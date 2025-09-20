import { randomUUID } from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { haversineDistanceKm } from "../lib/geodistance";
import { prisma } from "../lib/prisma";
import {
  AvailabilitySlot,
  StoredProposal,
  cleanup as cleanupStorage,
  deleteProposal,
  getPlayerAvailability,
  getProposal,
  setPlayerAvailability,
  upsertProposal,
} from "../services/matchmaking/storage";

export const matchmakingRouter = Router();

const slotSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

const searchSchema = z.object({
  requesterPairId: z.string(),
  playerId: z.string(),
  location: z.object({ lat: z.number(), lon: z.number() }),
  radiusKm: z.number().positive().max(500).default(100),
  maxEloDiff: z.number().positive().max(400).default(150),
  availability: z.array(slotSchema).min(1),
  matchDurationMinutes: z.number().int().min(30).max(240).default(90),
  limit: z.number().int().min(1).max(20).default(5),
});

const proposalAcceptSchema = z.object({
  pairId: z.string(),
});

type ProposalResponse = {
  id: string;
  opponentPair: {
    id: string;
    elo: number;
    players: Array<{ id: string; pseudo: string; elo: number }>;
  };
  schedule: { start: Date; end: Date };
  distanceKm: number;
  eloGap: number;
};

matchmakingRouter.post("/search", async (req, res, next) => {
  try {
    const payload = searchSchema.parse(req.body);
    const requesterPair = await prisma.pair.findUnique({
      where: { id: payload.requesterPairId },
      include: { l: true, r: true },
    });

    if (!requesterPair) {
      res.status(404).json({ error: "Requester pair not found" });
      return;
    }

    if (![requesterPair.l.id, requesterPair.r.id].includes(payload.playerId)) {
      res.status(403).json({ error: "Player is not part of requester pair" });
      return;
    }

    await cleanupStorage();

    const normalizedSlots = normalizeSlots(payload.availability);
    if (!normalizedSlots.length) {
      res.status(400).json({ error: "Availability slots are invalid" });
      return;
    }

    await Promise.all([
      setPlayerAvailability(requesterPair.l.id, normalizedSlots),
      setPlayerAvailability(requesterPair.r.id, normalizedSlots),
    ]);

    const candidatePairs = await prisma.pair.findMany({
      where: { NOT: { id: requesterPair.id } },
      include: { l: true, r: true },
    });

    const proposalsForResponse: ProposalResponse[] = [];

    for (const candidate of candidatePairs) {
      if ([requesterPair.l.id, requesterPair.r.id].includes(candidate.l.id) || [requesterPair.l.id, requesterPair.r.id].includes(candidate.r.id)) {
        continue;
      }

      if (Math.abs(candidate.elo - requesterPair.elo) > payload.maxEloDiff) {
        continue;
      }

      const candidateLocation = averageLocation(candidate.l, candidate.r);
      if (!candidateLocation) continue;

      const distanceKm = haversineDistanceKm(payload.location, candidateLocation);
      if (distanceKm > payload.radiusKm) continue;

      const [candidateSlotsL, candidateSlotsR] = await Promise.all([
        getPlayerAvailability(candidate.l.id),
        getPlayerAvailability(candidate.r.id),
      ]);

      if (!candidateSlotsL.length || !candidateSlotsR.length) {
        continue;
      }

      const candidateSlots = intersectSlots(candidateSlotsL, candidateSlotsR);
      if (!candidateSlots.length) continue;

      const commonSlots = intersectSlots(normalizedSlots, candidateSlots);
      const slot = pickSlotWithDuration(commonSlots, payload.matchDurationMinutes);
      if (!slot) continue;

      const end = new Date(slot.start.getTime() + payload.matchDurationMinutes * 60 * 1000);
      if (end > slot.end) continue;

      const proposalId = randomUUID();
      const stored: StoredProposal = {
        id: proposalId,
        requesterPairId: requesterPair.id,
        opponentPairId: candidate.id,
        start: slot.start,
        end,
        location: candidateLocation,
        acceptedPairIds: [],
        createdAt: new Date(),
      };
      await upsertProposal(stored);

      proposalsForResponse.push({
        id: proposalId,
        opponentPair: {
          id: candidate.id,
          elo: candidate.elo,
          players: [
            { id: candidate.l.id, pseudo: candidate.l.pseudo, elo: candidate.l.elo },
            { id: candidate.r.id, pseudo: candidate.r.pseudo, elo: candidate.r.elo },
          ],
        },
        schedule: { start: slot.start, end },
        distanceKm,
        eloGap: Math.abs(candidate.elo - requesterPair.elo),
      });

      if (proposalsForResponse.length >= payload.limit) break;
    }

    res.json({ proposals: proposalsForResponse });
  } catch (error) {
    next(error);
  }
});

matchmakingRouter.post("/proposals/:id/accept", async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const payload = proposalAcceptSchema.parse(req.body);

    await cleanupStorage();

    const proposal = await getProposal(params.id);
    if (!proposal) {
      res.status(404).json({ error: "Proposal not found" });
      return;
    }

    if (![proposal.requesterPairId, proposal.opponentPairId].includes(payload.pairId)) {
      res.status(403).json({ error: "Pair cannot accept this proposal" });
      return;
    }

    if (proposal.acceptedPairIds.includes(payload.pairId)) {
      res.json({ status: "waiting", message: "Pair already accepted" });
      return;
    }

    const updatedAccepted = [...proposal.acceptedPairIds, payload.pairId];
    const updatedProposal: StoredProposal = {
      ...proposal,
      acceptedPairIds: updatedAccepted,
    };

    if (updatedAccepted.length >= 2) {
      const match = await prisma.match.create({
        data: {
          pairAId: proposal.requesterPairId,
          pairBId: proposal.opponentPairId,
          startsAt: proposal.start,
          status: "PENDING",
        },
      });
      await deleteProposal(params.id);
      res.json({ status: "confirmed", match });
      return;
    }

    await upsertProposal(updatedProposal);

    res.json({ status: "waiting" });
  } catch (error) {
    next(error);
  }
});

function normalizeSlots(slots: Array<{ start: Date; end: Date }>): AvailabilitySlot[] {
  return slots
    .map((slot) => ({ start: new Date(slot.start), end: new Date(slot.end) }))
    .filter((slot) => slot.end > slot.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function intersectSlots(a: AvailabilitySlot[], b: AvailabilitySlot[]): AvailabilitySlot[] {
  const result: AvailabilitySlot[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    const start = new Date(Math.max(a[i].start.getTime(), b[j].start.getTime()));
    const end = new Date(Math.min(a[i].end.getTime(), b[j].end.getTime()));

    if (end > start) {
      result.push({ start, end });
    }

    if (a[i].end < b[j].end) {
      i += 1;
    } else {
      j += 1;
    }
  }

  return result;
}

function pickSlotWithDuration(slots: AvailabilitySlot[], durationMinutes: number) {
  const requiredMs = durationMinutes * 60 * 1000;
  return slots.find((slot) => slot.end.getTime() - slot.start.getTime() >= requiredMs) ?? null;
}

function averageLocation(
  ...players: Array<{ lat: number | null; lon: number | null }>
): { lat: number; lon: number } | null {
  const valid = players.filter((p) => p.lat !== null && p.lat !== undefined && p.lon !== null && p.lon !== undefined);
  if (!valid.length) return null;
  const avgLat = valid.reduce((sum, p) => sum + (p.lat as number), 0) / valid.length;
  const avgLon = valid.reduce((sum, p) => sum + (p.lon as number), 0) / valid.length;
  return { lat: avgLat, lon: avgLon };
}

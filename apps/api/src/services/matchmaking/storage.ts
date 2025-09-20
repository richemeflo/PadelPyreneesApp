import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

const AVAILABILITY_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const PROPOSAL_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours safeguarding stale proposals

export type AvailabilitySlot = {
  start: Date;
  end: Date;
};

export type StoredProposal = {
  id: string;
  requesterPairId: string;
  opponentPairId: string;
  start: Date;
  end: Date;
  location: { lat: number; lon: number };
  acceptedPairIds: string[];
  createdAt: Date;
};

type MatchProposalWithAcceptances = Prisma.MatchProposalGetPayload<{
  include: { acceptances: true };
}>;

type MatchmakingAvailabilityRecord = {
  start: Date;
  end: Date;
};

function sanitizeSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return slots
    .map((slot) => ({ start: new Date(slot.start), end: new Date(slot.end) }))
    .filter((slot) => slot.end > slot.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function toStoredProposal(record: MatchProposalWithAcceptances): StoredProposal {
  return {
    id: record.id,
    requesterPairId: record.requesterPairId,
    opponentPairId: record.opponentPairId,
    start: record.start,
    end: record.end,
    location: { lat: record.locationLat, lon: record.locationLon },
    acceptedPairIds: record.acceptances.map((acceptance) => acceptance.pairId),
    createdAt: record.createdAt,
  };
}

function toAvailabilitySlots(records: MatchmakingAvailabilityRecord[]): AvailabilitySlot[] {
  return records
    .map((record) => ({ start: record.start, end: record.end }))
    .filter((slot) => slot.end > slot.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function cleanup(now = new Date()) {
  const availabilityCutoff = new Date(now.getTime() - AVAILABILITY_TTL_MS);
  const proposalCutoff = new Date(now.getTime() - PROPOSAL_TTL_MS);

  await prisma.matchmakingAvailability.deleteMany({
    where: {
      OR: [
        { end: { lt: now } },
        { createdAt: { lt: availabilityCutoff } },
      ],
    },
  });

  await prisma.matchProposal.deleteMany({
    where: {
      OR: [
        { end: { lt: now } },
        { createdAt: { lt: proposalCutoff } },
      ],
    },
  });
}

export async function setPlayerAvailability(playerId: string, slots: AvailabilitySlot[]) {
  const sanitized = sanitizeSlots(slots);

  await prisma.$transaction(async (tx) => {
    await tx.matchmakingAvailability.deleteMany({ where: { playerId } });

    if (!sanitized.length) return;

    await tx.matchmakingAvailability.createMany({
      data: sanitized.map((slot) => ({
        playerId,
        start: slot.start,
        end: slot.end,
      })),
    });
  });
}

export async function getPlayerAvailability(playerId: string): Promise<AvailabilitySlot[]> {
  const records = await prisma.matchmakingAvailability.findMany({
    where: { playerId },
    orderBy: { start: "asc" },
    select: { start: true, end: true },
  });

  return toAvailabilitySlots(records);
}

export async function upsertProposal(proposal: StoredProposal) {
  await prisma.$transaction(async (tx) => {
    await tx.matchProposal.upsert({
      where: { id: proposal.id },
      create: {
        id: proposal.id,
        requesterPairId: proposal.requesterPairId,
        opponentPairId: proposal.opponentPairId,
        start: proposal.start,
        end: proposal.end,
        locationLat: proposal.location.lat,
        locationLon: proposal.location.lon,
        createdAt: proposal.createdAt,
      },
      update: {
        requesterPairId: proposal.requesterPairId,
        opponentPairId: proposal.opponentPairId,
        start: proposal.start,
        end: proposal.end,
        locationLat: proposal.location.lat,
        locationLon: proposal.location.lon,
      },
    });

    await tx.matchProposalAcceptance.deleteMany({ where: { proposalId: proposal.id } });

    if (!proposal.acceptedPairIds.length) return;

    await tx.matchProposalAcceptance.createMany({
      data: proposal.acceptedPairIds.map((pairId) => ({
        proposalId: proposal.id,
        pairId,
      })),
    });
  });
}

export async function getProposal(id: string): Promise<StoredProposal | null> {
  const record = await prisma.matchProposal.findUnique({
    where: { id },
    include: { acceptances: true },
  });

  return record ? toStoredProposal(record) : null;
}

export async function deleteProposal(id: string) {
  try {
    await prisma.matchProposal.delete({ where: { id } });
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

export async function listProposalsForPair(pairId: string): Promise<StoredProposal[]> {
  const proposals = await prisma.matchProposal.findMany({
    where: {
      OR: [
        { requesterPairId: pairId },
        { opponentPairId: pairId },
      ],
    },
    include: { acceptances: true },
    orderBy: { createdAt: "desc" },
  });

  return proposals.map(toStoredProposal);
}

function isNotFoundError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (error as Prisma.PrismaClientKnownRequestError).code === "P2025"
  );
}

import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";

export const tournamentsRouter = Router();

const tournamentCreateSchema = z.object({
  name: z.string().min(3),
  desc: z.string().optional(),
  kind: z.string().default("internal"),
  createdBy: z.string().optional(),
  externalClubId: z.string().optional(),
  levelMin: z.number().optional(),
  levelMax: z.number().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  place: z.string().optional(),
  price: z.number().optional(),
});

const querySchema = z.object({
  minElo: z.coerce.number().optional(),
  maxElo: z.coerce.number().optional(),
  limit: z.coerce.number().positive().max(100).default(50),
  playerId: z.string().optional(),
});

const registrationSchema = z.object({
  playerId: z.string(),
});

const tournamentRegistrations = new Map<string, Set<string>>();

tournamentsRouter.post("/", async (req, res, next) => {
  try {
    const payload = tournamentCreateSchema.parse(req.body);
    const tournament = await prisma.tournament.create({ data: payload });
    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.get("/", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const where = {
      ...(query.minElo !== undefined && { levelMax: { gte: query.minElo } }),
      ...(query.maxElo !== undefined && { levelMin: { lte: query.maxElo } }),
    };

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { startsAt: "asc" },
      take: query.limit,
      include: {
        externalClub: true,
      },
    });

    const response = tournaments.map((tournament) => {
      const registrations = tournamentRegistrations.get(tournament.id);
      const participantCount = registrations?.size ?? 0;
      const isRegistered = query.playerId ? registrations?.has(query.playerId) ?? false : false;
      return {
        ...tournament,
        participantCount,
        isRegistered,
      };
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.post("/:id/register", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const payload = registrationSchema.parse(req.body);

    const [player, tournament] = await Promise.all([
      prisma.player.findUnique({ where: { id: payload.playerId } }),
      prisma.tournament.findUnique({ where: { id } }),
    ]);

    if (!player || !tournament) {
      res.status(404).json({ error: "Player or tournament not found" });
      return;
    }

    if (
      (tournament.levelMin !== null && tournament.levelMin !== undefined && player.elo < tournament.levelMin) ||
      (tournament.levelMax !== null && tournament.levelMax !== undefined && player.elo > tournament.levelMax)
    ) {
      res.status(400).json({ error: "Player Elo outside tournament requirements" });
      return;
    }

    const registrations = tournamentRegistrations.get(id) ?? new Set<string>();
    if (registrations.has(payload.playerId)) {
      res.status(200).json({ status: "already-registered" });
      return;
    }

    registrations.add(payload.playerId);
    tournamentRegistrations.set(id, registrations);

    res.status(201).json({ status: "registered", participants: registrations.size });
  } catch (error) {
    next(error);
  }
});

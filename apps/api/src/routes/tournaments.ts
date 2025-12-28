import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";

export const tournamentsRouter = Router();

const tournamentCreateSchema = z.object({
  name: z.string().min(3),
  desc: z.string().optional(),
  kind: z.string().default("internal"),
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

tournamentsRouter.post("/", authGuard, async (req, res, next) => {
  try {
    const payload = tournamentCreateSchema.parse(req.body);
    const auth = requireFirebaseUser(req);
    const tournament = await prisma.tournament.create({
      data: {
        ...payload,
        createdBy: auth.uid,
      },
    });
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
        _count: { select: { registrations: true } },
      },
    });

    const registeredIds = query.playerId
      ? await prisma.tournamentRegistration.findMany({
          where: {
            playerId: query.playerId,
            tournamentId: { in: tournaments.map((tournament) => tournament.id) },
          },
          select: { tournamentId: true },
        })
      : [];

    const registeredSet = new Set(registeredIds.map((entry) => entry.tournamentId));

    const response = tournaments.map((tournament) => {
      const { _count, ...rest } = tournament;
      return {
        ...rest,
        participantCount: _count.registrations,
        isRegistered: query.playerId ? registeredSet.has(tournament.id) : false,
      };
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.post("/:id/register", authGuard, async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const auth = requireFirebaseUser(req);

    const [player, tournament] = await Promise.all([
      prisma.player.findUnique({ where: { id: auth.uid } }),
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

    try {
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId: id,
          playerId: auth.uid,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        res.status(200).json({ status: "already-registered" });
        return;
      }
      throw error;
    }

    const participantCount = await prisma.tournamentRegistration.count({
      where: { tournamentId: id },
    });

    res.status(201).json({ status: "registered", participants: participantCount });
  } catch (error) {
    next(error);
  }
});

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (error as Prisma.PrismaClientKnownRequestError).code === "P2002"
  );
}

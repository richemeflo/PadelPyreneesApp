import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { Coordinates, haversineDistanceKm } from "../lib/geodistance";

export const playersRouter = Router();
export const rankingRouter = Router();

const playerCreateSchema = z.object({
  email: z.string().email(),
  pseudo: z.string().min(3),
  passwordHash: z.string().min(10),
  locale: z.string().default("fr"),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

const playerUpdateSchema = playerCreateSchema.partial().omit({ email: true, passwordHash: true });

const rankingQuerySchema = z.object({
  region: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  radius: z.coerce.number().positive().max(500).default(150),
  limit: z.coerce.number().positive().max(100).default(50),
});

const REGION_PRESETS: Record<string, Coordinates & { radiusKm: number }> = {
  occitanie: { lat: 43.6045, lon: 1.444, radiusKm: 220 },
  "nouvelle-aquitaine": { lat: 43.2951, lon: -0.366, radiusKm: 250 },
  navarre: { lat: 42.8169, lon: -1.6432, radiusKm: 150 },
};

playersRouter.post("/", async (req, res, next) => {
  try {
    const payload = playerCreateSchema.parse(req.body);
    const player = await prisma.player.create({
      data: payload,
    });
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/", async (_req, res, next) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(players);
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        ratingHistory: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        pairsAsA: { select: { id: true, elo: true, rId: true } },
        pairsAsB: { select: { id: true, elo: true, lId: true } },
      },
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
});

playersRouter.patch("/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const payload = playerUpdateSchema.parse(req.body);

    const player = await prisma.player.update({
      where: { id },
      data: payload,
    });

    res.json(player);
  } catch (error) {
    next(error);
  }
});

rankingRouter.get("/", async (req, res, next) => {
  try {
    const query = rankingQuerySchema.parse(req.query);
    let coordinates: Coordinates | undefined;
    let radiusKm = query.radius;

    if (query.region) {
      const preset = REGION_PRESETS[query.region];
      if (preset) {
        coordinates = preset;
        radiusKm = preset.radiusKm;
      }
    }

    if (!coordinates && query.lat !== undefined && query.lon !== undefined) {
      coordinates = { lat: query.lat, lon: query.lon };
    }

    const players = await prisma.player.findMany({
      orderBy: { elo: "desc" },
      take: query.limit * 3,
    });

    const enriched = players
      .map((player, index) => {
        let distanceKm: number | undefined;
        if (coordinates && player.lat !== null && player.lat !== undefined && player.lon !== null && player.lon !== undefined) {
          distanceKm = haversineDistanceKm(coordinates, {
            lat: player.lat,
            lon: player.lon,
          });
        }
        return {
          id: player.id,
          pseudo: player.pseudo,
          elo: player.elo,
          rank: index + 1,
          distanceKm,
          locale: player.locale,
        };
      })
      .filter((player) => {
        if (!coordinates) return true;
        return player.distanceKm !== undefined && player.distanceKm <= radiusKm;
      })
      .slice(0, query.limit);

    res.json({
      total: enriched.length,
      region: query.region ?? null,
      players: enriched,
    });
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { z } from "zod";

import { haversineDistanceKm } from "../lib/geodistance";
import { prisma } from "../lib/prisma";
import { authGuard } from "../middlewares/authGuard";

export const clubsRouter = Router();
export const courtsRouter = Router();

const clubCreateSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  lat: z.number(),
  lon: z.number(),
  logoUrl: z.string().url().optional(),
  apiKind: z.string().optional(),
  apiKey: z.string().optional(),
});

const clubPublicSelect = {
  id: true,
  name: true,
  logoUrl: true,
  address: true,
  lat: true,
  lon: true,
  apiKind: true,
  createdAt: true,
} as const;

clubsRouter.post("/", authGuard, async (req, res, next) => {
  try {
    const payload = clubCreateSchema.parse(req.body);
    const club = await prisma.club.create({ data: payload });
    res.status(201).json(club);
  } catch (error) {
    next(error);
  }
});

clubsRouter.get("/", async (_req, res, next) => {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        ...clubPublicSelect,
        courts: { select: { id: true } },
      },
    });
    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

clubsRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const club = await prisma.club.findUnique({
      where: { id },
      select: {
        ...clubPublicSelect,
        courts: true,
      },
    });

    if (!club) {
      res.status(404).json({ error: "Club not found" });
      return;
    }

    res.json(club);
  } catch (error) {
    next(error);
  }
});

clubsRouter.get("/:id/courts", async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const courts = await prisma.court.findMany({
      where: { clubId: id },
      orderBy: { name: "asc" },
    });
    res.json(courts);
  } catch (error) {
    next(error);
  }
});

const courtQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  radius: z.coerce.number().positive().max(500).default(50),
});

courtsRouter.get("/", async (req, res, next) => {
  try {
    const query = courtQuerySchema.parse(req.query);
    const clubs = await prisma.club.findMany({
      select: {
        ...clubPublicSelect,
        courts: true,
      },
    });

    const results = clubs
      .flatMap((club) =>
        club.courts.map((court) => ({
          club,
          court,
          distanceKm: haversineDistanceKm(
            { lat: query.lat, lon: query.lon },
            { lat: club.lat, lon: club.lon },
          ),
        })),
      )
      .filter((entry) => entry.distanceKm <= query.radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      total: results.length,
      courts: results,
    });
  } catch (error) {
    next(error);
  }
});

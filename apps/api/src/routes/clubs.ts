import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { haversineDistanceKm } from "../lib/geodistance";
import { isValidCoordinates } from "../lib/geo";
import { sqlGeographyPoint } from "../lib/postgis";
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

const clubForMatchSchema = z.object({
  playerIds: z.string(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  limit: z.coerce.number().int().positive().max(50).default(5),
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

type PlayerLocationRow = {
  id: string;
  lat: number | null;
  lon: number | null;
};

type ClubForMatchRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  logoUrl: string | null;
  lat: number;
  lon: number;
  distance_m: number;
};

clubsRouter.post("/", authGuard, async (req, res, next) => {
  try {
    const payload = clubCreateSchema.parse(req.body);

    if (!isValidCoordinates(payload.lat, payload.lon)) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const club = await prisma.club.create({ data: payload });

    await prisma.$queryRaw(
      Prisma.sql`
        UPDATE "Club"
        SET "location" = ${sqlGeographyPoint(payload.lon, payload.lat)}
        WHERE id = ${club.id}
      `,
    );

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

clubsRouter.get("/for-match", async (req, res, next) => {
  try {
    const query = clubForMatchSchema.parse(req.query);
    const rawIds = query.playerIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const uniqueIds = Array.from(new Set(rawIds));

    if (rawIds.length !== 4 || uniqueIds.length !== 4) {
      res.status(400).json({ error: "playerIds must contain exactly 4 unique ids" });
      return;
    }

    const ids = uniqueIds.map((id) => Prisma.sql`${id}`);
    const players = await prisma.$queryRaw<PlayerLocationRow[]>(
      Prisma.sql`
        SELECT id,
               ST_Y("home_location"::geometry) AS lat,
               ST_X("home_location"::geometry) AS lon
        FROM "Player"
        WHERE id IN (${Prisma.join(ids)})
      `,
    );

    if (players.length !== 4 || players.some((player) => player.lat === null || player.lon === null)) {
      res.status(422).json({ error: "Missing player locations" });
      return;
    }

    const centerLat = players.reduce((sum, player) => sum + (player.lat as number), 0) / players.length;
    const centerLon = players.reduce((sum, player) => sum + (player.lon as number), 0) / players.length;

    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLon)) {
      res.status(422).json({ error: "Unable to compute centroid" });
      return;
    }

    const point = sqlGeographyPoint(centerLon, centerLat);
    const filters: Prisma.Sql[] = [Prisma.sql`c."location" IS NOT NULL`];
    if (query.radiusKm !== undefined) {
      filters.push(Prisma.sql`ST_DWithin(c."location", ${point}, ${query.radiusKm * 1000})`);
    }

    const rows = await prisma.$queryRaw<ClubForMatchRow[]>(
      Prisma.sql`
        SELECT c.id,
               c.name,
               c.address,
               c.city,
               c."postal_code" AS "postalCode",
               c.country,
               c."logoUrl" AS "logoUrl",
               c.lat,
               c.lon,
               ST_Distance(c."location", ${point}) AS distance_m
        FROM "Club" c
        WHERE ${Prisma.join(filters, Prisma.sql` AND `)}
        ORDER BY distance_m ASC
        LIMIT ${query.limit};
      `,
    );

    res.json({
      center: { lat: centerLat, lon: centerLon },
      total: rows.length,
      clubs: rows.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        city: row.city,
        postalCode: row.postalCode,
        country: row.country,
        logoUrl: row.logoUrl,
        lat: row.lat,
        lon: row.lon,
        distanceMeters: row.distance_m,
      })),
    });
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

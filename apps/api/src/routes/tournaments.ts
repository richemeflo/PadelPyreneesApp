import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { isValidCoordinates } from "../lib/geo";
import { sqlGeographyPoint } from "../lib/postgis";
import { prisma } from "../lib/prisma";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";
import { geocodeCity, type GeocodingResult } from "../services/geocoding";

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

const nearbyQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  radiusKm: z.coerce.number().positive().max(500).default(50),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

const nearbyCityQuerySchema = z.object({
  city: z.string().trim().min(2),
  country: z.string().trim().length(2).optional(),
  radiusKm: z.coerce.number().positive().max(500).default(50),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

type NearbyTournamentRow = {
  id: string;
  name: string;
  desc: string | null;
  kind: string;
  startsAt: Date;
  endsAt: Date;
  place: string | null;
  city: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lon: number | null;
  distance_m: number;
};

async function fetchNearbyTournaments(
  lat: number,
  lon: number,
  radiusMeters: number,
  limit: number,
) {
  const point = sqlGeographyPoint(lon, lat);
  return prisma.$queryRaw<NearbyTournamentRow[]>(
    Prisma.sql`
      SELECT t.id,
             t.name,
             t.desc,
             t.kind,
             t."startsAt",
             t."endsAt",
             t.place,
             t.city,
             t."postal_code" AS "postalCode",
             t.country,
             ST_Y(t."location"::geometry) AS lat,
             ST_X(t."location"::geometry) AS lon,
             ST_Distance(t."location", ${point}) AS distance_m
      FROM "Tournament" t
      WHERE t."location" IS NOT NULL
        AND ST_DWithin(t."location", ${point}, ${radiusMeters})
      ORDER BY distance_m ASC
      LIMIT ${limit};
    `,
  );
}

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

    if (payload.externalClubId) {
      await prisma.$queryRaw(
        Prisma.sql`
          UPDATE "Tournament" AS t
          SET "location" = c."location"
          FROM "Club" AS c
          WHERE t.id = ${tournament.id} AND c.id = ${payload.externalClubId}
        `,
      );
    }

    res.status(201).json(tournament);
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.get("/nearby", async (req, res, next) => {
  try {
    const query = nearbyQuerySchema.parse(req.query);
    if (!isValidCoordinates(query.lat, query.lon)) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const rows = await fetchNearbyTournaments(
      query.lat,
      query.lon,
      query.radiusKm * 1000,
      query.limit,
    );

    res.json({
      total: rows.length,
      tournaments: rows.map((row) => ({
        id: row.id,
        name: row.name,
        desc: row.desc,
        kind: row.kind,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        place: row.place,
        city: row.city,
        postalCode: row.postalCode,
        country: row.country,
        lat: row.lat,
        lon: row.lon,
        distanceMeters: row.distance_m,
      })),
    });
  } catch (error) {
    next(error);
  }
});

tournamentsRouter.get("/nearby-city", async (req, res, next) => {
  try {
    const query = nearbyCityQuerySchema.parse(req.query);

    const geocoded: GeocodingResult | null = await geocodeCity(query.city, query.country).catch(() => null);
    if (!geocoded) {
      res.status(422).json({ error: "Unable to geocode city" });
      return;
    }

    if (!isValidCoordinates(geocoded.lat, geocoded.lon)) {
      res.status(422).json({ error: "Geocoder returned invalid coordinates" });
      return;
    }

    const rows = await fetchNearbyTournaments(
      geocoded.lat,
      geocoded.lon,
      query.radiusKm * 1000,
      query.limit,
    );

    res.json({
      origin: {
        lat: geocoded.lat,
        lon: geocoded.lon,
        city: query.city,
      },
      total: rows.length,
      tournaments: rows.map((row) => ({
        id: row.id,
        name: row.name,
        desc: row.desc,
        kind: row.kind,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        place: row.place,
        city: row.city,
        postalCode: row.postalCode,
        country: row.country,
        lat: row.lat,
        lon: row.lon,
        distanceMeters: row.distance_m,
      })),
    });
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

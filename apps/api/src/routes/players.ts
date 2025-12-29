import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { Coordinates, haversineDistanceKm } from "../lib/geodistance";
import { isValidCoordinates } from "../lib/geo";
import { sqlGeographyPoint } from "../lib/postgis";
import { prisma } from "../lib/prisma";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";
import { geocodeAddress, type GeocodingResult } from "../services/geocoding";

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

const playerAddressSchema = z.object({
  streetNumber: z.string().trim().min(1).optional(),
  streetName: z.string().trim().min(2),
  city: z.string().trim().min(2),
  postalCode: z.string().trim().min(2),
  country: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
});

const nearbyPlayersQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  radiusKm: z.coerce.number().positive().max(500).default(50),
  minElo: z.coerce.number().optional(),
  maxElo: z.coerce.number().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

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

const playerPublicSelect = {
  id: true,
  email: true,
  pseudo: true,
  locale: true,
  lat: true,
  lon: true,
  streetNumber: true,
  streetName: true,
  city: true,
  postalCode: true,
  country: true,
  formattedAddress: true,
  elo: true,
  createdAt: true,
  updatedAt: true,
} as const;

type NearbyPlayerRow = {
  id: string;
  pseudo: string;
  locale: string;
  elo: number;
  lat: number | null;
  lon: number | null;
  distance_m: number;
};

type PlayerAddressRow = {
  id: string;
  email: string;
  pseudo: string;
  locale: string;
  lat: number | null;
  lon: number | null;
  streetNumber: string | null;
  streetName: string;
  city: string;
  postalCode: string;
  country: string;
  formattedAddress: string | null;
};

playersRouter.post("/", authGuard, async (req, res, next) => {
  try {
    const auth = requireFirebaseUser(req);
    const payload = playerCreateSchema.parse(req.body);
    if (auth.email && payload.email !== auth.email) {
      res.status(403).json({ error: "Email does not match authenticated user" });
      return;
    }

    if ((payload.lat !== undefined) !== (payload.lon !== undefined)) {
      res.status(400).json({ error: "lat and lon must be provided together" });
      return;
    }

    if (
      payload.lat !== undefined &&
      payload.lon !== undefined &&
      !isValidCoordinates(payload.lat, payload.lon)
    ) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const player = await prisma.player.create({
      data: {
        ...payload,
        id: auth.uid,
        email: auth.email ?? payload.email,
      },
    });

    if (payload.lat !== undefined && payload.lon !== undefined) {
      await prisma.$queryRaw(
        Prisma.sql`
          UPDATE "Player"
          SET "home_location" = ${sqlGeographyPoint(payload.lon, payload.lat)}
          WHERE id = ${player.id}
        `,
      );
    }

    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
});

playersRouter.put("/me/address", authGuard, async (req, res, next) => {
  try {
    const auth = requireFirebaseUser(req);
    const payload = playerAddressSchema.parse(req.body);

    const geocoded: GeocodingResult | null = await geocodeAddress(payload).catch(() => null);
    if (!geocoded) {
      res.status(422).json({ error: "Unable to geocode address" });
      return;
    }

    if (!isValidCoordinates(geocoded.lat, geocoded.lon)) {
      res.status(422).json({ error: "Geocoder returned invalid coordinates" });
      return;
    }

    const rows = await prisma.$queryRaw<PlayerAddressRow[]>(
      Prisma.sql`
        UPDATE "Player"
        SET "street_number" = ${payload.streetNumber ?? null},
            "street_name" = ${payload.streetName},
            "city" = ${payload.city},
            "postal_code" = ${payload.postalCode},
            "country" = ${payload.country},
            "formatted_address" = ${geocoded.formattedAddress ?? null},
            "lat" = ${geocoded.lat},
            "lon" = ${geocoded.lon},
            "home_location" = ${sqlGeographyPoint(geocoded.lon, geocoded.lat)},
            "updatedAt" = NOW()
        WHERE id = ${auth.uid}
        RETURNING id,
                  email,
                  pseudo,
                  locale,
                  lat,
                  lon,
                  street_number AS "streetNumber",
                  street_name AS "streetName",
                  city,
                  postal_code AS "postalCode",
                  country,
                  formatted_address AS "formattedAddress";
      `,
    );

    const updated = rows[0];
    if (!updated) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.json({
      id: updated.id,
      email: updated.email,
      pseudo: updated.pseudo,
      locale: updated.locale,
      lat: updated.lat,
      lon: updated.lon,
      address: {
        streetNumber: updated.streetNumber,
        streetName: updated.streetName,
        city: updated.city,
        postalCode: updated.postalCode,
        country: updated.country,
        formattedAddress: updated.formattedAddress,
      },
    });
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/nearby", async (req, res, next) => {
  try {
    const query = nearbyPlayersQuerySchema.parse(req.query);

    if (!isValidCoordinates(query.lat, query.lon)) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const radiusMeters = query.radiusKm * 1000;
    const point = sqlGeographyPoint(query.lon, query.lat);
    const filters: Prisma.Sql[] = [
      Prisma.sql`p."home_location" IS NOT NULL`,
      Prisma.sql`ST_DWithin(p."home_location", ${point}, ${radiusMeters})`,
    ];

    if (query.minElo !== undefined) {
      filters.push(Prisma.sql`p.elo >= ${query.minElo}`);
    }

    if (query.maxElo !== undefined) {
      filters.push(Prisma.sql`p.elo <= ${query.maxElo}`);
    }

    const rows = await prisma.$queryRaw<NearbyPlayerRow[]>(
      Prisma.sql`
        SELECT p.id,
               p.pseudo,
               p.locale,
               p.elo,
               p.lat,
               p.lon,
               ST_Distance(p."home_location", ${point}) AS distance_m
        FROM "Player" p
        WHERE ${Prisma.join(filters, Prisma.sql` AND `)}
        ORDER BY distance_m ASC
        LIMIT ${query.limit};
      `,
    );

    res.json({
      total: rows.length,
      players: rows.map((row) => ({
        id: row.id,
        pseudo: row.pseudo,
        locale: row.locale,
        elo: row.elo,
        lat: row.lat,
        lon: row.lon,
        distanceMeters: row.distance_m,
      })),
    });
  } catch (error) {
    next(error);
  }
});

playersRouter.get("/", async (_req, res, next) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: playerPublicSelect,
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
      select: {
        ...playerPublicSelect,
        ratingHistory: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            playerId: true,
            matchId: true,
            before: true,
            after: true,
            delta: true,
            createdAt: true,
          },
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

playersRouter.patch("/:id", authGuard, async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const auth = requireFirebaseUser(req);
    if (auth.uid !== id) {
      res.status(403).json({ error: "Cannot update another player" });
      return;
    }
    const payload = playerUpdateSchema.parse(req.body);

    if ((payload.lat !== undefined) !== (payload.lon !== undefined)) {
      res.status(400).json({ error: "lat and lon must be provided together" });
      return;
    }

    if (
      payload.lat !== undefined &&
      payload.lon !== undefined &&
      !isValidCoordinates(payload.lat, payload.lon)
    ) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const player = await prisma.player.update({
      where: { id },
      data: payload,
    });

    if (payload.lat !== undefined && payload.lon !== undefined) {
      await prisma.$queryRaw(
        Prisma.sql`
          UPDATE "Player"
          SET "home_location" = ${sqlGeographyPoint(payload.lon, payload.lat)},
              "updatedAt" = NOW()
          WHERE id = ${id}
        `,
      );
    }

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

import { randomUUID } from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { haversineDistanceKm } from "../lib/geodistance";
import { prisma } from "../lib/prisma";
import { authGuard, requireFirebaseUser } from "../middlewares/authGuard";
import {
  ReservationAvailability,
  ReservationBooking,
  ReservationRequest,
  getReservationAdapter,
} from "../services/adaptaters/reservation";

export const reservationsRouter = Router();

const suggestSchema = z.object({
  start: z.coerce.date(),
  durationMinutes: z.number().int().min(30).max(240).default(90),
  preferredClubIds: z.array(z.string()).optional(),
  location: z.object({ lat: z.number(), lon: z.number() }).optional(),
  radiusKm: z.number().positive().max(500).default(80),
  limit: z.number().int().min(1).max(10).default(5),
});

reservationsRouter.post("/suggest", authGuard, async (req, res, next) => {
  try {
    const payload = suggestSchema.parse(req.body);
    const auth = requireFirebaseUser(req);
    const start = new Date(payload.start);
    const end = new Date(start.getTime() + payload.durationMinutes * 60 * 1000);

    const clubs = await prisma.club.findMany({
      where: payload.preferredClubIds ? { id: { in: payload.preferredClubIds } } : undefined,
      include: { courts: true },
    });

    const rankedClubs = clubs
      .map((club) => {
        const distanceKm = payload.location
          ? haversineDistanceKm(payload.location, { lat: club.lat, lon: club.lon })
          : undefined;
        return { club, distanceKm };
      })
      .filter((item) =>
        payload.location ? (item.distanceKm ?? Infinity) <= payload.radiusKm : true,
      )
      .sort((a, b) => {
        if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });

    const suggestions = [] as Array<{
      suggestionId: string;
      club: { id: string; name: string; address: string };
      court: { id: string; name: string };
      start: Date;
      end: Date;
      provider: string;
      estimatedPrice?: number;
      currency?: string;
      distanceKm?: number;
    }>;

    for (const entry of rankedClubs) {
      const { club, distanceKm } = entry;
      const adapter = getReservationAdapter(club.apiKind);

      for (const court of club.courts) {
        const request: ReservationRequest = {
          clubId: club.id,
          courtId: court.id,
          start,
          end,
          userId: auth.uid,
        };

        let availability: ReservationAvailability;
        try {
          availability = await adapter.checkAvailability(request);
        } catch (error) {
          continue;
        }

        if (!availability.available) continue;

        const suggestionId = randomUUID();
        await prisma.reservationSuggestion.create({
          data: {
            id: suggestionId,
            clubId: club.id,
            courtId: court.id,
            userId: auth.uid,
            start,
            end,
            provider: availability.provider,
            estimatedPrice: availability.estimatedPrice,
            currency: availability.currency,
            distanceKm,
          },
        });

        suggestions.push({
          suggestionId,
          club: { id: club.id, name: club.name, address: club.address },
          court: { id: court.id, name: court.name },
          start,
          end,
          provider: availability.provider,
          estimatedPrice: availability.estimatedPrice,
          currency: availability.currency,
          distanceKm,
        });

        if (suggestions.length >= payload.limit) break;
      }

      if (suggestions.length >= payload.limit) break;
    }

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

reservationsRouter.post("/:id/confirm", authGuard, async (req, res, next) => {
  try {
    const params = z.object({ id: z.string() }).parse(req.params);
    const auth = requireFirebaseUser(req);

    const suggestion = await prisma.reservationSuggestion.findUnique({
      where: { id: params.id },
    });
    if (!suggestion) {
      res.status(404).json({ error: "Reservation suggestion not found" });
      return;
    }

    if (suggestion.userId !== auth.uid) {
      res.status(403).json({ error: "User mismatch for reservation" });
      return;
    }

    const club = await prisma.club.findUnique({ where: { id: suggestion.clubId } });
    if (!club) {
      res.status(404).json({ error: "Club not found" });
      return;
    }

    const adapter = getReservationAdapter(club.apiKind);
    const request: ReservationRequest = {
      clubId: suggestion.clubId,
      courtId: suggestion.courtId,
      start: suggestion.start,
      end: suggestion.end,
      userId: suggestion.userId,
    };
    let booking: ReservationBooking;
    try {
      booking = await adapter.createBooking(request);
    } catch (error) {
      res.status(409).json({ error: "Unable to confirm reservation" });
      return;
    }

    await prisma.reservationSuggestion.delete({ where: { id: params.id } });

    res.json({
      bookingId: booking.bookingId,
      provider: booking.provider,
      club: { id: club.id, name: club.name },
      courtId: suggestion.courtId,
      start: suggestion.start,
      end: suggestion.end,
      estimatedPrice: suggestion.estimatedPrice,
      currency: suggestion.currency,
      distanceKm: suggestion.distanceKm,
    });
  } catch (error) {
    next(error);
  }
});

import { randomUUID } from "node:crypto";

import {
  ReservationAdapter,
  ReservationAvailability,
  ReservationBooking,
  ReservationRequest,
} from "./adapter";

type StoredBooking = {
  id: string;
  start: Date;
  end: Date;
  userId: string;
  courtId?: string;
};

const PROVIDER = "manual";
const reservations = new Map<string, StoredBooking[]>();

const keyFor = (clubId: string, courtId?: string) => `${clubId}::${courtId ?? "_any"}`;

const overlaps = (a: ReservationRequest, b: StoredBooking) =>
  a.start < b.end && b.start < a.end;

const sanitize = (req: ReservationRequest): ReservationRequest => ({
  ...req,
  start: new Date(req.start),
  end: new Date(req.end),
});

const availabilityResponse = (
  available: boolean,
  conflictingBookingId?: string,
): ReservationAvailability => ({
  provider: PROVIDER,
  available,
  conflictingBookingId,
});

export const manualReservationAdapter: ReservationAdapter = {
  async checkAvailability(request) {
    const req = sanitize(request);
    const key = keyFor(req.clubId, req.courtId);
    const existing = reservations.get(key) ?? [];
    const conflict = existing.find((slot) => overlaps(req, slot));

    return availabilityResponse(!conflict, conflict?.id);
  },

  async createBooking(request) {
    const req = sanitize(request);
    const availability = await this.checkAvailability(req);

    if (!availability.available) {
      throw new Error("Court unavailable for requested slot");
    }

    const key = keyFor(req.clubId, req.courtId);
    const booking: StoredBooking = {
      id: randomUUID(),
      start: req.start,
      end: req.end,
      userId: req.userId,
      courtId: req.courtId,
    };

    const slots = reservations.get(key) ?? [];
    slots.push(booking);
    reservations.set(key, slots);

    const response: ReservationBooking = {
      provider: PROVIDER,
      bookingId: booking.id,
    };

    return response;
  },
};

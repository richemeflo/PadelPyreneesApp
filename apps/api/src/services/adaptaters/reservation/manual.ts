import { randomUUID } from "node:crypto";

import {
  ReservationAdapter,
  ReservationAvailability,
  ReservationBooking,
  ReservationRequest,
} from "./adapter";
import { prisma } from "../../../lib/prisma";

const PROVIDER = "manual";

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

async function findConflict(request: ReservationRequest) {
  const where = {
    clubId: request.clubId,
    ...(request.courtId ? { courtId: request.courtId } : {}),
    start: { lt: request.end },
    end: { gt: request.start },
  };

  const conflict = await prisma.reservation.findFirst({
    where,
    select: { id: true },
  });

  return conflict?.id;
}

export async function createReservationRecord(request: ReservationRequest, provider: string) {
  const booking = await prisma.reservation.create({
    data: {
      id: randomUUID(),
      clubId: request.clubId,
      courtId: request.courtId,
      start: request.start,
      end: request.end,
      userId: request.userId,
      provider,
    },
  });

  return booking;
}

export const manualReservationAdapter: ReservationAdapter = {
  async checkAvailability(request) {
    const req = sanitize(request);
    const conflictId = await findConflict(req);

    return availabilityResponse(!conflictId, conflictId);
  },

  async createBooking(request) {
    const req = sanitize(request);
    const conflictId = await findConflict(req);
    if (conflictId) {
      throw new Error("Court unavailable for requested slot");
    }

    const booking = await createReservationRecord(req, PROVIDER);

    const response: ReservationBooking = {
      provider: PROVIDER,
      bookingId: booking.id,
    };

    return response;
  },
};

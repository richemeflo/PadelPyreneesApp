export type ReservationRequest = {
  clubId: string;
  courtId?: string;
  start: Date;
  end: Date;
  userId: string;
};

export type ReservationAvailability = {
  provider: string;
  available: boolean;
  conflictingBookingId?: string;
  estimatedPrice?: number;
  currency?: string;
};

export type ReservationBooking = {
  provider: string;
  bookingId: string;
};

export interface ReservationAdapter {
  checkAvailability(req: ReservationRequest): Promise<ReservationAvailability>;
  createBooking(req: ReservationRequest): Promise<ReservationBooking>;
}

export type ReservationRequest = {
  clubId: string;
  courtId?: string;
  start: Date;
  end: Date;
  userId: string;
};

export interface ReservationAdapter {
  checkAvailability(req: ReservationRequest): Promise<any>;
  createBooking(req: ReservationRequest): Promise<{ bookingId: string }>;
}

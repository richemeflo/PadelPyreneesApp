import {
  ReservationAdapter,
  ReservationAvailability,
  ReservationBooking,
  ReservationRequest,
} from "./adapter";
import { createReservationRecord, manualReservationAdapter } from "./manual";

const PROVIDER = "bruyeres";
const CURRENCY = "EUR";

const peakHours = new Set([17, 18, 19, 20]);

const toProviderAvailability = (base: ReservationAvailability): ReservationAvailability => ({
  ...base,
  provider: PROVIDER,
});

export const bruyeresReservationAdapter: ReservationAdapter = {
  async checkAvailability(request) {
    const sanitized: ReservationRequest = {
      ...request,
      start: new Date(request.start),
      end: new Date(request.end),
    };

    const base = await manualReservationAdapter.checkAvailability(sanitized);
    const hour = sanitized.start.getHours();
    const estimatedPrice = peakHours.has(hour) ? 2600 : 1900;

    return {
      ...toProviderAvailability(base),
      estimatedPrice,
      currency: CURRENCY,
    };
  },

  async createBooking(request) {
    const sanitized: ReservationRequest = {
      ...request,
      start: new Date(request.start),
      end: new Date(request.end),
    };
    const booking = await createReservationRecord(sanitized, PROVIDER);
    const response: ReservationBooking = {
      provider: PROVIDER,
      bookingId: booking.id,
    };
    return response;
  },
};

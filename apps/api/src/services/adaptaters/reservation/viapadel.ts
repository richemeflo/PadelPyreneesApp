import {
  ReservationAdapter,
  ReservationAvailability,
  ReservationBooking,
  ReservationRequest,
} from "./adapter";
import { manualReservationAdapter } from "./manual";

const PROVIDER = "viapadel";
const CURRENCY = "EUR";
const BASE_RATE_PER_HOUR = 2200; // cents

const durationInHours = (start: Date, end: Date) =>
  Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

const toProviderAvailability = (base: ReservationAvailability): ReservationAvailability => ({
  ...base,
  provider: PROVIDER,
});

export const viaPadelReservationAdapter: ReservationAdapter = {
  async checkAvailability(request) {
    const sanitized: ReservationRequest = {
      ...request,
      start: new Date(request.start),
      end: new Date(request.end),
    };

    const base = await manualReservationAdapter.checkAvailability(sanitized);
    const multiplier = sanitized.start.getHours() >= 18 ? 1.2 : 1;
    const estimatedPrice = Math.round(
      durationInHours(sanitized.start, sanitized.end) * BASE_RATE_PER_HOUR * multiplier,
    );

    return {
      ...toProviderAvailability(base),
      estimatedPrice,
      currency: CURRENCY,
    };
  },

  async createBooking(request) {
    const booking = await manualReservationAdapter.createBooking(request);
    const response: ReservationBooking = {
      ...booking,
      provider: PROVIDER,
    };
    return response;
  },
};

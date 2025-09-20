import type { ReservationAdapter } from "./adapter";
import { bruyeresReservationAdapter } from "./bruyeres";
import { manualReservationAdapter } from "./manual";
import { viaPadelReservationAdapter } from "./viapadel";

const registry: Record<string, ReservationAdapter> = {
  manual: manualReservationAdapter,
  viapadel: viaPadelReservationAdapter,
  bruyeres: bruyeresReservationAdapter,
};

export function getReservationAdapter(kind?: string | null): ReservationAdapter {
  if (kind) {
    const adapter = registry[kind.toLowerCase()];
    if (adapter) return adapter;
  }
  return manualReservationAdapter;
}

export * from "./adapter";

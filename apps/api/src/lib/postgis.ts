import { Prisma } from "@prisma/client";

/** Builds a geography Point(4326) SQL fragment from lon/lat. */
export function sqlGeographyPoint(lon: number, lat: number) {
  return Prisma.sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography`;
}

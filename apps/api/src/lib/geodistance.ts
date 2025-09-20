export type Coordinates = {
  lat: number;
  lon: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

export function haversineDistanceKm(a: Coordinates, b: Coordinates) {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);

  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const haver = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const clamped = Math.min(1, Math.max(0, haver));
  const centralAngle = 2 * Math.asin(Math.sqrt(clamped));

  return EARTH_RADIUS_KM * centralAngle;
}

export function isWithinRadiusKm(a: Coordinates, b: Coordinates, radiusKm: number) {
  return haversineDistanceKm(a, b) <= radiusKm;
}

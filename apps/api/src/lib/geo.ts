/** Validates WGS84 latitude range. */
export function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

/** Validates WGS84 longitude range. */
export function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/** Validates a latitude/longitude pair. */
export function isValidCoordinates(lat: number, lon: number) {
  return isValidLatitude(lat) && isValidLongitude(lon);
}

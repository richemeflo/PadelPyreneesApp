import { z } from "zod";

type NominatimResponse = Array<{
  lat: string;
  lon: string;
  display_name?: string;
}>;

const nominatimSchema = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    display_name: z.string().optional(),
  }),
);

export type AddressInput = {
  streetNumber?: string;
  streetName: string;
  city: string;
  postalCode: string;
  country: string;
};

export type GeocodingResult = {
  lat: number;
  lon: number;
  formattedAddress?: string;
  provider: "nominatim";
};

const DEFAULT_BASE_URL = "https://nominatim.openstreetmap.org";

function buildNominatimUrl(query: string) {
  const baseUrl = process.env.GEOCODING_BASE_URL ?? DEFAULT_BASE_URL;
  const url = new URL("/search", baseUrl);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);
  const email = process.env.GEOCODING_EMAIL;
  if (email) {
    url.searchParams.set("email", email);
  }
  return url;
}

async function fetchNominatim(query: string): Promise<GeocodingResult> {
  const url = buildNominatimUrl(query);
  const userAgent = process.env.GEOCODING_USER_AGENT ?? "padelpyrenees-api/1.0";
  const timeoutMs = Number(process.env.GEOCODING_TIMEOUT_MS ?? "6000");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Geocoding provider error: ${response.status}`);
    }

    const data = nominatimSchema.parse((await response.json()) as NominatimResponse);
    if (!data.length) {
      throw new Error("Geocoding returned no results");
    }

    const lat = Number.parseFloat(data[0].lat);
    const lon = Number.parseFloat(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Geocoding returned invalid coordinates");
    }

    return {
      lat,
      lon,
      formattedAddress: data[0].display_name,
      provider: "nominatim",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function ensureNominatimProvider() {
  const provider = (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase();
  if (provider !== "nominatim") {
    throw new Error(`Unsupported geocoding provider: ${provider}`);
  }
}

/**
 * Geocode a full postal address via the configured provider.
 */
export async function geocodeAddress(input: AddressInput): Promise<GeocodingResult> {
  ensureNominatimProvider();

  const street = [input.streetNumber, input.streetName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const locality = [input.postalCode, input.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  const query = [street, locality, input.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");

  return fetchNominatim(query);
}

/**
 * Geocode a city name (optionally with country) via the configured provider.
 */
export async function geocodeCity(city: string, country?: string): Promise<GeocodingResult> {
  ensureNominatimProvider();

  const query = [city, country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");

  return fetchNominatim(query);
}

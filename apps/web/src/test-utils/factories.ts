import type { ClubInfo } from "../components/types/reservation";

const baseOpeningHours: Record<string, string> = {
  Lundi: "08:00 - 22:00",
  Mardi: "08:00 - 22:00",
  Mercredi: "08:00 - 22:00",
  Jeudi: "08:00 - 22:00",
  Vendredi: "08:00 - 22:00",
  Samedi: "09:00 - 20:00",
  Dimanche: "09:00 - 18:00",
};

const baseClubInfo: ClubInfo = {
  id: "club-1",
  name: "Club Test",
  address: "1 Rue des Tests, Toulouse",
  phone: "0102030405",
  email: "club@test.com",
  location: {
    lat: 43.6,
    lng: 1.44,
  },
  amenities: [
    "Parking gratuit",
    "WiFi gratuit",
    "Snack-bar",
    "Boutique equipements",
    "Vestiaires",
    "Douches",
    "Terrasse",
    "Restaurant",
  ],
  openingHours: baseOpeningHours,
};

export function buildClubInfo(overrides: Partial<ClubInfo> = {}): ClubInfo {
  return {
    ...baseClubInfo,
    ...overrides,
    location: {
      ...baseClubInfo.location,
      ...overrides.location,
    },
    openingHours: {
      ...baseOpeningHours,
      ...overrides.openingHours,
    },
    amenities: overrides.amenities ?? baseClubInfo.amenities,
  };
}

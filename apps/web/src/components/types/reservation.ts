export type ClubInfo = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  openingHours: Record<string, string>;
};

export type Coordinates = { lat: number; lon: number } | null;

export type Branch = {
  id: string;
  name: string;
  street?: string | null;
  city?: string | null;
  zipCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
  coordinates: Coordinates;
};

export type Country = {
  code: string;
  name: string;
};

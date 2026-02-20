import { parseCoordinates } from "@/lib/geo";
import type { Branch, Country } from "@/lib/types";

type GraphResponse<T> = { data?: T; errors?: Array<{ message: string }> };

async function postGraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/graph", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphResponse<T>;
  if (!res.ok || json.errors?.length) {
    const msg = json.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (!json.data) throw new Error("Missing data in Graph response");
  return json.data;
}

// graph API max is 100
const MAX_LIMIT = 100;
const clampLimit = (n?: number) => Math.min(Math.max(n ?? 50, 0), MAX_LIMIT);

const BRANCH_FIELDS = `
  items {
    Name
    Street
    City
    ZipCode
    Country
    CountryCode
    Phone
    Email
    Coordinates
    _metadata { key }
  }
`;

const QUERY_BRANCHES = `
query GetBranches($limit: Int!) {
  Branch(limit: $limit) {
    ${BRANCH_FIELDS}
  }
}
`;

const QUERY_COUNTRIES = `
query GetCountries($limit: Int!) {
  Branch(limit: $limit) {
    items { Country CountryCode }
  }
}
`;

function mapBranch(b: any): Branch {
  return {
    id: b?._metadata?.key ?? `${b?.Name ?? "branch"}-${b?.ZipCode ?? ""}`,
    name: b?.Name ?? "",
    street: b?.Street ?? null,
    city: b?.City ?? null,
    zipCode: b?.ZipCode ?? null,
    country: b?.Country ?? null,
    countryCode: b?.CountryCode ?? null,
    phone: b?.Phone ?? null,
    email: b?.Email ?? null,
    coordinates: parseCoordinates(b?.Coordinates),
  };
}

function includesCI(haystack: string | null | undefined, needle: string) {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

export async function fetchBranches(opts: { limit: number; skip?: number }): Promise<Branch[]> {
  const data = await postGraph<{ Branch: { items: any[] } }>(QUERY_BRANCHES, {
    limit: clampLimit(opts.limit),
  });
  return (data.Branch?.items ?? []).map(mapBranch);
}

// Filtering is done client-side since the schema doesn't support where clauses on these fields
export async function searchBranches(opts: { term: string; limit: number; skip?: number }): Promise<Branch[]> {
  const term = (opts.term ?? "").trim().toLowerCase();
  if (!term) return [];

  const all = await fetchBranches({ limit: clampLimit(opts.limit) });

  return all.filter((b) => {
    return (
      includesCI(b.name, term) ||
      includesCI(b.city, term) ||
      includesCI(b.zipCode, term) ||
      includesCI(b.country, term) ||
      includesCI(b.countryCode, term) ||
      includesCI(b.street, term)
    );
  });
}

// Same as above — country filtering has to happen after the fetch
export async function fetchBranchesByCountry(opts: {
  country: string;
  limit: number;
  skip?: number;
}): Promise<Branch[]> {
  const country = (opts.country ?? "").trim().toLowerCase();
  if (!country) return [];

  const all = await fetchBranches({ limit: clampLimit(opts.limit) });
  return all.filter((b) => (b.country ?? "").trim().toLowerCase() === country);
}

export async function fetchCountries(): Promise<Country[]> {
  const data = await postGraph<{ Branch: { items: Array<{ Country?: string; CountryCode?: string }> } }>(
    QUERY_COUNTRIES,
    { limit: clampLimit(1000) }
  );

  const map = new Map<string, string>();

  for (const item of data.Branch?.items ?? []) {
    const name = (item.Country ?? "").trim();
    if (!name) continue;

    const code =
      (item.CountryCode ?? "").trim().toUpperCase() ||
      name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

    if (!map.has(code)) map.set(code, name);
  }

  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3958.7613;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const aa =
    s1 * s1 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * (s2 * s2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

// Fetches branches and sorts them by distance from the given coordinates
export async function fetchNearestBranches(opts: {
  lat: number;
  lng: number;
  limit?: number;
  fetchLimit?: number;
}): Promise<(Branch & { distanceMiles?: number })[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 10, 50));
  const fetchLimit = clampLimit(opts.fetchLimit ?? 100);

  const origin = { lat: opts.lat, lon: opts.lng };

  const all = await fetchBranches({ limit: fetchLimit });

  const withDistance = all
    .map((b) => {
      if (!b.coordinates) return null;
      const d = haversineMiles(origin, b.coordinates);
      return { ...b, distanceMiles: d };
    })
    .filter(Boolean) as (Branch & { distanceMiles: number })[];

  withDistance.sort((x, y) => x.distanceMiles - y.distanceMiles);

  return withDistance.slice(0, limit);
}

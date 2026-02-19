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

// Limit Helper (Optimizely Graph enforces 0..100)
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

// Keep signature compatible; skip is ignored (no server paging)
export async function fetchBranches(opts: { limit: number; skip?: number }): Promise<Branch[]> {
  const data = await postGraph<{ Branch: { items: any[] } }>(QUERY_BRANCHES, {
    limit: clampLimit(opts.limit),
  });
  return (data.Branch?.items ?? []).map(mapBranch);
}

/**
 * Search is implemented client-side because this schema does not allow filtering by Country/CountryCode
 * (and may restrict other where fields too).
 */
export async function searchBranches(opts: { term: string; limit: number; skip?: number }): Promise<Branch[]> {
  const term = (opts.term ?? "").trim().toLowerCase();
  if (!term) return [];

  // Fetch up to 100 and filter locally
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

/**
 * Country filtering is implemented client-side because BranchWhereInput does not support Country/CountryCode.
 */
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
    { limit: clampLimit(1000) } // becomes 100
  );

  const map = new Map<string, string>();

  for (const item of data.Branch?.items ?? []) {
    const name = (item.Country ?? "").trim();
    if (!name) continue;

    // Prefer CountryCode if present; otherwise generate a stable slug from name
    const code =
      (item.CountryCode ?? "").trim().toUpperCase() ||
      name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

    if (!map.has(code)) map.set(code, name);
  }

  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

import type { Coordinates } from "@/lib/types";

export function parseCoordinates(input: unknown): Coordinates {
  if (!input || typeof input !== "string") return null;
  const parts = input.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

function toRad(v: number) {
  return (v * Math.PI) / 180;
}

export function computeDistanceMiles(from: { lat: number; lon: number }, to: Coordinates): number | null {
  if (!to) return null;
  const R = 3958.8;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortByDistance<T extends { distanceMiles: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.distanceMiles - b.distanceMiles);
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { searchBranches } from "@/lib/graph";
import { computeDistanceMiles, sortByDistance } from "@/lib/geo";
import type { Branch } from "@/lib/types";

export default function SearchClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const urlQ = sp.get("q") ?? "";

  const [q, setQ] = useState(urlQ);
  const [results, setResults] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Keep the input in sync when arriving via URL (e.g. homepage ZIP form)
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  // Live search — fires 300ms after the user stops typing
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchBranches({ term, limit: 100 });
        setResults(data);
      } catch (e: any) {
        setSearchError(e?.message ?? "Search failed. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  function handleSearch() {
    const term = q.trim();
    if (term) {
      router.replace(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  function onUseMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setGeoError(err.message || "Unable to get your location."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  const sortedResults = useMemo(() => {
    if (!geo) return results.map((b) => ({ ...b, distanceMiles: undefined }));

    const withDist = results.map((b) => ({
      ...b,
      distanceMiles: computeDistanceMiles(geo, b.coordinates) ?? undefined,
    }));

    const hasDist = withDist.filter((b): b is Branch & { distanceMiles: number } =>
      typeof b.distanceMiles === "number"
    );
    const noDist = withDist.filter((b) => typeof b.distanceMiles !== "number");

    return [...sortByDistance(hasDist), ...noDist];
  }, [results, geo]);

  return (
    <div className="container">
      {isLoading && <LoadingOverlay label="Searching..." />}

      <section className="card">
        <h2 className="section-title">Search branches</h2>
        <p className="muted">Search by name, city, country, or ZIP code.</p>

        <div className="input-row">
          <input
            className="input"
            placeholder="e.g., Tampa, 10001, Brightstream"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn" onClick={handleSearch}>
            Search
          </button>
          <button className="btn" type="button" onClick={onUseMyLocation}>
            {geo ? "Location set ✓" : "Near me"}
          </button>
        </div>

        {geoError && <p className="error">{geoError}</p>}
        {searchError && <p className="error">{searchError}</p>}
        {!q.trim() && <p className="muted">Enter a search term to see results.</p>}

        <div className="branch-list">
          {sortedResults.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>

        {q.trim() && sortedResults.length === 0 && !isLoading && (
          <p className="muted">No results found.</p>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { searchBranches } from "@/lib/graph";
import { computeDistanceMiles, sortByDistance } from "@/lib/geo";
import { useSearchParams } from "next/navigation";
import type { Branch } from "@/lib/types";

export default function SearchClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const urlQ = sp.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // sync input when navigating here from the ZIP form on the homepage
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  // SWR key is driven by the URL param — changing the URL always triggers a fresh fetch
  const key = urlQ.trim() ? ["search", urlQ.trim()] : null;

  const { data, isLoading, error } = useSWR(
    key,
    ([, term]: [string, string]) => searchBranches({ term, limit: 100 })
  );

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

  const results = useMemo(() => {
    const branches = data ?? [];
    if (!geo) return branches.map((b) => ({ ...b, distanceMiles: undefined }));

    const withDist = branches.map((b) => ({
      ...b,
      distanceMiles: computeDistanceMiles(geo, b.coordinates) ?? undefined,
    }));

    const hasDist = withDist.filter((b): b is Branch & { distanceMiles: number } =>
      typeof b.distanceMiles === "number"
    );
    const noDist = withDist.filter((b) => typeof b.distanceMiles !== "number");

    return [...sortByDistance(hasDist), ...noDist];
  }, [data, geo]);

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
          <button className="btn primary" onClick={handleSearch}>
            Search
          </button>
          <button className="btn" type="button" onClick={onUseMyLocation}>
            {geo ? "Location set ✓" : "Near me"}
          </button>
        </div>

        {geoError && <p className="error">{geoError}</p>}
        {error && <p className="error">Search failed. Please try again.</p>}
        {!urlQ.trim() && <p className="muted">Enter a search term to see results.</p>}

        <div className="branch-list">
          {results.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>

        {urlQ.trim() && results.length === 0 && !isLoading && (
          <p className="muted">No results found.</p>
        )}
      </section>
    </div>
  );
}

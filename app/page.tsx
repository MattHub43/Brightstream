"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import CountryCard from "@/components/CountryCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fetchBranches, fetchCountries } from "@/lib/graph";
import { computeDistanceMiles, sortByDistance } from "@/lib/geo";
import type { Branch } from "@/lib/types";

export default function HomePage() {
  const [zip, setZip] = useState("");
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const { data: countries, isLoading: countriesLoading, error: countriesError } = useSWR(
    "countries",
    () => fetchCountries()
  );

  const { data: branchesForNearest, isLoading: nearestLoading, error: nearestError, mutate: refetchNearest } =
    useSWR(geo ? ["nearest", geo.lat, geo.lon] : null, async () => {
      const branches = await fetchBranches({ limit: 200 });
      return branches;
    });

  const nearest = useMemo(() => {
    if (!geo || !branchesForNearest) return [];
    const withDistance = branchesForNearest
      .map((b) => {
        const dist = computeDistanceMiles(geo, b.coordinates);
        return { ...b, distanceMiles: dist };
      })
      .filter((b) => typeof b.distanceMiles === "number");
    return sortByDistance(withDistance as (Branch & { distanceMiles: number })[]).slice(0, 5);
  }, [geo, branchesForNearest]);

  function onUseMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        refetchNearest();
      },
      (err) => setGeoError(err.message || "Unable to get your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="container">
      {(countriesLoading || nearestLoading) && <LoadingOverlay label="Loading..." />}

      <section className="card hero-card">
        <div className="hero-grid">
          <div>
            <h2 className="section-title">Quick actions</h2>
            <p className="muted">Use location for nearest branches, or search by ZIP, city, or name.</p>

            <div className="actions-row">
              <button className="btn primary" onClick={onUseMyLocation}>
                Use my location
              </button>
              <a className="btn" href="/search">
                Go to search
              </a>
              <a className="btn" href="/branches">
                Browse all
              </a>
            </div>

            <form className="zip-form" action="/search" method="GET">
              <label className="label">Search by ZIP</label>
              <div className="input-row">
                <input
                  className="input"
                  name="q"
                  placeholder="e.g., 10001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
                <button className="btn primary" type="submit" disabled={!zip.trim()}>
                  Search
                </button>
              </div>
              <p className="hint">Tip: you can also search by city or branch name.</p>
            </form>

            {geoError && <p className="error">{geoError}</p>}
            {nearestError && <p className="error">Failed to load branches for nearest calculation.</p>}
          </div>

          <div>
            <h2 className="section-title">Nearest branches</h2>
            {!geo && <p className="muted">Click “Use my location” to see closest branches.</p>}
            {geo && nearest.length === 0 && <p className="muted">No nearby branches found (or missing coordinates).</p>}

            <div className="branch-list">
              {nearest.map((b) => (
                <BranchCard key={b.id} branch={b} showDistance />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2 className="section-title">Browse by country</h2>
          <a className="link" href="/countries">
            View all
          </a>
        </div>

        {countriesError && <p className="error">Failed to load countries.</p>}
        <div className="country-grid">
          {(countries ?? []).slice(0, 12).map((c) => (
            <CountryCard key={c.code} country={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

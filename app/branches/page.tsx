"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import LoadingOverlay from "@/components/LoadingOverlay";
import BranchCard from "@/components/BranchCard";
import { fetchBranches } from "@/lib/graph";
import { computeDistanceMiles, sortByDistance } from "@/lib/geo";
import type { Branch } from "@/lib/types";

function getDefaultPageSize() {
  const env = Number(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || "50");
  return Number.isFinite(env) && env > 0 ? env : 50;
}

export default function BranchesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getDefaultPageSize());
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const key = useMemo(() => ["branches", page, pageSize], [page, pageSize]);

  const { data, isLoading, error } = useSWR(key, () =>
    fetchBranches({ limit: pageSize, skip: page * pageSize })
  );

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

  const rows = useMemo(() => {
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
    <div className="page">
      {isLoading && <LoadingOverlay label="Loading branches..." />}

      <section className="hero" style={{ paddingTop: 36, paddingBottom: 20 }}>
        <div className="hero-kicker" />
        <h1 className="hero-title">All Branches</h1>
        <p className="hero-subtitle">Browse every location.</p>
        <div className="center-row" style={{ marginTop: 16 }}>
          <button className="btn-primary" type="button" onClick={onUseMyLocation}>
            {geo ? "Location set ✓" : "Sort by distance"}
          </button>
        </div>
        {geoError && <p className="error" style={{ textAlign: "center", marginTop: 10 }}>{geoError}</p>}
      </section>

      <section className="section">
        <div className="panel">

          {error && <p className="error">Failed to load branches.</p>}

          <div>
            {rows.map((b) => (
              <BranchCard key={b.id} branch={b} />
            ))}
          </div>

          {!isLoading && rows.length === 0 && <p className="muted">No branches found.</p>}
        </div>
      </section>
    </div>
  );
}

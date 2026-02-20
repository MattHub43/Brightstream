"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fetchCountries, fetchNearestBranches } from "@/lib/graph";

function sortCountries(list: { code: string; name: string }[]) {
  return [...list].sort((a, b) => {
    if (a.code === "US") return -1;
    if (b.code === "US") return 1;
    return a.name.localeCompare(b.name);
  });
}

function countryImageUrl(code: string, _name: string) {
  return `https://flagcdn.com/w640/${code.toLowerCase()}.jpg`;
}

export default function HomePage() {
  const [zip, setZip] = useState("");

  const [nearby, setNearby] = useState<any[] | null>(null);
  const [nearLoading, setNearLoading] = useState(false);
  const [nearError, setNearError] = useState<string | null>(null);

  const { data: countriesRaw, isLoading: countriesLoading, error: countriesError } = useSWR(
    ["countries"],
    () => fetchCountries()
  );

  const countries = useMemo(() => sortCountries(countriesRaw ?? []), [countriesRaw]);

  async function useMyLocation() {
    setNearError(null);
    setNearLoading(true);
    setNearby(null);

    if (!("geolocation" in navigator)) {
      setNearError("Geolocation is not supported in this browser.");
      setNearLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const results = await fetchNearestBranches({ lat, lng, limit: 10, fetchLimit: 100 });
          setNearby(results);
        } catch (e: any) {
          setNearError(e?.message ?? "Failed to load nearby branches.");
        } finally {
          setNearLoading(false);
        }
      },
      (err) => {
        setNearError(err?.message || "Location permission denied.");
        setNearLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30_000 }
    );
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-kicker" />
        <h1 className="hero-title">Find Your Nearest Branch</h1>
        <p className="hero-subtitle">We'll use your location to find the closest branch to you</p>

        <div className="center-row">
          <button className="btn-primary" type="button" onClick={useMyLocation} disabled={nearLoading}>
            {nearLoading ? "Locating…" : "Use My Location"}
          </button>
        </div>

        {nearError && (
          <p className="error" style={{ textAlign: "center", marginTop: 14 }}>
            {nearError}
          </p>
        )}
      </section>

      {nearLoading && <LoadingOverlay label="Finding nearest branches..." />}
      {nearby && (
        <section className="section">
          <h2 className="section-title">Nearest Branches</h2>
          <p className="section-subtitle">Based on your current location</p>

          <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
            {nearby.map((b) => (
              <BranchCard key={b.id ?? `${b.name}-${b.zipCode ?? ""}`} branch={b} />
            ))}
          </div>

          {nearby.length === 0 && <p className="section-subtitle">No nearby branches found.</p>}
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Search by name, city, country, or ZIP code</h2>

        <div className="zip-row">
          <input
            className="input"
            name="zip"
            autoComplete="postal-code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="e.g., Tampa, 10001, Brightstream"
            inputMode="text"
          />
          <Link className="btn" href={zip.trim() ? `/search?q=${encodeURIComponent(zip.trim())}` : "/search"}>
            Find Branches
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Browse by Country</h2>
        <p className="section-subtitle">Select a country to view all branch locations</p>

        {countriesLoading && <LoadingOverlay label="Loading countries..." />}
        {countriesError && <p className="error">Failed to load countries.</p>}

        <div className="country-grid">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={`/countries/${encodeURIComponent(c.code)}`}
              className="country-photo"
              style={{ backgroundImage: `url(${countryImageUrl(c.code, c.name)})` }}
            >
              <div className="country-photo-inner">
                <h3 className="country-photo-title">{c.name}</h3>
                <div className="country-photo-link">View branches</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

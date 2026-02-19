"use client";

import useSWR from "swr";
import LoadingOverlay from "@/components/LoadingOverlay";
import CountryCard from "@/components/CountryCard";
import { fetchCountries } from "@/lib/graph";

function sortCountries(list: { code: string; name: string }[]) {
  return [...list].sort((a, b) => {
    if (a.code === "US") return -1;
    if (b.code === "US") return 1;
    return a.name.localeCompare(b.name);
  });
}

export default function CountriesPage() {
  const { data, isLoading, error } = useSWR(["countries"], () => fetchCountries());

  const countries = sortCountries(data ?? []);

  return (
    <div className="page">
      {isLoading && <LoadingOverlay label="Loading countries..." />}

      <section className="section">
        <h1 className="section-title">Browse by Country</h1>
        <p className="section-subtitle">Select a country to view all branch locations</p>

        {error && <p className="error">Failed to load countries.</p>}

        <div className="country-grid">
          {countries.map((c) => (
            <CountryCard key={c.code} country={c} />
          ))}
        </div>

        {!isLoading && countries.length === 0 && (
          <p className="section-subtitle">No countries found.</p>
        )}
      </section>
    </div>
  );
}

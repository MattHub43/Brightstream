"use client";

import useSWR from "swr";
import CountryCard from "@/components/CountryCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fetchCountries } from "@/lib/graph";

export default function CountriesPage() {
  const { data, isLoading, error } = useSWR("countries", () => fetchCountries());

  return (
    <div className="container">
      {isLoading && <LoadingOverlay label="Loading countries..." />}

      <section className="card">
        <h2 className="section-title">Countries</h2>
        <p className="muted">Browse branches by country.</p>

        {error && <p className="error">Failed to load countries.</p>}

        <div className="country-grid">
          {(data ?? []).map((c) => (
            <CountryCard key={c.code} country={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

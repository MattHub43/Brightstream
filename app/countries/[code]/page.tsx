"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fetchBranchesByCountry, fetchCountries } from "@/lib/graph";

export default function CountryDetailPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();

  // resolve the code to a name first, then fetch branches by name
  const { data: countries, isLoading: countriesLoading } = useSWR("countries", fetchCountries);

  const selected = (countries ?? []).find((c) => c.code.toUpperCase() === code);
  const countryName = selected?.name ?? null;

  const {
    data: branches,
    isLoading: branchesLoading,
    error,
  } = useSWR(countryName ? ["countryBranches", countryName] : null, () =>
    fetchBranchesByCountry({ country: countryName!, limit: 100 })
  );

  const isLoading = countriesLoading || branchesLoading;

  return (
    <div className="container">
      {isLoading && <LoadingOverlay label="Loading branches..." />}

      <section className="card">
        <div className="section-header">
          <h2 className="section-title">Country: {countryName ?? code}</h2>
          <a className="link" href="/countries">
            Back to countries
          </a>
        </div>

        {!countriesLoading && !countryName && (
          <p className="error">Unknown country code: {code}. Please go back and choose a country again.</p>
        )}

        {error && <p className="error">Failed to load branches for this country.</p>}

        <div className="branch-list">
          {(branches ?? []).map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>

        {!isLoading && (branches ?? []).length === 0 && <p className="muted">No branches found for this country.</p>}
      </section>
    </div>
  );
}

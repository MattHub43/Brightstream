"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { searchBranches } from "@/lib/graph";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const sp = useSearchParams();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);

  const key = useMemo(() => {
    const term = q.trim();
    if (!term) return null;
    return ["search", term];
  }, [q]);

  const { data, isLoading, error } = useSWR(key, async () => {
    return searchBranches({ term: q.trim(), limit: 100 });
  });

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
          />
          <button className="btn primary" onClick={() => {}}>
            Search
          </button>
        </div>

        {error && <p className="error">Search failed. Please try again.</p>}
        {!q.trim() && <p className="muted">Enter a search term to see results.</p>}

        <div className="branch-list">
          {(data ?? []).map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>

        {q.trim() && (data ?? []).length === 0 && !isLoading && <p className="muted">No results found.</p>}
      </section>
    </div>
  );
}

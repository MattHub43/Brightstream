"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import BranchCard from "@/components/BranchCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { fetchBranches } from "@/lib/graph";

function getDefaultPageSize() {
  const env = Number(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || "50");
  return Number.isFinite(env) && env > 0 ? env : 50;
}

export default function BranchesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(getDefaultPageSize());

  const key = useMemo(() => ["branches", page, pageSize], [page, pageSize]);

  const { data, isLoading, error } = useSWR(key, () =>
    fetchBranches({ limit: pageSize, skip: page * pageSize })
  );

  const rows = data ?? [];
  const hasNext = rows.length >= pageSize;

  return (
    <div className="page">
      {isLoading && <LoadingOverlay label="Loading branches..." />}

      <header className="page-head">
        <div>
          <h1 className="page-title">All branches</h1>
          <p className="page-subtitle">Browse every branch in the directory.</p>
        </div>

        <div className="head-actions">
          <div className="field">
            <label className="label">Page size</label>
            <select
              className="select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="panel-top">
          <div className="pager">
            <button
              className="btn"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>

            <span className="muted">Page {page + 1}</span>

            <button className="btn" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>

        {error && <p className="error">Failed to load branches.</p>}

        <div className="grid">
          {rows.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </div>

        {!isLoading && rows.length === 0 && <p className="muted">No branches found.</p>}
      </section>
    </div>
  );
}

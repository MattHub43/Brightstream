import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}

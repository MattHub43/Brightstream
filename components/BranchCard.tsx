import type { Branch } from "@/lib/types";

function mapsLink(branch: Branch) {
  const parts = [branch.street, branch.city, branch.zipCode, branch.country].filter(Boolean).join(", ");
  const q = encodeURIComponent(parts || branch.name);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export default function BranchCard({
  branch,
  showDistance,
}: {
  branch: Branch & { distanceMiles?: number | null };
  showDistance?: boolean;
}) {
  const shouldShowDistance =
    typeof showDistance === "boolean" ? showDistance : typeof branch.distanceMiles === "number";

  return (
    <div className="branch-card">
      <div className="branch-card-header">
        <h3 className="branch-name">{branch.name}</h3>

        {shouldShowDistance && typeof branch.distanceMiles === "number" && (
          <span className="pill">{branch.distanceMiles.toFixed(1)} mi</span>
        )}
      </div>

      <div className="branch-body">
        <p className="branch-address">
          {[branch.street, branch.city, branch.zipCode].filter(Boolean).join(", ")}
        </p>
        <p className="branch-meta">{[branch.country, branch.countryCode].filter(Boolean).join(" • ")}</p>

        <div className="branch-actions">
          <a className="btn small" href={mapsLink(branch)} target="_blank" rel="noreferrer">
            Directions
          </a>
          {branch.phone && (
            <a className="btn small" href={`tel:${branch.phone}`}>
              Call
            </a>
          )}
          {branch.email && (
            <a className="btn small" href={`mailto:${branch.email}`}>
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

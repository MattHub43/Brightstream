import type { Country } from "@/lib/types";

export default function CountryCard({ country }: { country: Country }) {
  return (
    <a className="country-card" href={`/countries/${country.code}`}>
      <div className="country-name">{country.name}</div>
      <div className="country-code">{country.code}</div>
    </a>
  );
}

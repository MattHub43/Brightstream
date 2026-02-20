import type { Country } from "@/lib/types";

function flagImageUrl(code: string) {
  return `https://flagcdn.com/w640/${code.toLowerCase()}.jpg`;
}

export default function CountryCard({ country }: { country: Country }) {
  return (
    <a
      href={`/countries/${country.code}`}
      className="country-photo"
      style={{ backgroundImage: `url(${flagImageUrl(country.code)})` }}
    >
      <div className="country-photo-inner">
        <h3 className="country-photo-title">{country.name}</h3>
        <div className="country-photo-link">View branches</div>
      </div>
    </a>
  );
}

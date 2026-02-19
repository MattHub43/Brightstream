# Brightstream Branch Locator (Next.js)

A take-home skeleton for a bank branch locator web app powered by the Optimizely GraphQL Content Graph endpoint.

## What this includes

- Next.js App Router (React + TypeScript)
- `/api/graph` proxy route to keep the Graph auth key server-side
- Pages:
  - Home: geolocation → nearest branches, ZIP quick search, country preview
  - Search: name/city/country/ZIP search
  - Countries: browse countries
  - Country detail: branches filtered by country code
  - All Branches: simple pagination
- SWR for client caching
- Your existing CSS ported into `styles/globals.css` (with small safe additions)

## Setup

1) Install dependencies

```bash
npm install
```

2) Add environment variables

Copy `.env.example` to `.env` and set:

- `OPTIMIZELY_GRAPH_AUTH=...`

```bash
cp .env.example .env
```

3) Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Notes

- Authentication (user login) is not required by the assignment, but the Graph auth key is protected server-side.
- "Nearest branches" computes distances client-side using branch coordinates (if present).
- Countries are derived by sampling up to 1000 branches and deduplicating Country/CountryCode pairs.

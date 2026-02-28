# ATP Analytics — Tennis Statistics Dashboard

Interactive analytics dashboard for professional men's tennis (ATP) statistics spanning 1968–2024. Built with Next.js and designed for deployment on Vercel.

Data sourced from [Jeff Sackmann's tennis_atp](https://github.com/JeffSackmann/tennis_atp) repository — the most comprehensive open dataset of ATP match results, player info, and rankings.

## Features

- **Dashboard** — KPI cards (matches, players, tournaments), matches per year trend, surface distribution, surface trends over time, Grand Slam leaders, average match duration by decade
- **Player Explorer** — Searchable grid of 7,500+ players with win rates and country badges
- **Player Profiles** — Individual player pages with surface breakdown, match history, and tournament level performance
- **Head-to-Head** — Compare any two players with H2H record, surface breakdown, and full match history
- **Data Explorer** — Filterable, sortable data table (TanStack Table) with year selection, global search, and pagination across ~195K matches

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (19 components, new-york style) |
| Charts | Recharts |
| Data Table | TanStack React Table |
| State | Zustand |
| Fonts | Geist Sans / Geist Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/diegobenedicto/tennis_atp_viz.git
cd tennis_atp_viz

# Install dependencies
npm install

# Run the ETL pipeline (downloads & processes ATP data)
npm run etl

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### ETL Pipeline

The `npm run etl` command downloads CSV files from the tennis_atp repository, parses and normalizes them, and outputs optimized JSON files to `public/data/`. This step is required before running the app — the data files are not checked into the repository.

The pipeline produces:
- `stats.json` — Pre-aggregated dashboard statistics
- `metadata.json` — Filters, tournament lists, top players
- `players.json` — Full player directory
- `matches/{year}.json` — Match data partitioned by year for on-demand loading

## Deployment

### Vercel (Recommended)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the **Build Command** to:
   ```
   npm run etl && npm run build
   ```
4. Deploy

The ETL step runs during the build so the data files are included in the production output. No database or external API required — the app is fully static after build.

### Manual Build

```bash
npm run etl
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with AppShell
│   ├── page.tsx                # Dashboard
│   ├── explore/page.tsx        # Data table explorer
│   ├── h2h/page.tsx            # Head-to-head comparison
│   └── player/
│       ├── page.tsx            # Player explorer grid
│       └── [id]/page.tsx       # Player profile
├── components/
│   ├── layout/app-shell.tsx    # Sidebar navigation
│   └── ui/                     # shadcn/ui components
├── hooks/use-data.ts           # React data hooks
├── lib/
│   ├── data.ts                 # Data fetching & helpers
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions
└── store/filters.ts            # Zustand filter state
scripts/
└── etl.ts                      # ETL pipeline
```

## Data Source

All tennis data is from [Jeff Sackmann's tennis_atp](https://github.com/JeffSackmann/tennis_atp) repository.

Licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## License

This project's code is MIT licensed. The underlying tennis data retains its original CC BY-NC-SA 4.0 license.

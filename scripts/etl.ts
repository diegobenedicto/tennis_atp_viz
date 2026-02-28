/**
 * ETL Script: Downloads ATP tennis data from GitHub → optimized static JSON.
 * 
 * Output: public/data/
 *   - metadata.json     (filter options, data ranges)
 *   - players.json      (player master data, active players only)
 *   - stats.json        (pre-aggregated dashboard stats)
 *   - matches/{year}.json (yearly match files for on-demand loading)
 *
 * Usage: npx tsx scripts/etl.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

const BASE_URL =
  "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master";
const OUT_DIR = join(process.cwd(), "public", "data");

interface RawMatch {
  tourney_id: string;
  tourney_name: string;
  surface: string;
  draw_size: string;
  tourney_level: string;
  tourney_date: string;
  match_num: string;
  winner_id: string;
  winner_seed: string;
  winner_entry: string;
  winner_name: string;
  winner_hand: string;
  winner_ht: string;
  winner_ioc: string;
  winner_age: string;
  loser_id: string;
  loser_seed: string;
  loser_entry: string;
  loser_name: string;
  loser_hand: string;
  loser_ht: string;
  loser_ioc: string;
  loser_age: string;
  score: string;
  best_of: string;
  round: string;
  minutes: string;
  w_ace: string;
  w_df: string;
  w_svpt: string;
  w_1stIn: string;
  w_1stWon: string;
  w_2ndWon: string;
  w_SvGms: string;
  w_bpSaved: string;
  w_bpFaced: string;
  l_ace: string;
  l_df: string;
  l_svpt: string;
  l_1stIn: string;
  l_1stWon: string;
  l_2ndWon: string;
  l_SvGms: string;
  l_bpSaved: string;
  l_bpFaced: string;
  winner_rank: string;
  winner_rank_points: string;
  loser_rank: string;
  loser_rank_points: string;
}

interface RawPlayer {
  player_id: string;
  name_first: string;
  name_last: string;
  hand: string;
  dob: string;
  ioc: string;
  height: string;
  wikidata_id: string;
}

function toInt(v: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function toFloat(v: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

async function fetchCSV(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseCSV<T>(csvText: string): T[] {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as T[];
}

function transformMatch(r: RawMatch) {
  return {
    tid: r.tourney_id,
    tn: r.tourney_name,
    sf: r.surface || null,
    ds: toInt(r.draw_size),
    tl: r.tourney_level,
    td: toInt(r.tourney_date),
    mn: toInt(r.match_num),
    wi: toInt(r.winner_id),
    ws: toInt(r.winner_seed),
    we: r.winner_entry || null,
    wn: r.winner_name,
    wh: r.winner_hand || null,
    wht: toInt(r.winner_ht),
    wc: r.winner_ioc || null,
    wa: toFloat(r.winner_age),
    li: toInt(r.loser_id),
    ls: toInt(r.loser_seed),
    le: r.loser_entry || null,
    ln: r.loser_name,
    lh: r.loser_hand || null,
    lht: toInt(r.loser_ht),
    lc: r.loser_ioc || null,
    la: toFloat(r.loser_age),
    sc: r.score || null,
    bo: toInt(r.best_of),
    rd: r.round || null,
    mi: toInt(r.minutes),
    wAce: toInt(r.w_ace),
    wDf: toInt(r.w_df),
    wSv: toInt(r.w_svpt),
    w1i: toInt(r.w_1stIn),
    w1w: toInt(r.w_1stWon),
    w2w: toInt(r.w_2ndWon),
    wSg: toInt(r.w_SvGms),
    wBs: toInt(r.w_bpSaved),
    wBf: toInt(r.w_bpFaced),
    lAce: toInt(r.l_ace),
    lDf: toInt(r.l_df),
    lSv: toInt(r.l_svpt),
    l1i: toInt(r.l_1stIn),
    l1w: toInt(r.l_1stWon),
    l2w: toInt(r.l_2ndWon),
    lSg: toInt(r.l_SvGms),
    lBs: toInt(r.l_bpSaved),
    lBf: toInt(r.l_bpFaced),
    wr: toInt(r.winner_rank),
    wrp: toInt(r.winner_rank_points),
    lr: toInt(r.loser_rank),
    lrp: toInt(r.loser_rank_points),
  };
}

export type Match = ReturnType<typeof transformMatch>;

function transformPlayer(r: RawPlayer) {
  return {
    id: toInt(r.player_id),
    fn: r.name_first || null,
    ln: r.name_last || null,
    name: [r.name_first, r.name_last].filter(Boolean).join(" "),
    hand: r.hand || null,
    dob: toInt(r.dob),
    ioc: r.ioc || null,
    ht: toInt(r.height),
  };
}

export type Player = ReturnType<typeof transformPlayer>;

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log("🎾 ATP Tennis ETL Pipeline");
  console.log("=".repeat(50));

  console.log("\n📥 Downloading players...");
  const playersCSV = await fetchCSV(`${BASE_URL}/atp_players.csv`);
  const rawPlayers = parseCSV<RawPlayer>(playersCSV);
  const players = rawPlayers.map(transformPlayer);
  console.log(`   ✅ ${players.length} players parsed`);

  const playerIds = new Set<number>();

  console.log("\n📥 Downloading matches (1968-2024)...");
  const allMatches: Match[] = [];
  const START_YEAR = 1968;
  const END_YEAR = 2024;

  for (let batchStart = START_YEAR; batchStart <= END_YEAR; batchStart += 10) {
    const batchEnd = Math.min(batchStart + 9, END_YEAR);
    const urls = [];
    for (let y = batchStart; y <= batchEnd; y++) {
      urls.push({ year: y, url: `${BASE_URL}/atp_matches_${y}.csv` });
    }

    const results = await Promise.all(
      urls.map(async ({ year, url }) => {
        try {
          const csv = await fetchCSV(url);
          const rows = parseCSV<RawMatch>(csv);
          return { year, rows };
        } catch {
          console.warn(`   ⚠️  Skipping ${year}`);
          return { year, rows: [] };
        }
      })
    );

    for (const { year, rows } of results) {
      const transformed = rows.map(transformMatch);
      allMatches.push(...transformed);
      for (const m of transformed) {
        if (m.wi) playerIds.add(m.wi);
        if (m.li) playerIds.add(m.li);
      }
      if (rows.length > 0) {
        process.stdout.write(`   ✅ ${year}: ${rows.length}  `);
        if ((year - START_YEAR + 1) % 5 === 0) console.log();
      }
    }
  }
  console.log(`\n   📊 Total: ${allMatches.length} matches`);

  const activePlayers = players.filter(
    (p) => p.id !== null && playerIds.has(p.id)
  );
  console.log(`\n👤 Active players: ${activePlayers.length}`);

  const surfaces = [...new Set(allMatches.map((m) => m.sf).filter(Boolean))].sort() as string[];
  const tourneyLevels = [...new Set(allMatches.map((m) => m.tl).filter(Boolean))].sort() as string[];
  const countries = [...new Set(activePlayers.map((p) => p.ioc).filter(Boolean))].sort() as string[];
  const tournaments = [...new Set(allMatches.map((m) => m.tn).filter(Boolean))].sort() as string[];

  let minYear = Infinity;
  let maxYear = -Infinity;
  for (const m of allMatches) {
    if (m.td) {
      const y = Math.floor(m.td / 10000);
      if (y < minYear) minYear = y;
      if (y > maxYear) maxYear = y;
    }
  }

  const playerMatchCounts = new Map<number, { wins: number; losses: number }>();
  for (const m of allMatches) {
    if (m.wi) {
      const cur = playerMatchCounts.get(m.wi) || { wins: 0, losses: 0 };
      cur.wins++;
      playerMatchCounts.set(m.wi, cur);
    }
    if (m.li) {
      const cur = playerMatchCounts.get(m.li) || { wins: 0, losses: 0 };
      cur.losses++;
      playerMatchCounts.set(m.li, cur);
    }
  }

  const topPlayers = [...playerMatchCounts.entries()]
    .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
    .slice(0, 500)
    .map(([id, record]) => {
      const p = activePlayers.find((pl) => pl.id === id);
      return p ? { id: p.id, name: p.name, ioc: p.ioc, w: record.wins, l: record.losses } : null;
    })
    .filter(Boolean);

  console.log("\n📊 Building pre-aggregated stats...");

  const matchesByYear = new Map<number, Match[]>();
  const statsByYear: Record<number, { matches: number; surfaces: Record<string, number>; levels: Record<string, number> }> = {};
  const statsBySurface: Record<string, number> = {};
  const statsByLevel: Record<string, number> = {};
  const matchesByYearSurface: Record<string, number> = {};

  for (const m of allMatches) {
    const year = m.td ? Math.floor(m.td / 10000) : 0;
    if (!matchesByYear.has(year)) matchesByYear.set(year, []);
    matchesByYear.get(year)!.push(m);

    if (!statsByYear[year]) statsByYear[year] = { matches: 0, surfaces: {}, levels: {} };
    statsByYear[year].matches++;
    if (m.sf) {
      statsByYear[year].surfaces[m.sf] = (statsByYear[year].surfaces[m.sf] || 0) + 1;
      statsBySurface[m.sf] = (statsBySurface[m.sf] || 0) + 1;
    }
    if (m.tl) {
      statsByYear[year].levels[m.tl] = (statsByYear[year].levels[m.tl] || 0) + 1;
      statsByLevel[m.tl] = (statsByLevel[m.tl] || 0) + 1;
    }
    if (m.sf && m.td) {
      const key = `${year}-${m.sf}`;
      matchesByYearSurface[key] = (matchesByYearSurface[key] || 0) + 1;
    }
  }

  const grandSlamWinners: Record<string, number> = {};
  for (const m of allMatches) {
    if (m.tl === "G" && m.rd === "F" && m.wn) {
      grandSlamWinners[m.wn] = (grandSlamWinners[m.wn] || 0) + 1;
    }
  }

  const topGrandSlamWinners = Object.entries(grandSlamWinners)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  const avgMatchDurationByDecade: Record<string, { total: number; count: number }> = {};
  for (const m of allMatches) {
    if (m.mi && m.td) {
      const decade = `${Math.floor(Math.floor(m.td / 10000) / 10) * 10}s`;
      if (!avgMatchDurationByDecade[decade]) avgMatchDurationByDecade[decade] = { total: 0, count: 0 };
      avgMatchDurationByDecade[decade].total += m.mi;
      avgMatchDurationByDecade[decade].count++;
    }
  }

  const surfaceTrends: { year: number; Hard: number; Clay: number; Grass: number; Carpet: number }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    surfaceTrends.push({
      year: y,
      Hard: matchesByYearSurface[`${y}-Hard`] || 0,
      Clay: matchesByYearSurface[`${y}-Clay`] || 0,
      Grass: matchesByYearSurface[`${y}-Grass`] || 0,
      Carpet: matchesByYearSurface[`${y}-Carpet`] || 0,
    });
  }

  const stats = {
    total_matches: allMatches.length,
    total_players: activePlayers.length,
    total_tournaments: tournaments.length,
    by_year: Object.entries(statsByYear)
      .map(([y, v]) => ({ year: Number(y), ...v }))
      .sort((a, b) => a.year - b.year),
    by_surface: statsBySurface,
    by_level: statsByLevel,
    surface_trends: surfaceTrends,
    grand_slam_leaders: topGrandSlamWinners,
    avg_duration_by_decade: Object.entries(avgMatchDurationByDecade)
      .map(([decade, v]) => ({ decade, avg: Math.round(v.total / v.count) }))
      .sort((a, b) => a.decade.localeCompare(b.decade)),
  };

  const metadata = {
    total_matches: allMatches.length,
    total_players: activePlayers.length,
    year_range: { min: minYear, max: maxYear },
    surfaces,
    tourney_levels: tourneyLevels,
    tourney_level_labels: {
      G: "Grand Slam",
      M: "Masters 1000",
      A: "ATP Tour",
      F: "Tour Finals",
      D: "Davis Cup",
      C: "Challenger",
    } as Record<string, string>,
    rounds: ["F", "SF", "QF", "R16", "R32", "R64", "R128", "RR"],
    countries,
    tournaments,
    top_players: topPlayers,
    available_years: [...matchesByYear.keys()].filter(y => y > 0).sort(),
    generated_at: new Date().toISOString(),
  };

  console.log("\n💾 Writing output files...");

  const matchesDir = join(OUT_DIR, "matches");
  if (!existsSync(matchesDir)) mkdirSync(matchesDir, { recursive: true });

  for (const [year, matches] of matchesByYear) {
    if (year > 0) {
      writeFileSync(join(matchesDir, `${year}.json`), JSON.stringify(matches));
    }
  }
  console.log(`   ✅ matches/ (${matchesByYear.size} yearly files)`);

  writeFileSync(join(OUT_DIR, "players.json"), JSON.stringify(activePlayers));
  console.log(`   ✅ players.json`);

  writeFileSync(join(OUT_DIR, "metadata.json"), JSON.stringify(metadata, null, 2));
  console.log(`   ✅ metadata.json`);

  writeFileSync(join(OUT_DIR, "stats.json"), JSON.stringify(stats));
  console.log(`   ✅ stats.json`);

  console.log("\n✨ ETL complete!");
}

main().catch((err) => {
  console.error("❌ ETL failed:", err);
  process.exit(1);
});

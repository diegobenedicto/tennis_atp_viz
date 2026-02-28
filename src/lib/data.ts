
import type { Match, Metadata, Player, Stats } from "./types";

const BASE = "/data";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}



let _metadata: Metadata | null = null;
let _stats: Stats | null = null;
let _players: Player[] | null = null;
const _matchCache = new Map<number, Match[]>();



export async function getMetadata(): Promise<Metadata> {
  if (_metadata) return _metadata;
  _metadata = await fetchJSON<Metadata>("/metadata.json");
  return _metadata;
}

export async function getStats(): Promise<Stats> {
  if (_stats) return _stats;
  _stats = await fetchJSON<Stats>("/stats.json");
  return _stats;
}

export async function getPlayers(): Promise<Player[]> {
  if (_players) return _players;
  _players = await fetchJSON<Player[]>("/players.json");
  return _players;
}

export async function getMatchesByYear(year: number): Promise<Match[]> {
  if (_matchCache.has(year)) return _matchCache.get(year)!;
  const matches = await fetchJSON<Match[]>(`/matches/${year}.json`);
  _matchCache.set(year, matches);
  return matches;
}

export async function getMatchesForYears(years: number[]): Promise<Match[]> {
  const results = await Promise.all(years.map(getMatchesByYear));
  return results.flat();
}



export function getYear(td: number | null): number {
  if (!td) return 0;
  return Math.floor(td / 10000);
}

export function formatDate(td: number | null): string {
  if (!td) return "—";
  const s = String(td);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function getPlayerById(
  players: Player[],
  id: number | null
): Player | undefined {
  if (!id) return undefined;
  return players.find((p) => p.id === id);
}


export function computePlayerRecord(
  matches: Match[],
  playerId: number
): { wins: number; losses: number; matches: Match[] } {
  const wins: Match[] = [];
  const losses: Match[] = [];
  for (const m of matches) {
    if (m.wi === playerId) wins.push(m);
    else if (m.li === playerId) losses.push(m);
  }
  return {
    wins: wins.length,
    losses: losses.length,
    matches: [...wins, ...losses],
  };
}


export function computeH2H(
  matches: Match[],
  p1Id: number,
  p2Id: number
): { p1Wins: number; p2Wins: number; matches: Match[] } {
  const h2hMatches = matches.filter(
    (m) =>
      (m.wi === p1Id && m.li === p2Id) || (m.wi === p2Id && m.li === p1Id)
  );
  let p1Wins = 0;
  let p2Wins = 0;
  for (const m of h2hMatches) {
    if (m.wi === p1Id) p1Wins++;
    else p2Wins++;
  }
  return { p1Wins, p2Wins, matches: h2hMatches };
}


export interface Match {
  tid: string;        // tourney_id
  tn: string;         // tourney_name
  sf: string | null;  // surface (Hard/Clay/Grass/Carpet)
  ds: number | null;  // draw_size
  tl: string;         // tourney_level (G/M/A/F/D/C)
  td: number | null;  // tourney_date (YYYYMMDD)
  mn: number | null;  // match_num
  wi: number | null;  // winner_id
  ws: number | null;  // winner_seed
  we: string | null;  // winner_entry
  wn: string;         // winner_name
  wh: string | null;  // winner_hand
  wht: number | null; // winner_height
  wc: string | null;  // winner_ioc
  wa: number | null;  // winner_age
  li: number | null;  // loser_id
  ls: number | null;  // loser_seed
  le: string | null;  // loser_entry
  ln: string;         // loser_name
  lh: string | null;  // loser_hand
  lht: number | null; // loser_height
  lc: string | null;  // loser_ioc
  la: number | null;  // loser_age
  sc: string | null;  // score
  bo: number | null;  // best_of
  rd: string | null;  // round (F/SF/QF/R16/R32/R64/R128/RR)
  mi: number | null;  // minutes
  // winner serve stats
  wAce: number | null;
  wDf: number | null;
  wSv: number | null;  // serve points
  w1i: number | null;  // 1st serve in
  w1w: number | null;  // 1st serve won
  w2w: number | null;  // 2nd serve won
  wSg: number | null;  // serve games
  wBs: number | null;  // break points saved
  wBf: number | null;  // break points faced
  // loser serve stats
  lAce: number | null;
  lDf: number | null;
  lSv: number | null;
  l1i: number | null;
  l1w: number | null;
  l2w: number | null;
  lSg: number | null;
  lBs: number | null;
  lBf: number | null;
  // rankings
  wr: number | null;   // winner_rank
  wrp: number | null;  // winner_rank_points
  lr: number | null;   // loser_rank
  lrp: number | null;  // loser_rank_points
}

// ── Player (from players.json) ──

export interface Player {
  id: number | null;
  fn: string | null;  // first name
  ln: string | null;  // last name
  name: string;       // full name
  hand: string | null; // R/L/U
  dob: number | null; // YYYYMMDD
  ioc: string | null; // country code
  ht: number | null;  // height in cm
}

// ── TopPlayer (from metadata.json top_players) ──

export interface TopPlayer {
  id: number;
  name: string;
  ioc: string | null;
  w: number; // wins
  l: number; // losses
}

// ── Stats (from stats.json — pre-aggregated) ──

export interface YearStats {
  year: number;
  matches: number;
  surfaces: Record<string, number>;
  levels: Record<string, number>;
}

export interface SurfaceTrend {
  year: number;
  Hard: number;
  Clay: number;
  Grass: number;
  Carpet: number;
}

export interface GrandSlamLeader {
  name: string;
  count: number;
}

export interface DurationByDecade {
  decade: string;
  avg: number;
}

export interface Stats {
  total_matches: number;
  total_players: number;
  total_tournaments: number;
  by_year: YearStats[];
  by_surface: Record<string, number>;
  by_level: Record<string, number>;
  surface_trends: SurfaceTrend[];
  grand_slam_leaders: GrandSlamLeader[];
  avg_duration_by_decade: DurationByDecade[];
}

// ── Metadata (from metadata.json) ──

export interface Metadata {
  total_matches: number;
  total_players: number;
  year_range: { min: number; max: number };
  surfaces: string[];
  tourney_levels: string[];
  tourney_level_labels: Record<string, string>;
  rounds: string[];
  countries: string[];
  tournaments: string[];
  top_players: TopPlayer[];
  available_years: number[];
  generated_at: string;
}

// ── Surface constants ──

export const SURFACE_COLORS: Record<string, string> = {
  Hard: "hsl(220, 70%, 55%)",
  Clay: "hsl(20, 70%, 50%)",
  Grass: "hsl(120, 55%, 45%)",
  Carpet: "hsl(270, 50%, 55%)",
};

export const LEVEL_LABELS: Record<string, string> = {
  G: "Grand Slam",
  M: "Masters 1000",
  A: "ATP Tour",
  F: "Tour Finals",
  D: "Davis Cup",
  C: "Challenger",
};

export const ROUND_ORDER: Record<string, number> = {
  F: 0,
  SF: 1,
  QF: 2,
  R16: 3,
  R32: 4,
  R64: 5,
  R128: 6,
  RR: 7,
};

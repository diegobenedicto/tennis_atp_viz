"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { usePlayers, useMetadata, useMatchesForYears } from "@/hooks/use-data";
import { computePlayerRecord, formatDate, formatDuration } from "@/lib/data";
import { SURFACE_COLORS, LEVEL_LABELS } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const HAND_LABELS: Record<string, string> = {
  R: "Right-handed",
  L: "Left-handed",
  U: "Unknown",
};

const SURFACES = ["Hard", "Clay", "Grass", "Carpet"];

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = Number(params.id);
  const [showAll, setShowAll] = useState(false);

  const { data: players, loading: loadingPlayers } = usePlayers();
  const { data: metadata, loading: loadingMeta } = useMetadata();

  const availableYears = useMemo(
    () => metadata?.available_years ?? [],
    [metadata]
  );

  const { data: allMatches, loading: loadingMatches } = useMatchesForYears(availableYears);

  const loading = loadingPlayers || loadingMeta || loadingMatches;

  const player = useMemo(
    () => players?.find((p) => p.id === playerId) ?? null,
    [players, playerId]
  );

  const record = useMemo(() => {
    if (!allMatches || isNaN(playerId)) return null;
    return computePlayerRecord(allMatches, playerId);
  }, [allMatches, playerId]);

  const sortedMatches = useMemo(() => {
    if (!record) return [];
    return [...record.matches].sort((a, b) => (b.td ?? 0) - (a.td ?? 0));
  }, [record]);

  const displayMatches = showAll ? sortedMatches : sortedMatches.slice(0, 100);

  if (isNaN(playerId)) {
    return (
      <div className="space-y-4">
        <p className="text-red-500 font-medium">Invalid player ID.</p>
        <Link href="/player" className="text-sm underline text-muted-foreground">
          &larr; Back to Player Explorer
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted/50 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="space-y-4">
        <p className="text-red-500 font-medium">Player not found.</p>
        <Link href="/player" className="text-sm underline text-muted-foreground">
          &larr; Back to Player Explorer
        </Link>
      </div>
    );
  }

  const wins = record?.wins ?? 0;
  const losses = record?.losses ?? 0;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

  // Surface breakdown
  const surfaceStats = SURFACES.map((surface) => {
    const surfaceMatches = record?.matches.filter((m) => m.sf === surface) ?? [];
    const sw = surfaceMatches.filter((m) => m.wi === playerId).length;
    const sl = surfaceMatches.length - sw;
    const sTotal = sw + sl;
    const pct = sTotal > 0 ? ((sw / sTotal) * 100).toFixed(1) : "0.0";
    return { surface, wins: sw, losses: sl, total: sTotal, pct };
  });

  // Level breakdown
  const levelMap = new Map<string, { w: number; l: number }>();
  for (const m of record?.matches ?? []) {
    const key = m.tl;
    if (!key) continue;
    const entry = levelMap.get(key) ?? { w: 0, l: 0 };
    if (m.wi === playerId) entry.w++;
    else entry.l++;
    levelMap.set(key, entry);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/player"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Player Explorer
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {player.ioc && (
            <Badge variant="outline">{player.ioc}</Badge>
          )}
          {player.hand && (
            <Badge variant="secondary">
              {HAND_LABELS[player.hand] ?? player.hand}
            </Badge>
          )}
          {player.ht && (
            <Badge variant="secondary">{player.ht} cm</Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{wins.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{losses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Match History</TabsTrigger>
          <TabsTrigger value="levels">Tournament Levels</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <h2 className="text-lg font-semibold">Surface Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {surfaceStats.map(({ surface, wins: sw, losses: sl, total: sTotal, pct }) => (
              <Card key={surface}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{surface}</span>
                    <span className="text-sm text-muted-foreground">
                      {sw}W – {sl}L ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sTotal > 0 ? (sw / sTotal) * 100 : 0}%`,
                        backgroundColor: SURFACE_COLORS[surface] ?? "hsl(0,0%,60%)",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Match History Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMatches.map((m, i) => {
                  const isWin = m.wi === playerId;
                  return (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{formatDate(m.td)}</TableCell>
                      <TableCell>{m.tn}</TableCell>
                      <TableCell>
                        {m.sf && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: SURFACE_COLORS[m.sf] ?? undefined,
                              color: SURFACE_COLORS[m.sf] ?? undefined,
                            }}
                          >
                            {m.sf}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{m.rd}</TableCell>
                      <TableCell>{isWin ? m.ln : m.wn}</TableCell>
                      <TableCell>
                        <Badge
                          variant={isWin ? "default" : "destructive"}
                          className={
                            isWin
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : ""
                          }
                        >
                          {isWin ? "W" : "L"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{m.sc ?? "—"}</TableCell>
                      <TableCell>{formatDuration(m.mi)}</TableCell>
                    </TableRow>
                  );
                })}
                {sortedMatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No matches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!showAll && sortedMatches.length > 100 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setShowAll(true)}>
                Show all {sortedMatches.length.toLocaleString()} matches
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tournament Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from(levelMap.entries())
              .sort((a, b) => (b[1].w + b[1].l) - (a[1].w + a[1].l))
              .map(([level, { w, l }]) => {
                const lt = w + l;
                const lPct = lt > 0 ? ((w / lt) * 100).toFixed(1) : "0.0";
                return (
                  <Card key={level}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{LEVEL_LABELS[level] ?? level}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-emerald-600 font-semibold">{w}W</span>
                        <span className="text-rose-600 font-semibold">{l}L</span>
                        <span className="text-muted-foreground">{lPct}%</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
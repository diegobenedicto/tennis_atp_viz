"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Swords } from "lucide-react";

import { useMetadata, useMatchesForYears } from "@/hooks/use-data";
import { computeH2H, formatDate, formatDuration } from "@/lib/data";
import { SURFACE_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SURFACES = ["Hard", "Clay", "Grass", "Carpet"];

export default function HeadToHeadPage() {
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  const { data: metadata, loading: loadingMeta } = useMetadata();
  const players = metadata?.top_players ?? [];

  const availableYears = useMemo(
    () => metadata?.available_years ?? [],
    [metadata]
  );

  const shouldLoad = player1Id !== null && player2Id !== null;
  const { data: allMatches, loading: loadingMatches } = useMatchesForYears(
    shouldLoad ? availableYears : []
  );

  const h2h = useMemo(() => {
    if (!allMatches || !player1Id || !player2Id) return null;
    return computeH2H(allMatches, player1Id, player2Id);
  }, [allMatches, player1Id, player2Id]);

  const player1 = players.find((p) => p.id === player1Id);
  const player2 = players.find((p) => p.id === player2Id);

  const sortedH2hMatches = useMemo(() => {
    if (!h2h) return [];
    return [...h2h.matches].sort((a, b) => (b.td ?? 0) - (a.td ?? 0));
  }, [h2h]);

  const totalH2h = (h2h?.p1Wins ?? 0) + (h2h?.p2Wins ?? 0);
  const p1Pct = totalH2h > 0 ? ((h2h!.p1Wins / totalH2h) * 100) : 50;

  if (loadingMeta) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted/50 animate-pulse" />
        <div className="h-12 w-full rounded bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Head-to-Head</h1>
        <p className="text-muted-foreground">
          Compare two players&apos; head-to-head record
        </p>
      </div>

      {/* Player Selection */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Player 1 Combobox */}
        <Popover open={open1} onOpenChange={setOpen1}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open1}
              className="w-full sm:w-[260px] justify-between"
            >
              {player1 ? player1.name : "Select player 1..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0">
            <Command>
              <CommandInput placeholder="Search players..." />
              <CommandList>
                <CommandEmpty>No player found.</CommandEmpty>
                <CommandGroup>
                  {players.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => {
                        setPlayer1Id(p.id === player1Id ? null : p.id);
                        setOpen1(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          player1Id === p.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {p.name}
                      {p.ioc && (
                        <span className="ml-auto text-xs text-muted-foreground">{p.ioc}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Swords className="h-6 w-6 text-muted-foreground shrink-0" />

        {/* Player 2 Combobox */}
        <Popover open={open2} onOpenChange={setOpen2}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open2}
              className="w-full sm:w-[260px] justify-between"
            >
              {player2 ? player2.name : "Select player 2..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0">
            <Command>
              <CommandInput placeholder="Search players..." />
              <CommandList>
                <CommandEmpty>No player found.</CommandEmpty>
                <CommandGroup>
                  {players.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => {
                        setPlayer2Id(p.id === player2Id ? null : p.id);
                        setOpen2(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          player2Id === p.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {p.name}
                      {p.ioc && (
                        <span className="ml-auto text-xs text-muted-foreground">{p.ioc}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results */}
      {!shouldLoad && (
        <div className="text-center py-12 text-muted-foreground">
          Select two players above to compare their head-to-head record.
        </div>
      )}

      {shouldLoad && loadingMatches && (
        <div className="space-y-4">
          <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          <div className="h-48 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      )}

      {shouldLoad && h2h && totalH2h === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No matches found between {player1?.name} and {player2?.name}.
        </div>
      )}

      {shouldLoad && h2h && totalH2h > 0 && (
        <>
          {/* H2H Score Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1">
                  <div className="text-lg font-semibold">{player1?.name}</div>
                  <div className="text-3xl font-bold text-emerald-600">{h2h.p1Wins}</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-4">&mdash;</div>
                <div className="text-center flex-1">
                  <div className="text-lg font-semibold">{player2?.name}</div>
                  <div className="text-3xl font-bold text-rose-600">{h2h.p2Wins}</div>
                </div>
              </div>
              <div className="h-3 rounded-full bg-rose-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${p1Pct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Surface Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SURFACES.map((surface) => {
              const sm = h2h.matches.filter((m) => m.sf === surface);
              const s1 = sm.filter((m) => m.wi === player1Id).length;
              const s2 = sm.length - s1;
              if (sm.length === 0) return null;
              return (
                <Card key={surface}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: SURFACE_COLORS[surface],
                          color: SURFACE_COLORS[surface],
                        }}
                      >
                        {surface}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-semibold">{s1}</span>
                      <span className="text-muted-foreground">–</span>
                      <span className="text-rose-600 font-semibold">{s2}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Match History */}
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tournament</TableHead>
                      <TableHead>Surface</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedH2hMatches.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(m.td)}
                        </TableCell>
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
                        <TableCell className="font-medium">{m.wn}</TableCell>
                        <TableCell className="whitespace-nowrap">{m.sc ?? "—"}</TableCell>
                        <TableCell>{formatDuration(m.mi)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { useMetadata } from "@/hooks/use-data";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlayerSearchPage() {
  const { data: metadata, loading } = useMetadata();
  const [search, setSearch] = useState("");

  const players = metadata?.top_players || [];
  
  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Limit initially displayed players for performance if no search
  const displayPlayers = search ? filteredPlayers : filteredPlayers.slice(0, 50);

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Explorer</h1>
          <p className="text-muted-foreground mt-1">
            Browse top ATP players and view detailed career statistics
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search players..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayPlayers.map((player) => {
            const total = player.w + player.l;
            const winRate = total > 0 ? ((player.w / total) * 100).toFixed(1) : "0.0";
            
            return (
              <Link key={player.id} href={`/player/${player.id}`}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer group border-transparent bg-muted/30 hover:border-border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {player.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {player.ioc && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                              {player.ioc}
                            </Badge>
                          )}
                          <span className="text-xs">ID: {player.id}</span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                         <span className="text-xl font-bold tracking-tighter tabular-nums">
                            {winRate}%
                         </span>
                         <div className="text-[10px] text-muted-foreground uppercase font-medium">Win Rate</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col bg-background/50 p-2 rounded-md">
                        <span className="text-muted-foreground text-xs uppercase">Wins</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{player.w}</span>
                      </div>
                      <div className="flex flex-col bg-background/50 p-2 rounded-md">
                        <span className="text-muted-foreground text-xs uppercase">Losses</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{player.l}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      
      {!loading && displayPlayers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No players found matching "{search}"
        </div>
      )}
    </div>
  );
}

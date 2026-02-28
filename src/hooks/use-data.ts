"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMatchesByYear,
  getMatchesForYears,
  getMetadata,
  getPlayers,
  getStats,
} from "@/lib/data";
import type { Match, Metadata, Player, Stats } from "@/lib/types";



interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}



export function useStats(): AsyncState<Stats> {
  return useAsync(getStats);
}

export function useMetadata(): AsyncState<Metadata> {
  return useAsync(getMetadata);
}

export function usePlayers(): AsyncState<Player[]> {
  return useAsync(getPlayers);
}

export function useMatchesByYear(year: number | null): AsyncState<Match[]> {
  const fetcher = useCallback(
    () => (year ? getMatchesByYear(year) : Promise.resolve([])),
    [year]
  );
  return useAsync(fetcher, [year]);
}

export function useMatchesForYears(years: number[]): AsyncState<Match[]> {
  const key = years.join(",");
  const fetcher = useCallback(
    () => (years.length > 0 ? getMatchesForYears(years) : Promise.resolve([])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  return useAsync(fetcher, [key]);
}

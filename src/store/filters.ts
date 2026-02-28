"use client";

import { create } from "zustand";

export interface FilterState {
  yearFrom: number;
  yearTo: number;
  surfaces: string[];
  levels: string[];
  playerSearch: string;
  selectedPlayerId: number | null;
}

interface FilterActions {
  setYearRange: (from: number, to: number) => void;
  setSurfaces: (surfaces: string[]) => void;
  toggleSurface: (surface: string) => void;
  setLevels: (levels: string[]) => void;
  toggleLevel: (level: string) => void;
  setPlayerSearch: (search: string) => void;
  setSelectedPlayerId: (id: number | null) => void;
  reset: () => void;
}

const defaultState: FilterState = {
  yearFrom: 1968,
  yearTo: 2024,
  surfaces: [],
  levels: [],
  playerSearch: "",
  selectedPlayerId: null,
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...defaultState,

  setYearRange: (yearFrom, yearTo) => set({ yearFrom, yearTo }),

  setSurfaces: (surfaces) => set({ surfaces }),

  toggleSurface: (surface) =>
    set((s) => ({
      surfaces: s.surfaces.includes(surface)
        ? s.surfaces.filter((sf) => sf !== surface)
        : [...s.surfaces, surface],
    })),

  setLevels: (levels) => set({ levels }),

  toggleLevel: (level) =>
    set((s) => ({
      levels: s.levels.includes(level)
        ? s.levels.filter((l) => l !== level)
        : [...s.levels, level],
    })),

  setPlayerSearch: (playerSearch) => set({ playerSearch }),

  setSelectedPlayerId: (selectedPlayerId) => set({ selectedPlayerId }),

  reset: () => set(defaultState),
}));

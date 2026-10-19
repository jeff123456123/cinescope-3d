"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Movie } from "@/types/movie";

const STORAGE_KEY = "cinescope.watchlist.v1";

export type WatchlistEntry = {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  rating: number | null;
  personalRating: number | null;
  notes: string;
  addedAt: string;
};

type WatchlistAction =
  | {
      type: "hydrate";
      entries: WatchlistEntry[];
      storageError?: string | null;
    }
  | { type: "storage-error"; error: string | null }
  | { type: "add"; movie: Movie }
  | { type: "remove"; id: number }
  | { type: "toggle"; movie: Movie }
  | { type: "update-rating"; id: number; rating: number | null }
  | { type: "update-notes"; id: number; notes: string };

export type WatchlistState = {
  entries: WatchlistEntry[];
  storageError: string | null;
};

function createEntry(movie: Movie): WatchlistEntry {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    releaseYear: movie.releaseYear,
    rating: movie.rating,
    personalRating: null,
    notes: "",
    addedAt: new Date().toISOString(),
  };
}

export function watchlistReducer(
  state: WatchlistState,
  action: WatchlistAction,
): WatchlistState {
  switch (action.type) {
    case "hydrate":
      return {
        entries: action.entries,
        storageError: action.storageError ?? null,
      };
    case "storage-error":
      return { ...state, storageError: action.error };
    case "add":
      return state.entries.some((entry) => entry.id === action.movie.id)
        ? state
        : {
            entries: [...state.entries, createEntry(action.movie)],
            storageError: null,
          };
    case "remove":
      return {
        entries: state.entries.filter((entry) => entry.id !== action.id),
        storageError: null,
      };
    case "toggle":
      return state.entries.some((entry) => entry.id === action.movie.id)
        ? {
            entries: state.entries.filter(
              (entry) => entry.id !== action.movie.id,
            ),
          storageError: null,
        }
        : {
          entries: [...state.entries, createEntry(action.movie)],
          storageError: null,
        };
    case "update-rating":
      return {
        entries: state.entries.map((entry) =>
          entry.id === action.id
            ? { ...entry, personalRating: action.rating }
            : entry,
        ),
        storageError: null,
      };
    case "update-notes":
      return {
        entries: state.entries.map((entry) =>
          entry.id === action.id
            ? { ...entry, notes: action.notes.slice(0, 500) }
            : entry,
        ),
        storageError: null,
      };
  }
}

function isWatchlistEntry(value: unknown): value is WatchlistEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "number" &&
    Number.isSafeInteger(entry.id) &&
    entry.id > 0 &&
    typeof entry.title === "string" &&
    (typeof entry.posterPath === "string" || entry.posterPath === null) &&
    (typeof entry.releaseYear === "number" || entry.releaseYear === null) &&
    (typeof entry.rating === "number" || entry.rating === null) &&
    (typeof entry.personalRating === "number" ||
      entry.personalRating === null) &&
    (entry.personalRating === null ||
      (Number.isInteger(entry.personalRating) &&
        entry.personalRating >= 1 &&
        entry.personalRating <= 5)) &&
    typeof entry.notes === "string" &&
    entry.notes.length <= 500 &&
    typeof entry.addedAt === "string" &&
    Number.isFinite(Date.parse(entry.addedAt))
  );
}

function parseWatchlist(value: string): WatchlistEntry[] | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(isWatchlistEntry) ||
      new Set(parsed.map((entry) => entry.id)).size !== parsed.length
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

type WatchlistContextValue = {
  entries: WatchlistEntry[];
  storageError: string | null;
  hydrated: boolean;
  add: (movie: Movie) => void;
  remove: (id: number) => void;
  toggle: (movie: Movie) => void;
  updateRating: (id: number, rating: number | null) => void;
  updateNotes: (id: number, notes: string) => void;
  isInWatchlist: (id: number) => boolean;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(watchlistReducer, {
    entries: [],
    storageError: null,
  });
  const [hydrated, setHydrated] = useState(false);
  const lastPersistedValue = useRef<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      lastPersistedValue.current = stored;
      if (stored !== null) {
        const entries = parseWatchlist(stored);
        if (entries === null) {
          dispatch({
            type: "hydrate",
            entries: [],
            storageError: "Saved watchlist data was invalid and has been reset.",
          });
        } else {
          dispatch({ type: "hydrate", entries, storageError: null });
        }
      } else {
        dispatch({ type: "hydrate", entries: [], storageError: null });
      }
    } catch {
      dispatch({
        type: "hydrate",
        entries: [],
        storageError: "Saved watchlist data could not be read from this browser.",
      });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const serialized = JSON.stringify(state.entries);
    if (serialized === lastPersistedValue.current) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
      lastPersistedValue.current = serialized;
    } catch {
      dispatch({
        type: "storage-error",
        error: "Your watchlist could not be saved in this browser.",
      });
    }
  }, [hydrated, state.entries]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) {
        return;
      }
      if (event.newValue === null) {
        lastPersistedValue.current = JSON.stringify([]);
        dispatch({ type: "hydrate", entries: [], storageError: null });
        return;
      }
      const entries = parseWatchlist(event.newValue);
      if (entries === null) {
        dispatch({
          type: "storage-error",
          error: "Watchlist data from another tab could not be read.",
        });
        return;
      }
      lastPersistedValue.current = event.newValue;
      dispatch({ type: "hydrate", entries, storageError: null });
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const add = useCallback((movie: Movie) => {
    dispatch({ type: "add", movie });
  }, []);
  const remove = useCallback((id: number) => {
    dispatch({ type: "remove", id });
  }, []);
  const toggle = useCallback((movie: Movie) => {
    dispatch({ type: "toggle", movie });
  }, []);
  const updateRating = useCallback((id: number, rating: number | null) => {
    dispatch({ type: "update-rating", id, rating });
  }, []);
  const updateNotes = useCallback((id: number, notes: string) => {
    dispatch({ type: "update-notes", id, notes });
  }, []);
  const isInWatchlist = useCallback(
    (id: number) => state.entries.some((entry) => entry.id === id),
    [state.entries],
  );

  const value = useMemo(
    () => ({
      entries: state.entries,
      storageError: state.storageError,
      hydrated,
      add,
      remove,
      toggle,
      updateRating,
      updateNotes,
      isInWatchlist,
    }),
    [
      add,
      isInWatchlist,
      remove,
      state.entries,
      state.storageError,
      hydrated,
      toggle,
      updateNotes,
      updateRating,
    ],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider.");
  }
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useMovieSearch } from "@/hooks/use-movie-search";
import type { Movie } from "@/types/movie";

type MovieExplorerValue = {
  query: string;
  setQuery: (query: string) => void;
  movies: Movie[];
  loading: boolean;
  error: string | null;
  retry: () => void;
};

const MovieExplorerContext = createContext<MovieExplorerValue | null>(null);

export function MovieExplorer({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const result = useMovieSearch(query, retryKey);

  return (
    <MovieExplorerContext.Provider
      value={{
        query,
        setQuery,
        ...result,
        retry: () => setRetryKey((current) => current + 1),
      }}
    >
      {children}
    </MovieExplorerContext.Provider>
  );
}

function useMovieExplorer() {
  const context = useContext(MovieExplorerContext);
  if (!context) {
    throw new Error("Movie explorer components must be inside MovieExplorer.");
  }
  return context;
}

export function MovieSearchInput() {
  const { query, setQuery } = useMovieExplorer();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <>
      <div className="search-wrap" role="search" aria-label="Movie search">
        <svg
          aria-hidden="true"
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <label className="sr-only" htmlFor="movie-search">
          Search movies
        </label>
        <input
          autoComplete="off"
          id="movie-search"
          name="movie-search"
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by title, genre, or mood"
          type="search"
          value={query}
        />
        <span className="search-hint">DISCOVER</span>
      </div>
      <p className="search-note">
        Search trending films or find a movie by title.
      </p>
    </>
  );
}

export function useMovieExplorerState() {
  return useMovieExplorer();
}

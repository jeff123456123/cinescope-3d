"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMovies } from "@/lib/movies-client";
import type { Movie } from "@/types/movie";

type SearchState = {
  query: string;
  retryKey: number;
  movies: Movie[];
  loading: boolean;
  error: string | null;
};

const initialState: SearchState = {
  query: "",
  retryKey: -1,
  movies: [],
  loading: true,
  error: null,
};

export function useMovieSearch(query: string, retryKey: number) {
  const normalizedQuery = query.trim();
  const requestId = useRef(0);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestId.current;

    const timeoutId = window.setTimeout(() => {
      void fetchMovies(normalizedQuery, 1, controller.signal)
        .then((result) => {
          if (
            controller.signal.aborted ||
            requestId.current !== currentRequestId
          ) {
            return;
          }
          setState({
            query: normalizedQuery,
            retryKey,
            movies: result.movies,
            loading: false,
            error: null,
          });
        })
        .catch((error: unknown) => {
          if (
            controller.signal.aborted ||
            requestId.current !== currentRequestId
          ) {
            return;
          }
          setState({
            query: normalizedQuery,
            retryKey,
            movies: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load movies. Please try again.",
          });
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedQuery, retryKey]);

  if (state.query !== normalizedQuery || state.retryKey !== retryKey) {
    return { movies: [], loading: true, error: null };
  }

  return { movies: state.movies, loading: state.loading, error: state.error };
}

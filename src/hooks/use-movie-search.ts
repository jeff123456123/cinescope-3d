"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMovies } from "@/lib/movies-client";
import type { Movie } from "@/types/movie";

type SearchState = {
  key: string;
  movies: Movie[];
  page: number;
  totalPages: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
};

const initialState: SearchState = {
  key: "",
  movies: [],
  page: 0,
  totalPages: 0,
  loading: true,
  loadingMore: false,
  error: null,
  loadMoreError: null,
};

export function useMovieSearch(query: string, retryKey: number) {
  const normalizedQuery = query.trim();
  const requestKey = `${normalizedQuery}\u0000${retryKey}`;
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(initialState);
  const isCurrent = state.key === requestKey;

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestId.current;
    activeController.current = controller;

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
            key: requestKey,
            movies: result.movies,
            page: result.page,
            totalPages: Math.min(result.totalPages, 500),
            loading: false,
            loadingMore: false,
            error: null,
            loadMoreError: null,
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
            key: requestKey,
            movies: [],
            page: 0,
            totalPages: 0,
            loading: false,
            loadingMore: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not load movies. Please try again.",
            loadMoreError: null,
          });
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      if (activeController.current === controller) {
        activeController.current = null;
      }
      requestId.current += 1;
      loadingMoreRef.current = false;
    };
  }, [normalizedQuery, requestKey]);

  const loadMore = useCallback(() => {
    if (
      !isCurrent ||
      state.loading ||
      state.loadingMore ||
      loadingMoreRef.current ||
      state.page >= Math.min(state.totalPages, 500)
    ) {
      return;
    }

    const controller = new AbortController();
    const currentRequestId = ++requestId.current;
    const targetPage = state.page + 1;
    activeController.current?.abort();
    activeController.current = controller;
    loadingMoreRef.current = true;
    setState((current) =>
      current.key === requestKey
        ? { ...current, loadingMore: true, loadMoreError: null }
        : current,
    );

    void fetchMovies(normalizedQuery, targetPage, controller.signal)
      .then((result) => {
        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId
        ) {
          return;
        }
        setState((current) => {
          if (current.key !== requestKey) {
            return current;
          }
          const movieIds = new Set(current.movies.map((movie) => movie.id));
          const newMovies = result.movies.filter((movie) => {
            if (movieIds.has(movie.id)) {
              return false;
            }
            movieIds.add(movie.id);
            return true;
          });
          return {
            ...current,
            movies: [...current.movies, ...newMovies],
            page: result.page,
            totalPages: Math.min(result.totalPages, 500),
            loadingMore: false,
            loadMoreError: null,
          };
        });
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          requestId.current !== currentRequestId
        ) {
          return;
        }
        setState((current) =>
          current.key === requestKey
            ? {
                ...current,
                loadingMore: false,
                loadMoreError:
                  error instanceof Error
                    ? error.message
                    : "Could not load more movies. Please try again.",
              }
            : current,
        );
      })
      .finally(() => {
        if (requestId.current === currentRequestId) {
          loadingMoreRef.current = false;
        }
      });
  }, [isCurrent, normalizedQuery, requestKey, state]);

  const currentState = isCurrent
    ? state
    : {
        ...initialState,
        key: requestKey,
        loading: true,
      };
  const hasMore =
    isCurrent && state.page > 0 && state.page < Math.min(state.totalPages, 500);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || currentState.loading || currentState.error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    currentState.error,
    currentState.loading,
    currentState.page,
    hasMore,
    loadMore,
  ]);

  return {
    movies: currentState.movies,
    page: currentState.page,
    totalPages: currentState.totalPages,
    loading: currentState.loading,
    loadingMore: currentState.loadingMore,
    error: currentState.error,
    loadMoreError: currentState.loadMoreError,
    hasMore,
    loadMore,
    sentinelRef,
  };
}

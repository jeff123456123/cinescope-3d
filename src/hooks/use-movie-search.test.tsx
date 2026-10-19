import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMovieSearch } from "@/hooks/use-movie-search";
import { fetchMovies } from "@/lib/movies-client";
import type { Movie } from "@/types/movie";

vi.mock("@/lib/movies-client", () => ({
  fetchMovies: vi.fn(),
}));

const emptyFilters = { genreId: null, year: null, sort: "" as const };
const firstMovie: Movie = {
  id: 1,
  title: "First",
  releaseDate: null,
  releaseYear: null,
  overview: "",
  posterPath: null,
  rating: null,
  genreIds: [],
};

describe("useMovieSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(fetchMovies).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("debounces requests for 400ms", async () => {
    vi.mocked(fetchMovies).mockResolvedValue({
      page: 1,
      totalPages: 1,
      movies: [firstMovie],
    });
    const { result } = renderHook(() =>
      useMovieSearch("", emptyFilters, 0),
    );

    await act(async () => {
      vi.advanceTimersByTime(399);
    });
    expect(fetchMovies).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(fetchMovies).toHaveBeenCalledTimes(1);
    expect(result.current.movies).toEqual([firstMovie]);
  });

  it("aborts obsolete queries and ignores their stale responses", async () => {
    const pending: Array<{
      query: string;
      signal: AbortSignal;
      resolve: (value: {
        page: number;
        totalPages: number;
        movies: Movie[];
      }) => void;
    }> = [];
    vi.mocked(fetchMovies).mockImplementation(
      (query, _page, _filters, signal) =>
        new Promise((resolve) => {
          pending.push({
            query,
            signal,
            resolve: resolve as (value: {
              page: number;
              totalPages: number;
              movies: Movie[];
            }) => void,
          });
        }),
    );

    const { result, rerender } = renderHook(
      ({ query }) => useMovieSearch(query, emptyFilters, 0),
      { initialProps: { query: "old" } },
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const oldRequest = pending[0];

    rerender({ query: "new" });
    expect(oldRequest.signal.aborted).toBe(true);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const newRequest = pending[1];

    await act(async () => {
      oldRequest.resolve({ page: 1, totalPages: 1, movies: [firstMovie] });
      newRequest.resolve({
        page: 1,
        totalPages: 1,
        movies: [{ ...firstMovie, id: 2, title: "New" }],
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.movies.map((movie) => movie.title)).toEqual(["New"]);
  });

  it("loads and de-duplicates the next page", async () => {
    vi.mocked(fetchMovies)
      .mockResolvedValueOnce({
        page: 1,
        totalPages: 2,
        movies: [firstMovie],
      })
      .mockResolvedValueOnce({
        page: 2,
        totalPages: 2,
        movies: [firstMovie, { ...firstMovie, id: 2, title: "Second" }],
      });
    const { result } = renderHook(() =>
      useMovieSearch("", emptyFilters, 0),
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.page).toBe(2);
    expect(result.current.movies.map((movie) => movie.id)).toEqual([1, 2]);
  });
});

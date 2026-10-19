import { MovieExplorer } from "@/components/movie-explorer";
import { MovieGrid } from "@/components/movie-grid";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGenres, fetchMovies } from "@/lib/movies-client";

vi.mock("@/lib/movies-client", () => ({
  fetchGenres: vi.fn(),
  fetchMovies: vi.fn(),
}));

describe("movie search states", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(fetchGenres).mockResolvedValue([]);
    vi.mocked(fetchMovies).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows retryable errors, then an empty state when retry succeeds", async () => {
    vi.mocked(fetchMovies)
      .mockRejectedValueOnce(new Error("Movie service unavailable."))
      .mockResolvedValueOnce({ page: 1, totalPages: 1, movies: [] });
    render(
      <MovieExplorer>
        <MovieGrid />
      </MovieExplorer>,
    );

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("Movie service unavailable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      screen.getByText("No movies found. Try another search."),
    ).toBeInTheDocument();
  });
});

import { MovieCard } from "@/components/movie-card";
import { WatchlistProvider } from "@/context/watchlist-context";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Movie } from "@/types/movie";

vi.mock("next/image", () => ({
  default: () => <span data-testid="mock-image" />,
}));

const movie: Movie = {
  id: 14,
  title: "Posterless Movie",
  releaseDate: null,
  releaseYear: null,
  overview: "",
  posterPath: null,
  rating: null,
  genreIds: [],
};

describe("MovieCard", () => {
  it("shows a poster fallback and toggles watchlist state accessibly", async () => {
    const user = userEvent.setup();
    render(
      <WatchlistProvider>
        <MovieCard movie={movie} />
      </WatchlistProvider>,
    );

    expect(screen.getByText("POSTER UNAVAILABLE")).toBeInTheDocument();
    const saveButton = screen.getByRole("button", {
      name: "Add Posterless Movie to watchlist",
    });
    expect(saveButton).toHaveAttribute("aria-pressed", "false");
    await user.click(saveButton);

    expect(
      screen.getByRole("button", {
        name: "Remove Posterless Movie from watchlist",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

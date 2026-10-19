import {
  useWatchlist,
  watchlistReducer,
  type WatchlistState,
} from "@/context/watchlist-context";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { WatchlistProvider } from "@/context/watchlist-context";
import type { Movie } from "@/types/movie";

const movie: Movie = {
  id: 7,
  title: "A Sample Movie",
  releaseDate: "2024-01-01",
  releaseYear: 2024,
  overview: "A test synopsis.",
  posterPath: "/sample.jpg",
  rating: 0,
  genreIds: [18],
};

function WatchlistActions() {
  const {
    entries,
    storageError,
    add,
    remove,
    updateRating,
    updateNotes,
  } = useWatchlist();
  const entry = entries[0];

  return (
    <div>
      <output aria-label="Saved count">{entries.length}</output>
      <output aria-label="Storage error">{storageError}</output>
      <button onClick={() => add(movie)} type="button">
        Add movie
      </button>
      <button
        onClick={() => add({ ...movie, title: "Updated title" })}
        type="button"
      >
        Add duplicate
      </button>
      {entry && (
        <>
          <button onClick={() => updateRating(entry.id, 4)} type="button">
            Rate movie
          </button>
          <button
            onClick={() => updateNotes(entry.id, "A personal note")}
            type="button"
          >
            Add note
          </button>
          <button onClick={() => remove(entry.id)} type="button">
            Remove movie
          </button>
          <output aria-label="Personal rating">
            {entry.personalRating ?? "none"}
          </output>
          <output aria-label="Personal note">{entry.notes}</output>
        </>
      )}
    </div>
  );
}

describe("watchlist", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("supports add, remove, duplicate prevention, rating, and notes", () => {
    let state: WatchlistState = { entries: [], storageError: null };
    state = watchlistReducer(state, { type: "add", movie });
    state = watchlistReducer(state, {
      type: "add",
      movie: { ...movie, title: "Duplicate" },
    });
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].title).toBe(movie.title);

    state = watchlistReducer(state, {
      type: "update-rating",
      id: movie.id,
      rating: 5,
    });
    state = watchlistReducer(state, {
      type: "update-notes",
      id: movie.id,
      notes: "Remember this scene.",
    });
    expect(state.entries[0].personalRating).toBe(5);
    expect(state.entries[0].notes).toBe("Remember this scene.");

    state = watchlistReducer(state, { type: "remove", id: movie.id });
    expect(state.entries).toEqual([]);
  });

  it("persists changes and hydrates after mount", async () => {
    const user = userEvent.setup();
    const view = render(
      <WatchlistProvider>
        <WatchlistActions />
      </WatchlistProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add movie" }));

    await waitFor(() => {
      const saved = JSON.parse(
        window.localStorage.getItem("cinescope.watchlist.v1") ?? "[]",
      );
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({
        id: movie.id,
        title: movie.title,
        personalRating: null,
        notes: "",
      });
    });

    view.unmount();
    render(
      <WatchlistProvider>
        <WatchlistActions />
      </WatchlistProvider>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Saved count")).toHaveTextContent("1"),
    );
  });

  it("reports and resets corrupted stored data", async () => {
    window.localStorage.setItem("cinescope.watchlist.v1", "{broken");
    render(
      <WatchlistProvider>
        <WatchlistActions />
      </WatchlistProvider>,
    );
    expect(
      await screen.findByText(
        "Saved watchlist data was invalid and has been reset.",
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        window.localStorage.getItem("cinescope.watchlist.v1"),
      ).toBe("[]"),
    );
  });

  it("synchronizes valid changes from another tab", async () => {
    render(
      <WatchlistProvider>
        <WatchlistActions />
      </WatchlistProvider>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Saved count")).toHaveTextContent("0"),
    );

    const entry = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      personalRating: null,
      notes: "",
      addedAt: new Date().toISOString(),
    };
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "cinescope.watchlist.v1",
          newValue: JSON.stringify([entry]),
        }),
      );
    });
    await waitFor(() =>
      expect(screen.getByLabelText("Saved count")).toHaveTextContent("1"),
    );
  });
});

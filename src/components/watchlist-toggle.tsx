"use client";

import type { Movie } from "@/types/movie";
import { useWatchlist } from "@/context/watchlist-context";

type WatchlistToggleProps = {
  movie: Movie;
};

export function WatchlistToggle({ movie }: WatchlistToggleProps) {
  const { isInWatchlist, toggle } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  return (
    <button
      aria-label={
        inWatchlist
          ? `Remove ${movie.title} from watchlist`
          : `Add ${movie.title} to watchlist`
      }
      aria-pressed={inWatchlist}
      className={`watchlist-toggle${inWatchlist ? " is-saved" : ""}`}
      onClick={() => toggle(movie)}
      type="button"
    >
      {inWatchlist ? "In watchlist" : "＋ Watchlist"}
    </button>
  );
}

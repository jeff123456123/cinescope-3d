"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useWatchlist,
  type WatchlistEntry,
} from "@/context/watchlist-context";
import { getPosterUrl } from "@/lib/movies-client";

function WatchlistMovie({ entry }: { entry: WatchlistEntry }) {
  const { remove, updateRating, updateNotes } = useWatchlist();
  const [imageFailed, setImageFailed] = useState(false);
  const posterUrl = getPosterUrl(entry.posterPath);

  return (
    <article className="watchlist-item">
      <div className="watchlist-poster">
        {posterUrl && !imageFailed ? (
          <Image
            alt={`${entry.title} poster`}
            fill
            onError={() => setImageFailed(true)}
            sizes="(max-width: 620px) 28vw, 120px"
            src={posterUrl}
          />
        ) : (
          <span>Poster unavailable</span>
        )}
      </div>
      <div className="watchlist-item-content">
        <div className="watchlist-title-row">
          <div>
            <h2>{entry.title}</h2>
            {entry.releaseYear !== null && (
              <p className="watchlist-release-year">{entry.releaseYear}</p>
            )}
          </div>
          <button
            aria-label={`Remove ${entry.title} from watchlist`}
            className="watchlist-remove"
            onClick={() => remove(entry.id)}
            type="button"
          >
            Remove
          </button>
        </div>
        <div className="watchlist-editors">
          <div className="watchlist-editor">
            <label htmlFor={`personal-rating-${entry.id}`}>
              Your rating
            </label>
            <select
              id={`personal-rating-${entry.id}`}
              onChange={(event) => {
                const value = event.currentTarget.value;
                updateRating(entry.id, value ? Number(value) : null);
              }}
              value={entry.personalRating ?? ""}
            >
              <option value="">Not rated</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} / 5
                </option>
              ))}
            </select>
          </div>
          <div className="watchlist-editor notes-editor">
            <label htmlFor={`movie-notes-${entry.id}`}>Your notes</label>
            <textarea
              id={`movie-notes-${entry.id}`}
              maxLength={500}
              onChange={(event) =>
                updateNotes(entry.id, event.currentTarget.value)
              }
              placeholder="What do you want to remember?"
              rows={3}
              value={entry.notes}
            />
            <span className="notes-count">{entry.notes.length} / 500</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function WatchlistPage() {
  const { entries, hydrated, storageError } = useWatchlist();

  return (
    <section className="watchlist-page section-shell" aria-labelledby="watchlist-title">
      <p className="eyebrow section-eyebrow">Your personal collection</p>
      <div className="watchlist-page-heading">
        <div>
          <h1 id="watchlist-title">Your watchlist</h1>
          <p>Keep the stories you want to come back to.</p>
        </div>
        <Link className="header-cta" href="/">
          <span>Discover films</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M8 3l5 5-5 5" />
          </svg>
        </Link>
      </div>

      {storageError && (
        <p className="watchlist-storage-error" role="status">
          {storageError}
        </p>
      )}
      {!hydrated ? (
        <p className="watchlist-empty" aria-live="polite">
          Loading your saved movies…
        </p>
      ) : entries.length === 0 ? (
        <div className="watchlist-empty">
          <h2>Your watchlist is waiting for its first story.</h2>
          <p>Save a movie while exploring to keep it close.</p>
          <Link className="header-cta" href="/">
            Explore movies
          </Link>
        </div>
      ) : (
        <div className="watchlist-list" aria-live="polite">
          {entries.map((entry) => (
            <WatchlistMovie entry={entry} key={entry.id} />
          ))}
        </div>
      )}
    </section>
  );
}

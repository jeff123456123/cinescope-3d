"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  fetchMovieDetails,
  getBackdropUrl,
  getPosterUrl,
} from "@/lib/movies-client";
import type { Movie, MovieDetails } from "@/types/movie";

type MovieDetailsDialogProps = {
  movie: Movie;
};

export function MovieDetailsDialog({ movie }: MovieDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [backdropFailed, setBackdropFailed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const controller = new AbortController();
    void fetchMovieDetails(movie.id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setDetails(result);
          setLoading(false);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load movie details. Please retry.",
          );
        }
      });
    return () => controller.abort();
  }, [movie.id, open, retryKey]);

  function openDetails() {
    setDetails(null);
    setError(null);
    setLoading(true);
    setBackdropFailed(false);
    setOpen(true);
  }

  function retry() {
    setDetails(null);
    setError(null);
    setLoading(true);
    setRetryKey((current) => current + 1);
  }

  function closeDetails() {
    dialogRef.current?.close();
    setOpen(false);
    openerRef.current?.focus();
  }

  const backdropUrl = getBackdropUrl(details?.backdropPath ?? null);
  const posterUrl = getPosterUrl(details?.posterPath ?? movie.posterPath);

  return (
    <>
      <button
        className="movie-details-button"
        onClick={openDetails}
        ref={openerRef}
        type="button"
      >
        Details
      </button>
      <dialog
        aria-labelledby={`movie-dialog-title-${movie.id}`}
        className="movie-dialog"
        onClose={() => {
          setOpen(false);
          openerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeDetails();
          }
        }}
        ref={dialogRef}
      >
        <div className="movie-dialog-shell">
          <button
            aria-label={`Close details for ${movie.title}`}
            className="movie-dialog-close"
            onClick={closeDetails}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
          {backdropUrl && !backdropFailed && (
            <div className="movie-dialog-backdrop">
              <Image
                alt=""
                fill
                onError={() => setBackdropFailed(true)}
                priority
                sizes="(max-width: 900px) 100vw, 900px"
                src={backdropUrl}
              />
            </div>
          )}
          <div className="movie-dialog-content" aria-live="polite">
            {loading && (
              <div className="details-loading" aria-label="Loading movie details">
                <div className="details-skeleton-poster" />
                <div className="details-skeleton-copy">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="details-error" role="alert">
                <h2 id={`movie-dialog-title-${movie.id}`}>Details unavailable</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={retry} type="button">
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && details && (
              <div className="details-layout">
                <div className="details-poster">
                  {posterUrl ? (
                    <Image
                      alt={`${details.title} poster`}
                      fill
                      sizes="(max-width: 700px) 38vw, 240px"
                      src={posterUrl}
                    />
                  ) : (
                    <div className="details-poster-fallback">
                      Poster unavailable
                    </div>
                  )}
                </div>
                <div className="details-copy">
                  <p className="eyebrow section-eyebrow">CineScope 3D</p>
                  <h2 id={`movie-dialog-title-${movie.id}`}>
                    {details.title}
                  </h2>
                  {details.tagline && (
                    <p className="details-tagline">{details.tagline}</p>
                  )}
                  <div className="details-meta">
                    {details.releaseDate && <span>{details.releaseDate}</span>}
                    {details.runtime && <span>{details.runtime} min</span>}
                    {details.rating !== null && (
                      <span>
                        {details.rating === 0
                          ? "NR"
                          : `★ ${details.rating.toFixed(1)}`}
                      </span>
                    )}
                    <span>{details.voteCount.toLocaleString()} votes</span>
                  </div>
                  {details.genres.length > 0 && (
                    <ul className="details-genres" aria-label="Genres">
                      {details.genres.map((genre) => (
                        <li key={genre.id}>{genre.name}</li>
                      ))}
                    </ul>
                  )}
                  <p className="details-overview">
                    {details.overview || "No overview is available yet."}
                  </p>
                  {details.cast.length > 0 && (
                    <section aria-labelledby={`cast-title-${movie.id}`}>
                      <h3 id={`cast-title-${movie.id}`}>Top cast</h3>
                      <ul className="details-cast">
                        {details.cast.map((member, index) => (
                          <li key={`${member.name}-${index}`}>
                            <span>{member.name}</span>
                            {member.character && (
                              <span>{member.character}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {details.trailerKey && (
                    <a
                      className="trailer-link"
                      href={`https://www.youtube.com/watch?v=${encodeURIComponent(details.trailerKey)}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Watch trailer
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

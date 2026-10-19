"use client";

import Image from "next/image";
import {
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { getPosterUrl } from "@/lib/movies-client";
import type { Movie } from "@/types/movie";

type MovieCardProps = {
  movie: Movie;
};

type TiltStyle = CSSProperties & {
  "--rotate-x": string;
  "--rotate-y": string;
};

const restingTilt: TiltStyle = {
  "--rotate-x": "0deg",
  "--rotate-y": "0deg",
};

export function MovieCard({ movie }: MovieCardProps) {
  const [tilt, setTilt] = useState(restingTilt);
  const [isTilting, setIsTilting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const posterUrl = getPosterUrl(movie.posterPath);
  const showPoster = posterUrl !== null && !imageFailed;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)")
        .matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontalPosition =
      (event.clientX - bounds.left) / bounds.width - 0.5;
    const verticalPosition =
      (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      "--rotate-x": `${-verticalPosition * 5}deg`,
      "--rotate-y": `${horizontalPosition * 5}deg`,
    });
    setIsTilting(true);
  }

  function resetTilt() {
    setTilt(restingTilt);
    setIsTilting(false);
  }

  return (
    <article
      aria-labelledby={`movie-title-${movie.id}`}
      className={`movie-card${isTilting ? " is-tilting" : ""}`}
      onPointerLeave={resetTilt}
      onPointerMove={handlePointerMove}
      style={tilt}
    >
      <div className={`movie-card-art${showPoster ? " has-poster" : ""}`}>
        {posterUrl !== null && !imageFailed ? (
          <Image
            alt={`${movie.title} poster`}
            className="movie-poster"
            fill
            onError={() => setImageFailed(true)}
            sizes="(max-width: 700px) 45vw, (max-width: 900px) 30vw, (max-width: 1100px) 22vw, 18vw"
            src={posterUrl}
          />
        ) : (
          <div className="movie-card-fallback">
            <span className="movie-card-light" aria-hidden="true" />
            <span className="movie-card-orbit" aria-hidden="true" />
            <span className="movie-card-horizon" aria-hidden="true" />
            <span className="movie-card-placeholder-label">
              POSTER UNAVAILABLE
            </span>
          </div>
        )}
      </div>
      <div className="movie-card-caption">
        <h3 id={`movie-title-${movie.id}`} title={movie.title}>
          {movie.title}
        </h3>
        <div className="movie-card-meta">
          {movie.releaseYear !== null && <span>{movie.releaseYear}</span>}
          {movie.releaseYear !== null && movie.rating !== null && (
            <span className="movie-meta-separator" aria-hidden="true">
              ·
            </span>
          )}
          {movie.rating !== null && (
            <span aria-label={`Rating ${movie.rating.toFixed(1)} out of 10`}>
              {movie.rating === 0 ? "NR" : `★ ${movie.rating.toFixed(1)}`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

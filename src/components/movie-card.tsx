"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";

type MovieCardProps = {
  tone: string;
};

type TiltStyle = CSSProperties & {
  "--rotate-x": string;
  "--rotate-y": string;
};

const restingTilt: TiltStyle = {
  "--rotate-x": "0deg",
  "--rotate-y": "0deg",
};

export function MovieCard({ tone }: MovieCardProps) {
  const [tilt, setTilt] = useState(restingTilt);
  const [isTilting, setIsTilting] = useState(false);

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
      aria-label="Movie placeholder. Artwork and movie details coming soon."
      className={`movie-card movie-card-${tone}${isTilting ? " is-tilting" : ""}`}
      onPointerLeave={resetTilt}
      onPointerMove={handlePointerMove}
      style={tilt}
    >
      <div className="movie-card-art" aria-hidden="true">
        <span className="movie-card-light" />
        <span className="movie-card-orbit" />
        <span className="movie-card-horizon" />
        <span className="movie-card-placeholder-label">MOVIE PLACEHOLDER</span>
      </div>
      <p className="movie-card-caption">Artwork coming soon</p>
    </article>
  );
}

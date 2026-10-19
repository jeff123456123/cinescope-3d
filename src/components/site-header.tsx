"use client";

import Link from "next/link";
import { useWatchlist } from "@/context/watchlist-context";

export function SiteHeader() {
  const { entries } = useWatchlist();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="CineScope 3D home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="brand-name">
          CineScope<span className="brand-dimension">3D</span>
        </span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        <Link className="nav-link active" href="/#discover" aria-current="page">
          Discover
        </Link>
        <Link className="nav-link" href="/#now-showing">
          Your next watch
        </Link>
        <Link className="nav-link" href="/#about">
          The experience
        </Link>
      </nav>

      <Link
        aria-label={`Your watchlist, ${entries.length} ${entries.length === 1 ? "movie" : "movies"}`}
        className="header-cta watchlist-header-link"
        href="/watchlist"
      >
        <span>Watchlist</span>
        <span className="watchlist-count" aria-hidden="true">
          {entries.length}
        </span>
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3l5 5-5 5" />
        </svg>
      </Link>
    </header>
  );
}

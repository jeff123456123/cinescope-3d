"use client";

import { MovieCard } from "@/components/movie-card";
import { useMovieExplorerState } from "@/components/movie-explorer";

const skeletons = ["one", "two", "three", "four", "five"];

export function MovieGrid() {
  const {
    movies,
    loading,
    loadingMore,
    error,
    loadMoreError,
    retry,
    loadMore,
    hasMore,
    sentinelRef,
  } = useMovieExplorerState();

  return (
    <>
      <div className="movie-grid" aria-label="Movie results" aria-busy={loading}>
        {loading
          ? skeletons.map((skeleton) => (
              <div
                aria-hidden="true"
                className="movie-skeleton"
                key={skeleton}
              >
                <div className="movie-skeleton-art" />
                <div className="movie-skeleton-line" />
                <div className="movie-skeleton-line short" />
              </div>
            ))
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
      <div className="movie-status" aria-live="polite" aria-atomic="true">
        {loading && <p>Loading movies…</p>}
        {!loading && error && (
          <div className="movie-error">
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={retry}
              type="button"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && movies.length === 0 && (
          <p>No movies found. Try another search.</p>
        )}
        {!loading && !error && movies.length > 0 && (
          <p aria-label={`${movies.length} movies found`}>
            Showing {movies.length} movies.
          </p>
        )}
        {loadingMore && <p>Loading more movies…</p>}
        {!loading && loadMoreError && (
          <div className="movie-error">
            <p>{loadMoreError}</p>
            <button className="retry-button" onClick={loadMore} type="button">
              Retry
            </button>
          </div>
        )}
      </div>
      {hasMore && !loading && (
        <div
          aria-hidden="true"
          className="movie-grid-sentinel"
          ref={sentinelRef}
        />
      )}
    </>
  );
}

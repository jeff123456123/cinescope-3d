"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type KeyboardEvent,
  type RefObject,
  type ReactNode,
} from "react";
import { useMovieSearch } from "@/hooks/use-movie-search";
import { fetchGenres } from "@/lib/movies-client";
import {
  movieSortOptions,
  type Movie,
  type MovieFilters,
  type MovieGenre,
} from "@/types/movie";

type MovieExplorerValue = {
  query: string;
  setQuery: (query: string) => void;
  filters: MovieFilters;
  setFilters: (filters: MovieFilters) => void;
  genres: MovieGenre[];
  genresLoading: boolean;
  genresError: string | null;
  retryGenres: () => void;
  movies: Movie[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

const MovieExplorerContext = createContext<MovieExplorerValue | null>(null);

function isMovieSort(value: string): value is MovieFilters["sort"] {
  return movieSortOptions.some((option) => option === value);
}

export function MovieExplorer({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MovieFilters>({
    genreId: null,
    year: null,
    sort: "",
  });
  const [retryKey, setRetryKey] = useState(0);
  const [genres, setGenres] = useState<MovieGenre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState<string | null>(null);
  const [genresRetryKey, setGenresRetryKey] = useState(0);
  const result = useMovieSearch(query, filters, retryKey);

  useEffect(() => {
    const controller = new AbortController();
    void fetchGenres(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setGenres(items);
          setGenresLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setGenresError(
            error instanceof Error
              ? error.message
              : "Could not load genres. Please try again.",
          );
          setGenresLoading(false);
        }
      });
    return () => controller.abort();
  }, [genresRetryKey]);

  function retryGenres() {
    setGenresLoading(true);
    setGenresError(null);
    setGenresRetryKey((current) => current + 1);
  }

  return (
    <MovieExplorerContext.Provider
      value={{
        query,
        setQuery,
        filters,
        setFilters,
        genres,
        genresLoading,
        genresError,
        retryGenres,
        ...result,
        retry: () => setRetryKey((current) => current + 1),
      }}
    >
      {children}
    </MovieExplorerContext.Provider>
  );
}

function useMovieExplorer() {
  const context = useContext(MovieExplorerContext);
  if (!context) {
    throw new Error("Movie explorer components must be inside MovieExplorer.");
  }
  return context;
}

export function MovieSearchInput() {
  const { query, setQuery } = useMovieExplorer();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <>
      <div className="search-wrap" role="search" aria-label="Movie search">
        <svg
          aria-hidden="true"
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <label className="sr-only" htmlFor="movie-search">
          Search movies
        </label>
        <input
          autoComplete="off"
          id="movie-search"
          name="movie-search"
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by title, genre, or mood"
          maxLength={100}
          type="search"
          value={query}
        />
        <span className="search-hint">DISCOVER</span>
      </div>
      <p className="search-note">
        Search trending films or find a movie by title.
      </p>
    </>
  );
}

export function MovieFiltersControl() {
  const { filters, setFilters, genres, genresLoading, genresError, retryGenres } =
    useMovieExplorer();
  const hasActiveFilters =
    filters.genreId !== null || filters.year !== null || filters.sort !== "";

  return (
    <div className="movie-filters" aria-label="Movie filters">
      <div className="filter-field">
        <label htmlFor="filter-genre">Genre</label>
        <select
          disabled={genresLoading || genresError !== null}
          id="filter-genre"
          onChange={(event) =>
            setFilters({
              ...filters,
              genreId: event.currentTarget.value
                ? Number(event.currentTarget.value)
                : null,
            })
          }
          value={filters.genreId ?? ""}
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="filter-year">Release year</label>
        <input
          id="filter-year"
          min="1900"
          onChange={(event) => {
            const value = event.currentTarget.value;
            setFilters({
              ...filters,
              year: value ? Number(value) : null,
            });
          }}
          placeholder="Any year"
          step="1"
          type="number"
          value={filters.year ?? ""}
        />
      </div>
      <div className="filter-field">
        <label htmlFor="filter-sort">Sort by</label>
        <select
          id="filter-sort"
          onChange={(event) => {
            const sort = event.currentTarget.value;
            if (isMovieSort(sort)) {
              setFilters({ ...filters, sort });
            }
          }}
          value={filters.sort}
        >
          <option value="">Trending</option>
          <option value="popularity.desc">Popularity</option>
          <option value="vote_average.desc">Rating</option>
          <option value="primary_release_date.desc">Release date</option>
        </select>
      </div>
      {hasActiveFilters && (
        <button
          className="clear-filters-button"
          onClick={() =>
            setFilters({ genreId: null, year: null, sort: "" })
          }
          type="button"
        >
          Clear filters
        </button>
      )}
      {genresError && (
        <div className="genre-error" role="status">
          <span>{genresError}</span>
          <button className="retry-button" onClick={retryGenres} type="button">
            Retry genres
          </button>
        </div>
      )}
    </div>
  );
}

export function useMovieExplorerState() {
  return useMovieExplorer();
}

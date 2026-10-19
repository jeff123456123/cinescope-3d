import type {
  Movie,
  MovieDetails,
  MovieFilters,
  MovieGenre,
  MovieSearchResponse,
} from "@/types/movie";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMovie(value: unknown): value is Movie {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.title === "string" &&
    (typeof value.releaseDate === "string" || value.releaseDate === null) &&
    (typeof value.releaseYear === "number" || value.releaseYear === null) &&
    typeof value.overview === "string" &&
    (typeof value.posterPath === "string" || value.posterPath === null) &&
    (typeof value.rating === "number" || value.rating === null) &&
    Array.isArray(value.genreIds) &&
    value.genreIds.every(
      (genreId) => typeof genreId === "number" && Number.isInteger(genreId),
    )
  );
}

function isMovieGenre(value: unknown): value is MovieGenre {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.name === "string"
  );
}

function isMovieCastMember(
  value: unknown,
): value is MovieDetails["cast"][number] {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.character === "string" &&
    (typeof value.profilePath === "string" || value.profilePath === null)
  );
}

function isMovieDetails(value: unknown): value is MovieDetails {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.tagline === "string" &&
    typeof value.overview === "string" &&
    Array.isArray(value.genres) &&
    value.genres.every(isMovieGenre) &&
    (typeof value.runtime === "number" || value.runtime === null) &&
    (typeof value.releaseDate === "string" || value.releaseDate === null) &&
    (typeof value.rating === "number" || value.rating === null) &&
    typeof value.voteCount === "number" &&
    (typeof value.posterPath === "string" || value.posterPath === null) &&
    (typeof value.backdropPath === "string" || value.backdropPath === null) &&
    Array.isArray(value.cast) &&
    value.cast.every(isMovieCastMember) &&
    (typeof value.trailerKey === "string" || value.trailerKey === null)
  );
}

export function getPosterUrl(posterPath: string | null): string | null {
  return posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : null;
}

export function getBackdropUrl(backdropPath: string | null): string | null {
  return backdropPath
    ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
    : null;
}

export async function fetchMovieDetails(
  id: number,
  signal: AbortSignal,
): Promise<MovieDetails> {
  const response = await fetch(`/api/movies/${id}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Could not read the movie details response.");
  }

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string" ? data.error : null;
    throw new Error(message ?? "Could not load movie details. Please retry.");
  }
  if (!isMovieDetails(data)) {
    throw new Error("Movie service returned invalid detail data.");
  }
  return data;
}

export async function fetchMovies(
  query: string,
  page: number,
  filters: MovieFilters,
  signal: AbortSignal,
): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (query) {
    params.set("query", query);
  }
  if (filters.genreId !== null) {
    params.set("genre", String(filters.genreId));
  }
  if (filters.year !== null) {
    params.set("year", String(filters.year));
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  const response = await fetch(`/api/movies?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Could not read the movie service response.");
  }

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string" ? data.error : null;
    throw new Error(
      message ?? "Could not load movies. Please try again.",
    );
  }

  if (
    !isRecord(data) ||
    typeof data.page !== "number" ||
    typeof data.totalPages !== "number" ||
    !Array.isArray(data.movies) ||
    !data.movies.every(isMovie)
  ) {
    throw new Error("Movie service returned an invalid response.");
  }

  return {
    page: data.page,
    totalPages: data.totalPages,
    movies: data.movies,
  };
}

export async function fetchGenres(signal: AbortSignal): Promise<MovieGenre[]> {
  const response = await fetch("/api/genres", {
    signal,
    headers: { Accept: "application/json" },
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Could not read the genre service response.");
  }

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.error === "string" ? data.error : null;
    throw new Error(message ?? "Could not load genres. Please try again.");
  }

  if (!isRecord(data) || !Array.isArray(data.genres)) {
    throw new Error("Genre service returned an invalid response.");
  }

  if (!data.genres.every(isMovieGenre)) {
    throw new Error("Genre service returned invalid genre data.");
  }
  return data.genres;
}

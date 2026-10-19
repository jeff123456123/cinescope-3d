import "server-only";

import type {
  Movie,
  MovieFilters,
  MovieGenre,
  MovieSearchResponse,
} from "@/types/movie";

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMovieGenre(value: unknown): value is MovieGenre {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.name === "string"
  );
}

function normalizeMovie(value: unknown): Movie | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const title = value.title;
  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    typeof title !== "string" ||
    title.trim().length === 0
  ) {
    return null;
  }

  const releaseDate =
    typeof value.release_date === "string" && value.release_date.length > 0
      ? value.release_date
      : null;
  const yearMatch = releaseDate?.match(/^(\d{4})/);

  return {
    id,
    title,
    releaseDate,
    releaseYear: yearMatch ? Number(yearMatch[1]) : null,
    overview: typeof value.overview === "string" ? value.overview : "",
    posterPath:
      typeof value.poster_path === "string" &&
      value.poster_path.startsWith("/")
        ? value.poster_path
        : null,
    genreIds: Array.isArray(value.genre_ids)
      ? value.genre_ids.filter(
          (genreId): genreId is number =>
            typeof genreId === "number" && Number.isInteger(genreId),
        )
      : [],
    rating:
      typeof value.vote_average === "number" &&
      Number.isFinite(value.vote_average)
        ? value.vote_average
        : null,
  };
}

export async function getTmdbMovies(
  query: string,
  page: number,
  filters: MovieFilters,
): Promise<MovieSearchResponse> {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new TmdbError(
      "TMDB is not configured. Set TMDB_API_READ_ACCESS_TOKEN on the server.",
      503,
    );
  }

  const useTrending =
    !query &&
    filters.genreId === null &&
    filters.year === null &&
    filters.sort === "";
  const endpoint = new URL(
    query
      ? "https://api.themoviedb.org/3/search/movie"
      : useTrending
        ? "https://api.themoviedb.org/3/trending/movie/week"
        : "https://api.themoviedb.org/3/discover/movie",
  );
  endpoint.searchParams.set("page", String(page));
  if (query) {
    endpoint.searchParams.set("query", query);
    endpoint.searchParams.set("include_adult", "false");
    if (filters.year !== null) {
      endpoint.searchParams.set("primary_release_year", String(filters.year));
    }
  }
  if (!query && filters.genreId !== null) {
    endpoint.searchParams.set("with_genres", String(filters.genreId));
  }
  if (!query && filters.year !== null) {
    endpoint.searchParams.set("primary_release_year", String(filters.year));
  }
  if (!useTrending && filters.sort) {
    endpoint.searchParams.set("sort_by", filters.sort);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new TmdbError("Movie service is temporarily unavailable.", 502);
  }

  if (response.status === 401) {
    throw new TmdbError("TMDB rejected the server access token.", 502);
  }
  if (response.status === 429) {
    throw new TmdbError(
      "Movie requests are temporarily rate limited. Please try again shortly.",
      429,
    );
  }
  if (!response.ok) {
    throw new TmdbError(
      response.status >= 500
        ? "Movie service is temporarily unavailable."
        : "Movie request could not be completed.",
      502,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new TmdbError("Movie service returned an invalid response.", 502);
  }

  if (!isRecord(data)) {
    throw new TmdbError("Movie service returned an invalid response.", 502);
  }

  if (
    !Array.isArray(data.results) ||
    typeof data.total_pages !== "number" ||
    !Number.isFinite(data.total_pages)
  ) {
    throw new TmdbError("Movie service returned an invalid response.", 502);
  }

  const results = data.results.filter((result) => isRecord(result));
  if (query && filters.genreId !== null) {
    // TMDB search has no genre filter; filter its genre_ids per returned page.
    const genreId = filters.genreId;
    results.splice(
      0,
      results.length,
      ...results.filter(
        (result) =>
          Array.isArray(result.genre_ids) &&
          result.genre_ids.includes(genreId),
      ),
    );
  }
  if (query && filters.sort) {
    const sortKey =
      filters.sort === "vote_average.desc"
        ? "vote_average"
        : filters.sort === "primary_release_date.desc"
          ? "release_date"
          : "popularity";
    results.sort((first, second) => {
      const firstValue = first[sortKey];
      const secondValue = second[sortKey];
      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return secondValue - firstValue;
      }
      if (typeof firstValue === "string" && typeof secondValue === "string") {
        return secondValue.localeCompare(firstValue);
      }
      return 0;
    });
  }

  const movies = results
    .map(normalizeMovie)
    .filter((movie): movie is Movie => movie !== null);
  const totalPages = Math.min(Math.max(Math.floor(data.total_pages), 0), 500);

  return { page, totalPages, movies };
}

export async function getTmdbGenres(): Promise<MovieGenre[]> {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new TmdbError(
      "TMDB is not configured. Set TMDB_API_READ_ACCESS_TOKEN on the server.",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.themoviedb.org/3/genre/movie/list", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 86400 },
    });
  } catch {
    throw new TmdbError("Movie service is temporarily unavailable.", 502);
  }

  if (response.status === 401) {
    throw new TmdbError("TMDB rejected the server access token.", 502);
  }
  if (response.status === 429) {
    throw new TmdbError(
      "Movie requests are temporarily rate limited. Please try again shortly.",
      429,
    );
  }
  if (!response.ok) {
    throw new TmdbError(
      response.status >= 500
        ? "Movie service is temporarily unavailable."
        : "Movie request could not be completed.",
      502,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new TmdbError("Movie service returned an invalid response.", 502);
  }
  if (!isRecord(data) || !Array.isArray(data.genres)) {
    throw new TmdbError("Movie service returned an invalid response.", 502);
  }
  return data.genres.filter(isMovieGenre);
}

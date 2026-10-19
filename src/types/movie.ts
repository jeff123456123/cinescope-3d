export type Movie = {
  id: number;
  title: string;
  releaseDate: string | null;
  releaseYear: number | null;
  overview: string;
  posterPath: string | null;
  rating: number | null;
  genreIds: number[];
};

export type MovieGenre = {
  id: number;
  name: string;
};

export type MovieFilters = {
  genreId: number | null;
  year: number | null;
  sort: MovieSort;
};

export type MovieSort =
  | ""
  | "popularity.desc"
  | "vote_average.desc"
  | "primary_release_date.desc";

export const movieSortOptions: readonly MovieSort[] = [
  "",
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
];

export const currentYear = new Date().getFullYear();

export type MovieSearchResponse = {
  page: number;
  totalPages: number;
  movies: Movie[];
};

export type MovieCastMember = {
  name: string;
  character: string;
  profilePath: string | null;
};

export type MovieDetails = {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  genres: MovieGenre[];
  runtime: number | null;
  releaseDate: string | null;
  rating: number | null;
  voteCount: number;
  posterPath: string | null;
  backdropPath: string | null;
  cast: MovieCastMember[];
  trailerKey: string | null;
};

export type MovieApiErrorResponse = {
  error: string;
};

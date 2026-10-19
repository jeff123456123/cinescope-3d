export type Movie = {
  id: number;
  title: string;
  releaseDate: string | null;
  releaseYear: number | null;
  overview: string;
  posterPath: string | null;
  rating: number | null;
};

export type MovieSearchResponse = {
  page: number;
  totalPages: number;
  movies: Movie[];
};

export type MovieApiErrorResponse = {
  error: string;
};

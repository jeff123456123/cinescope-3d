import { describe, expect, it } from "vitest";
import { normalizeTmdbMovie } from "@/lib/tmdb";

describe("TMDB movie normalization", () => {
  it("normalizes missing poster and release date", () => {
    expect(
      normalizeTmdbMovie({
        id: 42,
        title: "A Test Film",
        overview: "A synopsis",
        vote_average: 0,
      }),
    ).toEqual({
      id: 42,
      title: "A Test Film",
      releaseDate: null,
      releaseYear: null,
      overview: "A synopsis",
      posterPath: null,
      rating: 0,
      genreIds: [],
    });
  });

  it("rejects records without a valid id and title", () => {
    expect(normalizeTmdbMovie({ id: "42", title: "Film" })).toBeNull();
    expect(normalizeTmdbMovie({ id: 42, title: " " })).toBeNull();
  });
});

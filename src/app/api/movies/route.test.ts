import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getMovies } from "@/app/api/movies/route";
import { GET as getMovieDetails } from "@/app/api/movies/[id]/route";

function request(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

describe("movie API route", () => {
  beforeEach(() => {
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it.each([
    ["/api/movies?page=0", 400],
    ["/api/movies?page=501", 400],
    [`/api/movies?query=${"x".repeat(101)}`, 400],
    ["/api/movies?genre=-1", 400],
    ["/api/movies?genre=1.5", 400],
    ["/api/movies?year=1899", 400],
    ["/api/movies?year=9999", 400],
    ["/api/movies?sort=invalid", 400],
  ])("validates %s", async (url, status) => {
    const response = await getMovies(request(url));
    expect(response.status).toBe(status);
  });

  it("returns a clear error when the server token is missing", async () => {
    vi.stubEnv("TMDB_API_READ_ACCESS_TOKEN", "");
    const response = await getMovies(request("/api/movies"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "TMDB is not configured. Set TMDB_API_READ_ACCESS_TOKEN on the server.",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    [401, 502, "TMDB rejected the server access token."],
    [429, 429, "Movie requests are temporarily rate limited."],
    [500, 502, "Movie service is temporarily unavailable."],
  ])(
    "maps TMDB status %i to a safe error",
    async (upstreamStatus, expectedStatus, message) => {
      vi.mocked(fetch).mockResolvedValue(
        new Response("{}", { status: upstreamStatus }),
      );
      const response = await getMovies(request("/api/movies"));
      expect(response.status).toBe(expectedStatus);
      const body = await response.json();
      expect(body.error).toContain(message);
      expect(body.error).not.toContain("test-token");
    },
  );

  it.each(["0", "-1", "1.2", "not-an-id"])(
    "rejects invalid detail id %s",
    async (id) => {
      const response = await getMovieDetails(new Request("http://localhost"), {
        params: Promise.resolve({ id }),
      });
      expect(response.status).toBe(400);
    },
  );
});

import { NextResponse, type NextRequest } from "next/server";
import { getTmdbMovies, TmdbError } from "@/lib/tmdb";
import {
  currentYear,
  movieSortOptions,
  type MovieFilters,
} from "@/types/movie";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseInteger(value: string | null): number | null | false {
  if (value === null || value === "") {
    return null;
  }
  if (!/^\d+$/.test(value)) {
    return false;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : false;
}

function isMovieSort(value: string): value is MovieFilters["sort"] {
  return movieSortOptions.some((sortOption) => sortOption === value);
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("query") ?? "";
  const query = rawQuery.trim();
  if (query.length > 100) {
    return errorResponse("Search query must be 100 characters or fewer.", 400);
  }

  const rawPage = request.nextUrl.searchParams.get("page");
  const pageValue = parseInteger(rawPage);
  const page = pageValue === null ? 1 : pageValue;
  if (page === false || page < 1 || page > 500) {
    return errorResponse("Page must be an integer between 1 and 500.", 400);
  }

  const genreId = parseInteger(request.nextUrl.searchParams.get("genre"));
  if (genreId === false || (genreId !== null && genreId < 1)) {
    return errorResponse("Genre must be a positive integer.", 400);
  }

  const year = parseInteger(request.nextUrl.searchParams.get("year"));
  if (
    year === false ||
    (year !== null && (year < 1900 || year > currentYear + 2))
  ) {
    return errorResponse(
      `Year must be between 1900 and ${currentYear + 2}.`,
      400,
    );
  }

  const rawSort = request.nextUrl.searchParams.get("sort") ?? "";
  if (!isMovieSort(rawSort)) {
    return errorResponse("Sort option is not supported.", 400);
  }
  const filters: MovieFilters = {
    genreId,
    year,
    sort: rawSort,
  };

  try {
    const result = await getTmdbMovies(query, page, filters);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof TmdbError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Movie service is temporarily unavailable.", 502);
  }
}

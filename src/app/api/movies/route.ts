import { NextResponse, type NextRequest } from "next/server";
import { getTmdbMovies, TmdbError } from "@/lib/tmdb";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("query") ?? "";
  const query = rawQuery.trim();
  if (query.length > 100) {
    return errorResponse("Search query must be 100 characters or fewer.", 400);
  }

  const rawPage = request.nextUrl.searchParams.get("page");
  const page = rawPage === null ? 1 : Number(rawPage);
  if (
    rawPage !== null &&
    (!/^\d+$/.test(rawPage) || !Number.isInteger(page) || page < 1 || page > 500)
  ) {
    return errorResponse("Page must be an integer between 1 and 500.", 400);
  }

  try {
    const result = await getTmdbMovies(query, page);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof TmdbError) {
      return errorResponse(error.message, error.status);
    }
    return errorResponse("Movie service is temporarily unavailable.", 502);
  }
}

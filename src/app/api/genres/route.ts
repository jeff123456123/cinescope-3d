import { NextResponse } from "next/server";
import { getTmdbGenres, TmdbError } from "@/lib/tmdb";

export async function GET() {
  try {
    return NextResponse.json({ genres: await getTmdbGenres() });
  } catch (error: unknown) {
    if (error instanceof TmdbError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Movie service is temporarily unavailable." },
      { status: 502 },
    );
  }
}

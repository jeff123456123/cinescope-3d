import { NextResponse } from "next/server";
import { getTmdbMovieDetails, TmdbError } from "@/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id: rawId } = await params;
  if (!/^[1-9]\d*$/.test(rawId)) {
    return NextResponse.json(
      { error: "Movie id must be a positive integer." },
      { status: 400 },
    );
  }

  const id = Number(rawId);
  if (!Number.isSafeInteger(id)) {
    return NextResponse.json(
      { error: "Movie id must be a positive integer." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getTmdbMovieDetails(id));
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

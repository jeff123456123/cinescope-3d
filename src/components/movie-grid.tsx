import { MovieCard } from "@/components/movie-card";

const placeholders = ["violet", "indigo", "rose", "teal", "amber"];

export function MovieGrid() {
  return (
    <div
      className="movie-grid"
      aria-label="Movie placeholders. Movie discovery is coming soon."
    >
      {placeholders.map((tone) => (
        <MovieCard key={tone} tone={tone} />
      ))}
    </div>
  );
}

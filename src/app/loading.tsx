export default function Loading() {
  return (
    <main className="loading-page section-shell" aria-busy="true">
      <div className="loading-title-skeleton" aria-hidden="true" />
      <div className="movie-grid" aria-label="Loading movies">
        {["one", "two", "three", "four", "five"].map((item) => (
          <div className="movie-skeleton" aria-hidden="true" key={item}>
            <div className="movie-skeleton-art" />
            <div className="movie-skeleton-line" />
            <div className="movie-skeleton-line short" />
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Loading page content
      </p>
    </main>
  );
}

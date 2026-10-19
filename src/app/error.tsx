"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="app-error section-shell" role="alert">
      <p className="eyebrow section-eyebrow">A brief intermission</p>
      <h1>That scene didn’t load.</h1>
      <p>Something went wrong while preparing this page. Please try again.</p>
      <button className="retry-button" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}

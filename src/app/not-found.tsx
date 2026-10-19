import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-error section-shell">
      <p className="eyebrow section-eyebrow">Out of frame</p>
      <h1>We couldn’t find that page.</h1>
      <p>The story you’re looking for may have moved.</p>
      <Link className="header-cta" href="/">
        Back to discovery
      </Link>
    </main>
  );
}

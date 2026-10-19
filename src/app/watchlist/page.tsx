import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { WatchlistPage } from "@/components/watchlist-page";

export const metadata: Metadata = {
  title: "Your Watchlist | CineScope 3D",
  description: "Your personal collection of movies to watch and remember.",
};

export default function WatchlistRoute() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <WatchlistPage />
      </main>
      <footer className="site-footer">
        <Link className="footer-brand" href="/">
          CineScope <span>3D</span>
        </Link>
        <p>Made for the love of the frame.</p>
        <span className="footer-year">YOUR NEXT FAVORITE IS OUT THERE</span>
      </footer>
    </>
  );
}

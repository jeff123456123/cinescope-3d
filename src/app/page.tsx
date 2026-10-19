import {
  MovieFiltersControl,
  MovieExplorer,
  MovieSearchInput,
} from "@/components/movie-explorer";
import { MovieGrid } from "@/components/movie-grid";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <MovieExplorer>
        <main id="top">
          <section className="hero" id="discover" aria-labelledby="hero-title">
            <div className="hero-atmosphere" aria-hidden="true">
              <div className="hero-orb hero-orb-violet" />
              <div className="hero-orb hero-orb-indigo" />
              <div className="hero-grain" />
            </div>

            <div className="hero-content">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                A more cinematic way to choose
              </p>
              <h1 id="hero-title">
                Your next obsession
                <br />
                <span className="headline-accent">starts here.</span>
              </h1>
              <p className="hero-description">
                Discover films worth remembering and build a watchlist for every
                mood, moment, and movie night.
              </p>

              <MovieSearchInput />
            </div>

            <div className="hero-index" aria-hidden="true">
              <span>01</span>
              <span className="hero-index-line" />
              <span>DISCOVER</span>
            </div>
            <a className="scroll-cue" href="#now-showing">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to explore
            </a>
          </section>

          <section
            className="showcase section-shell"
            id="now-showing"
            aria-labelledby="showcase-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow section-eyebrow">
                  Made for movie lovers
                </p>
                <h2 id="showcase-title">Explore the cinematic universe</h2>
              </div>
              <p className="section-description">
                Browse what is trending or search for your next favorite film.
              </p>
            </div>
            <MovieFiltersControl />
            <MovieGrid />
          </section>

          <section className="closing-note section-shell" id="about">
            <span className="closing-rule" aria-hidden="true" />
            <p>Less scrolling. More stories worth remembering.</p>
            <span className="closing-rule" aria-hidden="true" />
          </section>
        </main>
      </MovieExplorer>
      <footer className="site-footer">
        <a className="footer-brand" href="#top">
          CineScope <span>3D</span>
        </a>
        <p>Made for the love of the frame.</p>
        <span className="footer-year">YOUR NEXT FAVORITE IS OUT THERE</span>
      </footer>
    </>
  );
}

# CineScope 3D

CineScope 3D is a cinematic movie discovery and personal watchlist application.
It uses the Next.js App Router, strict TypeScript, Tailwind CSS, and ESLint.
Movie and genre data come from TMDB; watchlist data stays in the visitor's
browser.

## Features

- Trending movies and title search, with debounced requests and paginated
  infinite scroll.
- Genre, release-year, and sort filters.
- Movie details, cast, and trailer information.
- A responsive movie grid with CSS 3D card tilt that respects reduced-motion
  and coarse-pointer preferences.
- A personal watchlist with ratings and notes, persisted locally and synced
  between tabs.
- Accessible search, filters, dialogs, focus states, loading, and retryable
  error states.

## Architecture

```text
Browser
  app pages + reusable React components
    MovieExplorer -> useMovieSearch -> /api/movies
    WatchlistProvider -> versioned localStorage
    Movie details dialog -> /api/movies/[id]
    Genre filters -> /api/genres
                         |
                         v
               server-only src/lib/tmdb.ts
                         |
                         v
                        TMDB
```

The TMDB access token is read only by server routes and the server-only TMDB
module. The browser calls the application's API routes and never receives the
token. The watchlist is intentionally local-only; there is no account or
database.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set
   `TMDB_API_READ_ACCESS_TOKEN` to your TMDB API Read Access Token.
3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

Without a valid TMDB token, data routes return a safe configuration or upstream
error rather than movie results.

## Environment variables

| Variable | Required | Used by |
| --- | --- | --- |
| `TMDB_API_READ_ACCESS_TOKEN` | Yes for TMDB data | Server only |

Keep real credentials in `.env.local` locally and in the deployment provider's
encrypted environment settings. Never prefix the token with `NEXT_PUBLIC_` or
commit a real value.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the strict TypeScript check |
| `npm test` | Run the Vitest and React Testing Library suite |
| `npm run build` | Create the optimized production build |
| `npm run start` | Serve the production build locally |

## Testing

Tests use Vitest, jsdom, and React Testing Library. Network requests are mocked;
tests do not call TMDB or read local credentials.

Run the checks before deployment:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add `TMDB_API_READ_ACCESS_TOKEN` under the Vercel project's Environment
   Variables. Keep it server-only and enable it for the required environments.
4. Deploy (or redeploy after changing the environment variable).
5. Verify the live homepage, search, movie details, and watchlist. Check
   `/api/movies` to confirm the deployment can reach TMDB.

The project uses the standard Next.js build and start commands; no database or
additional managed service is required.

## Key technical concepts

- **Server-only credentials:** `src/lib/tmdb.ts` uses `server-only`; route
  handlers make authenticated TMDB requests on the server.
- **Debounce and cancellation:** the movie-search hook waits 400 ms before
  requesting and uses `AbortController` to cancel obsolete requests and avoid
  stale results.
- **Pagination:** an `IntersectionObserver` loads subsequent pages near the
  bottom of the grid, with page limits, deduplication, and retryable errors.
- **Local watchlist:** a React Context and reducer manage state; a versioned
  localStorage key is validated at runtime, loaded after mount, and synchronized
  across tabs.
- **CSS 3D transforms:** movie cards use perspective and pointer-driven
  transforms rather than a WebGL dependency. Tilt is disabled for reduced
  motion and coarse-pointer input.

# CineScope 3D

A cinematic movie discovery and personal watchlist experience, built with the
Next.js App Router, TypeScript, Tailwind CSS, and ESLint.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

The homepage loads trending movies and supports title search through the
server-side `/api/movies` route. Search is debounced; TMDB credentials are
never sent to the browser.

## Environment

Copy `.env.example` to `.env.local` and set `TMDB_API_READ_ACCESS_TOKEN` to a
TMDB API Read Access Token. The token is read by the server only. Never commit
real tokens.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

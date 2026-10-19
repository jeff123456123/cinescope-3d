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

The search field and movie-card area are UI placeholders; movie search and
recommendations are not connected to an API yet.

## Environment

Copy `.env.example` to `.env.local` and add a TMDB read access token when API
integration is introduced. Never commit real tokens.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

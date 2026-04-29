# Habit Tracker PWA

A mobile-first Habit Tracker Progressive Web App built from the Stage 3 technical requirements. It uses Next.js App Router, React, TypeScript, Tailwind CSS, localStorage persistence, Vitest, React Testing Library, and Playwright.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm test
```

`npm run test:unit` generates coverage for `src/lib` and enforces the required 80% line coverage threshold.

## Local Persistence

The app stores deterministic local state in `localStorage` using the required keys:

- `habit-tracker-users`: JSON array of users with `id`, `email`, `password`, and `createdAt`.
- `habit-tracker-session`: active session object with `userId` and `email`, or `null`.
- `habit-tracker-habits`: JSON array of habits with owner `userId`, `daily` frequency, and unique completion dates.

## PWA Support

`public/manifest.json` defines the installable app metadata and icon entries. `public/sw.js` registers a basic service worker that caches the app shell routes and serves cached responses when the network is unavailable after the shell has loaded once.

## Requirements Mapping

- Routes: `/`, `/login`, `/signup`, and `/dashboard` are implemented in `src/app`.
- Required types: `src/types/auth.ts` and `src/types/habit.ts`.
- Required utilities: `src/lib/slug.ts`, `src/lib/validators.ts`, `src/lib/streaks.ts`, and `src/lib/habits.ts`.
- Required UI test IDs: implemented across `src/components/shared`, `src/components/auth`, and `src/components/dashboard`.
- PWA files: `public/manifest.json`, `public/sw.js`, `public/icons/icon-192.png`, and `public/icons/icon-512.png`.

## Required Test Files

- `tests/unit/slug.test.ts`: verifies slug formatting rules.
- `tests/unit/validators.test.ts`: verifies habit name validation.
- `tests/unit/streaks.test.ts`: verifies current streak calculation.
- `tests/unit/habits.test.ts`: verifies completion toggling behavior.
- `tests/integration/auth-flow.test.tsx`: verifies signup, duplicate signup, login, and invalid login behavior.
- `tests/integration/habit-form.test.tsx`: verifies habit creation, validation, editing, deletion confirmation, and completion streak updates.
- `tests/e2e/app.spec.ts`: verifies route protection, auth flows, habit workflows, persistence after reload, logout, and cached shell behavior.

## Trade-offs And Limitations

Authentication is intentionally local and stores plaintext passwords because the specification requires deterministic front-end-only persistence. The service worker is a minimal app-shell cache rather than a full offline data synchronization system.

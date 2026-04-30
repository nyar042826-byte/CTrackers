# CTracker Architecture

CTracker is organized around a local-first React application shell with feature modules and small shared services.

## Source Layout

- `src/app` contains app-level configuration and the `CTrackerApp` composition shell.
- `src/components` contains reusable UI building blocks such as cards, progress bars, navigation, and headers.
- `src/features` contains product modules: dashboard, library, tracker, favorites, statistics, and settings.
- `src/services` contains persistence and title-domain helpers.
- `src/stores` contains the main React state hook that coordinates library actions.
- `src/types` contains shared title constants, status labels, form defaults, and seed data.

## Persistence

The app stores reading-library data in `localStorage` under `ctracker.titles.v1`. Theme preference is stored separately under `ctracker.theme.v1`.

Supabase can be enabled with `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`. When configured, the Settings view exposes pull, push, and sync actions against the `ctracker_titles` table. The app keeps a generated owner key in localStorage under `ctracker.supabase.owner.v1` so one browser profile can map to its cloud rows while the app remains usable offline.

## PWA

The public manifest identifies CTracker as an installable reading tracker. `public/sw.js` caches the app shell and falls back to `index.html` for offline navigation.

# CTracker — Manga and Manhwa Chapter Tracker PWA

## Master Prompt

Act as a senior full-stack React architect, UI/UX designer, and PWA developer. Design and develop a scalable Progressive Web App system called **CTracker**, a manga and manhwa chapter tracker that helps users organize reading lists, track chapter progress, monitor updates, manage favorites, and receive reading reminders.

---

## Technology Stack

- React (Vite)
- Tailwind CSS
- shadcn/ui
- React Router
- IndexedDB / localStorage
- Service Worker
- Web App Manifest

---

## Core Features

- Track manga, manhwa, manhua, webtoons
- Monitor reading progress
- Manage favorites and watchlists
- Receive reminders and alerts
- Offline-first functionality

---

## Modules

### Dashboard
- Reading summary
- Continue reading
- Quick add

### Library
- CRUD titles
- Metadata (author, genre, etc.)
- Ratings and notes

### Chapter Tracker
- Track current vs latest chapter
- Progress calculation
- Reading history

### Search & Filters
- Filter by genre, status, rating
- Sort options

### Favorites & Watchlist
- Pin and organize titles

### Statistics
- Reading analytics
- Completion rate

### Settings
- Theme
- Backup/import/export

---

## Data Model

```ts
type TitleStatus = "reading" | "completed" | "paused" | "dropped" | "planned";

type CTrackerTitle = {
  id: string;
  title: string;
  genres: string[];
  currentChapter: number;
  latestChapter: number;
  status: TitleStatus;
  rating?: number;
  isFavorite: boolean;
  createdAt: string;
};
```

---

## Architecture

```
src/
 ├─ app/
 ├─ components/
 ├─ features/
 ├─ hooks/
 ├─ services/
 ├─ stores/
 ├─ types/
```

---

## PWA Features

- Installable app
- Offline support
- Cached assets
- Fast performance

---

## UI/UX

- Mobile-first
- Clean card layout
- Dark mode
- Accessible design

---

## Deliverables

- Full React project
- Functional modules
- PWA setup
- Responsive UI
- Clean architecture

---

## Goal

Build a production-ready manga and manhwa chapter tracker with a smooth, fast, and offline-capable experience.

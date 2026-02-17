# 🎬 Movies Website

A React application for browsing, searching, and saving favorite movies, powered by the [TMDB API](https://www.themoviedb.org/).

---

## Tech Stack

- **React 19** + **Vite**
- **Redux Toolkit** + **Redux-Saga** — global state and async side-effects
- **React Router v7** — client-side routing
- **Axios** — HTTP client with centralized error handling
- **SASS** — component-level CSS modules

---

## What I Built

### State Management

The entire app state lives in a single Redux slice (`movieSlice`). Async work (API calls, caching, batched favorites fetching) is handled by Redux-Saga, keeping the reducers pure and the components clean. Favorites are persisted to `localStorage` and rehydrated on startup.

### Pages & Routing

| Route        | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `/`          | Main browse page with movie grid, search, and category nav     |
| `/movie/:id` | Movie detail page with backdrop, metadata, and favorite toggle |

### Features

**Browse Categories**
Three views available from the nav bar: _Popular_, _Now Playing_, and _Favorites_. Switching views resets to page 1 to avoid out-of-range pagination.

**Search**
Real-time search with a 500ms debounce to avoid hammering the API. A client-side `RateLimiter` class (5 requests per 10 seconds) protects against burst input. Searches shorter than 2 characters are ignored. When the user starts typing while on the Favorites view, the app automatically switches to Popular so results are visible.

**Favorites**
Movies are saved by ID in `localStorage`. The Favorites view fetches full details for up to 20 saved IDs in parallel using `yield all(...)`, with individual failures handled gracefully so one bad ID doesn't break the batch.

**API Caching**
Browse results are cached in Redux under `cache[view][page]`. Revisiting a page you've already loaded skips the network request entirely.

**Full Keyboard Navigation**
Every part of the UI is keyboard-accessible via arrow keys and Enter:

| Area          | Behavior                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Search input  | `Escape` clears and returns focus to the nav bar                          |
| Nav bar       | Arrow keys move between tabs; Enter selects; hovering for 2s auto-selects |
| Movie grid    | Arrow keys navigate in a responsive grid layout                           |
| Pagination    | Left/Right arrows; Enter triggers prev/next page                          |
| Movie details | Left/Right between action buttons; Enter activates                        |

Focus state is tracked in Redux (`focusArea` + `focusIndex`) so it stays consistent across the whole app. The relevant element scrolls into view automatically when focus changes.

**Movie Detail Page**
Shows a full-width backdrop image, poster, release year, star rating, runtime, and overview. Includes an Add/Remove Favorites button and a Back button, both keyboard and mouse accessible.

**Error Handling**
The Axios client intercepts all responses and maps HTTP status codes (401, 404, network timeouts) to human-readable error messages displayed in the UI.

---

## What I Would Add

### Technical

- **TypeScript** — catch type errors at compile time and improve IDE support
- **Tests** — Jest + React Testing Library for reducers, sagas, and key components
- **Error Boundary** — graceful fallback UI for unexpected render errors
- **Skeleton Loaders** — replace the spinner with content-shaped placeholders
- **Cache Management** — the current cache grows indefinitely for the session; I'd add TTL-based expiration (e.g. invalidate entries older than 5 minutes) and a max-size cap to avoid excessive memory use, plus a manual "clear cache" action for debugging

### A Note on React 19

React 19's compiler handles memoization automatically, which means `useCallback` and `useMemo` are no longer necessary in most cases. I kept them in the codebase intentionally — both as a habit from pre-19 development and to make the optimization intent explicit for anyone reading the code. In a greenfield React 19 project I'd leave them out.

---

## Debugging in Dev Mode

When running `npm run dev`, the app logs useful signals to the browser console to help verify that caching and rate limiting are working correctly.

**Cache hits** — whenever a page you've already visited is served from the Redux cache instead of the network, you'll see:

```
Cache HIT for popular page 2
```

To trigger this: browse to any page, navigate away, then come back to the same view and page number. If the log appears, no API call was made.

**Rate limit** — if you type in the search box faster than 5 requests per 10 seconds, the saga will block the request and log:

```
Rate limit exceeded
```

To trigger this: type quickly in the search field, delete, retype repeatedly. When the warning appears, the UI will also display an error message asking you to wait a moment.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

# Cielo — weather app

Responsive web application to check the current weather and the five-day forecast of any city. It works on laptops, TVs, tablets and phones, with an interface that changes its look according to the weather.

## Features

- **Current weather:** temperature, description, minimum and maximum, feels-like temperature, humidity, wind (with compass), pressure, visibility, cloudiness, sunrise, sunset and the sun's path.
- **5-day forecast** with minimum, maximum and an icon per day.
- **Search with suggestions** while typing, with a keyboard shortcut (`/`) and arrow-key navigation.
- **Recent searches:** up to six cities saved in the browser.
- **Persistent preferences:** unit (°C/°F), theme (system, light or dark) and language (Spanish or English).
- **Weather-driven animated background:** sun and rays, starry night, clouds, rain, thunderstorm with lightning, snow and fog, with their own colors in light and dark themes.
- **Demo mode:** walks through the 7 weather types in light and dark themes (14 steps) using sample data and no network calls. A welcome guide points at the Demo button on entry.
- **Animations:** staggered card entrance, "Next days" cards that grow on hover, and animated details (humidity ring, wind needle, sun arc). `prefers-reduced-motion` is respected.
- **Accessibility:** text contrast of at least 4.5:1 across every weather type and theme, visible focus, ARIA labels and keyboard navigation.

## Architecture

The app uses the Next.js App Router and is organized **by feature (domain)**, not by file type. The browser never talks to the weather providers directly: it always goes through Next.js' own endpoints (BFF pattern), so the API key never leaves the server.

### Data flow

```
Component (feature)
      ↓
Query hook (TanStack Query)
      ↓
Own endpoint  /api/weather · /api/forecast · /api/geocode
      ↓
Weather service (picks the provider)
      ↓
OpenWeather (when a key exists)  or  Open-Meteo (no key)
```

Both providers are mapped to the same contracts (`Weather`, `ForecastDay`, `CitySuggestion`), so the interface does not know which one is in use. Open-Meteo's WMO weather codes are converted to OpenWeather's icons so the same components can be reused.

### Folder structure

```
src/
├── app/                  Routes, root layout, providers and global styles
│   └── api/              Endpoints: weather, forecast, geocode and health
├── features/             One folder per domain; each exposes only its index.ts
│   ├── weather/          components/ (cards, details, forecast), hooks/, api/ (providers), conditions
│   ├── search/           SearchBar, RecentSearches and city suggestions
│   ├── demo/             Demo mode and welcome guide
│   ├── background/       Animated background: particle canvas and lightning
│   └── preferences/      Unit, theme and language controls
├── components/ui/        Components with no business logic (Card, empty/error states, skeletons)
├── hooks/                Generic hooks (useDebounce, useMediaQuery)
├── stores/               Persisted global state (Zustand): preferences and recent searches
├── lib/                  Translations (i18n)
├── utils/                Pure formatting functions
└── types/                Shared data contracts
```

Import rule: a feature is only used through its `index.ts`. The server-side code of `weather` (`api/`) is kept apart from browser code so the two do not end up mixed in the bundle.

### Internal endpoints

| Route | Parameters | Response |
|---|---|---|
| `GET /api/weather` | `city`, or `lat` and `lon`; `lang` (`es`/`en`) | Current weather |
| `GET /api/forecast` | same as above | 5-day forecast |
| `GET /api/geocode` | `city`; `lang` | Up to 5 city suggestions |
| `GET /api/health` | — | `{ "status": "ok" }` |

Errors carry a stable code: `INVALID_QUERY` (400), `CITY_NOT_FOUND` (404), `INVALID_API_KEY` (401) and `UPSTREAM_ERROR` (502).

### State and styling

- **Preferences and recent searches:** a Zustand store persisted in `localStorage`.
- **Queries:** TanStack Query for caching, loading and error states.
- **Theme and weather:** the theme is applied with classes on `<html>` and the weather with `html[data-weather]`. CSS variables adapt colors, sky tints and text color for every weather and theme combination.
- **Animation:** `motion` for interface transitions and `canvas` for the background particles.

## Configuration

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | No | When set, OpenWeather is used. Without it, Open-Meteo is used, which needs no sign-up |

The key is only read on the server, at runtime. Copy `.env.example` to `.env.local` to use it during development.

## Running

Requirements: Node.js 20 or later.

```sh
npm install
npm run dev          # http://localhost:3000
```

No key is needed to try it.

## Tests and quality

| Command | What it does |
|---|---|
| `npm test` | Runs Jest |
| `npm run test:coverage` | Jest with coverage; enforces a global minimum of **97%** for statements, branches, functions and lines |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run build` | Production build |

The tests use mocked responses and never call a real provider. They cover utilities, the store, hooks, components, the animated background (with a simulated canvas context), demo mode and the endpoints. Each module's tests sit next to its file; the ones that span several modules are in `src/__tests__/`.

## Docker and Dokploy

The app listens on port `3000` and exposes `/api/health` for its health check.

```sh
docker build -t cielo .
docker run --rm -p 3000:3000 -e OPENWEATHER_API_KEY=your_key cielo
docker compose up --build        # WEB_PORT changes the published port
```

In Dokploy, create a Docker Compose service from this folder, point the domain at the `web` service on internal port `3000` and, if you want, define `OPENWEATHER_API_KEY`.

## Technical decisions

- **Organization by feature:** everything about a domain lives together and is consumed through a single entry point.
- **BFF with route handlers:** the provider key never reaches the browser and the contracts are our own.
- **Two providers behind one contract:** it works right after cloning, without signing up for any service.
- **Theme, weather and text color as CSS variables:** they guarantee readability in any combination without boxes or frames over the background.
- **High, stable coverage:** the animated-background tests fix the clock and the frames so they do not depend on chance.

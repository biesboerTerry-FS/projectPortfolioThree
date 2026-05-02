# Frontend — Spotify at Midnight

React (Vite) client for the portfolio Spotify app: OAuth handoff via JWT, protected routes, search, landing catalog, detail flows, preview playback, and Spotify Web Playback SDK when available.

## Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server (default `http://127.0.0.1:5173`) |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Environment

Point the app at the backend if it is not on localhost:

```bash
VITE_BACKEND_URL=http://127.0.0.1:3001
```

## Project layout

```
frontend/
├── src/
│   ├── App.jsx / App.css       # Shell, routing, playback & UI
│   ├── Login.jsx / Login.css   # OAuth entry screen
│   ├── ProtectedRoute.jsx      # JWT gate
│   ├── contexts/
│   │   └── SpotifyContext.jsx  # Shared API helper & cache (optional wiring)
│   ├── main.jsx
│   └── index.css
├── package.json
└── README.md
```

## Features

- **Auth:** Spotify OAuth through the backend; JWT stored in `localStorage`; redirect to `/login` when missing.  
- **Browse:** Search, saved tracks, artist picks, landing catalog, detail views with Spotify links.  
- **Playback:** 30s previews where available; Web Playback SDK for full playback on supported accounts; shuffle, repeat (off / queue / one), collapsible queue.  
- **UI:** Dark, Spotify-inspired layout; sidebar; carousels (Swiper); connection/debug panel.

## Backend API (reference)

All routes are under **`/api/v42`** on the backend host (`VITE_BACKEND_URL`). Examples:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v42/auth/spotify/login` | Start OAuth |
| GET | `/api/v42/auth/spotify/callback` | OAuth return |
| GET | `/api/v42/auth/me` | Profile (Bearer JWT) |
| POST | `/api/v42/auth/refresh` | Refresh Spotify token |
| GET | `/api/v42/search` | Search |
| GET | `/api/v42/spotify/details` | Track / artist / album detail |
| GET | `/api/v42/spotify/favorites` | Saved tracks |
| POST | `/api/v42/spotify/play` | Start playback |
| POST | `/api/v42/spotify/pause` | Pause |
| GET | `/api/v42/spotify/player-token` | SDK token |
| GET | `/api/v42/landing-catalog` | Landing catalog |

## Stack

React 19, Vite 5, React Router 7, Swiper, ESLint.

## Notes

- Full-track playback through the SDK typically requires **Spotify Premium** and an active device / Web Playback setup.  
- Preview URLs work more broadly when returned by the API.  
- Search and catalog availability depend on Spotify’s rules for your market.  
- Every authenticated API call expects `Authorization: Bearer <jwt>` from your backend login flow.

## Playlist roadmap (future)

Possible next steps: user playlists, playlist tracks, create/update playlists, collaborative features. Planned REST shapes would live under `/api/v42/playlists` (list, detail, CRUD, track add/remove/reorder — not implemented in this branch unless added in code).

# Backend API — Spotify OAuth & catalog

Node.js (Express) + MongoDB backend for the portfolio Spotify integration. All JSON APIs are mounted under **`/api/v42`**.

## Stack

- Express 5, Mongoose, JWT auth  
- Spotify OAuth (authorization code + refresh tokens stored per user)  
- Axios for Spotify Web API calls  

## Architecture

- **`src/routes`** — route registration  
- **`src/controllers`** — HTTP handlers  
- **`src/services`** — Spotify and catalog logic  
- **`src/middleware`** — OAuth state, JWT, Spotify token refresh  

Protected Spotify routes require a valid JWT **and** a linked Spotify account (refresh token on the user).

## Endpoints

Paths below are relative to your server origin (for example `http://127.0.0.1:3001`). Full paths always include the **`/api/v42`** prefix.

### Public

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v42/` | Plain-text server banner |
| GET | `/api/v42/status` | Health JSON (`status`, `message`) |
| GET | `/api/v42/landing-catalog` | Landing-page catalog (songs, artists, albums) |
| GET | `/api/v42/auth/spotify/login` | Start Spotify OAuth (redirect) |
| GET | `/api/v42/auth/spotify/callback` | OAuth callback (returns JWT payload for the frontend) |

### Authenticated (JWT `Authorization: Bearer`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v42/auth/me` | Current user profile |
| GET | `/api/v42/auth/session-status` | Session / Spotify link status |
| POST | `/api/v42/auth/refresh` | Refresh Spotify access token via stored refresh token |

### Spotify integration (JWT + linked Spotify account)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v42/spotify/player-token` | Short-lived token for Web Playback SDK |
| GET | `/api/v42/spotify/favorites?limit=` | Saved tracks |
| GET | `/api/v42/spotify/details?type=&id=` | Track, artist, or album detail (`type`: `track` \| `artist` \| `album`) |
| POST | `/api/v42/spotify/play` | Body: `{ uri, deviceId? }` |
| POST | `/api/v42/spotify/pause` | Body: `{ deviceId? }` |
| GET | `/api/v42/search?q=&type=&limit=` | Search (`type`: e.g. `track`, `artist`) |

No-results search contract: `success: true`, `noResults: true`, `message`, `items: []`.

## Local testing

- **`backend/requests.http`** — VS Code REST Client requests (variables: `baseUrl`, `apiPrefix`, `jwt`).  
- **`.postman/`** — optional Postman collection and script snippets.  
- **Tests:** `npm test` runs Jest (`backend/tests/endpoints.test.js`) against the mounted Express app.

## Environment

Copy `.env.dist` to `.env` and set:

```bash
PORT=3001
MONGO_URI=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
REDIRECT_URI=http://127.0.0.1:3001/api/v42/auth/spotify/callback
FRONTEND_REDIRECT_URI=http://127.0.0.1:5173
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

## Run

```bash
npm install
npm test
npm start
```

Spotify dashboard configuration (redirect URI, client ID/secret) is managed in Spotify for Developers outside this repo.

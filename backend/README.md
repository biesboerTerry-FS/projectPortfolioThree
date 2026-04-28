# Backend Spotify OAuth + Search API (Week 2)

## Architecture
- Decoupled backend service using Node.js + Express + MongoDB (Mongoose).
- All versioned API routes are prefixed with `/api/v42`.
- JWT-based authorization gates protected Spotify routes.
- Modular backend layering for portfolio review:
  - `src/routes` for route registration
  - `src/controllers` for HTTP handlers
  - `src/services` for business logic and provider orchestration

## Step 1: Spotify OAuth + JWT Persistence
- Spotify OAuth implemented under `/api/v42/auth/...`.
- `User` model stores profile data for Spotify provider:
  - root identity fields (`email`, `displayName`)
  - provider-specific data (`spotify`)
  - session state (`sessions[]`)
- OAuth login includes request `state` protection and callback validation.
- Option A persistence pattern:
  - Spotify `refreshToken` is persisted in MongoDB
  - frontend receives short-lived JWT
  - backend refreshes Spotify access tokens using stored refresh token
- Protected identity check:
  - `GET /api/v42/auth/me`

## Step 2: Spotify REST API Integration
- Added versioned search proxy endpoint:
  - `GET /api/v42/search?q=...&type=track&limit=10`
- Added Spotify library endpoints:
  - `GET /api/v42/spotify/favorites?limit=10` (saved tracks)
- Behavior:
  - Requires valid JWT (forces login before search)
  - Validates stored Spotify authorization before protected Spotify requests
  - Refreshes Spotify access token on-demand using persisted Spotify refresh token
  - Proxies Spotify Search API response
  - Returns UI-friendly transformed items with:
    - `title`, `artist`, `album`, `image`
    - `spotifyUrl`
    - `external_urls.spotify`
- No-results contract:
  - `success: true`
  - `noResults: true`
  - `message`
  - `items: []`

## Player Support
- Spotify scopes include Web Playback and library permissions.
- Player token endpoint:
  - `GET /api/v42/spotify/player-token`
- OAuth scope additions for playback/library:
  - `user-library-read`

## Step 4: REST Client API Documentation
- Added `backend/requests.http` with requests for:
  - health check
  - OAuth login route
  - auth/me
  - auth/session-status
  - auth/refresh (Spotify access token refresh)
  - player token
  - favorites (saved tracks)
  - search (results + no-results)
- Use `backend/requests.http` as the ready-to-run API request collection in VS Code REST Client.
- Jest and related test files were removed so VS Code REST Client is the single API testing workflow.

## Environment Variables
Copy `.env.dist` to `.env` and provide:

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

## Assignment Evidence
- Spotify account signup and Spotify developer dashboard setup were completed outside the repo.
- The provided dashboard screenshot confirms the developer app exists and is configured in Spotify for Developers.

## Run
```bash
npm install
npm test
npm start
```

# Frontend - Spotify at Midnight

React + Vite frontend for the Spotify integration project. The app handles Spotify OAuth, protects signed-in routes, and renders search and catalog content.
## What It Does

- Spotify sign-in flow with JWT handoff from the backend
- Automatic redirect to the login screen when no JWT is available
- Search for tracks and artists from the Spotify catalog
- Browse saved tracks, artist picks, and landing-page catalog content
- Playback controls with preview audio, Spotify Web Playback SDK support, shuffle, repeat, and a collapsible up-next queue

## Editor Setup

This workspace includes VS Code recommendations for ligature-friendly editing.

### Suggested Font

- Fira Code
- JetBrains Mono

### Suggested Themes

- Dracula Theme Official
- One Dark Pro

Ligatures are what make operators like `===`, `=>`, `!==`, and `>=` render in the fancy combined style. Make sure your font supports ligatures and that `editor.fontLigatures` is enabled.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Set the backend URL if it is not on localhost:

```bash
VITE_BACKEND_URL=http://127.0.0.1:3001
```
# Frontend - Spotify at Midnight

A Spotify-inspired web player UI built with React and Vite. Features OAuth authentication, real-time search, playback controls, and a beautiful Spotify-style interface.

## Features

### 🔐 Authentication
- **Spotify OAuth Login** - Seamless login flow with Spotify account authorization
- **Dedicated Login Page** - Full-screen login interface with feature highlights
- **Protected Routes** - Automatic redirection to login when JWT is missing
- **Session Management** - JWT stored in localStorage with automatic cleanup on logout

### 🎵 Search & Discovery
- **Real-time Search** - Search songs, artists, and albums across Spotify catalog
- **Search History** - Recent searches saved locally for quick access
- **Suggestions** - Personalized suggestions based on saved tracks
- **Advanced Details Modal** - Full track/artist/album information with links to Spotify

### 🎧 Playback Controls
- **Multiple Playback Modes**:
  - Preview audio (30-second clips)
  - Spotify Web Playback SDK (full songs on Premium accounts)
- **Transport Controls**:
  - Previous/Next track navigation
  - Play/Pause with visual feedback
- **Advanced Playback**:
  - **Shuffle** - Randomize queue with toggle
  - **Repeat Modes** - Off, All (loop queue), One (repeat single track)
- **Queue Management** - Collapsible "Up Next" section showing remaining tracks
- **Current Track Display** - Always shows what's now playing in the sidebar

### 📚 Library Features
- **Saved Tracks** - Browse your Spotify saved/liked tracks
- **Artist Picks** - Curated artists extracted from your saved tracks
- **Landing Catalog** - Popular songs, artists, and albums on app load

### 🎨 UI/UX
- **Spotify-Inspired Design** - Dark theme matching Spotify's aesthetic
- **Sidebar Navigation** - Quick access to Home, Search, Artists, Picks, Saved Tracks
- **Media Carousels** - Swipeable card-based display for tracks and artists
- **Responsive Layout** - Works on desktop and tablet (mobile optimizations in progress)
- **Connection Status Panel** - Real-time device, session, and API connection info

### 🎮 Player Interface
- **Two-Row Button Layout**:
  - Row 1: Previous | Play/Pause | Next (equal width)
  - Row 2: Shuffle | Repeat (50% width each, pill-shaped)
- **Large Visible Icons** - 1.6rem icons for easy interaction
- **Color-Coded Buttons** - Primary green for play, secondary for controls
- **Visual Feedback** - Active states for shuffle and repeat modes

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main app component with routing & playback logic
│   ├── App.css              # Global styles and layout
│   ├── Login.jsx            # Dedicated login page component
│   ├── Login.css            # Login page styling
│   ├── ProtectedRoute.jsx   # Route protection wrapper
│   ├── main.jsx             # App entry point
│   └── index.css            # Base styles
├── package.json
└── README.md
```

## API Integration

Backend API calls use `/api/v42` routes:

| Endpoint | Purpose |
|----------|---------|
| `GET /auth/spotify/login` | Initiate Spotify OAuth |
| `GET /auth/spotify/callback` | Handle OAuth redirect |
| `GET /auth/me` | Get current user info |
| `POST /auth/refresh` | Refresh Spotify access token |
| `GET /search` | Search tracks/artists |
| `GET /spotify/details` | Get detailed info (track/artist/album) |
| `GET /spotify/favorites` | Get saved tracks |
| `POST /spotify/play` | Start playback via device |
| `POST /spotify/pause` | Pause playback |
| `GET /spotify/player-token` | Get Spotify SDK token |
| `GET /landing-catalog` | Get popular content for landing page |

## Environment Setup

```bash
# Set backend URL if not on default localhost
VITE_BACKEND_URL=http://127.0.0.1:3001
```

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Run production build preview
npm preview
```

## Future Roadmap - Playlists

### Phase 1: Basic Playlist Support
- [ ] **Fetch User Playlists** - List all playlists in user's library
- [ ] **Playlist Details View** - Show playlist name, description, cover, track count
- [ ] **Browse Playlist Tracks** - Display all tracks in a playlist
- [ ] **Play from Playlist** - Queue and play tracks from selected playlist
- [ ] **Playlist Search** - Search within playlist tracks

### Phase 2: Playlist Management  
- [ ] **Create Playlist** - Create new empty playlists
- [ ] **Add to Playlist** - Add current track/search results to playlist
- [ ] **Remove from Playlist** - Remove tracks from playlist
- [ ] **Reorder Tracks** - Drag-and-drop track ordering in playlists
- [ ] **Edit Playlist** - Update name, description, cover image

### Phase 3: Advanced Playlist Features
- [ ] **Follow/Unfollow Playlists** - Track public/collaborative playlists
- [ ] **Share Playlists** - Generate shareable links
- [ ] **Collaborative Playlists** - Allow multiple users to edit
- [ ] **Playlist Analytics** - View duration, popularity, etc.
- [ ] **Duplicate Playlist** - Clone existing playlists

## Backend Requirements for Playlists

To support playlists, the backend needs these endpoints:

```javascript
// GET /api/v42/playlists
// List all user playlists

// GET /api/v42/playlists/:id
// Get playlist details and tracks

// POST /api/v42/playlists
// Create new playlist
// Body: { name, description?, public? }

// PUT /api/v42/playlists/:id
// Update playlist metadata

// DELETE /api/v42/playlists/:id
// Delete playlist

// POST /api/v42/playlists/:id/add-tracks
// Add tracks to playlist
// Body: { trackIds: string[] }

// DELETE /api/v42/playlists/:id/remove-tracks
// Remove tracks from playlist
// Body: { trackIds: string[] }

// PUT /api/v42/playlists/:id/reorder-tracks
// Reorder tracks in playlist
// Body: { trackId, newPosition }
```

## Technology Stack

- **React 19** - UI framework
- **Vite** - Fast build tool
- **React Router DOM** - Client-side routing
- **Swiper** - Touch-enabled carousel component
- **Spotify Web Playback SDK** - Native playback support
- **ESLint** - Code quality

## Notes

- Playback requires Spotify Premium account for full functionality
- Preview audio (30s clips) available for all users
- Search limited to Spotify's available catalog in your market
- JWT tokens must be obtained from backend OAuth flow
- All API calls require valid Bearer token authentication


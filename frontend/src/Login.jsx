import './Login.css';

function SpotifyIcon() {
  return (
    <svg className="login-spotify-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M6.2 8.7c4.2-1.5 8.1-1.2 11.6.9" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M7.1 11.8c3.2-1 6.3-.8 9.1.7" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M8 14.5c2.6-.7 4.8-.4 6.8.7" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function Login({ onSpotifyLogin }) {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:3001';
  const API_PREFIX = '/api/v42';

  const handleSpotifyLogin = () => {
    if (onSpotifyLogin) {
      onSpotifyLogin();
    } else {
      window.location.href = `${BACKEND_URL}${API_PREFIX}/auth/spotify/login`;
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 80 80" role="img" aria-label="Spotify style logo" className="login-logo-svg">
              <circle cx="40" cy="40" r="38" />
              <path d="M18 28c15-6 30-5 44 1" />
              <path d="M21 39c13-4 25-3 37 2" />
              <path d="M24 49c10-2 20-1 29 3" />
            </svg>
          </div>
          <h1 className="login-title">spotify at midnight</h1>
          <p className="login-subtitle">Diggin' In The Digital Crates</p>
        </div>

        <div className="login-body">
          <p className="login-description">
            Search, browse, and play from a native-feeling Spotify-style interface. 
            Connect your Spotify account to get started.
          </p>

          <button 
            className="btn btn-primary btn-spotify-auth" 
            type="button" 
            onClick={handleSpotifyLogin}
            aria-label="Sign in with Spotify"
          >
            <SpotifyIcon />
            Sign in to Spotify
          </button>

          <p className="login-disclaimer">
            By connecting your Spotify account, you're authorizing this application 
            to access your music library and playback controls.
          </p>
        </div>

        <div className="login-features">
          <h2 className="login-features-title">Features</h2>
          <ul className="login-features-list">
            <li>
              <span className="feature-icon" aria-hidden="true" />
              <span>Search songs, artists, and albums</span>
            </li>
            <li>
              <span className="feature-icon" aria-hidden="true" />
              <span>Browse your saved tracks</span>
            </li>
            <li>
              <span className="feature-icon" aria-hidden="true" />
              <span>Play music directly from the app</span>
            </li>
            <li>
              <span className="feature-icon" aria-hidden="true" />
              <span>Discover artists from your library</span>
            </li>
          </ul>
        </div>
      </div>

      <footer className="login-footer">
        <p>&copy; {new Date().getFullYear()} spotify at midnight | Not affiliated with Spotify</p>
      </footer>
    </div>
  );
}

export default Login;

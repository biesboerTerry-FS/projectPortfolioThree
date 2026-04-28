const crypto = require('crypto');
const { refreshStoredSpotifyAccessToken } = require('../services/spotifyAuthService');

const SPOTIFY_STATE_COOKIE = 'spotify_oauth_state';
const SPOTIFY_STATE_TTL_MS = 10 * 60 * 1000;
const spotifyStateStore = new Map();

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, chunk) => {
    const [rawKey, ...rawValue] = chunk.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

function appendCookie(response, cookie) {
  const current = response.getHeader('Set-Cookie');
  if (!current) {
    response.setHeader('Set-Cookie', cookie);
    return;
  }

  if (Array.isArray(current)) {
    response.setHeader('Set-Cookie', [...current, cookie]);
    return;
  }

  response.setHeader('Set-Cookie', [current, cookie]);
}

function buildStateCookie(value, maxAge = SPOTIFY_STATE_TTL_MS) {
  return [
    `${SPOTIFY_STATE_COOKIE}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function clearStateCookie(response) {
  appendCookie(response, buildStateCookie('', 0));
}

function pruneExpiredSpotifyStates() {
  const now = Date.now();
  for (const [state, expiresAt] of spotifyStateStore.entries()) {
    if (expiresAt <= now) {
      spotifyStateStore.delete(state);
    }
  }
}

function issueSpotifyOauthState(request, response, next) {
  pruneExpiredSpotifyStates();
  const state = crypto.randomBytes(24).toString('hex');
  request.spotifyOauthState = state;
  spotifyStateStore.set(state, Date.now() + SPOTIFY_STATE_TTL_MS);
  appendCookie(response, buildStateCookie(state));
  next();
}

function validateSpotifyOauthState(request, response, next) {
  pruneExpiredSpotifyStates();
  const cookies = parseCookies(request.headers.cookie || '');
  const queryState = String(request.query.state || '');
  const storedState = cookies[SPOTIFY_STATE_COOKIE] || '';
  const storedStateExpiresAt = spotifyStateStore.get(queryState) || 0;
  const hasValidServerState = storedStateExpiresAt > Date.now();
  const hasValidCookieState = Boolean(queryState && storedState && queryState === storedState);

  clearStateCookie(response);
  if (queryState) {
    spotifyStateStore.delete(queryState);
  }

  if (!queryState || (!hasValidCookieState && !hasValidServerState)) {
    return response.status(400).json({ error: 'Invalid Spotify OAuth state' });
  }

  return next();
}

async function requireSpotifyAuthorization(request, response, next) {
  try {
    const spotifyToken = await refreshStoredSpotifyAccessToken(request.auth.user);
    request.spotifyAuth = spotifyToken;
    return next();
  } catch (error) {
    const details = error.authDetails || {
      reason: 'spotify-refresh-failed',
      message: 'Unable to validate Spotify authorization',
      statusCode: 502,
    };

    return response.status(details.statusCode || 500).json({
      authenticated: true,
      spotifyAuthorized: false,
      needsLogin: true,
      reason: details.reason,
      error: details.message,
    });
  }
}

module.exports = {
  issueSpotifyOauthState,
  validateSpotifyOauthState,
  requireSpotifyAuthorization,
};

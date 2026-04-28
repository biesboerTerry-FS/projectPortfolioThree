const { resolveAuthFromToken, sanitizeUser } = require('../auth');
const { getSpotifyAuthUrl } = require('../oauthProviders');
const { authenticateSpotifyUser } = require('../services/authService');
const { validateSpotifyAuthorization } = require('../services/spotifyAuthService');

function buildAuthResponse(response, token, user) {
  const frontendRedirectUri = process.env.FRONTEND_REDIRECT_URI;
  if (frontendRedirectUri) {
    const redirectParams = new URLSearchParams({ token });
    return response.redirect(`${frontendRedirectUri}?${redirectParams.toString()}`);
  }
  return response.json({ token, user });
}

function health(request, response) {
  response.json({
    status: 'Online',
    message: 'Spotify backend ready',
  });
}

function spotifyLogin(request, response) {
  response.redirect(getSpotifyAuthUrl(request.spotifyOauthState));
}

async function spotifyCallback(request, response) {
  try {
    const { code } = request.query;
    if (!code) {
      return response.status(400).json({ error: 'Spotify code is required' });
    }
    const result = await authenticateSpotifyUser(code);
    return buildAuthResponse(response, result.token, result.user);
  } catch (error) {
    const statusCode = error?.authDetails?.statusCode || 500;
    const providerError = error?.authDetails?.error || 'spotify-oauth-failed';
    const message = error?.authDetails?.message || 'Spotify OAuth failed';
    return response.status(statusCode).json({
      error: message,
      providerError,
    });
  }
}

function me(request, response) {
  return response.json({ user: sanitizeUser(request.auth.user) });
}

async function sessionStatus(request, response) {
  const authHeader = request.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const status = await resolveAuthFromToken(token);

  if (!status.authenticated) {
    return response.json({
      authenticated: false,
      spotifyAuthorized: false,
      needsLogin: true,
      reason: status.reason,
    });
  }

  const spotifyStatus = await validateSpotifyAuthorization(status.user);
  if (!spotifyStatus.valid) {
    return response.json({
      authenticated: true,
      spotifyAuthorized: false,
      needsLogin: true,
      reason: spotifyStatus.reason,
      user: sanitizeUser(status.user),
    });
  }

  return response.json({
    authenticated: true,
    spotifyAuthorized: true,
    needsLogin: false,
    reason: null,
    user: sanitizeUser(status.user),
  });
}

async function refreshSession(request, response) {
  try {
    return response.json({
      authenticated: true,
      spotifyAuthorized: true,
      needsLogin: false,
      accessToken: request.spotifyAuth.accessToken,
      expiresIn: request.spotifyAuth.expiresIn,
      tokenType: request.spotifyAuth.tokenType,
      scope: request.spotifyAuth.scope,
      user: sanitizeUser(request.auth.user),
    });
  } catch (error) {
    return response.status(500).json({ error: 'Unable to refresh Spotify access token' });
  }
}

module.exports = {
  health,
  spotifyLogin,
  spotifyCallback,
  me,
  sessionStatus,
  refreshSession,
};

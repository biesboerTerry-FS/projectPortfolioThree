const { refreshSpotifyAccessToken } = require('../oauthProviders');

function getSpotifyAuthFailure(error) {
  const providerError = error?.response?.data?.error;
  const description = error?.response?.data?.error_description;

  if (providerError === 'invalid_grant') {
    return {
      reason: 'spotify-reauthorization-required',
      message: description || 'Spotify authorization expired or was revoked',
      statusCode: 401,
      shouldClearRefreshToken: true,
    };
  }

  return {
    reason: 'spotify-refresh-failed',
    message: description || 'Unable to validate Spotify authorization',
    statusCode: 502,
    shouldClearRefreshToken: false,
  };
}

async function refreshStoredSpotifyAccessToken(user) {
  const refreshToken = user?.spotify?.refreshToken;
  if (!refreshToken) {
    const error = new Error('Spotify refresh token is missing');
    error.authDetails = {
      reason: 'spotify-not-connected',
      message: 'Spotify account is not connected for this user',
      statusCode: 401,
      shouldClearRefreshToken: false,
    };
    throw error;
  }

  try {
    const tokenResponse = await refreshSpotifyAccessToken(refreshToken);
    const nextRefreshToken = tokenResponse.refresh_token;

    if (nextRefreshToken && nextRefreshToken !== user.spotify.refreshToken) {
      user.spotify.refreshToken = nextRefreshToken;
      await user.save();
    }

    return {
      accessToken: tokenResponse.access_token,
      expiresIn: tokenResponse.expires_in,
      tokenType: tokenResponse.token_type || 'Bearer',
      scope: tokenResponse.scope || null,
    };
  } catch (error) {
    const authDetails = getSpotifyAuthFailure(error);

    if (authDetails.shouldClearRefreshToken && user?.spotify?.refreshToken) {
      user.spotify.refreshToken = undefined;
      await user.save();
    }

    error.authDetails = authDetails;
    throw error;
  }
}

async function validateSpotifyAuthorization(user) {
  try {
    const token = await refreshStoredSpotifyAccessToken(user);
    return {
      valid: true,
      reason: null,
      message: null,
      token,
    };
  } catch (error) {
    const details = error.authDetails || getSpotifyAuthFailure(error);
    return {
      valid: false,
      reason: details.reason,
      message: details.message,
      statusCode: details.statusCode,
      token: null,
    };
  }
}

module.exports = {
  refreshStoredSpotifyAccessToken,
  validateSpotifyAuthorization,
};

const User = require('../models/User');
const { createSessionToken, sanitizeUser } = require('../auth');
const {
  fetchSpotifyTokenFromCode,
  fetchSpotifyProfile,
} = require('../oauthProviders');

function attachAuthDetails(error, fallbackMessage) {
  const providerError = error?.response?.data?.error;
  const providerDescription = error?.response?.data?.error_description;
  const providerStatus = error?.response?.status;
  const message =
    providerDescription ||
    (typeof providerError === 'string' ? providerError : '') ||
    error?.message ||
    fallbackMessage;

  error.authDetails = {
    statusCode: providerStatus || 500,
    error: typeof providerError === 'string' ? providerError : 'spotify-auth-failed',
    message,
  };

  return error;
}

async function authenticateSpotifyUser(code) {
  let tokenResponse;
  try {
    tokenResponse = await fetchSpotifyTokenFromCode(code);
  } catch (error) {
    throw attachAuthDetails(error, 'Unable to exchange Spotify authorization code');
  }

  let spotifyProfile;
  try {
    spotifyProfile = await fetchSpotifyProfile(tokenResponse.access_token);
  } catch (error) {
    throw attachAuthDetails(error, 'Unable to fetch Spotify profile');
  }

  const query = { $or: [{ 'spotify.id': spotifyProfile.id }] };
  if (spotifyProfile.email) {
    query.$or.push({ email: spotifyProfile.email });
  }

  const user = (await User.findOne(query)) || new User();
  user.displayName = spotifyProfile.display_name || user.displayName;
  user.email = user.email || spotifyProfile.email;
  user.spotify = {
    id: spotifyProfile.id,
    email: spotifyProfile.email,
    displayName: spotifyProfile.display_name,
    image: spotifyProfile.images?.[0]?.url || null,
    refreshToken: tokenResponse.refresh_token || user.spotify?.refreshToken,
  };
  user.lastLoginProvider = 'spotify';

  const { token, jti, exp } = createSessionToken(user, 'spotify');
  user.sessions.push({
    jti,
    provider: 'spotify',
    expiresAt: new Date(exp * 1000),
  });

  await user.save();
  return { token, user: sanitizeUser(user) };
}

module.exports = {
  authenticateSpotifyUser,
};

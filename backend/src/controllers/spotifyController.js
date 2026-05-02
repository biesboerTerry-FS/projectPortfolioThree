const { getSavedTracks, getSpotifyDetail, playSpotifyUri, pauseSpotify } = require('../services/spotifyService');

async function playerToken(request, response) {
  try {
    return response.json({
      accessToken: request.spotifyAuth.accessToken,
      expiresIn: request.spotifyAuth.expiresIn,
      tokenType: request.spotifyAuth.tokenType,
      scope: request.spotifyAuth.scope,
    });
  } catch (error) {
    return response.status(500).json({ error: 'Unable to refresh Spotify access token' });
  }
}

module.exports = {
  playerToken,
  async favorites(request, response) {
    try {
      const limit = Number(request.query.limit || 20);
      const items = await getSavedTracks(request.spotifyAuth.accessToken, limit);
      return response.json({ success: true, items });
    } catch (error) {
      return response.status(500).json({ success: false, error: 'Unable to fetch Spotify favorites' });
    }
  },
  async details(request, response) {
    try {
      const type = String(request.query.type || '').trim().toLowerCase();
      const id = String(request.query.id || '').trim();

      if (!type || !id) {
        return response.status(400).json({ error: 'Query parameters "type" and "id" are required' });
      }

      const payload = await getSpotifyDetail(request.spotifyAuth.accessToken, type, id);
      return response.json({ success: true, ...payload });
    } catch (error) {
      const apiError = error?.response?.data?.error?.message || error?.response?.data?.error;
      return response.status(500).json({
        success: false,
        error: apiError || error?.message || 'Unable to fetch Spotify details',
      });
    }
  },
  async play(request, response) {
    try {
      const uri = String(request.body?.uri || '').trim();
      const deviceId = String(request.body?.deviceId || '').trim();

      if (!uri) {
        return response.status(400).json({ error: 'Request body "uri" is required' });
      }

      await playSpotifyUri(request.spotifyAuth.accessToken, uri, deviceId || undefined);
      return response.json({ success: true });
    } catch (error) {
      const apiError = error?.response?.data?.error?.message || error?.response?.data?.error;
      return response.status(500).json({
        success: false,
        error: apiError || error?.message || 'Unable to start Spotify playback',
      });
    }
  },
  async pause(request, response) {
    try {
      const deviceId = String(request.body?.deviceId || '').trim();

      await pauseSpotify(request.spotifyAuth.accessToken, deviceId || undefined);
      return response.json({ success: true });
    } catch (error) {
      const apiError = error?.response?.data?.error?.message || error?.response?.data?.error;
      return response.status(500).json({
        success: false,
        error: apiError || error?.message || 'Unable to pause Spotify playback',
      });
    }
  },
};

const axios = require('axios');

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_PROFILE_URL = 'https://api.spotify.com/v1/me';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';
const SPOTIFY_SAVED_TRACKS_URL = 'https://api.spotify.com/v1/me/tracks';
const SPOTIFY_PLAYER_URL = 'https://api.spotify.com/v1/me/player/play';
const SPOTIFY_PLAYER_PAUSE_URL = 'https://api.spotify.com/v1/me/player/pause';
const SPOTIFY_PLAYER_TRANSFER_URL = 'https://api.spotify.com/v1/me/player';
const SPOTIFY_TRACKS_URL = 'https://api.spotify.com/v1/tracks';
const SPOTIFY_ALBUMS_URL = 'https://api.spotify.com/v1/albums';
const SPOTIFY_ARTISTS_URL = 'https://api.spotify.com/v1/artists';
const SPOTIFY_ARTIST_ALBUMS_URL = 'https://api.spotify.com/v1/artists';

const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
].join(' ');


function buildQuery(params) {
  return new URLSearchParams(params).toString();
}

function getSpotifyAuthUrl(state) {
  return `${SPOTIFY_AUTHORIZE_URL}?${buildQuery({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    state,
    show_dialog: 'true',
    redirect_uri:
      process.env.REDIRECT_URI || 'http://127.0.0.1:3001/api/v42/auth/spotify/callback',
  })}`;
}


async function fetchSpotifyTokenFromCode(code) {
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri:
      process.env.REDIRECT_URI || 'http://127.0.0.1:3001/api/v42/auth/spotify/callback',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  }).toString();

  const { data } = await axios.post(SPOTIFY_TOKEN_URL, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
}

async function fetchSpotifyProfile(accessToken) {
  const { data } = await axios.get(SPOTIFY_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function refreshSpotifyAccessToken(refreshToken) {
  const payload = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  }).toString();

  const { data } = await axios.post(SPOTIFY_TOKEN_URL, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
}

async function searchSpotify(accessToken, query, type = 'track', limit = 10) {
  const { data } = await axios.get(SPOTIFY_SEARCH_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      q: query,
      type,
      limit,
    },
  });

  return data;
}

async function fetchSpotifySavedTracks(accessToken, limit = 20) {
  const { data } = await axios.get(SPOTIFY_SAVED_TRACKS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { limit },
  });
  return data;
}

async function fetchSpotifyTrackDetail(accessToken, id) {
  const { data } = await axios.get(`${SPOTIFY_TRACKS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function fetchSpotifyAlbumDetail(accessToken, id) {
  const { data } = await axios.get(`${SPOTIFY_ALBUMS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

async function fetchSpotifyArtistDetail(accessToken, id) {
  const artistResponse = await axios.get(`${SPOTIFY_ARTISTS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  let topTracks = [];
  try {
    const topTracksResponse = await axios.get(`${SPOTIFY_ARTISTS_URL}/${id}/top-tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { market: 'from_token' },
    });
    topTracks = topTracksResponse.data?.tracks || [];
  } catch {
    topTracks = [];
  }

  return {
    artist: artistResponse.data,
    topTracks,
  };
}

async function fetchSpotifyArtistAlbums(accessToken, id, limit = 50) {
  const { data } = await axios.get(`${SPOTIFY_ARTIST_ALBUMS_URL}/${id}/albums`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      market: 'from_token',
      limit,
      include_groups: 'album,single',
    },
  });
  return data;
}

async function startSpotifyPlayback(accessToken, deviceId, uris) {
  const params = deviceId ? { device_id: deviceId } : {};

  if (deviceId) {
    await axios.put(
      SPOTIFY_PLAYER_TRANSFER_URL,
      {
        device_ids: [deviceId],
        play: false,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }

  await axios.put(
    SPOTIFY_PLAYER_URL,
    { uris },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    }
  );
}

async function pauseSpotifyPlayback(accessToken, deviceId) {
  const params = deviceId ? { device_id: deviceId } : {};
  await axios.put(
    SPOTIFY_PLAYER_PAUSE_URL,
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    }
  );
}
  

module.exports = {
  getSpotifyAuthUrl,
  fetchSpotifyTokenFromCode,
  fetchSpotifyProfile,
  refreshSpotifyAccessToken,
  searchSpotify,
  fetchSpotifySavedTracks,
  fetchSpotifyTrackDetail,
  fetchSpotifyAlbumDetail,
  fetchSpotifyArtistDetail,
  fetchSpotifyArtistAlbums,
  startSpotifyPlayback,
  pauseSpotifyPlayback,
};

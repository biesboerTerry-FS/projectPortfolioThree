const {
  searchSpotify,
  fetchSpotifySavedTracks,
  fetchSpotifyTrackDetail,
  fetchSpotifyAlbumDetail,
  fetchSpotifyArtistDetail,
  fetchSpotifyArtistAlbums,
  startSpotifyPlayback,
  pauseSpotifyPlayback,
} = require('../oauthProviders');

function mapTrack(track) {
  return {
    id: track.id,
    title: track.name,
    href: track.href || null,
    artist: track.artists?.map((artist) => artist.name).join(', '),
    album: track.album?.name,
    albumId: track.album?.id || null,
    releaseDate: track.album?.release_date || null,
    image: track.album?.images?.[0]?.url || null,
    durationMs: track.duration_ms || null,
    popularity: typeof track.popularity === 'number' ? track.popularity : null,
    previewUrl: track.preview_url || null,
    explicit: Boolean(track.explicit),
    uri: track.uri || null,
    artists: track.artists?.map((artist) => ({ id: artist.id, name: artist.name })) || [],
    spotifyUrl: track.external_urls?.spotify || null,
    external_urls: {
      spotify: track.external_urls?.spotify || null,
    },
  };
}

function mapEpisode(episode) {
  return {
    id: episode.id,
    title: episode.name,
    artist: episode.show?.publisher || episode.show?.name || 'Episode',
    album: episode.show?.name || null,
    albumId: null,
    releaseDate: episode.release_date || null,
    image: episode.images?.[0]?.url || episode.show?.images?.[0]?.url || null,
    durationMs: episode.duration_ms || null,
    popularity: null,
    previewUrl: episode.audio_preview_url || null,
    explicit: Boolean(episode.explicit),
    uri: episode.uri || null,
    artists: [],
    spotifyUrl: episode.external_urls?.spotify || null,
    external_urls: {
      spotify: episode.external_urls?.spotify || null,
    },
    mediaType: 'episode',
  };
}

function mapArtist(artist) {
  return {
    id: artist.id,
    name: artist.name,
    href: artist.href || null,
    image: artist.images?.[0]?.url || null,
    genres: artist.genres || [],
    followers: artist.followers?.total || 0,
    popularity: typeof artist.popularity === 'number' ? artist.popularity : null,
    spotifyUrl: artist.external_urls?.spotify || null,
    external_urls: {
      spotify: artist.external_urls?.spotify || null,
    },
  };
}

async function searchTracks(accessToken, query, type, limit) {
  const spotifyData = await searchSpotify(accessToken, query, type, limit);

  if (type === 'artist') {
    const artists = spotifyData?.artists?.items || [];
    return artists.map(mapArtist);
  }

  if (type === 'episode') {
    const episodes = spotifyData?.episodes?.items || [];
    return episodes.map(mapEpisode);
  }

  const tracks = spotifyData?.tracks?.items || [];
  return tracks.map(mapTrack);
}

async function getSavedTracks(accessToken, limit = 20) {
  const data = await fetchSpotifySavedTracks(accessToken, limit);
  const items = data?.items || [];
  return items.map((item) => mapTrack(item.track));
}

async function getSpotifyDetail(accessToken, type, id) {
  if (type === 'track') {
    const track = await fetchSpotifyTrackDetail(accessToken, id);
    return {
      type,
      item: mapTrack(track),
    };
  }

  if (type === 'album') {
    const album = await fetchSpotifyAlbumDetail(accessToken, id);
    return {
      type,
      item: {
        id: album.id,
        name: album.name,
        image: album.images?.[0]?.url || null,
        releaseDate: album.release_date || null,
        totalTracks: album.total_tracks || 0,
        artists: album.artists?.map((artist) => ({ id: artist.id, name: artist.name })) || [],
        tracks: (album.tracks?.items || []).map((track) => ({
          id: track.id,
          title: track.name,
          artist: track.artists?.map((artist) => artist.name).join(', '),
          artists: track.artists?.map((artist) => ({ id: artist.id, name: artist.name })) || [],
          album: album.name,
          albumId: album.id,
          durationMs: track.duration_ms || null,
          previewUrl: track.preview_url || null,
          uri: track.uri || null,
        })),
      },
    };
  }

  if (type === 'artist') {
    const payload = await fetchSpotifyArtistDetail(accessToken, id);
    let albums = [];
    try {
      const albumsPayload = await fetchSpotifyArtistAlbums(accessToken, id);
      albums = (albumsPayload.items || [])
        .sort((a, b) => {
          const dateA = new Date(a.release_date || '0000-01-01');
          const dateB = new Date(b.release_date || '0000-01-01');
          return dateB - dateA;
        })
        .map((album) => ({
          id: album.id,
          name: album.name,
          image: album.images?.[0]?.url || null,
          releaseDate: album.release_date || null,
          totalTracks: album.total_tracks || 0,
          artists: album.artists?.map((artist) => ({ id: artist.id, name: artist.name })) || [],
          type: album.album_type || 'album',
          uri: album.uri || null,
        }));
    } catch {
      albums = [];
    }
    const topTracks = Array.isArray(payload.topTracks) ? payload.topTracks.map((track) => mapTrack(track)) : [];
    return {
      type,
      item: {
        id: payload.artist.id,
        name: payload.artist.name,
        type: payload.artist.type || 'artist',
        href: payload.artist.href || null,
        uri: payload.artist.uri || null,
        image: payload.artist.images?.[0]?.url || null,
        genres: payload.artist.genres || [],
        followers: payload.artist.followers?.total || 0,
        popularity: typeof payload.artist.popularity === 'number' ? payload.artist.popularity : null,
        spotifyUrl: payload.artist.external_urls?.spotify || null,
        external_urls: {
          spotify: payload.artist.external_urls?.spotify || null,
        },
        topTracks,
        albums,
      },
    };
  }

  throw new Error('Unsupported detail type');
}

async function playSpotifyUri(accessToken, uri, deviceId) {
  await startSpotifyPlayback(accessToken, deviceId, [uri]);
}

async function pauseSpotify(accessToken, deviceId) {
  await pauseSpotifyPlayback(accessToken, deviceId);
}

module.exports = {
  searchTracks,
  getSavedTracks,
  getSpotifyDetail,
  playSpotifyUri,
  pauseSpotify,
};

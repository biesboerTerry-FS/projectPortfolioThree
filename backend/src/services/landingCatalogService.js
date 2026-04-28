const axios = require('axios');
const LandingCatalog = require('../models/LandingCatalog');

const LANDING_CATALOG_KEY = 'landing-page';
const DEFAULT_DISPLAY_LIMIT = 12;

const DEFAULT_LANDING_CATALOG = {
  songs: [
    { id: 'song-1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
    { id: 'song-2', title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation' },
    { id: 'song-3', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House" },
    { id: 'song-4', title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights' },
    { id: 'song-5', title: 'Kill Bill', artist: 'SZA', album: 'SOS' },
    { id: 'song-6', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
    { id: 'song-7', title: 'Bad Habit', artist: 'Steve Lacy', album: 'Gemini Rights' },
    { id: 'song-8', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'Stay' },
    { id: 'song-9', title: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.' },
    { id: 'song-10', title: 'Super Bass', artist: 'Nicki Minaj', album: 'Pink Friday' },
    { id: 'song-11', title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR' },
    { id: 'song-12', title: 'Shape of You', artist: 'Ed Sheeran', album: 'Divide' },
    { id: 'song-13', title: 'One Dance', artist: 'Drake', album: 'Views' },
    { id: 'song-14', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice' },
    { id: 'song-15', title: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line' },
    { id: 'song-16', title: 'Vampire', artist: 'Olivia Rodrigo', album: 'GUTS' },
    { id: 'song-17', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover' },
    { id: 'song-18', title: 'Die For You', artist: 'The Weeknd', album: 'Starboy' },
    { id: 'song-19', title: 'Sunflower', artist: 'Post Malone, Swae Lee', album: 'Hollywoods Bleeding' },
    { id: 'song-20', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera' },
  ],
  artists: [
    { id: 'artist-1', name: 'Taylor Swift' },
    { id: 'artist-2', name: 'The Weeknd' },
    { id: 'artist-3', name: 'SZA' },
    { id: 'artist-4', name: 'Kendrick Lamar' },
    { id: 'artist-5', name: 'Bad Bunny' },
    { id: 'artist-6', name: 'Olivia Rodrigo' },
    { id: 'artist-7', name: 'Dua Lipa' },
    { id: 'artist-8', name: 'Harry Styles' },
    { id: 'artist-9', name: 'Drake' },
    { id: 'artist-10', name: 'Beyonce' },
    { id: 'artist-11', name: 'Ariana Grande' },
    { id: 'artist-12', name: 'Justin Bieber' },
    { id: 'artist-13', name: 'Billie Eilish' },
    { id: 'artist-14', name: 'Doja Cat' },
    { id: 'artist-15', name: 'Post Malone' },
    { id: 'artist-16', name: 'Travis Scott' },
    { id: 'artist-17', name: 'Miley Cyrus' },
    { id: 'artist-18', name: 'Ed Sheeran' },
    { id: 'artist-19', name: 'Queen' },
    { id: 'artist-20', name: 'Nicki Minaj' },
  ],
  albums: [
    { id: 'album-1', title: 'After Hours', artist: 'The Weeknd', album: 'After Hours' },
    { id: 'album-2', title: 'SOS', artist: 'SZA', album: 'SOS' },
    { id: 'album-3', title: 'Midnights', artist: 'Taylor Swift', album: 'Midnights' },
    { id: 'album-4', title: "Harry's House", artist: 'Harry Styles', album: "Harry's House" },
    { id: 'album-5', title: 'Future Nostalgia', artist: 'Dua Lipa', album: 'Future Nostalgia' },
    { id: 'album-6', title: 'DAMN.', artist: 'Kendrick Lamar', album: 'DAMN.' },
    { id: 'album-7', title: 'SOUR', artist: 'Olivia Rodrigo', album: 'SOUR' },
    { id: 'album-8', title: 'GUTS', artist: 'Olivia Rodrigo', album: 'GUTS' },
    { id: 'album-9', title: 'Lover', artist: 'Taylor Swift', album: 'Lover' },
    { id: 'album-10', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
    { id: 'album-11', title: 'Divide', artist: 'Ed Sheeran', album: 'Divide' },
    { id: 'album-12', title: 'Justice', artist: 'Justin Bieber', album: 'Justice' },
    { id: 'album-13', title: 'Pink Friday', artist: 'Nicki Minaj', album: 'Pink Friday' },
    { id: 'album-14', title: 'Views', artist: 'Drake', album: 'Views' },
    { id: 'album-15', title: 'Fine Line', artist: 'Harry Styles', album: 'Fine Line' },
    { id: 'album-16', title: 'Hollywoods Bleeding', artist: 'Post Malone', album: 'Hollywoods Bleeding' },
    { id: 'album-17', title: 'Endless Summer Vacation', artist: 'Miley Cyrus', album: 'Endless Summer Vacation' },
    { id: 'album-18', title: 'Renaissance', artist: 'Beyonce', album: 'Renaissance' },
    { id: 'album-19', title: 'When We All Fall Asleep, Where Do We Go?', artist: 'Billie Eilish', album: 'When We All Fall Asleep, Where Do We Go?' },
    { id: 'album-20', title: 'A Night at the Opera', artist: 'Queen', album: 'A Night at the Opera' },
  ],
};

function shuffleArray(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

async function lookupSongArtwork(title, artist) {
  const response = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: `${title} ${artist}`,
      entity: 'song',
      limit: 1,
    },
    timeout: 8000,
  });

  const match = response.data?.results?.[0];
  if (!match?.artworkUrl100) return '';
  return match.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
}

async function lookupAlbumArtwork(title, artist) {
  const response = await axios.get('https://itunes.apple.com/search', {
    params: {
      term: `${title} ${artist}`,
      entity: 'album',
      limit: 1,
    },
    timeout: 8000,
  });

  const match = response.data?.results?.[0];
  if (!match?.artworkUrl100) return '';
  return match.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
}

async function lookupArtistImage(name) {
  const response = await axios.get('https://api.deezer.com/search/artist', {
    params: {
      q: name,
    },
    timeout: 8000,
  });

  const match = response.data?.data?.[0];
  return match?.picture_xl || match?.picture_big || match?.picture_medium || '';
}

async function enrichArray(items, resolver) {
  let hasChanges = false;
  const enriched = [];

  for (const item of items) {
    if (item.image) {
      enriched.push(item);
      continue;
    }

    try {
      const image = await resolver(item);
      if (image) {
        enriched.push({ ...item, image });
        hasChanges = true;
      } else {
        enriched.push(item);
      }
    } catch {
      enriched.push(item);
    }
  }

  return { items: enriched, hasChanges };
}

async function ensureLandingCatalogSeeded() {
  let catalog = await LandingCatalog.findOne({ key: LANDING_CATALOG_KEY });

  if (!catalog) {
    catalog = await LandingCatalog.create({
      key: LANDING_CATALOG_KEY,
      songs: DEFAULT_LANDING_CATALOG.songs,
      artists: DEFAULT_LANDING_CATALOG.artists,
      albums: DEFAULT_LANDING_CATALOG.albums,
    });
  }

  const [songsResult, artistsResult, albumsResult] = await Promise.all([
    enrichArray(catalog.songs || [], (item) => lookupSongArtwork(item.title, item.artist)),
    enrichArray(catalog.artists || [], (item) => lookupArtistImage(item.name)),
    enrichArray(catalog.albums || [], (item) => lookupAlbumArtwork(item.title, item.artist)),
  ]);

  if (songsResult.hasChanges || artistsResult.hasChanges || albumsResult.hasChanges) {
    catalog.songs = songsResult.items;
    catalog.artists = artistsResult.items;
    catalog.albums = albumsResult.items;
    await catalog.save();
  }

  return catalog;
}

async function getLandingCatalog(displayLimit = DEFAULT_DISPLAY_LIMIT) {
  const catalog = await ensureLandingCatalogSeeded();
  const limit = Math.max(1, Number(displayLimit) || DEFAULT_DISPLAY_LIMIT);

  return {
    songs: shuffleArray(catalog.songs || []).slice(0, limit),
    artists: shuffleArray(catalog.artists || []).slice(0, limit),
    albums: shuffleArray(catalog.albums || []).slice(0, limit),
  };
}

module.exports = {
  getLandingCatalog,
  ensureLandingCatalogSeeded,
};

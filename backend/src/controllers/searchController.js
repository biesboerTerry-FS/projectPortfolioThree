const { searchTracks } = require('../services/spotifyService');

async function search(request, response) {
  try {
    const query = String(request.query.q || '').trim();
    const type = String(request.query.type || 'track').trim();
    const limit = Number(request.query.limit || 10);

    if (!query) {
      return response.status(400).json({
        error: 'Query parameter "q" is required',
      });
    }

    const items = await searchTracks(request.spotifyAuth.accessToken, query, type, limit);
    if (items.length === 0) {
      return response.status(200).json({
        success: true,
        noResults: true,
        message: `No results found for "${query}"`,
        items: [],
      });
    }

    return response.json({
      success: true,
      noResults: false,
      items,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: 'Spotify search failed',
    });
  }
}

module.exports = {
  search,
};

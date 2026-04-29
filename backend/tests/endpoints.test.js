const request = require('supertest');
const { API_PREFIX } = require('../src/config/constants');

jest.mock('../src/services/landingCatalogService', () => ({
  getLandingCatalog: jest.fn(),
}));

const { getLandingCatalog } = require('../src/services/landingCatalogService');
const { app } = require('../src/app');

describe('Server endpoint suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET / returns server status text', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Server running on port');
  });

  test(`GET ${API_PREFIX}/status returns health payload`, async () => {
    const response = await request(app).get(`${API_PREFIX}/status`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'Online',
      message: 'Spotify backend ready',
    });
  });

  test(`GET ${API_PREFIX}/landing-catalog returns catalog payload`, async () => {
    const mockedCatalog = {
      songs: [{ id: 'song-1' }],
      artists: [{ id: 'artist-1' }],
      albums: [{ id: 'album-1' }],
    };
    getLandingCatalog.mockResolvedValue(mockedCatalog);

    const response = await request(app).get(`${API_PREFIX}/landing-catalog?limit=5`);

    expect(getLandingCatalog).toHaveBeenCalledWith(5);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      ...mockedCatalog,
    });
  });

  test(`GET ${API_PREFIX}/auth/session-status returns unauthenticated without bearer token`, async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/session-status`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      authenticated: false,
      spotifyAuthorized: false,
      needsLogin: true,
      reason: 'missing-token',
    });
  });

  test(`GET ${API_PREFIX}/auth/spotify/login responds with spotify redirect`, async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/spotify/login`);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('https://accounts.spotify.com/authorize');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test(`GET ${API_PREFIX}/auth/spotify/callback rejects missing oauth state`, async () => {
    const response = await request(app).get(`${API_PREFIX}/auth/spotify/callback?code=abc123`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid Spotify OAuth state' });
  });

  test.each([
    ['GET', `${API_PREFIX}/auth/me`],
    ['POST', `${API_PREFIX}/auth/refresh`],
    ['GET', `${API_PREFIX}/spotify/player-token`],
    ['GET', `${API_PREFIX}/spotify/favorites`],
    ['GET', `${API_PREFIX}/spotify/details?type=track&id=123`],
    ['POST', `${API_PREFIX}/spotify/play`],
    ['POST', `${API_PREFIX}/spotify/pause`],
    ['GET', `${API_PREFIX}/search?q=test`],
  ])('%s %s returns 401 when bearer token is missing', async (method, url) => {
    const response = await request(app)[method.toLowerCase()](url);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ error: 'Missing bearer token' });
  });
});

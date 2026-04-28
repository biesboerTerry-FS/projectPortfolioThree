const express = require('express');
const {
  health,
  spotifyLogin,
  spotifyCallback,
  me,
  sessionStatus,
  refreshSession,
} = require('../controllers/authController');
const { landingCatalog } = require('../controllers/landingController');
const { authenticateJwt } = require('../auth');
const {
  issueSpotifyOauthState,
  validateSpotifyOauthState,
  requireSpotifyAuthorization,
} = require('../middleware/spotifyAuth');

const router = express.Router();

router.get('/status', health);
router.get('/landing-catalog', landingCatalog);
router.get('/auth/spotify/login', issueSpotifyOauthState, spotifyLogin);
router.get('/auth/spotify/callback', validateSpotifyOauthState, spotifyCallback);
router.get('/auth/me', authenticateJwt, me);
router.get('/auth/session-status', sessionStatus);
router.post('/auth/refresh', authenticateJwt, requireSpotifyAuthorization, refreshSession);

module.exports = router;

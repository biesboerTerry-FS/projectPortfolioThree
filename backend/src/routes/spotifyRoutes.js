const express = require('express');
const { authenticateJwt } = require('../auth');
const { requireSpotifyAuthorization } = require('../middleware/spotifyAuth');
const {
	playerToken,
	favorites,
	details,
	play,
	pause,
} = require('../controllers/spotifyController');
const { search } = require('../controllers/searchController');

const router = express.Router();

router.use(authenticateJwt, requireSpotifyAuthorization);

router.get('/spotify/player-token', playerToken);
router.get('/spotify/favorites', favorites);
router.get('/spotify/details', details);
router.post('/spotify/play', play);
router.post('/spotify/pause', pause);
router.get('/search', search);

module.exports = router;

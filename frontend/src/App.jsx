import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';
const API_PREFIX = '/api/v42';
const SEARCH_HISTORY_KEY = 'search_history_v1';
const PLAY_SUGGESTIONS_KEY = 'play_suggestions_v1';
const LIBRARY_CAROUSEL_LIMIT = 20;

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg className="btn-spotify-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" />
      <path d="M6.2 8.7c4.2-1.5 8.1-1.2 11.6.9" />
      <path d="M7.1 11.8c3.2-1 6.3-.8 9.1.7" />
      <path d="M8 14.5c2.6-.7 4.8-.4 6.8.7" />
    </svg>
  );
}

function PlaybackIcon({ isPlaying }) {
  return (
    <svg className="playback-icon" viewBox="0 0 24 24" aria-hidden="true">
      {isPlaying ? (
        <>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </>
      ) : (
        <path d="M8 6v12l10-6z" />
      )}
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg className="transport-icon transport-icon-previous" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6v12" />
      <path d="M17 6 8 12l9 6V6Z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg className="transport-icon transport-icon-next" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 6v12" />
      <path d="M7 6v12l9-6-9-6Z" />
    </svg>
  );
}

function RepeatIcon({ mode }) {
  return (
    <svg className={`transport-icon repeat-icon repeat-${mode}`} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="currentColor" fillRule="evenodd">
        {/* Repeat arrows */}
        <path d="M7 7h10v2l4-3-4-3v2H5v6h2V7zm10 10H7v-2l-4 3 4 3v-2h12v-6h-2v4z" />
      </g>
      {/* Indicator for repeat mode */}
      {mode === 'one' && (
        <circle cx="18" cy="18" r="5" fill="currentColor" opacity="0.8" />
      )}
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg className="transport-icon shuffle-icon" viewBox="0 0 24 24" aria-hidden="true">
      {/* Top-left to bottom-right arrow */}
      <path d="M3 8h14v2H5l3 3-1.41 1.41L2.59 9 6.59 5 8 6.41 5 9.41V8z" fill="currentColor" />
      {/* Bottom-left to top-right arrow */}
      <path d="M21 16H7v-2h12l-3-3 1.41-1.41L21.41 15l-4 4-1.41-1.41L20 16.59V16z" fill="currentColor" />
      {/* Right side accent point */}
      <circle cx="20" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="4" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg className="transport-icon queue-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.645-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
    </svg>
  );
}


function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function SectionPlaceholder({ title, description }) {
  return (
    <article className="media-card media-empty">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function SafeImage({ className, src, alt, fallbackClassName, fallbackLabel }) {
  const [isBroken, setIsBroken] = useState(false);
  const imageSrc = typeof src === 'string' ? src.trim() : '';

  if (!imageSrc || isBroken) {
    return <div className={`${className} ${fallbackClassName || ''}`.trim()} aria-label={fallbackLabel || alt || 'image unavailable'} role="img" />;
  }

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onError={() => setIsBroken(true)}
      loading="lazy"
    />
  );
}

function MediaCarousel({ items, type, emptyLabel, nowPlayingId, isPlaybackActive }) {
  const slideItems = items.length > 0 ? items : [{ id: `${type}-empty`, empty: true }];
  const enableLoop = slideItems.length > 5 && !slideItems[0]?.empty;

  return (
    <Swiper
      modules={[Navigation, Pagination, A11y]}
      navigation
      pagination={{ clickable: true }}
      loop={enableLoop}
      loopAddBlankSlides
      spaceBetween={12}
      slidesPerView={1}
      breakpoints={{
        560: { slidesPerView: 2 },
        860: { slidesPerView: 3 },
        1180: { slidesPerView: 4 },
        1440: { slidesPerView: 5 },
      }}
      className="media-swiper"
    >
      {slideItems.map((item) => {
        if (item.empty) {
          return (
            <SwiperSlide key={item.id}>
              <SectionPlaceholder title="No results yet" description={emptyLabel} />
            </SwiperSlide>
          );
        }

        if (type === 'artists') {
          return (
            <SwiperSlide key={item.id}>
              <article className="media-card artist-card">
                <div className="media-cover-wrap">
                  <SafeImage
                    className="media-cover"
                    src={item.image}
                    alt={item.name}
                    fallbackClassName="media-cover-empty"
                    fallbackLabel={`${item.name || 'Artist'} artwork unavailable`}
                  />
                </div>
                <h3 className="media-title">{item.name}</h3>
                {item.onOpenDetails && (
                  <button className="media-link" type="button" onClick={() => item.onOpenDetails?.()}>
                    View details
                  </button>
                )}
              </article>
            </SwiperSlide>
          );
        }

        return (
          <SwiperSlide key={item.id}>
            <article className="media-card">
              <div className="media-cover-wrap">
                <SafeImage
                  className="media-cover"
                  src={item.image}
                  alt={item.title || item.name}
                  fallbackClassName="media-cover-empty"
                  fallbackLabel={`${item.title || item.name || 'Media'} artwork unavailable`}
                />
              </div>
              <h3 className="media-title">{item.title || item.name}</h3>
              <p className="media-subtitle">{item.artist || item.album || 'Track'}</p>
              {item.previewUrl ? (
                <audio className="preview-audio" controls src={item.previewUrl} preload="none" />
              ) : null}
              <div className="media-links-stack">
                {item.onOpenDetails && (
                  <button className="media-link" type="button" onClick={() => item.onOpenDetails?.()}>
                    View details
                  </button>
                )}
                {item.previewUrl && (
                  <button className="media-link secondary" type="button" onClick={() => item.onTogglePlay?.()}>
                    <PlaybackIcon isPlaying={nowPlayingId === item.id && isPlaybackActive} />
                      {nowPlayingId === item.id && isPlaybackActive ? 'Pause' : 'Play'}
                  </button>
                )}
                {item.albumId && (
                  <button className="media-link secondary" type="button" onClick={() => item.onOpenAlbumDetails?.()}>
                    Album details
                  </button>
                )}
              </div>
            </article>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

function AppContent({ jwtToken, setJwtToken }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [sessionLabel, setSessionLabel] = useState('Signed out');
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('Sign in to search.');
  const [isSearching, setIsSearching] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [startupSuggestions, setStartupSuggestions] = useState([]);
  const [authTime, setAuthTime] = useState('Not authenticated');
  const [visibilityState, setVisibilityState] = useState({
    connectionOpen: false,
    searched: false,
  });
  const [activeSection, setActiveSection] = useState('home');
  const [detailContext, setDetailContext] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [visibleArtistDetailFields] = useState(() => new Set(['genres', 'followers', 'popularity']));
  const [playerState, setPlayerState] = useState('Not initialized');
  const [spotifyDeviceId, setSpotifyDeviceId] = useState('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [landingCatalog, setLandingCatalog] = useState({
    songs: [],
    artists: [],
    albums: [],
  });
  const [manualPlaybackQueue, setManualPlaybackQueue] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [isShuffled, setIsShuffled] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const previewAudioRef = useRef(null);
  const spotifyPlayerRef = useRef(null);

  const isSignedIn = Boolean(jwtToken && spotifyConnected);

  const getSectionIdFromPath = useCallback((pathname) => {
    if (!pathname || pathname === '/') return 'home';
    if (pathname.startsWith('/section/')) {
      return pathname.replace('/section/', '') || 'home';
    }
    return 'home';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (!tokenFromUrl) return;
    params.delete('token');
    const query = params.toString();
    window.history.replaceState({}, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
    setJwtToken(tokenFromUrl);
  }, [setJwtToken]);

  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      setRecentSearches(Array.isArray(history) ? history.slice(0, 3) : []);
    } catch {
      setRecentSearches([]);
    }

    try {
      const rawSuggestions = localStorage.getItem(PLAY_SUGGESTIONS_KEY);
      const suggestions = rawSuggestions ? JSON.parse(rawSuggestions) : [];
      setStartupSuggestions(Array.isArray(suggestions) ? suggestions.slice(0, 3) : []);
    } catch {
      setStartupSuggestions([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadLandingCatalog = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${API_PREFIX}/landing-catalog?limit=12`);
        const data = await response.json().catch(() => ({}));

        if (!active) return;

        setLandingCatalog({
          songs: Array.isArray(data.songs) ? data.songs : [],
          artists: Array.isArray(data.artists) ? data.artists : [],
          albums: Array.isArray(data.albums) ? data.albums : [],
        });
      } catch {
        if (active) {
          setLandingCatalog({
            songs: [],
            artists: [],
            albums: [],
          });
        }
      }
    };

    const load = async () => {
      await loadLandingCatalog();
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!jwtToken) {
      setSessionLabel('Signed out');
      setSpotifyConnected(false);
      setUserProfile(null);
      setAuthTime('Not authenticated');
      setTracks([]);
      setArtists([]);
      setFavorites([]);
      setRecommendedArtists([]);
      setVisibilityState((current) => ({ ...current, searched: false }));
      setSearchMessage('Sign in to search.');
      setManualPlaybackQueue([]);
      return;
    }

    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${API_PREFIX}/auth/me`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await response.json().catch(() => ({}));

        if (!active) return;

        if (!response.ok || !data?.user) {
          setSessionLabel('authenticated');
          setSpotifyConnected(false);
          setUserProfile(null);
          return;
        }

        setSessionLabel(`authenticated as ${data.user.displayName || data.user.email || 'Spotify user'}`);
        setSpotifyConnected(Boolean(data.user.spotifyConnected));
        setUserProfile(data.user);
        setAuthTime(new Date().toLocaleString());
        setSearchMessage('');
      } catch {
        if (active) {
          setSessionLabel('authenticated');
          setSpotifyConnected(false);
        }
      }
    };

    loadSession();
    return () => {
      active = false;
    };
  }, [jwtToken]);

  useEffect(() => {
    if (!isSignedIn) return;

    let active = true;

    const loadLibrary = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${API_PREFIX}/spotify/favorites?limit=${LIBRARY_CAROUSEL_LIMIT}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!active) return;

        const favoriteItems = response.ok && Array.isArray(data.items) ? data.items : [];
        const shuffledFavorites = shuffleArray(favoriteItems);
        setFavorites(shuffledFavorites);

        const libraryArtists = [];
        const seenArtistIds = new Set();

        shuffledFavorites.forEach((track) => {
          (track.artists || []).forEach((artist) => {
            if (!artist?.id || seenArtistIds.has(artist.id)) return;
            seenArtistIds.add(artist.id);
            libraryArtists.push({ id: artist.id, name: artist.name || 'Unknown artist' });
          });
        });

        const selectedArtists = libraryArtists.slice(0, LIBRARY_CAROUSEL_LIMIT);

        if (selectedArtists.length === 0) {
          setRecommendedArtists([]);
          return;
        }

        const artistResults = await Promise.all(
          selectedArtists.map(async (artist) => {
            try {
              const artistResponse = await fetch(`${BACKEND_URL}${API_PREFIX}/spotify/details?type=artist&id=${encodeURIComponent(artist.id)}`, {
                headers: { Authorization: `Bearer ${jwtToken}` },
              });
              const artistData = await artistResponse.json().catch(() => ({}));
              return artistResponse.ok ? artistData.item || null : null;
            } catch {
              return null;
            }
          })
        );

        if (active) {
          setRecommendedArtists(shuffleArray(artistResults.filter(Boolean)));
        }
      } catch {
        if (active) {
          setFavorites([]);
          setRecommendedArtists([]);
        }
      }
    };

    loadLibrary();
    return () => {
      active = false;
    };
  }, [isSignedIn, jwtToken]);

  useEffect(() => {
    const sectionIds = ['home', 'search-results', 'artist-results', 'picked-artists', 'favorites'];
    const targets = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { root: null, rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.3, 0.6] }
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isSignedIn, tracks.length, artists.length, favorites.length, recommendedArtists.length]);

  const runSearch = useCallback(
    async (term, persistHistory = true) => {
      if (!jwtToken) {
        setSearchMessage('Sign in with Spotify first.');
        return;
      }

      if (!spotifyConnected) {
        setSearchMessage('Spotify account is not connected for this session.');
        return;
      }

      const query = String(term || '').trim();
      if (!query) {
        setSearchMessage('Please enter a search term.');
        return;
      }

      setSearchQuery(query);
      setIsSearching(true);
      setVisibilityState((current) => ({ ...current, searched: true }));
      setSearchMessage('Searching...');

      try {
        const [trackResponse, artistResponse] = await Promise.all([
          fetch(`${BACKEND_URL}${API_PREFIX}/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }),
          fetch(`${BACKEND_URL}${API_PREFIX}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }),
        ]);

        const trackData = await trackResponse.json().catch(() => ({}));
        const artistData = await artistResponse.json().catch(() => ({}));

        if (!trackResponse.ok) {
          setTracks([]);
          setArtists([]);
          setSearchMessage(trackData?.error || 'Search failed.');
          return;
        }

        if (trackData.noResults) {
          setTracks([]);
          setArtists([]);
          setSearchMessage(trackData.message || 'No results found.');
          return;
        }

        const trackItems = Array.isArray(trackData.items) ? trackData.items : [];
        const artistItems = artistResponse.ok && Array.isArray(artistData.items) ? artistData.items : [];

        setTracks(trackItems);
        setArtists(artistItems);
        setSearchMessage(`Loaded ${trackItems.length} tracks and ${artistItems.length} artists.`);

        if (persistHistory) {
          setRecentSearches((current) => {
            const next = [query, ...current.filter((entry) => entry.toLowerCase() !== query.toLowerCase())].slice(0, 3);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
            return next;
          });
        }
      } catch {
        setSearchMessage('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    },
    [jwtToken, spotifyConnected]
  );

  const handleSearch = async () => {
    await runSearch(searchQuery, true);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleRecentSearch = async (value) => {
    setSearchQuery(value);
    await runSearch(value, false);
  };

  const navigateToSection = useCallback((sectionId, shouldRoute = true) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveSection(sectionId);
    if (shouldRoute) {
      const route = sectionId === 'home' ? '/' : `/section/${sectionId}`;
      if (location.pathname !== route) {
        navigate(route);
      }
    }
  }, [location.pathname, navigate]);

  const navigateHome = useCallback(() => {
    navigateToSection('home', true);
  }, [navigateToSection]);

  useEffect(() => {
    const sectionId = getSectionIdFromPath(location.pathname);
    navigateToSection(sectionId, false);
  }, [getSectionIdFromPath, location.pathname, navigateToSection]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_jwt');
    setJwtToken('');
    setSessionLabel('Signed out');
    setSpotifyConnected(false);
    setUserProfile(null);
    setSearchQuery('');
    setSearchMessage('Sign in to search.');
    setTracks([]);
    setArtists([]);
    setFavorites([]);
    setRecommendedArtists([]);
    setVisibilityState({ connectionOpen: false, searched: false });
    setNowPlaying(null);
    setIsPlaybackActive(false);
    setSpotifyDeviceId('');
    setPlayerState('Not initialized');
    setIsPlayerReady(false);
    setAuthTime('Not authenticated');
    setActiveSection('home');
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const truncateToken = (token) => {
    if (!token) return 'None';
    if (token.length < 28) return token;
    return `${token.slice(0, 14)}...${token.slice(-8)}`;
  };

  const formatOptionalValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
  };

  const formatDurationMs = useCallback((durationMs) => {
    if (!durationMs || Number.isNaN(Number(durationMs))) return null;
    const totalSeconds = Math.max(0, Math.round(Number(durationMs) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, []);

  const getSpotifyWebUrl = useCallback((item) => {
    if (!item) return '';
    return item.spotifyUrl || item.external_urls?.spotify || '';
  }, []);

  const toSpotifyOpenUrl = useCallback((uri) => {
    if (typeof uri !== 'string' || !uri.startsWith('spotify:')) return '';
    const [scheme, type, id] = uri.split(':');
    if (scheme !== 'spotify' || !type || !id) return '';
    return `https://open.spotify.com/${type}/${id}`;
  }, []);

  const toSpotifyEntityUrl = useCallback((type, id) => {
    if (!type || !id) return '';
    return `https://open.spotify.com/${type}/${id}`;
  }, []);

  const renderLinkedValue = useCallback((value, displayText) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    const linkText = String(displayText || trimmed).trim().replaceAll('_', ' ');
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      return <a href={trimmed} target="_blank" rel="noreferrer">{linkText}</a>;
    }

    if (trimmed.startsWith('spotify:')) {
      const openUrl = toSpotifyOpenUrl(trimmed);
      if (openUrl) {
        return <a href={openUrl} target="_blank" rel="noreferrer">{linkText}</a>;
      }
    }

    return linkText;
  }, [toSpotifyOpenUrl]);

  const openDetails = (type, item) => {
    setDetailContext({ type, id: item.id, seed: item });
    setDetailData(null);
    setDetailError('');
  };

  const closeDetails = () => {
    setDetailContext(null);
    setDetailData(null);
    setDetailError('');
  };

  const togglePreviewPlayback = useCallback((item, options = {}) => {
    const { preserveQueue = false, queue = null } = options;
    if (!item) {
      return;
    }

    if (Array.isArray(queue)) {
      setManualPlaybackQueue(queue);
    } else if (!preserveQueue) {
      setManualPlaybackQueue([]);
    }

    if (item.uri) {
      if (!isPlayerReady || !spotifyDeviceId) {
        setSearchMessage('Spotify player is not ready yet.');
        return;
      }

      if (nowPlaying?.id === item.id && isPlaybackActive) {
        const pausePlayback = async () => {
          try {
            await fetch(`${BACKEND_URL}${API_PREFIX}/spotify/pause`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
              body: JSON.stringify({ deviceId: spotifyDeviceId }),
            });
            setIsPlaybackActive(false);
            setPlayerState('Paused');
          } catch {
            setSearchMessage('Unable to pause playback.');
          }
        };

        pausePlayback();
        return;
      }

      const startPlayback = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}${API_PREFIX}/spotify/play`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ uri: item.uri, deviceId: spotifyDeviceId }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || 'Unable to start playback');
          }
          setNowPlaying(item);
          setIsPlaybackActive(true);
          setPlayerState(`Playing on ${spotifyDeviceId}`);
        } catch (error) {
          setSearchMessage(error instanceof Error ? error.message : 'Unable to start playback.');
        }
      };

      startPlayback();
      return;
    }

    const audio = previewAudioRef.current;
    if (!audio) {
      setSearchMessage('No playable media available for this item.');
      return;
    }

    if (nowPlaying?.id === item.id) {
      if (audio.paused) {
        audio.play().catch(() => {
          setSearchMessage('Preview ready. Press play in the player bar.');
        });
      } else {
        audio.pause();
      }
      return;
    }

    setNowPlaying(item);
  }, [isPlaybackActive, isPlayerReady, jwtToken, nowPlaying?.id, spotifyDeviceId]);

  const playbackQueue = useMemo(() => {
    if (manualPlaybackQueue.length > 0) {
      return manualPlaybackQueue;
    }

    const signedOutPlayable = (landingCatalog.songs || [])
      .map((item) => ({ ...item, uri: null, previewUrl: null }))
      .filter((item) => item.previewUrl || item.uri);

    if (!isSignedIn) {
      return signedOutPlayable;
    }

    const merged = [...(tracks || []), ...(favorites || [])]
      .filter((item) => item && item.id)
      .filter((item) => item.previewUrl || item.uri);

    const deduped = [];
    const seen = new Set();
    for (const item of merged) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      deduped.push(item);
    }
    return deduped;
  }, [favorites, isSignedIn, landingCatalog.songs, manualPlaybackQueue, tracks]);

  const currentQueueIndex = useMemo(() => {
    if (!nowPlaying?.id) return -1;
    return playbackQueue.findIndex((item) => item.id === nowPlaying.id);
  }, [nowPlaying?.id, playbackQueue]);

  const playQueueItemAt = useCallback((index) => {
    if (index < 0 || index >= playbackQueue.length) return;
    const target = playbackQueue[index];
    if (!target) return;
    togglePreviewPlayback(target, { preserveQueue: true });
  }, [playbackQueue, togglePreviewPlayback]);

  const playPrevious = useCallback(() => {
    if (playbackQueue.length === 0) return;
    if (currentQueueIndex <= 0) {
      playQueueItemAt(playbackQueue.length - 1);
      return;
    }
    playQueueItemAt(currentQueueIndex - 1);
  }, [currentQueueIndex, playQueueItemAt, playbackQueue.length]);

  const playNext = useCallback(() => {
    if (playbackQueue.length === 0) return;
    
    // Handle repeat one
    if (repeatMode === 'one') {
      if (nowPlaying?.id) {
        togglePreviewPlayback(nowPlaying, { preserveQueue: true });
      }
      return;
    }
    
    if (currentQueueIndex < 0 || currentQueueIndex >= playbackQueue.length - 1) {
      // If repeat all is on, loop back to beginning
      if (repeatMode === 'all') {
        playQueueItemAt(0);
      }
      return;
    }
    playQueueItemAt(currentQueueIndex + 1);
  }, [currentQueueIndex, playQueueItemAt, playbackQueue.length, repeatMode, nowPlaying, togglePreviewPlayback]);

  const toggleRepeatMode = useCallback(() => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  }, [repeatMode]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(!isShuffled);
    if (!isShuffled && playbackQueue.length > 0) {
      // Shuffle the queue and set as manual queue
      const shuffled = shuffleArray(playbackQueue);
      setManualPlaybackQueue(shuffled);
    } else {
      // Return to original queue
      setManualPlaybackQueue([]);
    }
  }, [isShuffled, playbackQueue]);

  useEffect(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (!nowPlaying?.previewUrl) return;
    if (nowPlaying.uri) return;

    audio.play().then(() => {
      setIsPlaybackActive(true);
    }).catch(() => {
      setSearchMessage('Preview loaded. Press play in the player bar to start.');
    });
  }, [nowPlaying?.id, nowPlaying?.previewUrl, nowPlaying?.uri]);

  useEffect(() => {
    if (!jwtToken || !spotifyConnected) return undefined;

    let active = true;
    let script = document.querySelector('script[data-spotify-sdk="true"]');

    const initializePlayer = async () => {
      if (!window.Spotify) return;

      if (spotifyPlayerRef.current) {
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}${API_PREFIX}/spotify/player-token`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.accessToken) {
          throw new Error(data?.error || 'Unable to initialize Spotify player');
        }

        const player = new window.Spotify.Player({
          name: 'spotify at midnight',
          getOAuthToken: (callback) => callback(data.accessToken),
        });

        player.addListener('ready', ({ device_id: deviceId }) => {
          if (!active) return;
          spotifyPlayerRef.current = player;
          setSpotifyDeviceId(deviceId);
          setIsPlayerReady(true);
          setPlayerState(`Ready on ${deviceId}`);
        });

        player.addListener('not_ready', ({ device_id: deviceId }) => {
          if (!active) return;
          setPlayerState(`Device offline: ${deviceId}`);
          setIsPlayerReady(false);
        });

        player.addListener('initialization_error', ({ message }) => {
          if (active) setPlayerState(`Initialization error: ${message}`);
        });

        player.addListener('authentication_error', ({ message }) => {
          if (active) setPlayerState(`Authentication error: ${message}`);
        });

        player.addListener('account_error', ({ message }) => {
          if (active) setPlayerState(`Account error: ${message}`);
        });

        player.addListener('player_state_changed', (state) => {
          if (!active || !state) return;
          setIsPlaybackActive(!state.paused);
          const currentTrack = state.track_window?.current_track;
          if (currentTrack?.uri) {
            setNowPlaying((current) => ({
              ...(current || {}),
              id: currentTrack.id,
              title: currentTrack.name,
              artist: currentTrack.artists?.map((artist) => artist.name).join(', '),
              album: currentTrack.album?.name,
              albumId: currentTrack.album?.uri?.split(':').pop() || null,
              image: currentTrack.album?.images?.[0]?.url || null,
              uri: currentTrack.uri,
              previewUrl: currentTrack.preview_url || null,
            }));
          }
        });

        await player.connect();
      } catch (error) {
        if (active) setPlayerState(error instanceof Error ? error.message : 'Unable to initialize Spotify player');
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.dataset.spotifySdk = 'true';
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    if (window.Spotify) {
      initializePlayer();
    }

    return () => {
      active = false;
    };
  }, [jwtToken, spotifyConnected]);

  useEffect(() => {
    if (!detailContext || !jwtToken || !spotifyConnected) return undefined;

    let active = true;

    const loadDetails = async () => {
      setDetailLoading(true);
      setDetailError('');

      try {
        const response = await fetch(
          `${BACKEND_URL}${API_PREFIX}/spotify/details?type=${encodeURIComponent(detailContext.type)}&id=${encodeURIComponent(detailContext.id)}`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        const payload = await response.json().catch(() => ({}));

        if (!active) return;

        if (!response.ok || !payload?.item) {
          throw new Error(payload?.error || 'Unable to fetch details');
        }

        setDetailData(payload);
      } catch (error) {
        if (active) {
          setDetailError(error instanceof Error ? error.message : 'Unable to fetch details');
          setDetailData(null);
        }
      } finally {
        if (active) setDetailLoading(false);
      }
    };

    loadDetails();
    return () => {
      active = false;
    };
  }, [detailContext, jwtToken, spotifyConnected]);

  const detailItem = detailData?.item || detailContext?.seed || null;
  const detailType = detailData?.type || detailContext?.type || '';
  const trackDetailCards = detailType === 'track' ? [
    { label: null, value: formatOptionalValue(getSpotifyWebUrl(detailItem)), displayText: detailItem?.title || detailItem?.name || 'Track' },
    { label: null, value: detailItem?.albumId ? toSpotifyEntityUrl('album', detailItem.albumId) : null, displayText: detailItem?.album || 'Album' },
    { label: 'Release date', value: formatOptionalValue(detailItem?.releaseDate) },
    { label: 'Duration', value: formatDurationMs(detailItem?.durationMs) },
    { label: 'Popularity', value: detailItem?.popularity !== null && detailItem?.popularity !== undefined ? String(detailItem.popularity) : null },
    { label: 'Explicit', value: detailItem?.explicit === true ? 'Yes' : detailItem?.explicit === false ? 'No' : null },
  ].filter((field) => field.value) : [];
  const artistDetailCards = [
    { key: 'href', label: 'Href', value: formatOptionalValue(detailItem?.href) },
    { key: 'trackLink', label: 'Artist link', value: formatOptionalValue(detailItem?.spotifyUrl || detailItem?.external_urls?.spotify) },
    { key: 'genres', label: 'Genres', value: detailItem?.genres?.length ? detailItem.genres.join(', ') : null },
    { key: 'followers', label: 'Followers', value: detailItem?.followers !== null && detailItem?.followers !== undefined ? detailItem.followers.toLocaleString?.() || String(detailItem.followers) : null },
    { key: 'popularity', label: 'Popularity', value: detailItem?.popularity !== null && detailItem?.popularity !== undefined ? String(detailItem.popularity) : null },
  ].filter((field) => visibleArtistDetailFields.has(field.key) && field.value);
  const displayedSearchMessage = isSignedIn && searchMessage === 'Sign in to search.' ? '' : searchMessage;

  return (
    <div className={`clone-layout${isSignedIn ? '' : ' signed-out-layout'}`}>
      {isSignedIn && (
      <aside className="sidebar">
        <div className="brand-row side-brand">
          <button className="brand-home-link" type="button" onClick={navigateHome}>
            <div className="spotify-mark" aria-hidden="true">
              <svg viewBox="0 0 80 80" role="img" aria-label="Spotify style logo">
                <circle cx="40" cy="40" r="38" />
                <path d="M18 28c15-6 30-5 44 1" />
                <path d="M21 39c13-4 25-3 37 2" />
                <path d="M24 49c10-2 20-1 29 3" />
              </svg>
            </div>
            <strong>{userProfile?.displayName || userProfile?.email || 'Spotify'}</strong>
          </button>
        </div>

        <nav className="side-links">
          <NavLink to="/" className={activeSection === 'home' ? 'is-active' : ''} onClick={() => navigateToSection('home', false)}>
            home
          </NavLink>
          <NavLink to="/section/search-results" className={activeSection === 'search-results' ? 'is-active' : ''} onClick={() => navigateToSection('search-results', false)}>
            search
          </NavLink>
          <NavLink to="/section/artist-results" className={activeSection === 'artist-results' ? 'is-active' : ''} onClick={() => navigateToSection('artist-results', false)}>
            artists
          </NavLink>
          <NavLink to="/section/picked-artists" className={activeSection === 'picked-artists' ? 'is-active' : ''} onClick={() => navigateToSection('picked-artists', false)}>
            picks
          </NavLink>
          <NavLink to="/section/favorites" className={activeSection === 'favorites' ? 'is-active' : ''} onClick={() => navigateToSection('favorites', false)}>
            saved tracks
          </NavLink>
        </nav>

        {nowPlaying && (nowPlaying.previewUrl || nowPlaying.uri) && (
          <>
            <section className="side-player-wrapper">
              <SafeImage
                className="player-thumbnail"
                src={nowPlaying.image || ''}
                alt={`${nowPlaying.title || 'Song'} artwork`}
                fallbackClassName="thumbnail-fallback"
                fallbackLabel="Album artwork unavailable"
              />
              <div className="player-info">
                <strong className="player-title">{nowPlaying.title || nowPlaying.name || 'Now playing'}</strong>
                <span className="player-artist">{nowPlaying.artist || nowPlaying.album || 'Preview'}</span>
              </div>
              <div className="player-controls">
                <button className="btn btn-icon btn-secondary" type="button" onClick={playPrevious} aria-label="Previous track">
                  <PreviousIcon />
                </button>
                <button className="btn btn-icon btn-primary" type="button" onClick={() => togglePreviewPlayback(nowPlaying)} aria-label={isPlaybackActive ? 'Pause' : 'Play'}>
                  <PlaybackIcon isPlaying={isPlaybackActive} />
                </button>
                <button className="btn btn-icon btn-secondary" type="button" onClick={playNext} aria-label="Next track">
                  <NextIcon />
                </button>
                <button 
                  className={`btn btn-icon btn-secondary btn-row-2 ${isShuffled ? 'active' : ''}`} 
                  type="button" 
                  onClick={toggleShuffle} 
                  aria-label="Toggle shuffle"
                  title={isShuffled ? 'Shuffle on' : 'Shuffle off'}
                >
                  <ShuffleIcon />
                </button>
                <button 
                  className={`btn btn-icon btn-secondary btn-row-2 repeat-button repeat-${repeatMode}`} 
                  type="button" 
                  onClick={toggleRepeatMode} 
                  aria-label={`Repeat: ${repeatMode}`}
                  title={`Repeat: ${repeatMode}`}
                >
                  <RepeatIcon mode={repeatMode} />
                </button>
              </div>
              <button
                className="queue-toggle"
                type="button"
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                aria-label="Toggle queue"
              >
                <QueueIcon />
                Queue ({playbackQueue.length})
              </button>
              <audio
                ref={previewAudioRef}
                className="preview-audio preview-audio-hidden"
                src={nowPlaying.previewUrl || ''}
                preload="none"
                aria-hidden="true"
                onPlay={() => setIsPlaybackActive(true)}
                onPause={() => setIsPlaybackActive(false)}
                onEnded={() => {
                  setIsPlaybackActive(false);
                  playNext();
                }}
              />
            </section>

            {isQueueOpen && playbackQueue.length > 0 && (
              <section className="side-queue-wrapper">
                <div className="queue-header">
                  <h3>Up Next</h3>
                  <span className="queue-count">{playbackQueue.length - Math.max(0, currentQueueIndex + 1)} tracks remaining</span>
                </div>
                <div className="queue-list">
                  {playbackQueue.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className={`queue-item ${index === currentQueueIndex ? 'now-playing' : ''} ${index < currentQueueIndex ? 'played' : ''}`}
                    >
                      <span className="queue-index">{index + 1}</span>
                      <div className="queue-item-info">
                        <div className="queue-item-title">
                          {index === currentQueueIndex && <span className="playing-badge">▶</span>}
                          {item.title || item.name}
                        </div>
                        <div className="queue-item-artist">{item.artist || item.album || 'Unknown'}</div>
                      </div>
                      <button
                        className="queue-item-play"
                        type="button"
                        onClick={() => playQueueItemAt(index)}
                        title="Play this track"
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="side-connection-wrapper">
          <button
            className="connection-toggle"
            type="button"
            onClick={() => setVisibilityState((current) => ({ ...current, connectionOpen: !current.connectionOpen }))}
            aria-label="Toggle connection details"
          >
            Connection Details {visibilityState.connectionOpen ? '−' : '+'}
          </button>
          {visibilityState.connectionOpen && (
            <section className="side-connection">
              <p><strong>session:</strong> {sessionLabel}</p>
              <p><strong>spotify:</strong> {spotifyConnected ? 'connected' : 'Not connected'}</p>
              <p><strong>player:</strong> {playerState}</p>
              <p><strong>device:</strong> {spotifyDeviceId || 'Not ready'}</p>
              <p><strong>backend:</strong> {BACKEND_URL}</p>
              <p><strong>API:</strong> {API_PREFIX}</p>
              <p><strong>last auth:</strong> {authTime}</p>
              <p><strong>JWT:</strong> {truncateToken(jwtToken)}</p>
            </section>
          )}
        </section>
      </aside>
      )}

      <div className="content-column">
        <main className="app-shell">
          <header className="hero" id="home">
            <div className="hero-top">
              <div>
                <p className="hero-kicker">Diggin' In The Digital Crates</p>
                <h1>spotify at midnight</h1>
              </div>
              <div className="avatar-wrap">
                {jwtToken ? (
                  <button className="btn btn-secondary hero-signout" type="button" onClick={handleSignOut}>
                    Log out
                  </button>
                ) : (
                  <a className="btn btn-primary" href={`${BACKEND_URL}${API_PREFIX}/auth/spotify/login`}>
                    <SpotifyIcon />
                    Sign in to Spotify
                  </a>
                )}
                <SafeImage
                  className="avatar"
                  src={userProfile?.avatarUrl || ''}
                  alt={userProfile?.displayName || 'Spotify user'}
                  fallbackClassName="avatar-fallback"
                  fallbackLabel="User avatar unavailable"
                />
              </div>
            </div>
            <p className="lead">Search, browse, and play from a native-feeling Spotify-style interface.</p>
          </header>

          <section className="home-player">
            <div className="home-player-row">
              <div className="search-input-wrap">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search songs, artists, or albums"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <button
                  className="search-submit"
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  aria-label={isSearching ? 'Searching' : 'Search'}
                >
                  <SearchIcon />
                </button>
              </div>
              <button className="btn btn-secondary" type="button" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Go'}
              </button>
            </div>

            {isSignedIn && recentSearches.length > 0 && (
              <div className="recent-row">
                <span className="recent-label">Recent</span>
                {recentSearches.map((value) => (
                  <button key={value} className="chip-btn" type="button" onClick={() => handleRecentSearch(value)}>
                    {value}
                  </button>
                ))}
              </div>
            )}

            {isSignedIn && startupSuggestions.length > 0 && (
              <div className="recent-row suggestions-row">
                <span className="recent-label">Suggestions</span>
                {startupSuggestions.map((value) => (
                  <button key={value} className="chip-btn ghost" type="button" onClick={() => handleRecentSearch(value)}>
                    {value}
                  </button>
                ))}
              </div>
            )}

            {displayedSearchMessage ? <p className="search-message">{displayedSearchMessage}</p> : null}
          </section>

          {!isSignedIn ? (
            <>
              <section className="media-section">
                <h2>Popular Songs</h2>
                <MediaCarousel
                  items={landingCatalog.songs}
                  type="tracks"
                  nowPlayingId={nowPlaying?.id}
                  isPlaybackActive={isPlaybackActive}
                  emptyLabel="Popular songs are unavailable right now."
                />
              </section>
              <section className="media-section">
                <h2>Popular Artists</h2>
                <MediaCarousel
                  items={landingCatalog.artists}
                  type="artists"
                  nowPlayingId={nowPlaying?.id}
                  isPlaybackActive={isPlaybackActive}
                  emptyLabel="Popular artists are unavailable right now."
                />
              </section>
              <section className="media-section">
                <h2>Popular Albums</h2>
                <MediaCarousel
                  items={landingCatalog.albums}
                  type="tracks"
                  nowPlayingId={nowPlaying?.id}
                  isPlaybackActive={isPlaybackActive}
                  emptyLabel="Popular albums are unavailable right now."
                />
              </section>
            </>
          ) : (
            <>
              {visibilityState.searched && (
                <>
                  <section className="media-section" id="search-results">
                    <h2>Search Results</h2>
                    <MediaCarousel
                      items={tracks.map((item) => ({
                        ...item,
                        onOpenDetails: () => openDetails('track', item),
                        onOpenAlbumDetails: item.albumId ? () => openDetails('album', { id: item.albumId, name: item.album, image: item.image, album: item.album, artists: item.artists }) : undefined,
                        onTogglePlay: () => togglePreviewPlayback(item),
                      }))}
                      type="tracks"
                      nowPlayingId={nowPlaying?.id}
                      isPlaybackActive={isPlaybackActive}
                      emptyLabel="Search the catalog to load track results."
                    />
                  </section>

                  <section className="media-section" id="artist-results">
                    <h2>Artists</h2>
                    <MediaCarousel
                      items={artists.map((item) => ({
                        ...item,
                        onOpenDetails: () => openDetails('artist', item),
                      }))}
                      type="artists"
                      nowPlayingId={nowPlaying?.id}
                      isPlaybackActive={isPlaybackActive}
                      emptyLabel="Search the catalog to load artist results."
                    />
                  </section>
                </>
              )}

              <section className="media-section" id="picked-artists">
                <h2>Picked From Your Library</h2>
                <MediaCarousel
                  items={recommendedArtists.map((item) => ({
                    ...item,
                    onOpenDetails: () => openDetails('artist', item),
                  }))}
                  type="artists"
                  nowPlayingId={nowPlaying?.id}
                  isPlaybackActive={isPlaybackActive}
                  emptyLabel="Saved tracks will surface artist picks here."
                />
              </section>

              <section className="media-section" id="favorites">
                <h2>Saved Tracks</h2>
                <MediaCarousel
                  items={favorites.map((item) => ({
                    ...item,
                    onOpenDetails: () => openDetails('track', item),
                    onOpenAlbumDetails: item.albumId ? () => openDetails('album', { id: item.albumId, name: item.album, image: item.image, album: item.album, artists: item.artists }) : undefined,
                    onTogglePlay: () => togglePreviewPlayback(item),
                  }))}
                  type="tracks"
                  nowPlayingId={nowPlaying?.id}
                  isPlaybackActive={isPlaybackActive}
                  emptyLabel="Saved tracks will appear here after Spotify connects."
                />
              </section>
            </>
          )}
        </main>

        <footer className="app-footer">
          <div>spotify at midnight |  &copy; {new Date().getFullYear()} <br/> not affiliated with Spotify</div>
        </footer>
      </div>

      {detailItem && (
        <div className="details-modal-backdrop" onClick={closeDetails}>
          <section className="details-modal" onClick={(event) => event.stopPropagation()}>
            <div className="details-header">
              <h2>
                {detailType === 'artist'
                  ? 'Artist details'
                  : detailType === 'album'
                    ? 'Album details'
                    : 'Track details'}
              </h2>
              <button className="btn btn-secondary" type="button" onClick={closeDetails}>
                Close
              </button>
            </div>

            <div className="details-card">
              <div className="details-two-column">
                <div className="details-left">
                  <SafeImage
                    className="details-cover"
                    src={detailItem.image}
                    alt={detailItem.name || detailItem.title || 'details'}
                    fallbackClassName="details-cover-empty"
                    fallbackLabel="Details artwork unavailable"
                  />
                  <p className="details-label">{detailType}</p>

                  {detailType === 'track' && (
                    <>
                      <h2>
                        {getSpotifyWebUrl(detailItem) ? (
                          <a className="inline-item-anchor" href={getSpotifyWebUrl(detailItem)} target="_blank" rel="noreferrer">
                            {detailItem.title || detailItem.name || 'Unknown track'}
                          </a>
                        ) : (
                          detailItem.title || detailItem.name || 'Unknown track'
                        )}
                      </h2>
                      <p>
                        Artist:{' '}
                        {(detailItem.artists || []).length > 0
                          ? (detailItem.artists || []).map((artist, index) => (
                              <span key={artist.id || `${artist.name}-${index}`}>
                                {artist.id ? (
                                  <a
                                    className="inline-item-anchor"
                                    href={toSpotifyEntityUrl('artist', artist.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {artist.name}
                                  </a>
                                ) : (
                                  <span>{artist.name}</span>
                                )}
                                {index < detailItem.artists.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          : detailItem.artist || 'Unknown artist'}
                      </p>
                      <p>
                        Album:{' '}
                        {detailItem.albumId ? (
                          <a className="inline-item-anchor" href={toSpotifyEntityUrl('album', detailItem.albumId)} target="_blank" rel="noreferrer">
                            {detailItem.album || 'Unknown album'}
                          </a>
                        ) : (
                          detailItem.album || 'Unknown album'
                        )}
                      </p>
                      {detailItem.uri && (
                        <button className="media-link" type="button" onClick={() => togglePreviewPlayback(detailItem)}>
                          <PlaybackIcon isPlaying={nowPlaying?.id === detailItem.id && isPlaybackActive} />
                          {nowPlaying?.id === detailItem.id && isPlaybackActive ? 'Pause' : 'Play'}
                        </button>
                      )}

                    </>
                  )}

                  {detailType === 'album' && (
                    <div className="details-album-meta">
                      <h2>
                        {detailItem.id ? (
                          <a className="inline-item-anchor" href={toSpotifyEntityUrl('album', detailItem.id)} target="_blank" rel="noreferrer">
                            {detailItem.name || 'Unknown album'}
                          </a>
                        ) : (
                          detailItem.name || 'Unknown album'
                        )}
                      </h2>
                      <p>Release date: {detailItem.releaseDate || 'Unknown'}</p>
                      <p>Total tracks: {detailItem.totalTracks ?? 'N/A'}</p>
                      <p>
                        Artists:{' '}
                        {(detailItem.artists || []).length > 0
                          ? (detailItem.artists || []).map((artist, index) => (
                              <span key={artist.id || `${artist.name}-${index}`}>
                                {artist.id ? (
                                  <a className="inline-item-anchor" href={toSpotifyEntityUrl('artist', artist.id)} target="_blank" rel="noreferrer">
                                    {artist.name}
                                  </a>
                                ) : (
                                  <span>{artist.name}</span>
                                )}
                                {index < detailItem.artists.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          : 'Unknown artist'}
                      </p>
                      {detailItem.id && (
                        <button
                          className="media-link"
                          type="button"
                          onClick={() => {
                            const albumQueue = (detailItem.tracks || [])
                              .filter((track) => track?.id && track?.uri)
                              .map((track) => ({
                                id: track.id,
                                title: track.title || track.name,
                                artist: track.artist || (track.artists || []).map((artist) => artist.name).join(', ') || 'Unknown artist',
                                album: detailItem.name,
                                albumId: detailItem.id,
                                image: detailItem.image,
                                uri: track.uri,
                                previewUrl: track.previewUrl || null,
                                artists: track.artists || [],
                              }));
                            const albumPlaybackItem = albumQueue[0];
                            if (!albumPlaybackItem) {
                              setSearchMessage('This album has no playable tracks in the current market.');
                              return;
                            }
                            togglePreviewPlayback(albumPlaybackItem, { queue: albumQueue });
                          }}
                        >
                          <PlaybackIcon isPlaying={manualPlaybackQueue[0]?.albumId === detailItem.id && isPlaybackActive} />
                          {manualPlaybackQueue[0]?.albumId === detailItem.id && isPlaybackActive ? 'Pause album' : 'Play album'}
                        </button>
                      )}
                    </div>
                  )}

                  {detailType === 'artist' && (
                    <div className="details-artist-meta">
                      <h2>
                        {getSpotifyWebUrl(detailItem) ? (
                          <a className="inline-item-anchor" href={getSpotifyWebUrl(detailItem)} target="_blank" rel="noreferrer">
                            {detailItem.name || 'Unknown artist'}
                          </a>
                        ) : (
                          detailItem.name || 'Unknown artist'
                        )}
                      </h2>
                      {getSpotifyWebUrl(detailItem) && (
                        <p>
                          Artist page:{' '}
                          <a href={getSpotifyWebUrl(detailItem)} target="_blank" rel="noreferrer">
                            Open in Spotify
                          </a>
                        </p>
                      )}
                      {detailItem.followers !== null && detailItem.followers !== undefined && <p>Followers: {detailItem.followers.toLocaleString?.() || String(detailItem.followers)}</p>}
                      {detailItem.popularity !== null && detailItem.popularity !== undefined && <p>Popularity: {detailItem.popularity}</p>}
                      {detailItem.genres?.length ? <p>Genres: {detailItem.genres.slice(0, 3).join(', ')}</p> : null}
                    </div>
                  )}
                </div>

                <div className="details-right">
                  {detailLoading ? <p className="detail-message">Loading full details...</p> : null}
                  {detailError ? <p className="detail-message error">{detailError}</p> : null}

                  {detailType === 'track' && (
                    <>
                      <h3 className="detail-subhead">Track API fields</h3>
                      <div className="detail-grid-list">
                        {trackDetailCards.map((field) => (
                          <article key={`${field.label || field.displayText || 'field'}-${field.value}`} className="detail-mini-card">
                            {field.label ? <strong>{field.label}</strong> : null}
                            <p>{renderLinkedValue(field.value, field.displayText)}</p>
                          </article>
                        ))}
                      </div>
                    </>
                  )}

                  {detailType === 'artist' && artistDetailCards.length > 0 && (
                    <>
                      <div className="detail-grid-list">
                        {artistDetailCards.map((field) => (
                          <article key={field.key} className="detail-mini-card">
                            <strong>{field.label}</strong>
                            <p>{renderLinkedValue(field.value)}</p>
                          </article>
                        ))}
                      </div>
                    </>
                  )}

                  {detailType === 'album' && Array.isArray(detailItem.tracks) && detailItem.tracks.length > 0 && (
                    <>
                      <h3 className="detail-subhead">Tracks</h3>
                      <div className="album-track-list" role="list">
                        {detailItem.tracks.map((track, index) => (
                          <article key={track.id} className="album-track-row" role="listitem">
                            <span className="album-track-number">{index + 1}</span>
                            {track.id ? (
                              <button className="inline-item-link album-track-button" type="button" onClick={() => openDetails('track', track)}>
                                {track.title || track.name}
                              </button>
                            ) : (
                              <span className="album-track-title">{track.title || track.name}</span>
                            )}
                          </article>
                        ))}
                      </div>
                    </>
                  )}

                  {detailType === 'track' && detailItem.previewUrl && (
                    <>
                      <h3 className="detail-subhead">Preview</h3>
                      <button className="media-link secondary" type="button" onClick={() => togglePreviewPlayback(detailItem)}>
                        <PlaybackIcon isPlaying={nowPlaying?.id === detailItem.id && isPlaybackActive} />
                        {nowPlaying?.id === detailItem.id && isPlaybackActive ? 'Pause' : 'Play'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}


    </div>
  );
}

function App() {
  const [jwtToken, setJwtToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const localToken = localStorage.getItem('auth_jwt');
    const token = tokenFromUrl || localToken || '';
    if (tokenFromUrl) {
      localStorage.setItem('auth_jwt', tokenFromUrl);
      // Clean up the URL to remove the token query parameter
      const params = new URLSearchParams(window.location.search);
      params.delete('token');
      const query = params.toString();
      window.history.replaceState({}, '', query ? `${window.location.pathname}?${query}` : window.location.pathname);
    }
    return token;
  });

  // Redirect from /login to home if already authenticated
  if (jwtToken && window.location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute jwtToken={jwtToken}>
            <AppContent jwtToken={jwtToken} setJwtToken={setJwtToken} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

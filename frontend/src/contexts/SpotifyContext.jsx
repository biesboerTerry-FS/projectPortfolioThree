import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

const SpotifyContext = createContext(null);

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:3001';
const API = '/api/v42';

const CACHE_TTL = 1000 * 60 * 5;
const RATE_LIMIT_KEY = 'spotify_rate_limit_reset';

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastResponse = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    lastResponse = res;

    if (res.status !== 429) return res;

    if (attempt === retries) {
      return res;
    }

    const retryAfter = Number(res.headers.get('retry-after')) || 1;
    const backoff = retryAfter * 1000 * Math.pow(2, attempt);

    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now() + backoff));
    await sleep(backoff);
  }

  return lastResponse || new Response('Request failed', { status: 500 });
}

export function SpotifyProvider({ jwtToken, children }) {
  const cacheRef = useRef(new Map());

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    } catch {
      return [];
    }
  });

  const isRateLimited = () => {
    const reset = Number(localStorage.getItem(RATE_LIMIT_KEY) || 0);
    return Date.now() < reset;
  };

  const addRecentlyViewed = useCallback((item) => {
    setRecentlyViewed((prev) => {
      const next = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 10);
      localStorage.setItem('recently_viewed', JSON.stringify(next));
      return next;
    });
  }, []);

  const request = useCallback(
    async (endpoint) => {
      const cacheKey = endpoint;
      const cached = cacheRef.current.get(cacheKey);

      if (cached && Date.now() - cached.time < CACHE_TTL) {
        return cached.data;
      }

      if (isRateLimited()) {
        throw new Error('Client is rate limited. Try again shortly.');
      }

      const res = await fetchWithRetry(`${BACKEND_URL}${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData?.error || res.statusText || 'Request failed';
        
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('retry-after')) || 1;
          localStorage.setItem(RATE_LIMIT_KEY, String(Date.now() + retryAfter * 1000));
        }
        
        throw new Error(errorMessage);
      }

      const data = await res.json();

      cacheRef.current.set(cacheKey, {
        data,
        time: Date.now(),
      });

      return data;
    },
    [jwtToken]
  );

  const value = {
    request,
    recentlyViewed,
    addRecentlyViewed,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify() {
  return useContext(SpotifyContext);
}

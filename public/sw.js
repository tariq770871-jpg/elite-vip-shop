const CACHE_NAME = 'elite-vip-shop-v3';
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon-32.png',
];

// Install: precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll for required assets, but catch failures for non-critical ones
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some precache URLs failed:', err);
        // Try caching what we can
        return Promise.allSettled(
          PRECACHE_URLS.map(url => cache.add(url).catch(() => {}))
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first strategy for API, Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except specific CDNs
  if (url.origin !== self.location.origin) return;

  // For navigation requests (HTML pages): Network first, fallback to cache
  if (request.mode === 'navigate') {
    // Never cache authenticated/private pages — expose user data if cached
    const privatePaths = ['/dashboard', '/profile', '/orders', '/cart', '/wishlist', '/settings', '/checkout', '/login', '/register'];
    const isPrivate = privatePaths.some(p => url.pathname.startsWith(p));

    if (isPrivate) {
      // Network-only for private pages — never cache, show offline page on failure
      event.respondWith(
        fetch(request).catch(() => caches.match(OFFLINE_URL))
      );
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses (public pages only)
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For Next.js static chunks: Cache first with background revalidation
  // (safe because filenames include content hashes)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // CRITICAL: Never cache /_next/data/ RSC payloads — these contain
  // user-specific auth state, cart data, and dynamic content.
  // Caching them causes stale auth/data for users.
  if (url.pathname.startsWith('/_next/data/')) {
    event.respondWith(fetch(request));
    return;
  }

  // For other static assets (images, fonts, etc.): Stale-while-revalidate
  // NOTE: .json extension removed from here — RSC .json is excluded above,
  //   and manifest.json should use Cache-Control from vercel.json, not SW.
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.avif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Return cached if available, but always fetch and update in background
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // For API calls: Network only with timeout
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { signal: AbortSignal.timeout(8000) }).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Default: Network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

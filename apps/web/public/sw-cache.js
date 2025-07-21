// EdUsage AI Learning Companion - Service Worker v2.0
const CACHE_NAME = 'edusage-v2.0.0';
const STATIC_CACHE = 'edusage-static-v2.0.0';
const DYNAMIC_CACHE = 'edusage-dynamic-v2.0.0';
const AI_CACHE = 'edusage-ai-responses-v2.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/login',
  '/manifest.json',
  '/offline.html',
  // CSS and JS will be added dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Initialize IndexedDB for offline storage
      initializeOfflineDB(),
    ])
  );

  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - cache with network-first strategy
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - cache-first strategy
    event.respondWith(handleStaticAsset(request));
  } else {
    // HTML pages - network-first with offline fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const cacheName = DYNAMIC_CACHE;

  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());

      // Store in IndexedDB for offline access
      if (request.url.includes('/memory-bank/')) {
        await storeInOfflineDB(request, networkResponse.clone());
      }
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try IndexedDB for memory bank data
    if (request.url.includes('/memory-bank/')) {
      const offlineData = await getFromOfflineDB(request);
      if (offlineData) {
        return new Response(JSON.stringify(offlineData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Return offline response
    return new Response(
      JSON.stringify({ error: 'Offline - data not available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Handle page requests with network-first strategy
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for page, trying cache:', request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline.html');
  }
}

// Utility functions
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/static/') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  );
}

// IndexedDB functions for offline storage
async function initializeOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EdusageOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('memories')) {
        const memoryStore = db.createObjectStore('memories', { keyPath: 'id' });
        memoryStore.createIndex('userId', 'userId', { unique: false });
        memoryStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('content')) {
        db.createObjectStore('content', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('quizzes')) {
        db.createObjectStore('quizzes', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function storeInOfflineDB(request, response) {
  try {
    const data = await response.json();
    const db = await initializeOfflineDB();

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    let storeName = 'content'; // default
    if (pathParts.includes('profiles')) storeName = 'profiles';
    else if (pathParts.includes('memories')) storeName = 'memories';
    else if (pathParts.includes('quiz')) storeName = 'quizzes';

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    await store.put(data);
  } catch (error) {
    console.error('[SW] Failed to store in IndexedDB:', error);
  }
}

async function getFromOfflineDB(request) {
  try {
    const db = await initializeOfflineDB();
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    let storeName = 'content';
    if (pathParts.includes('profiles')) storeName = 'profiles';
    else if (pathParts.includes('memories')) storeName = 'memories';
    else if (pathParts.includes('quiz')) storeName = 'quizzes';

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    // Extract ID from URL
    const id = pathParts[pathParts.length - 1];

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Failed to get from IndexedDB:', error);
    return null;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'edusage-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    const db = await initializeOfflineDB();
    const transaction = db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');

    const request = store.getAll();
    const queuedItems = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log('[SW] Syncing', queuedItems.length, 'queued items');

    for (const item of queuedItems) {
      try {
        await syncItem(item);

        // Remove from queue after successful sync
        const deleteTransaction = db.transaction(['sync_queue'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('sync_queue');
        await deleteStore.delete(item.id);
      } catch (error) {
        console.error('[SW] Failed to sync item:', item, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncItem(item) {
  const response = await fetch(item.url, {
    method: item.method,
    headers: item.headers,
    body: item.body,
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response;
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'QUEUE_SYNC':
      queueForSync(data);
      break;
    case 'FORCE_SYNC':
      syncOfflineData();
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

async function queueForSync(data) {
  try {
    const db = await initializeOfflineDB();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');

    const syncItem = {
      ...data,
      timestamp: Date.now(),
    };

    await store.add(syncItem);
    console.log('[SW] Queued for sync:', syncItem);
  } catch (error) {
    console.error('[SW] Failed to queue for sync:', error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}
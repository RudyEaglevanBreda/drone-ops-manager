// This is the service worker for the Drone Operations Manager PWA

const CACHE_NAME = 'drone-ops-manager-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network first, falling back to cache strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Update the cache with the latest version
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-flight-data') {
    event.waitUntil(syncFlightData());
  } else if (event.tag === 'sync-work-orders') {
    event.waitUntil(syncWorkOrders());
  }
});

// Handle offline form submissions
async function syncFlightData() {
  const db = await openIndexedDB();
  const pendingFlights = await db.getAll('pendingFlights');
  
  for (const flight of pendingFlights) {
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flight.data)
      });
      
      if (response.ok) {
        await db.delete('pendingFlights', flight.id);
      }
    } catch (error) {
      console.error('Sync failed for flight:', error);
    }
  }
}

async function syncWorkOrders() {
  const db = await openIndexedDB();
  const pendingWorkOrders = await db.getAll('pendingWorkOrders');
  
  for (const workOrder of pendingWorkOrders) {
    try {
      const response = await fetch('/api/workorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workOrder.data)
      });
      
      if (response.ok) {
        await db.delete('pendingWorkOrders', workOrder.id);
      }
    } catch (error) {
      console.error('Sync failed for work order:', error);
    }
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('droneOpsManager', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingFlights')) {
        db.createObjectStore('pendingFlights', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingWorkOrders')) {
        db.createObjectStore('pendingWorkOrders', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id' });
      }
    };
  });
}

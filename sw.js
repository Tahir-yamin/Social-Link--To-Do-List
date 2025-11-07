// A minimal service worker for PWA installation.
// It doesn't do any caching yet.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // The service worker is installed.
  // We don't need to precache anything for this basic setup.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Claim clients to take control of the page immediately.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For this basic PWA, we'll just use the network.
  // This ensures the app is always up-to-date.
  // More complex caching strategies can be added later.
  event.respondWith(fetch(event.request));
});

// public/sw.js
const CACHE_NAME = "practix-v2";
const APP_SHELL = [
  "/", // SPA entry
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png",
  "/logo.png"
];

// Install: cache app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: bersihkan cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch: 
// - Untuk navigasi (route React), pakai "network first, fallback ke cache index.html"
// - Untuk file statis (icon, manifest), pakai cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigations (SPA routes)
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch (e) {
          // offline fallback ke shell
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match("/index.html");
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const network = await fetch(req);
        // hanya cache permintaan same-origin & GET
        const url = new URL(req.url);
        if (req.method === "GET" && url.origin === self.location.origin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, network.clone());
        }
        return network;
      } catch (e) {
        return cached || Response.error();
      }
    })()
  );
});

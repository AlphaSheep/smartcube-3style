const CACHE_NAME = "threestyle-pwa-v1";

self.addEventListener("install", () => {
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event) => {
  (event as any).waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  (self as any).clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = (event as any).request as Request;

  if (request.method !== "GET") {
    return;
  }

  (event as any).respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    })
  );
});

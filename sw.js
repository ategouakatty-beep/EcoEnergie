const CACHE_NAME = "ecoenergie-v3";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomsCaches) => {
        return Promise.all(
          nomsCaches
            .filter((nom) =>
              nom.startsWith("ecoenergie-") &&
              nom !== CACHE_NAME
            )
            .map((nom) => caches.delete(nom))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requete = event.request;

  if (
    requete.method !== "GET" ||
    new URL(requete.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const reponse = await fetch(requete);

        if (reponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(requete, reponse.clone());
        }

        return reponse;

      } catch (erreur) {
        const cache = await caches.open(CACHE_NAME);
        const reponseCache = await cache.match(requete);

        if (reponseCache) {
          return reponseCache;
        }

        if (requete.mode === "navigate") {
          return await cache.match("./index.html");
        }

        throw erreur;
      }
    })()
  );
});

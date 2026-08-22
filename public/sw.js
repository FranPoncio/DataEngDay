/* Service worker mínimo, sin librerías.
   - HTML: network-first, para que un deploy nuevo se vea al toque.
   - Assets con hash (/assets/*): cache-first, nunca cambian de contenido.
   Nada de Supabase pasa por acá: las llamadas a la API van siempre a la red. */

const CACHE = "dbd-v1";
const SHELL = ["/", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase y demás: directo a la red

  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(request).then((hit) =>
        hit || fetch(request).then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copia));
          return res;
        })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copia));
          return res;
        })
        .catch(() => caches.match("/"))
    );
  }
});

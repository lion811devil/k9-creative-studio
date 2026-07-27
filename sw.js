const CACHE_VERSION = "k9-creative-studio-v7.6.0-sprint2";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/base.css", "./css/core.css", "./css/studio.css", "./css/interface.css",
  "./css/preview.css", "./css/layout-engine.css", "./css/social.css", "./css/pwa.css",
  "./css/content.css", "./css/mobile-polish.css", "./css/template-engine.css", "./css/project-manager.css", "./css/brand-kit.css", "./css/asset-center.css", "./css/ui-2.css",
  "./js/renderer.js", "./js/app.js", "./js/template-engine.js", "./js/project-manager.js", "./js/brand-kit.js", "./js/asset-center.js", "./js/ui-2.js", "./js/runtime-guard.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Un singolo asset temporaneamente irraggiungibile non blocca l'intero aggiornamento.
    await Promise.allSettled(APP_SHELL.map(asset => cache.add(asset)));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("k9-creative-studio-") && key !== CACHE_VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(request)) || (fallbackUrl ? await cache.match(fallbackUrl) : Response.error());
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const network = fetch(request).then(async response => {
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "./index.html"));
    return;
  }
  event.respondWith(staleWhileRevalidate(event.request));
});

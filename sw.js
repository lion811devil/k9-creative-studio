const CACHE_VERSION = "k9-creative-studio-3.0.2";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/base.css?v=3.0.2", "./css/interface.css?v=3.0.2",
  "./css/pwa.css?v=3.0.2",
  "./css/mobile-polish.css?v=3.0.2", "./css/template-engine.css?v=3.0.2", "./css/project-manager.css?v=3.0.2", "./css/brand-kit.css?v=3.0.2", "./css/asset-center.css?v=3.0.2", "./css/ui-2.css?v=3.0.2", "./css/creative-engine.css?v=3.0.2", "./css/practical-2.2.css?v=3.0.2",
  "./js/app.js?v=3.0.2", "./js/template-engine.js?v=3.0.2", "./js/project-manager.js?v=3.0.2", "./js/brand-kit.js?v=3.0.2", "./js/asset-center.js?v=3.0.2", "./js/ui-2.js?v=3.0.2", "./js/runtime-guard.js?v=3.0.2",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const results = await Promise.allSettled(APP_SHELL.map(asset => cache.add(asset)));
    const failed = results.filter(result => result.status === "rejected");
    if (failed.length) console.warn(`K9 cache: ${failed.length} risorse non precaricate.`);
    await self.skipWaiting();
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
    const response = await fetch(request, { cache: "no-store" });
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

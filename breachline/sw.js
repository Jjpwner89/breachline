// On the copy hosted outside Claude, GitHub Pages lets a browser keep each file for ten minutes, so a page could run an
// old script, or a mix of old and new ones, for a while after an update. This asks the server about every page, script
// and stylesheet each time instead. An unchanged file costs only a short "not modified" reply. Art and sound still come
// from the browser's cache, and without a connection the cached copy is used.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode !== 'navigate' && !/\.(js|css|html)$/.test(url.pathname)) return;
  e.respondWith(fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' }).catch(function () { return fetch(req); }));
});

/* מעשרותי's offline copy for the web version and for iPhone (added to the home screen from Safari).
   The Android app never uses it. When the website is built, scripts/web-app.mjs writes the list of the
   app's files and a version made from their contents into VERSION and FILES below; a new version is
   downloaded in full in the background and only then replaces the old one, so the app always opens. */
const VERSION = "7887e274b27a";
const FILES = ["cap-runtime.js","css/base.css","css/cards.css","css/chips.css","css/controls.css","css/layout.css","css/lists.css","css/misc.css","css/money.css","css/nav.css","css/sheets.css","fonts/Rubik-var.ttf","icon-180.png","icon-512.png","icon-maskable-512.png","icon.png","index.html","js/actions/feedback.js","js/actions/fund.js","js/actions/gift.js","js/actions/income.js","js/actions/nav.js","js/actions/recurring.js","js/actions/settings.js","js/actions/targets.js","js/app/events.js","js/app/start.js","js/core/config.js","js/core/dates.js","js/core/device.js","js/core/hebrew.js","js/core/helpers.js","js/core/http.js","js/core/icons.js","js/core/native.js","js/core/network.js","js/core/receipts.js","js/core/registry.js","js/core/storage.js","js/data/backup.js","js/data/calc.js","js/data/defaults.js","js/data/export-csv.js","js/data/normalize.js","js/data/recurring.js","js/data/state.js","js/features/feedback-send.js","js/features/install-ios.js","js/features/reminders.js","js/features/share-app.js","js/features/updates.js","js/features/web-app.js","js/features/web-share.js","js/sheets/feedback.js","js/sheets/form-parts.js","js/sheets/fund.js","js/sheets/gift.js","js/sheets/import.js","js/sheets/income.js","js/sheets/recurring.js","js/sheets/sec46.js","js/sheets/settings-sheets.js","js/sheets/share-app.js","js/sheets/target.js","js/sheets/update.js","js/sheets/welcome.js","js/ui/render.js","js/ui/sheets.js","js/ui/theme.js","js/ui/toast.js","js/version.js","js/views/fund.js","js/views/history.js","js/views/home.js","js/views/parts.js","js/views/settings.js","js/views/targets.js","logo.svg","manifest.webmanifest"];
const CACHE = 'maasroti-' + VERSION;
const DEV = VERSION === 'dev';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    if (!DEV) {
      const cache = await caches.open(CACHE);
      // All or nothing: if one file fails, this version is not installed and the previous one keeps working.
      await cache.addAll(['./'].concat(FILES).map((f) => new Request(f, { cache: 'reload' })));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('maasroti-') && n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only the app's own files. Update checks and feedback go straight to the internet.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL('./', self.location).pathname)) return;
  event.respondWith(DEV ? fromNetwork(req) : fromCache(req));
});

async function fromCache(req) {
  const cache = await caches.open(CACHE);
  const key = req.mode === 'navigate' ? './' : req;
  const hit = await cache.match(key, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}

async function fromNetwork(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

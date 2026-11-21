/* sw.js — Service Worker لأكاديمية الكاراتيه
 * استراتيجية:
 *  - precache: الـ app shell (html, css, js, manifest, الأيقونات، الخطوط المحلية)
 *  - runtime: الصور والـ gifs بأسلوب stale-while-revalidate
 *  - network-first للـ html مع fallback للكاش عند انقطاع الشبكة
 *  - تجاهل الطلبات المشتركة بين المواقع (cross-origin) وغير GET
 */
const VERSION = 'karate-pwa-v1.2.1';
const SHELL_CACHE = `${VERSION}-shell`;
const IMG_CACHE = `${VERSION}-img`;
const FONT_CACHE = `${VERSION}-fonts`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/karate.css',
  './assets/js/karate.js',
  './assets/images/logo.png',
  './assets/images/hero-dojo.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/icon-maskable-192.png',
  './assets/images/icon-maskable-512.png',
  './assets/images/apple-touch-icon.png',
  './assets/images/favicon-32.png',
  './assets/images/favicon-16.png'
];

// ===== INSTALL: precache the app shell =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // استخدم addAll لكن مع تحمّل الإخفاقات الجزئية (لا نكسر التثبيت لو فشل ملف واحد)
      Promise.all(APP_SHELL.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE: تنظيف الكاش القديم =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => ![SHELL_CACHE, IMG_CACHE, FONT_CACHE].includes(k))
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // فقط طلبات GET من نفس الأصل
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // الخطوط من Google: نتركها تمر عبر الشبكة مع كاش خفيف
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(FONT_CACHE).then((cache) =>
          cache.match(req).then((res) =>
            res || fetch(req).then((net) => {
              if (net && net.status === 200) cache.put(req, net.clone());
              return net;
            }).catch(() => res)
          )
        )
      );
    }
    return;
  }

  // HTML: network-first مع fallback للكاش
  const accept = req.headers.get('accept') || '';
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(req).then((net) => {
        const clone = net.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(req, clone));
        return net;
      }).catch(() =>
        caches.match(req).then((res) => res || caches.match('./index.html'))
      )
    );
    return;
  }

  // الصور و GIFs و SVG: stale-while-revalidate
  if (req.destination === 'image' || /\.(?:png|jpe?g|gif|svg|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((net) => {
            if (net && net.status === 200 && net.type === 'basic') {
              cache.put(req, net.clone());
            }
            return net;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // باقي أصول الموقع (css/js): stale-while-revalidate من كاش الـ shell
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((net) => {
        if (net && net.status === 200) {
          const clone = net.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, clone));
        }
        return net;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ===== MESSAGE: تحديث فوري من العميل =====
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

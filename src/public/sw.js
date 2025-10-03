// ===============================
// Service Worker (Workbox + Push Notification with Actions)
// ===============================

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache asset hasil build (diisi otomatis sama InjectManifest)
precacheAndRoute(self.__WB_MANIFEST || []);

// Contoh runtime caching (sesuaikan kebutuhan)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({ cacheName: 'static-resources' })
);

// ===============================
// Push Notification
// ===============================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  async function showNotification() {
    let data = {
      title: 'Notifikasi',
      options: {
        body: 'Ada pesan baru',
        data: { url: './#/stories' },
      },
    };

    if (event.data) {
      try {
        const json = await event.data.json();
        data = {
          title: json.title || 'Story Baru!',
          options: {
            body: json.body || 'Ada story baru dari temanmu 🚀',
            icon: json.icon || './images/logo.png',
            badge: json.badge || './images/logo.png',
            data: json.data || { url: './#/stories' },
          },
        };
      } catch {
        data.options.body = event.data.text();
      }
    }

    data.options.actions = [
      { action: 'open', title: 'Buka Aplikasi' },
      { action: 'close', title: 'Tutup' },
    ];

    return self.registration.showNotification(data.title, data.options);
  }

  event.waitUntil(showNotification());
});

// ===============================
// Handle Klik Notifikasi
// ===============================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
  } else if (event.action === 'close') {
    // dismiss aja
  } else {
    event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
  }
});

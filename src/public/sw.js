// ===============================
// Service Worker: Push Notification Only
// ===============================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  async function showNotification() {
    let data = { title: 'Notifikasi', options: { body: 'Ada pesan baru' } };

    if (event.data) {
      try {
        // Coba parse JSON
        data = await event.data.json();
      } catch {
        // Kalau bukan JSON, ambil sebagai string biasa
        data = {
          title: 'Notifikasi',
          options: { body: event.data.text() },
        };
      }
    }

    await self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: data.options.icon || './images/logo.png',
      badge: data.options.badge || './images/logo.png',
    });
  }

  event.waitUntil(showNotification());
});

// Optional: klik notifikasi
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
});

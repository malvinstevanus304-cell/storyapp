// ===============================
// Service Worker: Push Notification with Actions
// ===============================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  async function showNotification() {
    let data = {
      title: 'Notifikasi',
      options: {
        body: 'Ada pesan baru',
        data: { url: './#/stories' }, // default buka stories
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

    // Tambahin 2 tombol
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
    // cukup dismiss
  } else {
    // klik body notif
    event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
  }
});

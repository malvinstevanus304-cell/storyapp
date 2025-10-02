// src/index.js
import '../styles/styles.css';
import App from './pages/app';
import { subscribePush, unsubscribePush } from './push';
import { registerServiceWorker } from './utils';
// import Camera jika ingin pakai media stop
// import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  // -----------------------------
  // Render halaman utama
  // -----------------------------
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    // skipLinkButton: document.querySelector('#skip-link'), // opsional
  });

  await app.renderPage();

  // -----------------------------
  // Register Service Worker
  // -----------------------------
  const registration = await registerServiceWorker(); // pakai utils baru

  // -----------------------------
  // Event hashchange
  // -----------------------------
  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    // Jika menggunakan Camera/stream video:
    // Camera.stopAllStreams();
  });

  // -----------------------------
  // Tombol subscribe/unsubscribe
  // -----------------------------
  const notifToggle = document.getElementById('push-toggle');
  if (!notifToggle) {
    console.error('[Push] Tombol push-toggle tidak ditemukan!');
    return;
  }

  // -----------------------------
  // Cek status awal subscription
  // -----------------------------
  if (registration) {
    try {
      const currentSub = await registration.pushManager.getSubscription();
      const token = localStorage.getItem('api_token') || null;

      if (!token) {
        notifToggle.disabled = true;
        notifToggle.textContent = 'Login dahulu';
      } else if (currentSub) {
        notifToggle.textContent = 'Unsubscribe';
        notifToggle.classList.remove('subscribe');
        notifToggle.classList.add('unsubscribe');
      } else {
        notifToggle.textContent = 'Subscribe';
        notifToggle.classList.remove('unsubscribe');
        notifToggle.classList.add('subscribe');
      }
    } catch (err) {
      console.error('[Push] Gagal cek status awal:', err);
    }
  }

  // -----------------------------
  // Event klik tombol
  // -----------------------------
  notifToggle.addEventListener('click', async () => {
    const token = localStorage.getItem('api_token') || null;
    if (!token) {
      alert('⚠️ Harap login terlebih dahulu sebelum mengaktifkan notifikasi.');
      return;
    }

    if (!registration) {
      alert('⚠️ Service Worker belum siap.');
      return;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribePush(registration);
        notifToggle.textContent = 'Subscribe';
        notifToggle.classList.remove('unsubscribe');
        notifToggle.classList.add('subscribe');
      } else {
        const result = await subscribePush(registration);
        if (result) {
          notifToggle.textContent = 'Unsubscribe';
          notifToggle.classList.remove('subscribe');
          notifToggle.classList.add('unsubscribe');
        }
      }
    } catch (err) {
      console.error('[Push] Error saat toggle push:', err);
    }
  });
});

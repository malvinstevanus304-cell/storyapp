// src/scripts/index.js
import '../styles/styles.css';
import App from './pages/app';
import { subscribePush, unsubscribePush } from './push';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => await app.renderPage());

  // -----------------------------
  // Register Service Worker
  // -----------------------------
  let registration = null;
  if ('serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('[SW] Service Worker registered:', registration.scope);

      registration = await navigator.serviceWorker.ready;
      console.log('[SW] Service Worker ready:', registration.scope);
    } catch (err) {
      console.error('[SW] Failed to register Service Worker:', err);
    }
  }

  // Tombol subscribe/unsubscribe
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
        console.warn('[Push] Token belum ada, tombol tidak aktif');
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
    console.log('[Push] Tombol diklik');

    if (!registration) {
      alert('⚠️ Service Worker belum siap.');
      return;
    }

    const token = localStorage.getItem('api_token') || null;
    if (!token) {
      alert('⚠️ Harap login terlebih dahulu sebelum mengaktifkan notifikasi.');
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

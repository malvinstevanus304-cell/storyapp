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

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // -----------------------------
  // Register Service Worker
  // -----------------------------
  let registration = null;
  if ('serviceWorker' in navigator) {
    try {
      registration = await navigator.serviceWorker.register('./sw.js'); // relative path agar compatible GitHub Pages
      console.log('[SW] Service Worker registered:', registration);
      await navigator.serviceWorker.ready;
      registration = await navigator.serviceWorker.ready;
      console.log('[SW] Service Worker ready:', registration);
    } catch (err) {
      console.error('[SW] Failed to register Service Worker:', err);
    }
  }

  // Tombol nav subscribe/unsubscribe
  const notifToggle = document.getElementById('push-toggle');

  if (!notifToggle) {
    console.error('[Push] Tombol push-toggle tidak ditemukan di DOM!');
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
        console.warn('[Push] Token belum tersedia, tombol Subscribe tidak bisa digunakan');
        notifToggle.disabled = true;
        notifToggle.textContent = 'Login dahulu';
      } else if (currentSub) {
        console.log('[Push] Sudah ada subscription aktif:', currentSub);
        notifToggle.textContent = 'Unsubscribe';
        notifToggle.classList.remove('subscribe');
        notifToggle.classList.add('unsubscribe');
      } else {
        console.log('[Push] Belum ada subscription aktif');
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
        console.log('[Push] Ada subscription aktif, proses unsubscribe...');
        await unsubscribePush(registration);
        notifToggle.textContent = 'Subscribe';
        notifToggle.classList.remove('unsubscribe');
        notifToggle.classList.add('subscribe');
      } else {
        console.log('[Push] Belum ada subscription, coba subscribe...');
        const result = await subscribePush(registration);
        if (result) {
          console.log('[Push] Subscription berhasil:', result);
          notifToggle.textContent = 'Unsubscribe';
          notifToggle.classList.remove('subscribe');
          notifToggle.classList.add('unsubscribe');
        } else {
          console.warn('[Push] Subscription gagal atau dibatalkan user');
        }
      }
    } catch (err) {
      console.error('[Push] Error saat toggle push:', err);
    }
  });
});

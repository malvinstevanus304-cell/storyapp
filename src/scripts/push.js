// src/scripts/push.js
import { getToken } from './utils/auth.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribePush(registration) {
  const vapidPublicKey =
    "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    console.log('[Push] Permission notifikasi saat ini:', Notification.permission);

    if (Notification.permission === 'default') {
      console.log('[Push] Request permission...');
      const permission = await Notification.requestPermission();
      console.log('[Push] Hasil requestPermission:', permission);
      if (permission !== 'granted') {
        alert('⚠️ Notifikasi tidak diizinkan browser.');
        return null;
      }
    } else if (Notification.permission === 'denied') {
      alert('⚠️ Notifikasi diblokir. Ubah pengaturan browser.');
      return null;
    }

    const token = getToken();
    if (!token) {
      console.error('[Push] Token tidak ditemukan, abort!');
      return null;
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    console.log('✅ Subscribed ke push manager:', subscription);

    // POST ke Dicoding API
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))))
            : '',
          auth: subscription.getKey('auth')
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
            : '',
        },
      }),
    });

    const result = await response.json();
    console.log('[Push] Response API subscribe:', result);

    return subscription;
  } catch (err) {
    console.error('❌ Gagal subscribe:', err);
    return null;
  }
}

export async function unsubscribePush(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.warn('[Push] Tidak ada subscription aktif.');
      return;
    }

    const token = getToken();
    if (!token) {
      console.error('[Push] Token tidak ditemukan, abort!');
      return;
    }

    // DELETE ke Dicoding API
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    const result = await response.json();
    console.log('[Push] Response API unsubscribe:', result);

    // Hapus subscription browser
    await subscription.unsubscribe();
    alert('🔔 Push notification dinonaktifkan untuk aplikasi ini.');
  } catch (err) {
    console.error('❌ Gagal unsubscribe:', err);
  }
}

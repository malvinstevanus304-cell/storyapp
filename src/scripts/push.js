// src/scripts/push.js
import { getToken } from './utils/auth.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribePush(registration) {
  const vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    // Cek permission notifikasi
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("⚠️ Notifikasi tidak diizinkan oleh browser.");
        return null;
      }
    } else if (Notification.permission === "denied") {
      alert("⚠️ Notifikasi telah diblokir sebelumnya. Silakan ubah pengaturan browser.");
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    console.log("✅ Subscribed:", subscription);

    const token = getToken();
    if (!token) throw new Error("Token tidak ditemukan");

    await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey("p256dh")
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh"))))
            : "",
          auth: subscription.getKey("auth")
            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth"))))
            : "",
        },
      }),
    });

    return subscription;
  } catch (err) {
    console.error("❌ Gagal subscribe:", err);
    return null;
  }
}

export async function unsubscribePush(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    console.log("❌ Unsubscribed:", subscription);

    const token = getToken();
    if (!token) throw new Error("Token tidak ditemukan");

    await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();

    alert("🔔 Push notification telah dinonaktifkan untuk aplikasi ini.");
  } catch (err) {
    console.error("❌ Gagal unsubscribe:", err);
  }
}

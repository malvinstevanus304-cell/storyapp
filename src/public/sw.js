// ===============================
// Service Worker Final + Push + API POST Notif
// ===============================

const CACHE_NAME = "story-app-cache-v7";
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/app.bundle.js",
  "/images/logo.png",
];

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navigasi → network-first fallback offline.html
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }

  // Intercept POST ke API tertentu
  if (req.method === "POST" && req.url.includes("/api/")) {
    event.respondWith(
      fetch(req.clone())
        .then((res) => {
          // Setelah sukses POST, munculkan notif
          self.registration.showNotification("Story App", {
            body: "Data berhasil dikirim ke server!",
            icon: "/images/logo.png",
            badge: "/images/logo.png",
            vibrate: [100, 50, 100],
          });
          return res;
        })
        .catch((err) => {
          console.error("[SW] POST gagal:", err);
          return new Response(
            JSON.stringify({ error: "Tidak bisa kirim data" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // Cache-first untuk asset lain
  event.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});

// Push
self.addEventListener("push", (event) => {
  console.log("[SW] Push event:", event);
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "Story App", message: event.data.text(), url: "/" };
    }
  }

  const options = {
    body: data.message || "Anda mendapat notifikasi baru!",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Buka Aplikasi" },
      { action: "close", title: "Tutup" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Story App", options)
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open" && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else if (event.action === "close") {
    // do nothing
  } else {
    event.waitUntil(clients.openWindow("/"));
  }
});

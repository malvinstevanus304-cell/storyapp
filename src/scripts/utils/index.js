// utils/index.js

// -----------------------------
// Helper tanggal dan delay
// -----------------------------
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// -----------------------------
// Helper error global
// -----------------------------
function showGlobalError(message) {
  const div = document.createElement('div');
  div.className = 'global-error';
  div.textContent = message;

  document.body.appendChild(div);

  // Auto hilang setelah 5 detik
  setTimeout(() => {
    div.classList.add('fade-out');
    setTimeout(() => div.remove(), 500); // tunggu animasi selesai
  }, 5000);
}

// Tangani unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  const msg = event.reason?.message || event.reason;
  showGlobalError(`⚠️ ${msg}`);
});

// Tangani runtime error global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const msg = event.error?.message || event.message;
  showGlobalError(`❌ ${msg}`);
});

// -----------------------------
// Service Worker
// -----------------------------
export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  try {
    // Ganti '/sw.bundle.js' sesuai service worker orang yang ingin dipakai
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.log('Service worker telah terpasang', registration);
    return registration; // supaya bisa digunakan di index.js
  } catch (error) {
    console.error('Failed to install service worker:', error);
  }
}

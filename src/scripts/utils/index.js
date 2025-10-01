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

// Helper buat munculin pesan error global
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

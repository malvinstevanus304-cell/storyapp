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

  // Tombol nav subscribe/unsubscribe
  const notifToggle = document.getElementById('push-toggle');

  notifToggle.addEventListener('click', async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await unsubscribePush(registration);
      notifToggle.textContent = 'Subscribe';
    } else {
      const result = await subscribePush(registration);
      if (result) notifToggle.textContent = 'Unsubscribe';
    }
  });
});

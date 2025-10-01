import { getToken } from '../../utils/auth.js';
import { addToFavorites } from '../../utils/favorite.js';

export default class HomePage {
  async render() {
    return `
      <section class="container page">
        <div class="hero">
          <h1 class="hero__title">Selamat Datang di Story App</h1>
          <p class="hero__subtitle">Bagikan momenmu dengan dunia 🌍</p>
        </div>
        <h2 class="section-title">Daftar Story Terbaru</h2>
        <div id="stories" class="stories-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyContainer = document.querySelector('#stories');
    const token = getToken();

    if (!token) {
      storyContainer.innerHTML = `<p style="color:red;text-align:center;"><a href="#/login">Login</a> untuk melihat story.</p>`;
      return;
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || result.error) {
        storyContainer.innerHTML = `<p style="color:red;text-align:center;">${result.message || 'Gagal memuat story'}</p>`;
        return;
      }

      storyContainer.innerHTML = result.listStory.map(story => `
        <div class="story-item">
          <img src="${story.photoUrl}" alt="${story.name}" />
          <div class="story-item__content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <small>📅 ${new Date(story.createdAt).toLocaleString()}</small>
          </div>
          <button class="love-btn" data-id="${story.id}">❤️</button>
        </div>
      `).join('');

      // Event tombol love
      document.querySelectorAll('.love-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const storyId = btn.dataset.id;
          const storyData = result.listStory.find(s => s.id === storyId);
          if (!storyData) return;

          await addToFavorites(storyData);
          btn.textContent = '💖'; // tanda sudah disimpan
        });
      });

    } catch (err) {
      storyContainer.innerHTML = `<p style="color:red;text-align:center;">Gagal memuat story: ${err.message}</p>`;
    }
  }
}

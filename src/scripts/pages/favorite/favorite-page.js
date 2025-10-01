import { getToken } from '../../utils/auth.js';
import { getFavorites, removeFavorite } from '../../utils/favorite.js';

export default class FavoritePage {
  async render() {
    return `
      <section class="container page">
        <h1 class="section-title">Story Favorit</h1>
        <div id="favorite-list" class="stories-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = getToken();
    const container = document.querySelector('#favorite-list');

    if (!token) {
      container.innerHTML = `<p style="color:red;text-align:center;">⚠️ Harap login dulu untuk melihat favorit!</p>`;
      return;
    }

    const favorites = await getFavorites();

    container.innerHTML = favorites.length
      ? favorites.map(story => `
          <div class="story-item">
            <img src="${story.photoUrl}" alt="${story.name}" />
            <div class="story-item__content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <small>📅 ${new Date(story.createdAt).toLocaleString()}</small>
            </div>
            <button class="remove-btn" data-id="${story.id}">❌ Hapus</button>
          </div>
        `).join('')
      : `<p>Belum ada story favorit. Tambahkan dari Home!</p>`;

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await removeFavorite(id);
        btn.parentElement.remove();
      });
    });
  }
}

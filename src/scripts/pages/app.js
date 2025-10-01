import routes from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { getToken, clearToken } from '../utils/auth.js';

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupLogout();

    window.addEventListener('hashchange', () => this.renderPage());
    window.addEventListener('load', () => this.renderPage());
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes['/'];
    const token = getToken();

    // Halaman yang harus login
    const loginRequiredRoutes = ['/favorites', '/add', '/map'];
    if (loginRequiredRoutes.includes(url) && !token) {
      alert('⚠️ Harap login terlebih dahulu!');
      window.location.hash = '#/login';
      return;
    }

    // Stop halaman sebelumnya
    if (this.#currentPage?.stop) {
      try { await this.#currentPage.stop(); } catch { }
    }
    this.#currentPage = page;

    try {
      const content = await page.render();
      this.#content.innerHTML = content || '<section class="page"><p>⚠️ Konten gagal dimuat.</p></section>';
      if (page.afterRender) await page.afterRender();
    } catch (err) {
      this.#content.innerHTML = '<section class="page"><p>⚠️ Terjadi kesalahan saat memuat halaman.</p></section>';
      console.error('RenderPage Error:', err);
    }

    this._updateNavigation(token);
  }

  _updateNavigation(token) {
    document.querySelectorAll('.nav-list li.login, .nav-list li.register')
      .forEach(el => el.style.display = token ? 'none' : 'block');
    document.querySelectorAll('.nav-list li.logout')
      .forEach(el => el.style.display = token ? 'block' : 'none');
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });
    document.body.addEventListener('click', e => {
      if (!this.#navigationDrawer.contains(e.target) && !this.#drawerButton.contains(e.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.#navigationDrawer.classList.remove('open');
    });
  }

  _setupLogout() {
    document.addEventListener('click', e => {
      if (e.target.id === 'logout-link') {
        e.preventDefault();
        clearToken();
        window.location.hash = '#/login';
      }
    });
  }
}

export default App;

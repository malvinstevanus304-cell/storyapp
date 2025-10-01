import { setToken, clearToken, getToken } from '../../utils/auth';

export default class LoginPage {
  async render() {
    const isLogin = getToken();
    return `
      <section class="container page">
        <div class="hero">
          <h1 class="hero__title">🔐 Login</h1>
          <p class="hero__subtitle">Masuk untuk mulai berbagi cerita dan melihat postingan teman</p>
        </div>

        ${!isLogin ? `
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Masukkan email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Masukkan password" required>
          </div>
          <button type="submit" class="btn-primary">➡️ Login</button>
        </form>
        ` : `
        <p style="text-align:center; margin:20px 0;">Anda sudah login!</p>
        `}

        <div id="login-message" class="form-message"></div>

        ${isLogin ? `
        <div style="text-align:center; margin-top:15px;">
          <button id="logout-button" class="btn-secondary">🚪 Logout</button>
        </div>
        ` : ''}
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');
    const logoutBtn = document.querySelector('#logout-button');
    const messageBox = document.querySelector('#login-message');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value.trim();
        const password = form.password.value.trim();

        if (!email || !password) {
          messageBox.innerHTML = `<p style="color:red;">⚠️ Email dan password wajib diisi</p>`;
          return;
        }

        try {
          const response = await fetch('https://story-api.dicoding.dev/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const result = await response.json();

          if (response.ok && !result.error) {
            setToken(result.loginResult.token);
            messageBox.innerHTML = `<p style="color:green;">✅ Login berhasil!</p>`;
            form.reset();
            setTimeout(() => {
              window.location.hash = '#/';
            }, 1000);
          } else {
            messageBox.innerHTML = `<p style="color:red;">❌ ${result.message}</p>`;
          }
        } catch (err) {
          messageBox.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${err.message}</p>`;
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearToken();
        messageBox.innerHTML = `<p style="color:blue;">Anda sudah logout.</p>`;
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 800);
      });
    }
  }
}

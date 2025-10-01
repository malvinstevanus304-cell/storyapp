export default class RegisterPage {
  async render() {
    return `
      <section class="container page">
        <div class="hero">
          <h1 class="hero__title">📝 Register</h1>
          <p class="hero__subtitle">Buat akun baru untuk mulai berbagi cerita</p>
        </div>

        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" placeholder="Masukkan nama" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Masukkan email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Masukkan password" required>
          </div>
          <button type="submit" class="btn-primary">➡️ Daftar</button>
        </form>

        <div id="register-message" class="form-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#register-form');
    const messageBox = document.querySelector('#register-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!name || !email || !password) {
        messageBox.innerHTML = `<p style="color:red;">⚠️ Semua field wajib diisi</p>`;
        return;
      }

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (response.ok && !result.error) {
          messageBox.innerHTML = `<p style="color:green;">✅ Registrasi berhasil! Mengarahkan ke login...</p>`;
          form.reset();

          // ⏳ Redirect otomatis ke login setelah 2 detik
          setTimeout(() => {
            window.location.hash = '#/login';
          }, 2000);
        } else {
          messageBox.innerHTML = `<p style="color:red;">❌ ${result.message}</p>`;
        }
      } catch (err) {
        messageBox.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${err.message}</p>`;
      }
    });
  }
}

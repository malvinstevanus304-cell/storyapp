export default class AboutPage {
  async render() {
    return `
      <section class="container page">
        <!-- HERO SECTION -->
        <div class="hero">
          <h1 class="hero__title">Tentang Aplikasi</h1>
          <p class="hero__subtitle">
            Aplikasi Story App ini dibuat untuk submission Dicoding dengan konsep SPA (Single Page Application).
          </p>
        </div>

        <!-- CONTENT -->
        <div class="about-content">
          <h2>Kenapa Story App?</h2>
          <p>
            Story App memungkinkan pengguna untuk berbagi momen dalam bentuk cerita
            lengkap dengan foto, deskripsi, dan lokasi. Setiap cerita dapat dilihat oleh pengguna lain,
            sehingga tercipta interaksi dan inspirasi baru.
          </p>

          <h2>Fitur Utama</h2>
          <ul>
            <li>📸 Upload foto dari kamera atau galeri</li>
            <li>📝 Tambahkan deskripsi cerita</li>
            <li>📍 Simpan lokasi cerita di peta</li>
            <li>🔒 Autentikasi login & register</li>
          </ul>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Bisa tambahkan interaksi kalau diperlukan
  }
}

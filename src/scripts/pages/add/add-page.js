import { getToken } from '../../utils/auth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class AddPage {
  constructor() {
    this._stream = null;
    this._marker = null;
  }

  async render() {
    return `
      <section class="container page">
        <div class="hero">
          <h1 class="hero__title">➕ Tambah Story Baru</h1>
          <p class="hero__subtitle">Bagikan momenmu dengan foto, deskripsi, dan lokasi</p>
        </div>

        <form id="story-form" class="story-form" enctype="multipart/form-data">
          <div>
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" required></textarea>
          </div>

          <div>
            <label>Ambil Foto</label>
            <div id="camera-container" style="position:relative;">
              <video id="video" autoplay playsinline style="display:none; width:100%; max-height:300px;"></video>
              <button id="snap-btn" type="button" style="display:none; position:absolute; bottom:10px; left:50%; transform:translateX(-50%); font-size:24px;">📸</button>
            </div>
            <button id="capture-btn" type="button">Ambil Gambar</button>
            <div id="camera-preview" class="preview-box">Belum ada foto</div>
          </div>

          <div>
            <label>Upload Foto</label>
            <input type="file" id="photo" name="photo" accept="image/*">
          </div>

          <div>
            <label>Pilih Lokasi</label>
            <p>Klik pada peta untuk memilih lokasi:</p>
            <input type="text" id="lat" name="lat" readonly placeholder="Latitude">
            <input type="text" id="lon" name="lon" readonly placeholder="Longitude">
          </div>
          <div id="map" class="add-map" style="height:400px;"></div>

          <button type="submit">🚀 Kirim</button>
        </form>

        <div id="message" class="form-message"></div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#story-form');
    const messageBox = document.querySelector('#message');
    const video = document.querySelector('#video');
    const canvas = document.createElement('canvas');
    const captureBtn = document.querySelector('#capture-btn');
    const snapBtn = document.querySelector('#snap-btn');
    const cameraPreview = document.querySelector('#camera-preview');
    const fileInput = document.querySelector('#photo');
    const latInput = document.querySelector('#lat');
    const lonInput = document.querySelector('#lon');
    const token = getToken();

    let hasCaptured = false;

    // Tombol "Ambil Gambar" memunculkan kamera
    captureBtn.addEventListener('click', async () => {
      try {
        if (!this._stream) {
          this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = this._stream;
          video.style.display = 'block';
          snapBtn.style.display = 'block';
        }
      } catch (err) {
        cameraPreview.innerHTML = `<p style="color:red;">Tidak dapat mengakses kamera</p>`;
      }
    });

    // Tombol overlay 📸 → ambil snapshot
    snapBtn.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

      // Kamera mati setelah ambil gambar
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
      video.style.display = 'none';
      snapBtn.style.display = 'none';

      // Preview muncul
      cameraPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      cameraPreview.appendChild(img);

      // Tombol × untuk hapus preview
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.className = 'close-preview-btn';
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '5px';
      closeBtn.style.right = '5px';
      closeBtn.style.background = 'rgba(255,255,255,0.8)';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.addEventListener('click', () => {
        cameraPreview.innerHTML = 'Belum ada foto';
        hasCaptured = false;
      });
      cameraPreview.style.position = 'relative';
      cameraPreview.appendChild(closeBtn);

      hasCaptured = true;
      fileInput.value = '';
    });

    // Upload file → reset preview kamera
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        cameraPreview.innerHTML = `<p style="color:#555;">📂 Foto diambil dari file upload</p>`;
        hasCaptured = false;
      }
    });

    // Map Leaflet
    const map = L.map('map').setView([-6.2, 106.8], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e) => {
      if (this._marker) map.removeLayer(this._marker);
      this._marker = L.marker(e.latlng).addTo(map);
      latInput.value = e.latlng.lat;
      lonInput.value = e.latlng.lng;
    });

    // Submit form //
  form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = form.description.value.trim();
  const photoFile = fileInput.files[0];

  if (!description) {
    messageBox.innerHTML = `<p style="color:red;">⚠️ Deskripsi wajib diisi</p>`;
    return;
  }

  const formData = new FormData();
  formData.append('description', description);

  if (photoFile) {
    formData.append('photo', photoFile);
  } else if (hasCaptured) {
    const blob = await (await fetch(canvas.toDataURL())).blob();
    formData.append('photo', blob, 'captured.png');
  } else {
    messageBox.innerHTML = `<p style="color:red;">⚠️ Foto wajib diisi</p>`;
    return;
  }

  if (latInput.value && lonInput.value) {
    formData.append('lat', latInput.value);
    formData.append('lon', lonInput.value);
  }

  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();
    if (response.ok && !result.error) {
      messageBox.innerHTML = `<p style="color:green;">✅ Story berhasil ditambahkan!</p>`;
      form.reset();
      cameraPreview.innerHTML = 'Belum ada foto';
      if (this._marker) map.removeLayer(this._marker);
      this._marker = null;

      // 🔹 Redirect ke halaman utama
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

  // Matikan kamera saat navigasi
  async stop() {
    const video = document.querySelector('#video');
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
    }
    if (video) video.srcObject = null;
  }
}

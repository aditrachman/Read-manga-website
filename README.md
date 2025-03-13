# Read Manga Web

**mocomanga.vercel.app** adalah sebuah website untuk membaca manga secara online dengan tampilan yang sederhana dan responsif. Website ini dibangun menggunakan **Next.js** dan akan dikembangkan lebih lanjut dengan integrasi **Firebase** untuk manajemen data manga.

## 🚀 Fitur Utama
- 📖 Menampilkan daftar manga lengkap dengan cover, genre, chapter, dan rating
- 🔍 Pencarian manga berdasarkan judul atau genre
- 🆕 Halaman **Updates** untuk menampilkan update chapter terbaru
- 🛠️ Halaman admin (dengan autentikasi) untuk menambahkan dan mengedit data manga
- ⚡ Performa cepat dengan **Next.js**

## 📦 Teknologi yang Digunakan
- **Next.js** - Framework React untuk aplikasi web modern
- **Firebase** (Upcoming) - Digunakan untuk menyimpan data manga
- **Tailwind CSS** - Styling yang fleksibel dan cepat
- **MyAnimeList API (Opsional)** - Untuk mengambil rating manga

## 📥 Instalasi & Menjalankan Proyek
### 1. Clone Repository
```bash
git clone https://github.com/aditrachman/Read-manga-website.git
cd Read-manga-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan di Mode Development
```bash
npm run dev
```
Website akan berjalan di `http://localhost:3000`

### 4. Build untuk Production
```bash
npm run build
npm start
```

## 📂 Struktur Folder
```
📦 Read-manga-website
├── 📂 pages          # Halaman utama website
│   ├── 📄 index.js   # Halaman home
│   ├── 📄 updates.js # Halaman update manga
│   ├── 📄 admin.js   # Halaman admin (akan diintegrasikan dengan Firebase)
├── 📂 components     # Komponen reusable
├── 📂 public         # Folder untuk aset statis
├── 📂 styles         # File CSS / Tailwind config
└── 📄 next.config.js # Konfigurasi Next.js
```

## 🔥 TODO List
- [x] Menampilkan daftar manga
- [x] Menambahkan halaman **Updates**
- [ ] Integrasi **Firebase** untuk manajemen data manga
- [ ] Menambahkan autentikasi admin
- [ ] Optimasi performa dan UI

## 🤝 Kontribusi
Buat yang mau kontribusi, bisa **fork** repo ini, buat branch baru, terus **pull request**. Semua bantuan sangat dihargai! 🙌

## 📞 Kontak
Untuk pertanyaan atau saran, bisa hubungi:
- **GitHub**: [aditrachman](https://github.com/aditrachman)
- **Email**: (aditrachman23@gmail.com)


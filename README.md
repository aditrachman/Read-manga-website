# 📚 Moco Manga

> Website baca manga, manhwa, dan manhua terlengkap — gratis, tanpa iklan, dengan admin panel yang lengkap.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Fitur

### 👤 User
| Fitur | Keterangan |
|-------|------------|
| 📖 Baca Gratis | Tanpa iklan yang mengganggu |
| 🔍 Search & Filter | Cari berdasarkan judul atau 14+ genre |
| 🌍 Multi-Origin | Manga (JP), Manhwa (KR), Manhua (CN) |
| ⚙️ Reading Modes | Vertical, fit-width, original size |
| 🔖 Bookmark | Simpan manga favorit |
| 📊 Rekomendasi | Top rated, trending, new releases |
| 📱 Responsive | Optimal di semua device |

### 🛠️ Admin
| Fitur | Keterangan |
|-------|------------|
| 👨‍💼 Dashboard | Kelola semua konten dari satu tempat |
| ➕ Add Manga | Auto-fill data via MyAnimeList API |
| 📦 Bulk Import | Import banyak chapter sekaligus |
| 🖼️ Chapter Management | Upload, edit, hapus chapter |
| 📊 Statistik | Monitor total manga dan chapter |

---

## 🚀 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Firebase Firestore |
| Auth | Firebase Auth |
| Deployment | Vercel |
| Performance | PWA, Service Worker, Image Optimization |

---

## 📦 Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/moco-manga.git
cd moco-manga
npm install
```

### 2. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> 💡 Buat project baru di [Firebase Console](https://console.firebase.google.com) untuk mendapatkan config di atas.

### 3. Setup Firestore

1. Enable **Firestore Database** di Firebase Console
2. Import rules: `firestore.rules`
3. Import indexes: `firestore.indexes.json`
4. Buat collections: `manga`, `chapters`

### 4. Jalankan Dev Server

```bash
npm run dev
```

Akses di:
- **User:** `http://localhost:3000`
- **Admin:** `http://localhost:3000/admin/login`

---

## 🎮 Cara Pakai

### User
1. Buka homepage → browse manga
2. Klik manga untuk lihat detail & daftar chapter
3. Klik chapter untuk mulai membaca

### Admin
1. Login di `/admin/login` menggunakan Firebase Auth
2. Tambah manga baru → data auto-fill dari MyAnimeList
3. Gunakan **Bulk Import** di `/admin/manga/[id]/bulk-import` untuk upload chapter cepat

---

## 🔧 Tools & Scripts

### Manga Extractor
- **File:** `public/manga-extractor.js`
- **Cara pakai:** Copy script → paste di browser console → auto-extract image URLs
- **Support:** Komiku, Mangaku, dan website manga lainnya

### Bulk Import
- **Akses:** `/admin/manga/[id]/bulk-import`
- **Format:** URL list atau JSON
- **Fitur:** Auto-detect format & chapter numbering

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── components/        # Shared React components
│   ├── admin/             # Halaman admin panel
│   ├── manga/             # Halaman detail & reader
│   ├── genre/             # Filter berdasarkan genre
│   ├── recommendation/    # Halaman rekomendasi
│   └── lib/               # Firebase config & utilities
public/
├── manga-extractor.js     # Script ekstrak gambar
├── chrome-extension/      # Browser extension
└── sw.js                  # Service worker
firestore.rules            # Aturan keamanan Firestore
firestore.indexes.json     # Index query Firestore
```

---

## 🤝 Contributing

1. Fork repository ini
2. Buat branch baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buka Pull Request

---

## 📞 Support

Ada pertanyaan atau menemukan bug?

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/moco-manga/issues)
- 💬 **Discord:** [Join Server](https://discord.gg/nymph)
- 📧 **Email:** aditrachman23@gmail.com

---

## 🙏 Acknowledgments

- [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2) — sumber data manga
- [Firebase](https://firebase.google.com) — backend & auth
- [Next.js](https://nextjs.org) — React framework
- [Tailwind CSS](https://tailwindcss.com) — styling

---

<p align="center">Made with ❤️ for manga lovers everywhere</p>

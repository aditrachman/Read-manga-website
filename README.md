# 📚 Moco Manga - Website Baca Manga Gratis

Website baca manga, manhwa, dan manhua terlengkap tanpa iklan dengan fitur admin panel yang lengkap.

## ✨ Fitur Utama

### 🎯 **User Features:**
- 📖 **Baca Manga Gratis** - Tanpa iklan yang mengganggu
- 🔍 **Search & Filter** - Cari manga berdasarkan judul
- 🎭 **Filter by Genre** - 14+ genre tersedia
- 🌍 **Multi-Origin** - Manga (JP), Manhwa (KR), Manhua (CN)
- 📱 **Responsive Design** - Optimal di semua device
- ⚙️ **Reading Modes** - Vertical, fit-width, original size
- 🔖 **Bookmark System** - Simpan manga favorit
- 📊 **Recommendation** - Top rated, trending, new releases

### 🛠️ **Admin Features:**
- 👨‍💼 **Admin Dashboard** - Kelola semua konten
- ➕ **Add Manga** - Tambah manga baru dengan MyAnimeList integration
- 📦 **Bulk Import** - Import chapter dengan tools otomatis
- 🖼️ **Chapter Management** - Upload, edit, hapus chapter
- 🗑️ **Delete System** - Hapus manga dan chapter dengan aman
- 📊 **Statistics** - Monitor total manga dan chapter

## 🚀 Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Deployment:** Vercel
- **Performance:** PWA, Service Worker, Image Optimization

## 📦 Installation

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/moco-manga.git
cd moco-manga
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup Firebase:**
   - Buat project di [Firebase Console](https://console.firebase.google.com)
   - Copy Firebase config ke `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Setup Firestore:**
   - Enable Firestore Database
   - Import `firestore.rules` dan `firestore.indexes.json`
   - Create collections: `manga`, `chapters`

5. **Run development server:**
```bash
npm run dev
```

## 🎮 Usage

### **User Side:**
1. Buka `http://localhost:3000`
2. Browse manga di homepage
3. Klik manga untuk lihat detail
4. Klik chapter untuk mulai baca

### **Admin Side:**
1. Buka `http://localhost:3000/admin/login`
2. Login dengan Firebase Auth
3. Kelola manga di dashboard
4. Gunakan bulk import untuk upload chapter cepat

## 🔧 Tools & Scripts

### **Manga Extractor Script:**
- File: `public/manga-extractor.js`
- Cara pakai: Copy script → Paste di console browser → Auto extract image URLs
- Support: Komiku, Mangaku, dan website manga lainnya

### **Bulk Import:**
- Akses: `/admin/manga/[id]/bulk-import`
- Support: URL list, JSON format, multiple chapters
- Auto-detect format dan chapter numbering

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   ├── admin/              # Admin panel pages
│   ├── manga/              # Manga pages
│   ├── genre/              # Genre filtering
│   ├── recommendation/     # Recommendation page
│   └── lib/               # Firebase config
├── public/
│   ├── manga-extractor.js  # Image extraction script
│   ├── chrome-extension/   # Browser extension
│   └── sw.js              # Service worker
└── firestore.*            # Firebase config files
```

## 🎨 Features Detail

### **Reading Experience:**
- **No Crop Images** - Gambar tampil full tanpa terpotong
- **Multiple Reading Modes** - Sesuaikan dengan preferensi
- **Smooth Navigation** - Previous/next chapter
- **Mobile Optimized** - Touch-friendly interface

### **Admin Panel:**
- **MyAnimeList Integration** - Auto-fill manga data
- **Bulk Operations** - Import multiple chapters
- **Image Management** - Preview dan validation
- **Statistics Dashboard** - Monitor website performance

### **Performance:**
- **PWA Ready** - Installable web app
- **Service Worker** - Offline caching
- **Image Optimization** - WebP, lazy loading
- **Code Splitting** - Faster load times

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MyAnimeList API** - Manga data source
- **Firebase** - Backend services
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:
- 📧 Email: support@mocomanga.com
- 💬 Discord: [Join Server](https://discord.gg/mocomanga)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/moco-manga/issues)

---

**Made with ❤️ for manga lovers everywhere**
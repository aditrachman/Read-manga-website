# 🚀 Setup GitHub Repository

## 📋 Langkah-langkah Upload ke GitHub:

### 1. **Buat Repository Baru di GitHub**
1. Buka [GitHub.com](https://github.com)
2. Klik tombol **"New"** atau **"+"** → **"New repository"**
3. Isi detail repository:
   - **Repository name:** `moco-manga` atau `manga-website`
   - **Description:** `Website baca manga gratis dengan admin panel lengkap`
   - **Visibility:** Public atau Private (sesuai kebutuhan)
   - **❌ JANGAN** centang "Add a README file" (karena sudah ada)
   - **❌ JANGAN** pilih .gitignore (karena sudah ada)
4. Klik **"Create repository"**

### 2. **Connect Local Repository ke GitHub**
Setelah repository dibuat, GitHub akan kasih instruksi. Jalankan command ini:

```bash
# Add remote origin (ganti dengan URL repository kamu)
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Contoh:**
```bash
git remote add origin https://github.com/johndoe/moco-manga.git
git branch -M main  
git push -u origin main
```

### 3. **Verifikasi Upload**
1. Refresh halaman GitHub repository
2. Pastikan semua file sudah ter-upload
3. Cek README.md tampil dengan baik

---

## 🔧 Setup Environment Variables di Production

### **Untuk Vercel Deployment:**
1. Buka [Vercel Dashboard](https://vercel.com)
2. Import repository dari GitHub
3. Tambahkan Environment Variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### **Untuk Netlify Deployment:**
1. Connect repository di Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Tambahkan environment variables yang sama

---

## 📁 File Structure yang Sudah Di-commit:

```
✅ Root Files:
├── README.md              # Dokumentasi lengkap
├── CHANGELOG.md           # History perubahan
├── package.json           # Dependencies
├── next.config.mjs        # Next.js config
├── tailwind.config.mjs    # Tailwind config
├── .gitignore            # Git ignore rules
├── firestore.rules       # Firebase security rules
└── firestore.indexes.json # Firebase indexes

✅ Source Code:
├── src/app/              # Next.js app directory
├── public/               # Static assets
└── Tools & Scripts       # Development tools

✅ Features Included:
- 🏠 Homepage dengan Hero & Popular sections
- 📚 Manga detail & chapter reader
- 🔍 Search & filter functionality  
- 👨‍💼 Complete admin panel
- 📦 Bulk import system
- 🛠️ Developer tools & scripts
- 📱 Mobile responsive design
- ⚡ Performance optimizations
```

---

## 🎯 Next Steps Setelah Upload:

### **1. Setup Firebase Production:**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Deploy indexes: `firebase deploy --only firestore:indexes`

### **2. Domain & SSL:**
- Setup custom domain di Vercel/Netlify
- SSL certificate otomatis ter-setup

### **3. Monitoring:**
- Setup Google Analytics
- Monitor Core Web Vitals
- Setup error tracking (Sentry)

### **4. SEO Optimization:**
- Submit sitemap ke Google Search Console
- Setup meta tags untuk social sharing
- Optimize images untuk better loading

---

## 🔒 Security Checklist:

- ✅ `.env.local` tidak ter-commit (ada di .gitignore)
- ✅ Firebase rules sudah di-setup
- ✅ API keys menggunakan environment variables
- ✅ Admin routes protected dengan authentication

---

## 📞 Support:

Jika ada masalah saat setup:
1. Cek GitHub repository sudah ter-create
2. Pastikan git remote origin sudah di-set
3. Verifikasi semua file ter-upload dengan benar
4. Test deployment di Vercel/Netlify

**Repository siap untuk production! 🚀**
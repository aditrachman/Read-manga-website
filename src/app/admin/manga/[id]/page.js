"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function MangaDetail() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params.id;

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deletingManga, setDeletingManga] = useState(false);

  useEffect(() => {
    if (mangaId) {
      fetchMangaData();
      fetchChapters();
    }
  }, [mangaId]);

  const fetchMangaData = async () => {
    try {
      const docRef = doc(db, "manga", mangaId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setManga({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("Manga tidak ditemukan!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error fetching manga:", error);
    }
  };

  const fetchChapters = async () => {
    try {
      const chaptersRef = collection(db, "chapters");
      const q = query(
        chaptersRef,
        where("mangaId", "==", mangaId)
      );
      const querySnapshot = await getDocs(q);

      const chaptersList = [];
      querySnapshot.forEach((doc) => {
        chaptersList.push({ id: doc.id, ...doc.data() });
      });

      // Sort manually by chapter number
      chaptersList.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

      setChapters(chaptersList);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChapter = async (chapterId, chapterNumber) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Chapter ${chapterNumber}?`)) {
      return;
    }

    setDeleting(chapterId);
    try {
      await deleteDoc(doc(db, "chapters", chapterId));
      
      // Update chapter count in manga
      const newChapterCount = chapters.length - 1;
      await updateDoc(doc(db, "manga", mangaId), {
        chapters: newChapterCount,
      });

      // Refresh data
      fetchChapters();
      fetchMangaData();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Gagal menghapus chapter!");
    } finally {
      setDeleting(null);
    }
  };

  const deleteManga = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus manga "${manga.title}"?\n\nPeringatan: Semua ${chapters.length} chapter akan ikut terhapus dan tidak bisa dikembalikan!`)) {
      return;
    }

    setDeletingManga(true);
    try {
      // 1. Hapus semua chapters
      const deletePromises = chapters.map(chapter => 
        deleteDoc(doc(db, "chapters", chapter.id))
      );
      await Promise.all(deletePromises);

      // 2. Hapus manga
      await deleteDoc(doc(db, "manga", mangaId));

      alert(`✅ Manga "${manga.title}" dan ${chapters.length} chapter berhasil dihapus!`);
      
      // 3. Redirect ke dashboard
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error deleting manga:", error);
      alert("❌ Gagal menghapus manga. Silakan coba lagi.");
    } finally {
      setDeletingManga(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto py-24">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="p-6 max-w-6xl mx-auto py-24">
        <div className="text-center">Manga tidak ditemukan!</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto py-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold">Detail Manga</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/admin/manga/${mangaId}/add-chapter`}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm"
          >
            + Tambah Chapter
          </Link>
          <Link
            href={`/admin/manga/${mangaId}/bulk-import`}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm"
          >
            📦 Bulk Import
          </Link>
          <Link
            href={`/admin/manga/${mangaId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
          >
            Edit Manga
          </Link>
          <button
            onClick={deleteManga}
            disabled={deletingManga}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md text-sm"
          >
            {deletingManga ? "Menghapus..." : "🗑️ Hapus Manga"}
          </button>
        </div>
      </div>

      {/* Manga Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          {manga.image && (
            <img
              src={manga.image}
              alt={manga.title}
              className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
            />
          )}
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-3xl font-bold">{manga.title}</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Author:</span>
              <p>{Array.isArray(manga.authors) ? manga.authors.join(", ") : manga.authors}</p>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <p className="capitalize">{manga.status}</p>
            </div>
            <div>
              <span className="text-gray-400">Rating:</span>
              <p>⭐ {manga.rating}/10</p>
            </div>
            <div>
              <span className="text-gray-400">Total Chapters:</span>
              <p>{chapters.length} chapters</p>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <p className="capitalize">{manga.type}</p>
            </div>
            <div>
              <span className="text-gray-400">Members:</span>
              <p>{manga.members?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div>
            <span className="text-gray-400">Genre:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {Array.isArray(manga.genre) && manga.genre.map((g, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-xs rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-gray-400">Description:</span>
            <p className="mt-1 text-gray-300 leading-relaxed">
              {manga.description || "Tidak ada deskripsi."}
            </p>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Daftar Chapter</h3>
          <span className="text-gray-400">{chapters.length} chapters</span>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Belum ada chapter.</p>
            <Link
              href={`/admin/manga/${mangaId}/add-chapter`}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm"
            >
              Tambah Chapter Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3 pr-6">Chapter</th>
                  <th className="pb-3 pr-6">Judul</th>
                  <th className="pb-3 pr-6">Halaman</th>
                  <th className="pb-3 pr-6">Tanggal Upload</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id} className="border-b border-gray-700/50">
                    <td className="py-3 pr-6">Chapter {chapter.chapterNumber}</td>
                    <td className="py-3 pr-6">{chapter.title}</td>
                    <td className="py-3 pr-6">
                      {Array.isArray(chapter.images) ? chapter.images.length : 0} halaman
                    </td>
                    <td className="py-3 pr-6">
                      {chapter.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/manga/${mangaId}/chapter/${chapter.id}/edit`}
                          className="text-blue-400 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteChapter(chapter.id, chapter.chapterNumber)}
                          disabled={deleting === chapter.id}
                          className="text-red-400 hover:underline text-sm disabled:opacity-50"
                        >
                          {deleting === chapter.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
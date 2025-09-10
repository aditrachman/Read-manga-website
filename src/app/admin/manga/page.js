"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  deleteDoc, 
  where 
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AllManga() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAllManga();
  }, []);

  const fetchAllManga = async () => {
    try {
      const mangaRef = collection(db, "manga");
      const q = query(mangaRef, orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const mangaList = [];
      querySnapshot.forEach((doc) => {
        mangaList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setMangas(mangaList);
    } catch (error) {
      console.error("Error fetching manga:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMangas = mangas.filter((manga) =>
    manga.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteManga = async (mangaId, mangaTitle) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus manga "${mangaTitle}"?\n\nPeringatan: Semua chapter akan ikut terhapus dan tidak bisa dikembalikan!`)) {
      return;
    }

    setDeleting(mangaId);
    try {
      // 1. Hapus semua chapters dari manga ini
      const chaptersRef = collection(db, "chapters");
      const chaptersQuery = query(chaptersRef, where("mangaId", "==", mangaId));
      const chaptersSnapshot = await getDocs(chaptersQuery);
      
      // Hapus chapters satu per satu
      const deletePromises = chaptersSnapshot.docs.map(chapterDoc => 
        deleteDoc(doc(db, "chapters", chapterDoc.id))
      );
      await Promise.all(deletePromises);

      // 2. Hapus manga
      await deleteDoc(doc(db, "manga", mangaId));

      // 3. Refresh data
      fetchAllManga();
      
      alert(`✅ Manga "${mangaTitle}" dan ${chaptersSnapshot.docs.length} chapter berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting manga:", error);
      alert("❌ Gagal menghapus manga. Silakan coba lagi.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto py-24">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto py-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Semua Manga</h1>
        <Link
          href="/admin/manga/add"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
        >
          + Tambah Manga Baru
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari manga..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 bg-gray-800 border border-gray-700 rounded-md"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 text-gray-400">
        Menampilkan {filteredMangas.length} dari {mangas.length} manga
      </div>

      {/* Manga List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {filteredMangas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">
              {searchTerm ? "Tidak ada manga yang ditemukan." : "Belum ada manga."}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/manga/add"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
              >
                Tambah Manga Pertama
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr className="text-left">
                  <th className="p-4">Cover</th>
                  <th className="p-4">Judul</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Chapters</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMangas.map((manga) => (
                  <tr key={manga.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4">
                      {manga.image ? (
                        <img
                          src={manga.image}
                          alt={manga.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{manga.title}</div>
                      <div className="text-sm text-gray-400 capitalize">{manga.type}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {Array.isArray(manga.authors) 
                        ? manga.authors.join(", ") 
                        : manga.authors || "Unknown"}
                    </td>
                    <td className="p-4">{manga.chapters || 0}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        {manga.rating || "0.0"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        manga.status === 'completed' 
                          ? 'bg-green-900 text-green-300'
                          : manga.status === 'hiatus'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}>
                        {manga.status || 'ongoing'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {manga.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/admin/manga/${manga.id}`}
                          className="text-indigo-400 hover:underline text-sm"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/admin/manga/${manga.id}/add-chapter`}
                          className="text-green-400 hover:underline text-sm"
                        >
                          + Chapter
                        </Link>
                        <button
                          onClick={() => deleteManga(manga.id, manga.title)}
                          disabled={deleting === manga.id}
                          className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === manga.id ? "Menghapus..." : "🗑️ Hapus"}
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
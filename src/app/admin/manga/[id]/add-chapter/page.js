"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AddChapter() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params.id;

  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chapterImages, setChapterImages] = useState([{ url: "" }]);
  const [nextChapterNumber, setNextChapterNumber] = useState(1);
  
  const [chapter, setChapter] = useState({
    title: "",
    chapterNumber: 1,
  });

  useEffect(() => {
    if (mangaId) {
      fetchMangaData();
      getNextChapterNumber();
    }
  }, [mangaId]);

  const fetchMangaData = async () => {
    try {
      const docRef = doc(db, "manga", mangaId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const mangaData = { id: docSnap.id, ...docSnap.data() };
        setManga(mangaData);
      } else {
        console.log("Manga tidak ditemukan!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error fetching manga:", error);
    }
  };

  const getNextChapterNumber = async () => {
    try {
      const chaptersRef = collection(db, "chapters");
      const q = query(
        chaptersRef,
        where("mangaId", "==", mangaId)
      );
      const querySnapshot = await getDocs(q);

      let nextNumber = 1;
      if (!querySnapshot.empty) {
        // Get all chapters and find the highest chapter number
        const chapters = [];
        querySnapshot.forEach((doc) => {
          chapters.push(doc.data());
        });
        
        const maxChapter = Math.max(...chapters.map(ch => ch.chapterNumber || 0));
        nextNumber = maxChapter + 1;
      }

      setNextChapterNumber(nextNumber);
      setChapter(prev => ({
        ...prev,
        chapterNumber: nextNumber,
        title: `Chapter ${nextNumber}`
      }));
    } catch (error) {
      console.error("Error getting next chapter number:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChapter({
      ...chapter,
      [name]: value,
    });
  };

  const handleChapterImageChange = (index, value) => {
    const updatedImages = [...chapterImages];
    updatedImages[index].url = value;
    setChapterImages(updatedImages);
  };

  const addImageField = () => {
    setChapterImages([...chapterImages, { url: "" }]);
  };

  const removeImageField = (index) => {
    if (chapterImages.length === 1) return;
    const updatedImages = chapterImages.filter((_, i) => i !== index);
    setChapterImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty URLs
      const validChapterImages = chapterImages
        .filter((img) => img.url.trim() !== "")
        .map((img) => img.url);

      if (validChapterImages.length === 0) {
        alert("Minimal harus ada 1 gambar untuk chapter!");
        setLoading(false);
        return;
      }

      // Add chapter to Firestore
      await addDoc(collection(db, "chapters"), {
        mangaId: mangaId,
        mangaTitle: manga.title,
        mangaCover: manga.image,
        chapterNumber: parseInt(chapter.chapterNumber),
        title: chapter.title,
        images: validChapterImages,
        createdAt: serverTimestamp(),
      });

      // Update manga chapter count
      const mangaRef = doc(db, "manga", mangaId);
      await updateDoc(mangaRef, {
        chapters: parseInt(chapter.chapterNumber),
        updatedAt: serverTimestamp(),
      });

      // Redirect back to manga detail
      router.push(`/admin/manga/${mangaId}`);
    } catch (error) {
      console.error("Error adding chapter:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!manga) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-24">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto py-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold">Tambah Chapter Baru</h1>
      </div>

      {/* Manga Info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          {manga.image && (
            <img
              src={manga.image}
              alt={manga.title}
              className="w-16 h-20 object-cover rounded"
            />
          )}
          <div>
            <h2 className="text-lg font-bold">{manga.title}</h2>
            <p className="text-gray-400 text-sm">
              {Array.isArray(manga.authors) ? manga.authors.join(", ") : manga.authors}
            </p>
            <p className="text-gray-400 text-sm">
              Chapter terakhir: {manga.chapters || 0}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nomor Chapter
            </label>
            <input
              type="number"
              name="chapterNumber"
              value={chapter.chapterNumber}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            />
            <p className="text-xs text-gray-400 mt-1">
              Chapter selanjutnya: {nextChapterNumber}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Judul Chapter
            </label>
            <input
              type="text"
              name="title"
              value={chapter.title}
              onChange={handleChange}
              required
              placeholder="Chapter 1"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              URL Gambar Chapter (Halaman untuk Membaca)
            </label>
            <button
              type="button"
              onClick={addImageField}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
            >
              + Tambah Gambar
            </button>
          </div>

          {chapterImages.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={image.url}
                onChange={(e) =>
                  handleChapterImageChange(index, e.target.value)
                }
                placeholder={`URL Gambar Halaman ${index + 1}`}
                className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-md"
                required={index === 0} // First image is required
              />
              <button
                type="button"
                onClick={() => removeImageField(index)}
                disabled={chapterImages.length === 1}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hapus
              </button>
            </div>
          ))}

          <div className="mt-4">
            <p className="text-sm mb-2">Preview Halaman:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chapterImages.map(
                (image, index) =>
                  image.url && (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Page ${index + 1}`}
                        className="h-32 object-cover rounded-md w-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Invalid+URL";
                        }}
                      />
                      <span className="absolute top-0 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded-br-md">
                        #{index + 1}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Chapter"}
          </button>
        </div>
      </form>
    </div>
  );
}
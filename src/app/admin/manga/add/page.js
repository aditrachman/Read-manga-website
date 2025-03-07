"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AddManga() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [coverURL, setCoverURL] = useState("");
  const [chapterImages, setChapterImages] = useState([{ url: "" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);

  const [manga, setManga] = useState({
    title: "",
    authors: [],
    description: "",
    status: "ongoing",
    genre: [],
    chapters: 0,
    rating: 0,
    type: "manga",
    members: 0,
    popularity: 0,
  });

  // Function to search manga from MyAnimeList API
  const searchManga = async () => {
    if (!searchQuery.trim()) {
      alert("Masukkan judul manga untuk dicari!");
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setSearchResults(data.data.slice(0, 5)); // Take top 5 results
      } else {
        alert("Tidak ditemukan manga dengan judul tersebut.");
      }
    } catch (error) {
      console.error("Error searching manga:", error);
      alert("Terjadi kesalahan saat mencari manga.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to select a manga from search results
  const selectManga = (selectedData) => {
    setSelectedManga(selectedData);

    // Map MyAnimeList data to our manga structure
    const authors = selectedData.authors?.map((author) => author.name) || [];
    const genre = selectedData.genres?.map((genre) => genre.name) || [];
    const status =
      selectedData.status === "Finished"
        ? "completed"
        : selectedData.status === "On Hiatus"
        ? "hiatus"
        : "ongoing";

    setManga({
      title: selectedData.title || "",
      authors: authors,
      description: selectedData.synopsis || "",
      status: status,
      genre: genre,
      chapters: selectedData.chapters || 0,
      rating: selectedData.score || 0,
      type: "manga",
      members: selectedData.members || 0,
      popularity: selectedData.popularity || 0,
    });

    setCoverURL(selectedData.images?.jpg?.image_url || "");

    // Clear search results after selection
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setManga({
      ...manga,
      [name]: value,
    });
  };

  const handleAuthorChange = (e) => {
    // Split by comma and trim each author name
    const authorsArray = e.target.value
      .split(",")
      .map((author) => author.trim());
    setManga({
      ...manga,
      authors: authorsArray,
    });
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setManga((prevManga) => {
      if (isChecked) {
        return {
          ...prevManga,
          genre: [...prevManga.genre, value],
        };
      } else {
        return {
          ...prevManga,
          genre: prevManga.genre.filter((genre) => genre !== value),
        };
      }
    });
  };

  const handleCoverURLChange = (e) => {
    setCoverURL(e.target.value);
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

      // Format the current date as a string
      const now = new Date();
      const publishedDate = now.toISOString();

      // Add manga to Firestore
      const docRef = await addDoc(collection(db, "manga"), {
        title: manga.title,
        authors: manga.authors,
        description: manga.description,
        genre: manga.genre,
        chapters: manga.chapters,
        rating: manga.rating,
        type: manga.type,
        members: manga.members,
        popularity: manga.popularity,
        image: coverURL,
        published: publishedDate,
        updatedAt: serverTimestamp(),
      });

      // If we have chapter images, create a chapter
      if (validChapterImages.length > 0) {
        await addDoc(collection(db, "chapters"), {
          mangaId: docRef.id,
          mangaTitle: manga.title,
          chapterNumber: 1,
          title: "Chapter 1",
          images: validChapterImages,
          createdAt: serverTimestamp(),
        });

        // Update manga with chapter count
        await updateDoc(doc(db, "manga", docRef.id), {
          chapters: 1,
        });
      }

      // Redirect to manga detail
      router.push(`/admin/manga/${docRef.id}`);
    } catch (error) {
      console.error("Error adding manga:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const genreOptions = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Supernatural",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto py-24">
      <h1 className="text-2xl font-bold mb-6">Tambah Manga Baru</h1>

      {/* Search Section */}
      <div className="mb-8 p-4 bg-gray-850 border border-gray-700 rounded-lg">
        <h2 className="text-xl font-medium mb-4">Cari dari MyAnimeList</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Masukkan judul manga"
            className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-md"
            onKeyPress={(e) => e.key === "Enter" && searchManga()}
          />
          <button
            type="button"
            onClick={searchManga}
            disabled={searchLoading}
            className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md ${
              searchLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {searchLoading ? "Mencari..." : "Cari"}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Hasil Pencarian:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.mal_id}
                  className="flex gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-750"
                  onClick={() => selectManga(result)}
                >
                  {result.images?.jpg?.image_url && (
                    <img
                      src={result.images.jpg.image_url}
                      alt={result.title}
                      className="h-24 w-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{result.title}</h4>
                    <p className="text-sm text-gray-400">
                      {result.authors?.map((a) => a.name).join(", ") ||
                        "Unknown author"}
                    </p>
                    <p className="text-sm mt-1">
                      {result.score ? `★ ${result.score}` : "No rating"} ·{" "}
                      {result.chapters || "?"} ch
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Manga Preview */}
        {selectedManga && (
          <div className="mt-4 p-3 bg-gray-800 border border-indigo-500 rounded-lg">
            <div className="flex gap-4">
              {selectedManga.images?.jpg?.image_url && (
                <img
                  src={selectedManga.images.jpg.image_url}
                  alt={selectedManga.title}
                  className="h-32 w-24 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{selectedManga.title}</h3>
                <p className="text-sm text-gray-400">
                  {selectedManga.authors?.map((a) => a.name).join(", ") ||
                    "Unknown author"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedManga.genres?.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-2 py-1 bg-gray-700 text-xs rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul</label>
              <input
                type="text"
                name="title"
                value={manga.title}
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Penulis (pisahkan dengan koma)
              </label>
              <input
                type="text"
                name="authors"
                value={manga.authors.join(", ")}
                onChange={handleAuthorChange}
                required
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                placeholder="Nama Penulis 1, Nama Penulis 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={manga.status}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={manga.type}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              >
                <option value="manga">Manga</option>
                <option value="manhwa">Manhwa</option>
                <option value="manhua">Manhua</option>
                <option value="novel">Novel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="10"
                step="0.1"
                value={manga.rating}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Members</label>
              <input
                type="number"
                name="members"
                min="0"
                value={manga.members}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Popularity
              </label>
              <input
                type="number"
                name="popularity"
                min="0"
                value={manga.popularity}
                onChange={handleChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                URL Cover Image
              </label>
              <input
                type="url"
                value={coverURL}
                onChange={handleCoverURLChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              />
              {coverURL && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Preview:</p>
                  <img
                    src={coverURL}
                    alt="Cover preview"
                    className="h-40 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/150?text=Invalid+URL";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={manga.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <div className="grid grid-cols-2 gap-2">
                {genreOptions.map((genre) => (
                  <label key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      value={genre}
                      checked={manga.genre.includes(genre)}
                      onChange={handleGenreChange}
                      className="mr-2"
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              URL Gambar Chapter 1 (Halaman untuk Membaca)
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
              />
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md"
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
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memproses..." : "Simpan Manga"}
          </button>
        </div>
      </form>
    </div>
  );
}

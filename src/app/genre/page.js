"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function GenrePage() {
  const [selectedGenre, setSelectedGenre] = useState("Action");
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
    "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
    "Supernatural", "Thriller", "Sports", "Historical"
  ];

  useEffect(() => {
    fetchMangasByGenre(selectedGenre);
  }, [selectedGenre]);

  const fetchMangasByGenre = async (genre) => {
    setLoading(true);
    try {
      const mangaRef = collection(db, "manga");
      const q = query(mangaRef, where("genre", "array-contains", genre));
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
      console.error("Error fetching manga by genre:", error);
    } finally {
      setLoading(false);
    }
  };

  const MangaCard = ({ manga }) => (
    <Link href={`/manga/${manga.id}`}>
      <div className="group relative bg-gradient-to-b from-gray-800/40 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:transform hover:scale-[1.03] border border-gray-700/50">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
          <img
            src={manga.image || "/api/placeholder/240/320"}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            width="240"
            height="320"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/240x320/333/fff?text=No+Image";
            }}
          />
          
          <div className="absolute top-2 right-2 backdrop-blur-md bg-indigo-600/60 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
            {manga.status || "ongoing"}
          </div>
        </div>

        <div className="relative p-3 md:p-4">
          <h3 className="text-base md:text-lg font-bold truncate text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
            {manga.title}
          </h3>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              {manga.chapters || 0} chapters
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-xs font-medium">{manga.rating || "0.0"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Manga by Genre
          </h1>
          <p className="text-gray-400 text-lg">
            Temukan manga berdasarkan genre favorit kamu
          </p>
        </div>

        {/* Genre Selector */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Pilih Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedGenre === genre
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Genre */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Genre: {selectedGenre}
          </h2>
          <p className="text-gray-400">
            {loading ? "Memuat..." : `${mangas.length} manga ditemukan`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-700 aspect-[3/4] rounded-xl mb-3"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : mangas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Belum ada manga dengan genre {selectedGenre}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
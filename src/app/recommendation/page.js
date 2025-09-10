"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function RecommendationPage() {
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const mangaRef = collection(db, "manga");

      // Reduce limit for better performance
      // Top Rated (rating tertinggi)
      const topRatedQuery = query(mangaRef, orderBy("rating", "desc"), limit(4));
      const topRatedSnap = await getDocs(topRatedQuery);
      const topRatedList = topRatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Trending (berdasarkan popularity)
      const trendingQuery = query(mangaRef, orderBy("popularity", "asc"), limit(4));
      const trendingSnap = await getDocs(trendingQuery);
      const trendingList = trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // New Releases (terbaru berdasarkan updatedAt)
      const newQuery = query(mangaRef, orderBy("updatedAt", "desc"), limit(4));
      const newSnap = await getDocs(newQuery);
      const newList = newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Completed Series
      const completedQuery = query(mangaRef, where("status", "==", "completed"), limit(4));
      const completedSnap = await getDocs(completedQuery);
      const completedList = completedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setTopRated(topRatedList);
      setTrending(trendingList);
      setNewReleases(newList);
      setCompleted(completedList);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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

  const Section = ({ title, description, mangas, icon }) => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">{icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 aspect-[3/4] rounded-xl mb-3"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : mangas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Belum ada data untuk kategori ini
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {mangas.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Rekomendasi Manga
          </h1>
          <p className="text-gray-400 text-lg">
            Temukan manga terbaik berdasarkan berbagai kategori
          </p>
        </div>

        {/* Top Rated */}
        <Section
          title="Rating Tertinggi"
          description="Manga dengan rating terbaik dari pembaca"
          mangas={topRated}
          icon="🏆"
        />

        {/* Trending */}
        <Section
          title="Trending"
          description="Manga yang sedang populer saat ini"
          mangas={trending}
          icon="🔥"
        />

        {/* New Releases */}
        <Section
          title="Update Terbaru"
          description="Manga yang baru saja diupdate"
          mangas={newReleases}
          icon="🆕"
        />

        {/* Completed Series */}
        <Section
          title="Series Tamat"
          description="Manga yang sudah selesai dan bisa dibaca sampai habis"
          mangas={completed}
          icon="✅"
        />

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Tidak menemukan yang kamu cari?
            </h3>
            <p className="text-gray-400 mb-6">
              Jelajahi semua koleksi manga kami atau cari berdasarkan genre
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/manga"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Lihat Semua Manga
              </Link>
              <Link
                href="/genre"
                className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Cari by Genre
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
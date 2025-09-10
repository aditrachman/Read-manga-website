"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AllManga() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 8; // Reduce items per page for better performance

  useEffect(() => {
    fetchMangas(true);
  }, [sortBy, filterStatus, filterType]);

  const fetchMangas = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setMangas([]);
      setLastDoc(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const mangaRef = collection(db, "manga");
      let q;

      // Build query based on sort
      if (sortBy === "title") {
        q = query(mangaRef, orderBy("title", "asc"), limit(ITEMS_PER_PAGE));
      } else if (sortBy === "rating") {
        q = query(mangaRef, orderBy("rating", "desc"), limit(ITEMS_PER_PAGE));
      } else if (sortBy === "updated") {
        q = query(mangaRef, orderBy("updatedAt", "desc"), limit(ITEMS_PER_PAGE));
      } else {
        q = query(mangaRef, orderBy("title", "asc"), limit(ITEMS_PER_PAGE));
      }

      // Add pagination
      if (!reset && lastDoc) {
        q = query(mangaRef, orderBy(sortBy === "rating" ? "rating" : sortBy === "updated" ? "updatedAt" : "title", sortBy === "rating" || sortBy === "updated" ? "desc" : "asc"), startAfter(lastDoc), limit(ITEMS_PER_PAGE));
      }

      const querySnapshot = await getDocs(q);
      const mangaList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mangaList.push({
          id: doc.id,
          ...data,
        });
      });

      // Filter by type and status
      let filteredMangas = mangaList;

      if (filterType !== "all") {
        filteredMangas = filteredMangas.filter((manga) => 
          manga.type?.toLowerCase() === filterType.toLowerCase()
        );
      }

      if (filterStatus !== "all") {
        filteredMangas = filteredMangas.filter((manga) => manga.status === filterStatus);
      }

      if (reset) {
        setMangas(filteredMangas);
      } else {
        setMangas(prev => [...prev, ...filteredMangas]);
      }

      // Set last document for pagination
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // Check if there are more documents
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching manga:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMangas(false);
    }
  };

  // Manga Card Component
  const MangaCard = ({ manga }) => (
    <Link href={`/manga/${manga.id}`}>
      <div className="group relative bg-gradient-to-b from-gray-800/40 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:transform hover:scale-[1.03] border border-gray-700/50">
        {/* Card glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
        </div>

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

          {/* Status badge */}
          <div className="absolute top-2 right-2 backdrop-blur-md bg-indigo-600/60 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
            {manga.status || "ongoing"}
          </div>

          {/* Type badge with different colors */}
          <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg ${
            manga.type === "manhwa" 
              ? "bg-gradient-to-r from-red-500 to-pink-600" 
              : manga.type === "manhua"
              ? "bg-gradient-to-r from-yellow-500 to-orange-600"
              : "bg-gradient-to-r from-blue-500 to-indigo-600"
          }`}>
            {manga.type?.toUpperCase() || "MANGA"}
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>

        <div className="relative p-3 md:p-4">
          {/* Title */}
          <h3 className="text-base md:text-lg font-bold truncate text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
            {manga.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-gray-400 mb-2 truncate">
            {Array.isArray(manga.authors) ? manga.authors.join(", ") : manga.authors || "Unknown Author"}
          </p>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              {manga.chapters || 0} chapters
            </div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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
            Koleksi Lengkap
          </h1>
          <p className="text-gray-400 text-lg">
            Manga, Manhwa, dan Manhua terlengkap dalam satu tempat
          </p>
          
          {/* Type indicators */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <span className="text-sm text-gray-400">Manga (Jepang)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
              <span className="text-sm text-gray-400">Manhwa (Korea)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
              <span className="text-sm text-gray-400">Manhua (China)</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipe
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="manga">Manga (Jepang)</option>
                <option value="manhwa">Manhwa (Korea)</option>
                <option value="manhua">Manhua (China)</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="title">Judul (A-Z)</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="updated">Terbaru Update</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {loading ? "Memuat..." : `Menampilkan ${mangas.length} ${filterType === "all" ? "manga" : filterType}`}
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
              {filterType !== "all" ? `Belum ada ${filterType} yang tersedia` : "Belum ada manga"}
            </div>
            {filterType !== "all" && (
              <button
                onClick={() => setFilterType("all")}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Lihat semua tipe
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Manga Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {mangas.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
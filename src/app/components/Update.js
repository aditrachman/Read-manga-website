"use client";
import { db } from "../lib/firebase";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";

// Komponen MangaCard yang di-memoize untuk mencegah render ulang yang tidak perlu
const MangaCard = memo(({ manga }) => {
  return (
    <div className="group relative bg-gradient-to-b from-gray-800/40 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:transform hover:scale-[1.03] border border-gray-700/50">
      {/* Card glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
      </div>

      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        <Image
          src={manga.image}
          alt={manga.title}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          loading="lazy"
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMDIwMzAiLz48L3N2Zz4="
          onError={(e) => {
            e.target.src = "/api/placeholder/240/320";
          }}
        />

        {/* Status badge */}
        <div className="absolute top-2 right-2 backdrop-blur-md bg-indigo-600/60 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
          {manga.status}
        </div>

        {/* New chapter badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
          Ch.{manga.chapter}
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="relative p-3 md:p-4">
        {/* Title */}
        <h3 className="text-base md:text-lg font-bold truncate text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
          {manga.title}
        </h3>

        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-400">Chapter {manga.chapter}</div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium">{manga.rating}</span>
          </div>
        </div>

        {/* Genre tags - hanya tampilkan maksimal 3 */}
        {manga.genres && manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1 py-1">
            {manga.genres.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="text-xs bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-700/60 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Pastikan nama tampil di React DevTools
MangaCard.displayName = "MangaCard";

// Filter button component untuk mengurangi duplikat kode
const FilterButton = ({ icon, text }) => (
  <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
    {icon}
    {text}
  </button>
);

export default function Update() {
  const [mangas, setMangas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gunakan useCallback untuk fungsi yang akan dipass sebagai prop atau dalam useEffect
  const fetchMangas = useCallback(async () => {
    try {
      setIsLoading(true);
      // Gunakan limit untuk mengurangi jumlah data yang diambil sekaligus
      // dan orderBy untuk memastikan data yang paling relevan ditampilkan lebih dulu
      const mangaQuery = query(
        collection(db, "manga"),
        orderBy("chapters", "desc"), // Urutkan berdasar chapter terbaru
        limit(20) // Batasi jumlah data yang diambil
      );

      const querySnapshot = await getDocs(mangaQuery);

      const mangaList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled",
        chapter: doc.data().chapters || 0,
        image: doc.data().image || "/api/placeholder/240/320",
        status: doc.data().status || "Ongoing",
        rating: doc.data().rating || "0.0",
        genres: doc.data().genre || [],
      }));

      setMangas(mangaList);
    } catch (error) {
      console.error("Error fetching manga data: ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Gunakan useEffect dengan dependensi yang jelas
  useEffect(() => {
    fetchMangas();

    // Hapus konsol log pada production
    return () => {
      // Cleanup jika diperlukan
    };
  }, [fetchMangas]);

  // SVG untuk filter icon
  const filterIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );

  // SVG untuk sort icon
  const sortIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  );

  return (
    <div className="min-h-screen text-white px-2 py-4 md:p-6">
      {/* Header dengan Latest Update dan filter/sort buttons */}
      <div className="flex justify-between items-center mb-4 md:mb-6 px-2 md:px-8">
        <h1 className="text-4xl font-bold">Latest Update</h1>

        {/* Desktop view - filter dan sort buttons */}
        <div className="hidden lg:flex lg:gap-3">
          <div className="flex gap-2">
            <FilterButton icon={filterIcon} text="Filter" />
            <FilterButton icon={sortIcon} text="Sort by" />
          </div>
        </div>
      </div>

      {/* Mobile menu toggle button */}
      <div className="lg:hidden px-2 mb-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex justify-between items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium"
        >
          <span>Filters</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={`w-5 h-5 transition-transform duration-200 ${
              mobileMenuOpen ? "rotate-180" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile view - filter options - hanya render jika terbuka */}
      {mobileMenuOpen && (
        <div className="lg:hidden mb-4 px-2">
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center justify-center gap-2">
              {filterIcon}
              Filter
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center justify-center gap-2">
              {sortIcon}
              Sort by
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Grid untuk menampilkan manga */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-2 md:px-8">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {/* View All button */}
          <div className="flex justify-center mt-8 mb-4">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-300 hover:shadow-lg flex items-center gap-2">
              View More Manga
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

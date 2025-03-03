"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Komponen GenreCard yang di-memoize
const GenreCard = memo(({ genre, index }) => {
  return (
    <div className="flex items-center p-2 sm:p-3 rounded-xl bg-gradient-to-r from-gray-800/40 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="w-5 mr-2 text-gray-400 text-sm font-medium">
        {index + 1}
      </div>
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-700/70">
        <Image
          src={genre.image}
          alt={genre.name}
          fill
          sizes="(max-width: 640px) 40px, 48px"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMDMwNDAiLz48L3N2Zz4="
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/40/40";
          }}
        />
      </div>
      <div className="ml-2 sm:ml-3 flex-1 min-w-0">
        <h3 className="font-medium text-sm sm:text-base text-white truncate group-hover:text-blue-300 transition-colors">
          {genre.name}
        </h3>
        <div className="flex items-center mt-0.5">
          {genre.trend === "up" ? (
            <span className="text-green-400 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </span>
          ) : (
            <span className="text-red-400 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </span>
          )}
          <span className="text-xs text-gray-400 truncate">{genre.count}</span>
        </div>
      </div>
    </div>
  );
});

// Pastikan nama tampil di React DevTools
GenreCard.displayName = "GenreCard";

// Komponen TimeframeButton yang di-memoize
const TimeframeButton = memo(({ timeframe, activeTimeframe, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded-full transition-all ${
        activeTimeframe === timeframe
          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
          : "text-gray-300 hover:text-white"
      }`}
    >
      {timeframe}
    </button>
  );
});

TimeframeButton.displayName = "TimeframeButton";

export default function Genre() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("1 Day");
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // Fungsi untuk mendapatkan gambar genre dari database manga
  const fetchGenres = useCallback(async () => {
    try {
      setIsLoading(true);

      // Object untuk menyimpan genre dan jumlahnya
      const genreCounts = {};
      const genreImages = {};

      // Ambil data manga untuk mengitung jumlah per genre dan mendapatkan gambar
      const mangaQuery = query(
        collection(db, "manga"),
        limit(100) // Batasi jumlah manga yang diproses untuk performa
      );

      const querySnapshot = await getDocs(mangaQuery);

      // Hitung manga per genre dan temukan gambar representatif
      querySnapshot.docs.forEach((doc) => {
        const mangaData = doc.data();
        const genres = mangaData.genre || [];
        const image = mangaData.image;

        genres.forEach((genre) => {
          // Hitung jumlah manga per genre
          if (genreCounts[genre]) {
            genreCounts[genre] += 1;
          } else {
            genreCounts[genre] = 1;
          }

          // Tetapkan gambar untuk genre jika belum ada atau update secara random
          // Untuk memastikan kita mendapatkan gambar yang berbeda-beda
          if (!genreImages[genre] || Math.random() > 0.8) {
            genreImages[genre] = image;
          }
        });
      });

      // Konversi ke format array untuk tampilan
      const genreArray = Object.keys(genreCounts).map((name) => {
        return {
          id: name,
          name: name,
          image: genreImages[name] || "/api/placeholder/40/40",
          count: genreCounts[name].toLocaleString(),
          trend: Math.random() > 0.5 ? "up" : "down", // Simulasi trend naik/turun
        };
      });

      // Urutkan berdasarkan jumlah manga terbanyak
      genreArray.sort((a, b) => {
        return (
          parseInt(b.count.replace(/,/g, "")) -
          parseInt(a.count.replace(/,/g, ""))
        );
      });

      setGenres(genreArray.slice(0, 9)); // Ambil 9 genre teratas saja
    } catch (error) {
      console.error("Error fetching genres:", error);
      // Gunakan data statis sebagai fallback jika ada error
      setGenres([
        {
          id: 1,
          name: "Action",
          image: "/api/placeholder/40/40",
          count: "10,450",
          trend: "up",
        },
        {
          id: 2,
          name: "Romance",
          image: "/api/placeholder/40/40",
          count: "5,344",
          trend: "up",
        },
        {
          id: 3,
          name: "Fantasy",
          image: "/api/placeholder/40/40",
          count: "33,457",
          trend: "down",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Ambil data genre
    fetchGenres();

    // Deteksi lebar window untuk menentukan jumlah genre yang ditampilkan
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set lebar window awal
    handleResize();

    // Tambahkan event listener resize dengan throttling
    let timeout;
    const throttledResize = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          handleResize();
        }, 200); // Hanya update setiap 200ms untuk mencegah rerender berlebihan
      }
    };

    window.addEventListener("resize", throttledResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", throttledResize);
      clearTimeout(timeout);
    };
  }, [fetchGenres]);

  // Menentukan jumlah genre yang ditampilkan berdasarkan kondisi
  const displayGenres =
    showAllGenres || windowWidth >= 640 ? genres : genres.slice(0, 5);

  // Handler tombol timeframe dengan useCallback
  const handleTimeframeClick = useCallback((timeframe) => {
    setActiveTimeframe(timeframe);
    // Di sini bisa ditambahkan logika untuk filter data berdasarkan timeframe
  }, []);

  return (
    <div className="w-full px-2 py-4 md:p-6">
      <div className="mb-4 px-2 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className="text-4xl font-bold">Top Genres</h1>

          <div className="flex items-center self-start sm:self-auto gap-1 sm:gap-2 bg-gray-800/40 p-1 rounded-full">
            {["1 Day", "7 Days", "30 Days"].map((timeframe) => (
              <TimeframeButton
                key={timeframe}
                timeframe={timeframe}
                activeTimeframe={activeTimeframe}
                onClick={() => handleTimeframeClick(timeframe)}
              />
            ))}
          </div>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-2 sm:p-3 rounded-xl bg-gradient-to-r from-gray-800/40 to-gray-900/80 backdrop-blur-sm border border-gray-700/50"
              >
                <div className="w-5 mr-2 bg-gray-700 h-4 rounded animate-pulse"></div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 animate-pulse"></div>
                <div className="ml-2 sm:ml-3 flex-1">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {displayGenres.map((genre, index) => (
                <GenreCard key={genre.id} genre={genre} index={index} />
              ))}
            </div>

            {windowWidth < 640 && genres.length > 5 && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowAllGenres(!showAllGenres)}
                  className="bg-gradient-to-r from-indigo-600/80 to-blue-600/80 text-white text-xs px-4 py-2 rounded-lg font-medium hover:from-indigo-500 hover:to-blue-500 transition-all duration-300"
                >
                  {showAllGenres ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

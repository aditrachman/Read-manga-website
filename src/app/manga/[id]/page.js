"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function MangaDetail() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  // Fetch manga detail dari Firestore berdasarkan ID
  useEffect(() => {
    const fetchMangaDetail = async () => {
      try {
        if (!params.id) return;

        const mangaRef = doc(db, "manga", params.id);
        const mangaDoc = await getDoc(mangaRef);

        if (mangaDoc.exists()) {
          const data = mangaDoc.data();
          const publishedDate = data.published
            ? data.published.split(" to ")[0]
            : "Unknown"; // Ambil bagian pertama
          setManga({
            id: mangaDoc.id,
            title: data.title || "Unknown Title",
            authors: data.authors || ["Unknown Author"], // Ambil data authors
            published: publishedDate, // Gunakan tanggal awal saja
            members: data.members || 0, // Ambil data members
            rating: data.rating?.toString() || "0.0",
            chapters: data.chapters || 0,
            image: data.image || "/default-cover.jpg",
            status: data.status || "Ongoing",
            origin: data.origin || "JP",
            description: data.description || "No description available",
            genres: data.genres || [],
            releaseYear: data.releaseYear || "Unknown",
          });
        } else {
          console.error("Manga tidak ditemukan!");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching manga details:", error);
        setLoading(false);
      }
    };

    fetchMangaDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10 px-4">
        <div className="max-w-6xl w-full">
          <div className="animate-pulse flex flex-col items-center text-white">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Loading manga details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center py-10 px-4">
        <div className="max-w-6xl w-full">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Manga Tidak Ditemukan</h1>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400 bg-green-900/20";
      case "ongoing":
        return "text-blue-400 bg-blue-900/20";
      case "hiatus":
        return "text-yellow-400 bg-yellow-900/20";
      case "cancelled":
        return "text-red-400 bg-red-900/20";
      default:
        return "text-gray-400 bg-gray-900/20";
    }
  };

  // Function to get origin text
  const getOriginText = (origin) => {
    switch (origin) {
      case "JP":
        return "Japanese";
      case "KR":
        return "Korean";
      case "CN":
        return "Chinese";
      default:
        return origin;
    }
  };

  // Function to render chapter item with proper date
  const renderChapterItem = (chapterNum) => {
    // For demonstration, we'll use a random time difference
    const timeDiffs = [
      "1 hari yang lalu",
      "2 hari yang lalu",
      "3 hari yang lalu",
      "1 minggu yang lalu",
      "2 minggu yang lalu",
    ];
    const randomIndex = Math.floor(Math.random() * timeDiffs.length);

    return (
      <Link key={chapterNum} href={`/manga/${manga.id}/chapter/${chapterNum}`}>
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-white font-medium">Chapter {chapterNum}</div>
            <div className="text-gray-400 text-sm">
              {timeDiffs[randomIndex]}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Function to truncate description and add "Read more" functionality
  const renderSynopsis = () => {
    if (!manga.description) return "No description available";

    const maxLength = 180; // Character limit for short description
    const isLongDescription = manga.description.length > maxLength;
    const shortDescription = isLongDescription
      ? manga.description.substring(0, maxLength).trim() + "..."
      : manga.description;

    if (!isLongDescription)
      return (
        <p className="text-gray-300 leading-relaxed">{manga.description}</p>
      );

    return (
      <div>
        <p className="text-gray-300 leading-relaxed">
          {showFullSynopsis ? manga.description : shortDescription}
        </p>
        <button
          onClick={() => setShowFullSynopsis(!showFullSynopsis)}
          className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium flex items-center"
        >
          {showFullSynopsis ? (
            <>
              <span>Tutup</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          ) : (
            <>
              <span>Baca Selengkapnya</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="py-10 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali
        </button>

        {/* Manga Detail Content */}
        <div className="bg-gradient-to-b from-gray-800/60 to-gray-900/90 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-gray-700/50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manga Cover - Left Column */}
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg border border-gray-700/50">
                <Image
                  src={manga.image}
                  alt={manga.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="w-full h-full"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMDIwMzAiLz48L3N2Zz4="
                  onError={(e) => {
                    e.target.src = "/api/placeholder/300/400";
                  }}
                />
              </div>

              {/* Rating */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-white">
                  {manga.rating}
                </span>
              </div>

              {/* Read Button */}
              <div className="mt-6">
                <Link href={`/manga/${manga.id}/chapter/1`}>
                  <button className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Baca Chapter 1
                  </button>
                </Link>
              </div>
            </div>

            {/* Manga Information - Right Column */}
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {manga.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-gray-300 mb-4">
                <span>By {manga.authors.join(", ")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span>Release {manga.published}</span>
              </div>

              {/* Status & Origin Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(
                    manga.status
                  )}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                  {manga.status}
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-gray-700/40 text-blue-300 rounded-md text-sm font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                  {getOriginText(manga.origin)}
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 text-sm rounded-full hover:bg-indigo-600/30 hover:text-white transition-colors cursor-pointer"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Synopsis
                </h2>
                {renderSynopsis()}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Chapters</div>
                  <div className="text-xl font-bold text-white">
                    {manga.chapters}
                  </div>
                </div>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Views</div>
                  <div className="text-xl font-bold text-white">
                    {manga.members.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Rating</div>
                  <div className="text-xl font-bold text-white">
                    {manga.rating}/5
                  </div>
                </div>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Release</div>
                  <div className="text-xl font-bold text-white">
                    {manga.published}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Chapters
            </h2>

            {/* Chapters */}
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => manga.chapters - i)
                .filter((num) => num > 0)
                .map((chapterNum) => renderChapterItem(chapterNum))}
            </div>

            {/* Show All Chapters Button */}
            <div className="mt-8 flex justify-center">
              <button className="group relative px-8 py-3 overflow-hidden rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-600/30 transition-colors">
                <span className="relative z-10 flex items-center">
                  <span>Lihat Semua Chapter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

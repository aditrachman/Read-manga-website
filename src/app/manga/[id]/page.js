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
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-white text-center">
            Loading manga details...
          </div>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Manga Tidak Ditemukan</h1>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4">
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
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
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

              {/* Status badge */}
              <div className="mt-4 flex justify-center">
                <div className="inline-block backdrop-blur-md bg-indigo-600/60 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                  {manga.status}
                </div>
              </div>

              {/* Origin badge */}
              <div className="mt-2 flex justify-center">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                  {manga.origin === "JP"
                    ? "Japanese"
                    : manga.origin === "KR"
                    ? "Korean"
                    : manga.origin === "CN"
                    ? "Chinese"
                    : manga.origin}
                </div>
              </div>

              {/* Read Button */}
              <div className="mt-6">
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                  Baca Sekarang
                </button>
              </div>
            </div>

            {/* Manga Information - Right Column */}
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {manga.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-gray-300 mb-6">
                <span>By {manga.authors.join(", ")}</span>{" "}
                {/* Tampilkan authors */}
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span>Release {manga.published}</span>{" "}
                {/* Tampilkan tanggal awal saja */}
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span>{manga.chapters} Chapters</span>
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
                <p className="text-gray-300 leading-relaxed">
                  {manga.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Chapters</div>
                  <div className="text-xl font-bold text-white">
                    {manga.chapters}
                  </div>
                </div>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
                  <div className="text-sm text-gray-400">Views</div>
                  <div className="text-xl font-bold text-white">
                    {manga.members.toLocaleString()}{" "}
                    {/* Tampilkan members sebagai views */}
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
            <h2 className="text-2xl font-bold text-white mb-6">Chapters</h2>

            {/* Placeholder for chapters */}
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => manga.chapters - i)
                .filter((num) => num > 0)
                .map((chapterNum) => (
                  <Link
                    key={chapterNum}
                    href={`/manga/${manga.id}/chapter/${chapterNum}`}
                  >
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="text-white font-medium">
                          Chapter {chapterNum}
                        </div>
                        <div className="text-gray-400 text-sm">
                          1 hari yang lalu
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* Show All Chapters Button */}
            <div className="mt-6 flex justify-center">
              <button className="px-6 py-2 border border-indigo-500 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors">
                Lihat Semua Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

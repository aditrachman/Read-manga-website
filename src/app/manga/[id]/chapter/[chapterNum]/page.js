"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function ReadChapter() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch manga dan chapter detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id || !params.chapterNum) return;

        // Fetch manga detail
        const mangaRef = doc(db, "manga", params.id);
        const mangaDoc = await getDoc(mangaRef);

        if (mangaDoc.exists()) {
          setManga({
            id: mangaDoc.id,
            title: mangaDoc.data().title || "Unknown Title",
            // Bisa tambahkan data lain yang diperlukan
          });

          // Fetch chapter detail
          const chaptersRef = collection(db, "chapters");
          const q = query(
            chaptersRef,
            where("mangaId", "==", params.id),
            where("number", "==", parseInt(params.chapterNum))
          );

          const chapterSnapshot = await getDocs(q);

          if (!chapterSnapshot.empty) {
            const chapterDoc = chapterSnapshot.docs[0];
            setChapter({
              id: chapterDoc.id,
              ...chapterDoc.data(),
              // Buat placeholder pages jika perlu
              pages:
                chapterDoc.data().pages ||
                Array(20).fill("/api/placeholder/800/1200"),
            });
          } else {
            console.error("Chapter tidak ditemukan");
          }
        } else {
          console.error("Manga tidak ditemukan");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.chapterNum]);

  if (loading) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse text-white text-center">
            Loading chapter...
          </div>
        </div>
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Chapter Tidak Ditemukan</h1>
            <button
              onClick={() => router.push(`/manga/${params.id}`)}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Detail Manga
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle chapter navigation
  const goToPreviousChapter = () => {
    if (parseInt(params.chapterNum) > 1) {
      router.push(
        `/manga/${params.id}/chapter/${parseInt(params.chapterNum) - 1}`
      );
    }
  };

  const goToNextChapter = () => {
    router.push(
      `/manga/${params.id}/chapter/${parseInt(params.chapterNum) + 1}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-2">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 py-3 px-4 mb-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push(`/manga/${params.id}`)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
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
            Detail
          </button>

          <div className="text-white font-medium truncate max-w-xs">
            {manga.title} - Chapter {params.chapterNum}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={goToPreviousChapter}
              disabled={parseInt(params.chapterNum) <= 1}
              className={`p-2 rounded-lg ${
                parseInt(params.chapterNum) <= 1
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={goToNextChapter}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {chapter.pages.map((page, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={page}
                alt={`Page ${index + 1}`}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 60vw"
                className="w-full h-auto"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMDIwMzAiLz48L3N2Zz4="
                onError={(e) => {
                  e.target.src = "/api/placeholder/800/1200";
                }}
              />
            </div>
          ))}
        </div>

        {/* Chapter Navigation */}
        <div className="mt-8 mb-12 flex justify-between">
          <button
            onClick={goToPreviousChapter}
            disabled={parseInt(params.chapterNum) <= 1}
            className={`px-4 py-2 rounded-lg ${
              parseInt(params.chapterNum) <= 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Chapter Sebelumnya
          </button>

          <button
            onClick={goToNextChapter}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Chapter Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}

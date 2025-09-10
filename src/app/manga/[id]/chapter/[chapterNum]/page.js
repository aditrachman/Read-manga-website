"use client";
import { useState, useEffect } from "react";
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
  const [readingMode, setReadingMode] = useState("vertical");
  const [showSettings, setShowSettings] = useState(false);

  // Set default reading mode
  useEffect(() => {
    document.documentElement.style.setProperty('--manga-spacing', '0px');
  }, []);

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
            where("chapterNumber", "==", parseInt(params.chapterNum))
          );

          const chapterSnapshot = await getDocs(q);

          if (!chapterSnapshot.empty) {
            const chapterDoc = chapterSnapshot.docs[0];
            const chapterData = chapterDoc.data();



            setChapter({
              id: chapterDoc.id,
              title:
                chapterData.title || `Chapter ${chapterData.chapterNumber}`,
              number: chapterData.chapterNumber,
              images: chapterData.images || [],
              createdAt: chapterData.createdAt,
            });
          } else {
            console.error("Chapter tidak ditemukan untuk:", {
              mangaId: params.id,
              chapterNum: params.chapterNum
            });
            setChapter(null);
          }
        } else {
          console.error("Manga tidak ditemukan dengan ID:", params.id);
          setManga(null);
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
            <p>Loading chapter...</p>
            <p className="text-sm text-gray-400 mt-2">
              Manga ID: {params.id} | Chapter: {params.chapterNum}
            </p>
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
            <div className="bg-gray-800 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm">Debug Info:</p>
              <p className="text-xs text-gray-400">Manga ID: {params.id}</p>
              <p className="text-xs text-gray-400">Chapter Number: {params.chapterNum}</p>
              <p className="text-xs text-gray-400">Manga Found: {manga ? "Yes" : "No"}</p>
              <p className="text-xs text-gray-400">Chapter Found: {chapter ? "Yes" : "No"}</p>
            </div>
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
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 py-3 px-4 mb-2">
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
            {manga.title} - {chapter.title}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={goToPreviousChapter}
              disabled={parseInt(params.chapterNum) <= 1}
              className={`p-2 rounded-lg ${parseInt(params.chapterNum) <= 1
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

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
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
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Reading Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-white font-medium mb-3">Reading Settings</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setReadingMode("vertical");
                    // Apply CSS for vertical reading
                    document.documentElement.style.setProperty('--manga-spacing', '0px');
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${readingMode === "vertical"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  📱 No Gap
                </button>
                <button
                  onClick={() => {
                    setReadingMode("fit-width");
                    // Apply CSS for spaced reading
                    document.documentElement.style.setProperty('--manga-spacing', '8px');
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${readingMode === "fit-width"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  📏 With Gap
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Gambar akan tampil full tanpa terpotong dalam semua mode
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chapter Content - Full Width No Crop */}
      <div className="manga-reader w-full">


        {chapter.images && chapter.images.length > 0 ? (
          chapter.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Page ${index + 1}`}
              loading="lazy"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x1200/333/fff?text=Image+Not+Found";
              }}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-10">
            Tidak ada gambar tersedia untuk chapter ini.
          </div>
        )}
      </div>

      {/* Chapter Navigation */}
      <div className="mt-8 mb-12 flex justify-between">
        <button
          onClick={goToPreviousChapter}
          disabled={parseInt(params.chapterNum) <= 1}
          className={`px-4 py-2 rounded-lg ${parseInt(params.chapterNum) <= 1
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
  );
}

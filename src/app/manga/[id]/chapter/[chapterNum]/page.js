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
import { db, firebaseReady } from "@/app/lib/firebase";

export default function ReadChapter() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState("no-gap");
  const [showSettings, setShowSettings] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [imageSrcOverrides, setImageSrcOverrides] = useState({});
  const [navigatingNext, setNavigatingNext] = useState(false);

  const getInitialImageSrc = (url) => {
    if (!url || typeof url !== "string") return url;
    // Komiku CDN often blocks direct browser hotlinking.
    if (url.includes("img.komiku.org") || url.includes("img.komiku.id")) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Fetch manga dan chapter detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params.id || !params.chapterNum) return;

        // Fetch manga detail
        const mangaRef = doc(db, "manga", params.id);
        const mangaDoc = await getDoc(mangaRef);

        if (mangaDoc.exists()) {
          const mangaData = mangaDoc.data();
          setManga({
            id: mangaDoc.id,
            title: mangaData.title || "Unknown Title",
            image: mangaData.image || "",
            genre: mangaData.genre || [],
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
              title: chapterData.title || `Chapter ${chapterData.chapterNumber}`,
              number: chapterData.chapterNumber,
              images: Array.isArray(chapterData.images) ? chapterData.images : [],
              createdAt: chapterData.createdAt,
            });
          } else {
            // If chapter doesn't exist, return user to manga detail page.
            router.replace(`/manga/${params.id}`);
            return;
          }
        } else {
          console.error("Manga tidak ditemukan dengan ID:", params.id);
          setManga(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.chapterNum]);

  // Handle image error
  const handleImageError = (index, imageUrl) => {
    const fallbackSrc = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

    // First failure: retry via server-side proxy
    if (imageSrcOverrides[index] !== fallbackSrc) {
      setImageSrcOverrides((prev) => ({
        ...prev,
        [index]: fallbackSrc,
      }));
      return;
    }

    // Proxy also failed: show placeholder block
    setImageErrors((prev) => new Set(prev).add(index));
    console.warn(`Image failed (direct + proxy): page ${index + 1}`);
  };

  // Handle chapter navigation
  const goToPreviousChapter = () => {
    const currentChapter = parseInt(params.chapterNum);
    if (currentChapter > 1) {
      router.push(`/manga/${params.id}/chapter/${currentChapter - 1}`);
    }
  };

  const goToNextChapter = async () => {
    if (navigatingNext) return;

    const currentChapter = parseInt(params.chapterNum);
    const nextChapterNumber = currentChapter + 1;
    setNavigatingNext(true);

    try {
      const chaptersRef = collection(db, "chapters");
      const q = query(
        chaptersRef,
        where("mangaId", "==", params.id),
        where("chapterNumber", "==", nextChapterNumber)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Chapter selanjutnya tidak ditemukan. Kembali ke detail manga.");
        router.push(`/manga/${params.id}`);
        return;
      }

      router.push(`/manga/${params.id}/chapter/${nextChapterNumber}`);
    } catch (error) {
      console.error("Error checking next chapter:", error);
      alert("Gagal membuka chapter selanjutnya.");
    } finally {
      setNavigatingNext(false);
    }
  };

  const currentChapterNum = parseInt(params.chapterNum) || 0;
  const isPreviousDisabled = currentChapterNum <= 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse text-white text-center">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chapter...</p>
            <p className="text-sm text-gray-500 mt-2">
              Manga ID: {params.id} | Chapter: {params.chapterNum}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="min-h-screen bg-gray-900 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Chapter Tidak Ditemukan</h1>
            <div className="bg-gray-800 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm mb-2 font-medium">Debug Info:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Manga ID: {params.id}</p>
                <p>Chapter Number: {params.chapterNum}</p>
                <p>Manga Found: {manga ? "Yes" : "No"}</p>
                <p>Chapter Found: {chapter ? "Yes" : "No"}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/manga/${params.id}`)}
              className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Detail Manga
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 py-3 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push(`/manga/${params.id}`)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
            aria-label="Kembali ke detail manga"
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

          <div className="text-white font-medium truncate max-w-xs text-center">
            <div className="text-sm text-gray-300">{manga.title}</div>
            <div className="text-xs text-gray-400">{chapter.title}</div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={goToPreviousChapter}
              disabled={isPreviousDisabled}
              className={`p-2 rounded-lg transition-colors ${isPreviousDisabled
                ? "text-gray-500 cursor-not-allowed"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              aria-label="Chapter sebelumnya"
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
              disabled={navigatingNext}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Chapter selanjutnya"
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
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              aria-label="Pengaturan baca"
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
          <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 mt-3 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-white font-medium mb-3">Pengaturan Membaca</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setReadingMode("no-gap")}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${readingMode === "no-gap"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  📱 Tanpa Jarak
                </button>
                <button
                  onClick={() => setReadingMode("with-gap")}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${readingMode === "with-gap"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  📏 Dengan Jarak
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Pilih mode membaca sesuai preferensi Anda
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chapter Content */}
      <div className="flex justify-center px-2 sm:px-4">
        <div className="w-full max-w-3xl">
          {chapter.images && chapter.images.length > 0 ? (
            <div className={`${readingMode === "with-gap" ? "space-y-2" : ""}`}>
              {chapter.images.map((imageUrl, index) => {
                if (!imageUrl || typeof imageUrl !== 'string') {
                  return null;
                }

                return (
                  <div
                    key={index}
                    className="relative"
                    style={{
                      marginBottom: readingMode === "no-gap" ? 0 : undefined
                    }}
                  >
                    {imageErrors.has(index) ? (
                      <div className="w-full h-96 bg-gray-800 flex items-center justify-center rounded">
                        <div className="text-center text-gray-400">
                          <p>Gambar tidak dapat dimuat</p>
                          <p className="text-xs mt-1">Halaman {index + 1}</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={imageSrcOverrides[index] || getInitialImageSrc(imageUrl)}
                        alt={`Page ${index + 1} of ${chapter.title}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-auto block"
                        style={{
                          display: 'block',
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: readingMode === "with-gap" ? '0.375rem' : 0,
                        }}
                        onError={() => handleImageError(index, imageUrl)}
                        onLoad={(e) => {
                          // Ensure proper display
                          e.target.style.display = 'block';
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              <div className="max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2">Tidak Ada Gambar</h3>
                <p>Tidak ada gambar tersedia untuk chapter ini.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Navigation - Bottom */}
      <div className="mt-8 mb-12 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={goToPreviousChapter}
            disabled={isPreviousDisabled}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${isPreviousDisabled
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
          >
            ← Chapter Sebelumnya
          </button>

          <div className="text-center text-gray-400">
            <p className="text-sm">Chapter {currentChapterNum}</p>
          </div>

          <button
            onClick={goToNextChapter}
            disabled={navigatingNext}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {navigatingNext ? "Mengecek..." : "Chapter Selanjutnya →"}
          </button>
        </div>
      </div>
    </div>
  );
}
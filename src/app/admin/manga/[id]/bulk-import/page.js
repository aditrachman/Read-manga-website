"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function BulkImportChapter() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params.id;

  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [importMode, setImportMode] = useState("urls"); // urls, json, auto-detect
  const [startChapter, setStartChapter] = useState(1);
  const [chapterTitle, setChapterTitle] = useState("Chapter");

  useEffect(() => {
    if (mangaId) {
      fetchMangaData();
      getNextChapterNumber();
    }
  }, [mangaId]);

  const fetchMangaData = async () => {
    try {
      const docRef = doc(db, "manga", mangaId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setManga({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error fetching manga:", error);
    }
  };

  const getNextChapterNumber = async () => {
    try {
      const chaptersRef = collection(db, "chapters");
      const q = query(chaptersRef, where("mangaId", "==", mangaId));
      const querySnapshot = await getDocs(q);

      let nextNumber = 1;
      if (!querySnapshot.empty) {
        const chapters = [];
        querySnapshot.forEach((doc) => {
          chapters.push(doc.data());
        });
        
        const maxChapter = Math.max(...chapters.map(ch => ch.chapterNumber || 0));
        nextNumber = maxChapter + 1;
      }

      setStartChapter(nextNumber);
    } catch (error) {
      console.error("Error getting next chapter number:", error);
    }
  };

  const parseUrlList = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('http'));
  };

  const parseJsonData = (text) => {
    try {
      const data = JSON.parse(text);
      if (data.images && Array.isArray(data.images)) {
        return data.images;
      }
      return [];
    } catch (error) {
      console.error("Invalid JSON:", error);
      return [];
    }
  };

  const autoDetectFormat = (text) => {
    // Try JSON first
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      const jsonUrls = parseJsonData(text);
      if (jsonUrls.length > 0) return jsonUrls;
    }
    
    // Fallback to URL list
    return parseUrlList(text);
  };

  const processImport = async () => {
    if (!bulkData.trim()) {
      alert("Please paste your data first!");
      return;
    }

    setLoading(true);

    try {
      let imageUrls = [];

      switch (importMode) {
        case "urls":
          imageUrls = parseUrlList(bulkData);
          break;
        case "json":
          imageUrls = parseJsonData(bulkData);
          break;
        case "auto-detect":
          imageUrls = autoDetectFormat(bulkData);
          break;
      }

      if (imageUrls.length === 0) {
        alert("No valid image URLs found!");
        setLoading(false);
        return;
      }

      // Create chapter with all images
      await addDoc(collection(db, "chapters"), {
        mangaId: mangaId,
        mangaTitle: manga.title,
        mangaCover: manga.image,
        chapterNumber: parseInt(startChapter),
        title: `${chapterTitle} ${startChapter}`,
        images: imageUrls,
        createdAt: serverTimestamp(),
      });

      // Update manga chapter count
      const mangaRef = doc(db, "manga", mangaId);
      await updateDoc(mangaRef, {
        chapters: parseInt(startChapter),
        updatedAt: serverTimestamp(),
      });

      alert(`✅ Successfully imported ${imageUrls.length} images as Chapter ${startChapter}!`);
      router.push(`/admin/manga/${mangaId}`);

    } catch (error) {
      console.error("Error importing chapter:", error);
      alert("❌ Failed to import chapter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const processMultipleChapters = async () => {
    if (!bulkData.trim()) {
      alert("Please paste your data first!");
      return;
    }

    setLoading(true);

    try {
      // Split by double newlines to separate chapters
      const chapters = bulkData.split('\n\n').filter(chapter => chapter.trim());
      
      for (let i = 0; i < chapters.length; i++) {
        const chapterData = chapters[i];
        const imageUrls = autoDetectFormat(chapterData);
        
        if (imageUrls.length > 0) {
          const chapterNumber = startChapter + i;
          
          await addDoc(collection(db, "chapters"), {
            mangaId: mangaId,
            mangaTitle: manga.title,
            mangaCover: manga.image,
            chapterNumber: chapterNumber,
            title: `${chapterTitle} ${chapterNumber}`,
            images: imageUrls,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Update manga chapter count
      const finalChapterNumber = startChapter + chapters.length - 1;
      const mangaRef = doc(db, "manga", mangaId);
      await updateDoc(mangaRef, {
        chapters: finalChapterNumber,
        updatedAt: serverTimestamp(),
      });

      alert(`✅ Successfully imported ${chapters.length} chapters!`);
      router.push(`/admin/manga/${mangaId}`);

    } catch (error) {
      console.error("Error importing chapters:", error);
      alert("❌ Failed to import chapters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!manga) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-24">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto py-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold">Bulk Import Chapter</h1>
      </div>

      {/* Manga Info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          {manga.image && (
            <img
              src={manga.image}
              alt={manga.title}
              className="w-16 h-20 object-cover rounded"
            />
          )}
          <div>
            <h2 className="text-lg font-bold">{manga.title}</h2>
            <p className="text-gray-400 text-sm">
              Current chapters: {manga.chapters || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold mb-2">📖 How to Use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Go to manga reading website and open chapter</li>
          <li>Open browser console (F12)</li>
          <li>Paste the extractor script from <code>/manga-extractor.js</code></li>
          <li>Copy the extracted URLs and paste them below</li>
          <li>Click "Import Chapter" to save</li>
        </ol>
      </div>

      <div className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Import Mode</label>
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            >
              <option value="auto-detect">Auto Detect</option>
              <option value="urls">URL List</option>
              <option value="json">JSON Format</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Chapter</label>
            <input
              type="number"
              value={startChapter}
              onChange={(e) => setStartChapter(parseInt(e.target.value))}
              min="1"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chapter Title</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Chapter"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </div>
        </div>

        {/* Bulk Data Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Paste Image URLs or JSON Data
          </label>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder={`Paste your data here:

For URL List:
https://example.com/image1.jpg
https://example.com/image2.jpg
https://example.com/image3.jpg

For JSON:
{"images": ["url1", "url2", "url3"]}

For Multiple Chapters (separate with double newlines):
Chapter 1 URLs...

Chapter 2 URLs...`}
            rows="15"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md font-mono text-sm"
          />
        </div>

        {/* Preview */}
        {bulkData && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Preview:</h3>
            <p className="text-sm text-gray-400">
              {importMode === "auto-detect" 
                ? `Auto-detected ${autoDetectFormat(bulkData).length} images`
                : importMode === "urls"
                ? `Found ${parseUrlList(bulkData).length} URLs`
                : `JSON contains ${parseJsonData(bulkData).length} images`
              }
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={processImport}
            disabled={loading || !bulkData.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium"
          >
            {loading ? "Importing..." : "Import Single Chapter"}
          </button>
          
          <button
            onClick={processMultipleChapters}
            disabled={loading || !bulkData.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium"
          >
            {loading ? "Importing..." : "Import Multiple Chapters"}
          </button>
        </div>
      </div>
    </div>
  );
}
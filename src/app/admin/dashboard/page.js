// /app/admin/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/app/lib/auth";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalManga: 0,
    totalChapters: 0,
  });
  const [recentManga, setRecentManga] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    const fetchStats = async () => {
      try {
        // Fetch manga count
        const mangaRef = collection(db, "manga");
        const mangaSnap = await getDocs(mangaRef);

        // Fetch recent manga
        const recentMangaQuery = query(
          mangaRef,
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const recentMangaSnap = await getDocs(recentMangaQuery);
        const recentMangaList = [];

        recentMangaSnap.forEach((doc) => {
          recentMangaList.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Fetch chapters count
        const chaptersRef = collection(db, "chapters");
        const chaptersSnap = await getDocs(chaptersRef);

        setStats({
          totalManga: mangaSnap.size,
          totalChapters: chaptersSnap.size,
        });

        setRecentManga(recentMangaList);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto py-24">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-900/50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Total Manga</h2>
          <p className="text-3xl">{stats.totalManga}</p>
          <Link
            href="/admin/manga"
            className="text-indigo-400 text-sm hover:underline mt-2 inline-block"
          >
            Lihat semua manga
          </Link>
        </div>

        <div className="bg-purple-900/50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Total Chapter</h2>
          <p className="text-3xl">{stats.totalChapters}</p>
        </div>

        <div className="bg-blue-900/50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
          <div className="flex flex-col space-y-2 mt-2">
            <Link
              href="/admin/manga/add"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm text-center"
            >
              Tambah Manga Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Manga Terbaru</h2>

        {recentManga.length === 0 ? (
          <p className="text-gray-400">Belum ada manga.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3 pr-6">Judul</th>
                  <th className="pb-3 pr-6">Chapters</th>
                  <th className="pb-3 pr-6">Rating</th>
                  <th className="pb-3 pr-6">Updated</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentManga.map((manga) => (
                  <tr key={manga.id} className="border-b border-gray-700/50">
                    <td className="py-3 pr-6">{manga.title}</td>
                    <td className="py-3 pr-6">{manga.chapters}</td>
                    <td className="py-3 pr-6">{manga.rating}</td>
                    <td className="py-3 pr-6">
                      {manga.updatedAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/manga/${manga.id}`}
                        className="text-indigo-400 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

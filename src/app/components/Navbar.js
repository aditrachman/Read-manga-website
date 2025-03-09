"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePage, setActivePage] = useState("Home");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Handle scroll untuk hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle navigasi saat item menu diklik
  const handleNavigation = (item) => {
    setActivePage(item);

    const pathMap = {
      Home: "/",
      "All Manga": "/manga",
      Genre: "/genre",
      Recomendation: "/recommendation",
    };

    router.push(pathMap[item]);
  };

  // Implementasi fungsi pencarian dengan jumlah chapter
  const searchManga = async (term) => {
    try {
      // Normalisasi search term untuk pencarian
      const searchTermLower = term.toLowerCase();
      const results = [];

      // Query koleksi manga
      const mangaRef = collection(db, "manga");
      const mangaSnapshot = await getDocs(mangaRef);

      // Filter hasil secara manual untuk lebih fleksibel
      for (const doc of mangaSnapshot.docs) {
        const data = doc.data();
        const title = (data.title || "").toLowerCase();

        // Cek apakah title mengandung search term
        if (title.includes(searchTermLower)) {
          // Hitung jumlah chapter untuk manga ini
          const chapterCount = await getChapterCount(doc.id);

          results.push({
            id: doc.id,
            ...data,
            coverImage: data.image || data.coverImage, // Coba kedua field
            chapterCount: chapterCount,
            source: "manga",
          });
        }
      }

      // Query koleksi chapters
      const chaptersRef = collection(db, "chapters");
      const chaptersSnapshot = await getDocs(chaptersRef);

      // Object untuk mengelompokkan chapter berdasarkan mangaId
      const mangaChapters = {};

      // Kelompokkan chapter berdasarkan mangaId
      chaptersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const mangaId = data.mangaId;
        if (mangaId) {
          if (!mangaChapters[mangaId]) {
            mangaChapters[mangaId] = [];
          }
          mangaChapters[mangaId].push(data);
        }
      });

      // Filter chapters berdasarkan judul
      for (const doc of chaptersSnapshot.docs) {
        const data = doc.data();
        const title = (data.mangaTitle || "").toLowerCase();
        const mangaId = data.mangaId;

        if (title.includes(searchTermLower) && mangaId) {
          // Cek apakah manga ini sudah ada di result dari koleksi manga
          const existingIndex = results.findIndex(
            (item) =>
              item.id === mangaId || (item.title || "").toLowerCase() === title
          );

          // Jika belum ada, tambahkan ke hasil
          if (existingIndex === -1) {
            // Hitung jumlah chapter untuk manga ini
            const chapterCount = mangaChapters[mangaId]
              ? mangaChapters[mangaId].length
              : 1;

            results.push({
              id: mangaId,
              title: data.mangaTitle,
              coverImage: data.mangaCover || data.image,
              chapterCount: chapterCount,
              source: "chapters",
            });
          }
        }
      }

      // Batasi hasil ke 10 item
      const limitedResults = results.slice(0, 10);

      // Untuk debugging
      console.log("Search results with chapter counts:", limitedResults);

      setSearchResults(limitedResults);
      setShowResults(limitedResults.length > 0);
    } catch (error) {
      console.error("Error searching manga:", error);
      setSearchResults([]);
    }
  };

  // Fungsi untuk menghitung jumlah chapter dari suatu manga
  const getChapterCount = async (mangaId) => {
    try {
      const chaptersRef = collection(db, "chapters");
      const q = query(chaptersRef, where("mangaId", "==", mangaId));

      // Gunakan getCountFromServer untuk efisiensi jika tersedia
      if (getCountFromServer) {
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
      } else {
        // Fallback jika getCountFromServer tidak tersedia
        const snapshot = await getDocs(q);
        return snapshot.docs.length;
      }
    } catch (error) {
      console.error(`Error getting chapter count for manga ${mangaId}:`, error);
      return 0;
    }
  };

  // Debounce fungsi pencarian
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchManga(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const menuItems = ["Home", "All Manga", "Genre", "Recomendation"];

  return (
    <Disclosure
      as="nav"
      className={`fixed top-0 left-0 w-full transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } bg-[#0a0d18]/80 backdrop-blur-sm shadow-lg z-20`}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex shrink-0 items-center">
                <Link href="/" onClick={() => setActivePage("Home")}>
                  <h1 className="text-xl font-bold text-white lg:text-2xl cursor-pointer">
                    <span className="lg:hidden">MM</span>
                    <span className="hidden lg:block">MOCO MANGA</span>
                  </h1>
                </Link>
              </div>

              {/* Nav Items (Desktop) - Centered */}
              <div className="hidden lg:block lg:w-2/4">
                <div className="flex justify-center space-x-8">
                  {menuItems.map((item) => (
                    <Link
                      key={item}
                      href="#"
                      onClick={() => handleNavigation(item)}
                      aria-current={activePage === item ? "page" : undefined}
                      className={`relative inline-flex items-center px-1 pt-1 text-lg font-medium transition-all duration-300 ${
                        activePage === item
                          ? "text-white before:scale-x-100"
                          : "text-gray-400 hover:text-white before:scale-x-0"
                      } before:absolute before:bottom-0 before:left-0 before:h-[3px] before:w-full before:bg-gradient-to-r before:from-purple-500 before:to-blue-500 before:transition-transform before:duration-300 before:origin-left hover:before:scale-x-100`}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search Bar with Dropdown Results */}
              <div className="flex w-full max-w-[60%] sm:max-w-xs ml-4 mr-2 lg:ml-0 lg:mr-0 lg:w-1/4 lg:justify-end">
                <div className="w-full relative">
                  <input
                    name="search"
                    type="search"
                    placeholder="Cari Manga"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="block w-full rounded-md bg-gray-800/80 py-1.5 pr-3 pl-10 text-base text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400"
                  />

                  {/* Search Results Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-[#0a0d14] border border-gray-700 rounded-md shadow-lg z-30 max-h-64 overflow-y-auto">
                      {searchResults.map((manga, index) => (
                        <Link
                          key={`${manga.id}-${index}`}
                          href={`/manga/${manga.id}`} // Link ke halaman detail manga
                          onClick={() => {
                            setShowResults(false);
                            setSearchTerm("");
                          }}
                          className="block px-4 py-2 hover:bg-gray-800 text-white"
                        >
                          <div className="flex items-center">
                            {manga.coverImage && (
                              <img
                                src={manga.coverImage}
                                alt={manga.title || manga.mangaTitle}
                                className="w-10 h-14 object-cover rounded mr-3"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {manga.title || manga.mangaTitle}
                                </p>
                              </div>
                              {manga.chapterCount > 0 && (
                                <p className="text-gray-400 text-sm">
                                  {manga.chapterCount} Chapters
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {showResults && searchTerm && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-[#0a0d14] border border-gray-700 rounded-md shadow-lg z-30">
                      <p className="px-4 py-2 text-gray-400">
                        Tidak ditemukan manga dengan judul "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center lg:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="size-6" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <DisclosurePanel className="lg:hidden bg-[#05080f]/90 backdrop-blur-sm">
            <div className="space-y-1 pt-2 pb-3">
              {menuItems.map((item) => (
                <DisclosureButton
                  key={item}
                  as="a"
                  href="#"
                  onClick={() => handleNavigation(item)}
                  aria-current={activePage === item ? "page" : undefined}
                  className={`block py-2 pr-4 pl-3 text-base font-medium transition-all duration-300 ${
                    activePage === item
                      ? "relative text-white bg-[#161b2e]/50 border-l-0 before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-purple-500 before:to-blue-500"
                      : "border-transparent text-gray-400 hover:text-white hover:border-l-0 hover:bg-[#0a0d14]/50 relative hover:before:content-[''] hover:before:absolute hover:before:top-0 hover:before:left-0 hover:before:w-1 hover:before:h-full hover:before:bg-gradient-to-b hover:before:from-purple-500/50 hover:before:to-blue-500/50"
                  }`}
                >
                  {item}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

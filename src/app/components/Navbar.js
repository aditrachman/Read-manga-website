"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePage, setActivePage] = useState("Home");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchPool, setSearchPool] = useState([]);

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

  // Update active page based on current pathname
  useEffect(() => {
    let currentPage = "Home";
    if (pathname.startsWith("/manga")) currentPage = "All Manga";
    else if (pathname.startsWith("/genre")) currentPage = "Genre";
    else if (pathname.startsWith("/recommendation")) currentPage = "Recommendation";
    setActivePage(currentPage);
  }, [pathname]);

  // Preload manga list once for fast local search.
  useEffect(() => {
    let mounted = true;
    const preloadSearchPool = async () => {
      try {
        const mangaRef = collection(db, "manga");
        const q = query(mangaRef, orderBy("updatedAt", "desc"), limit(500));
        const snapshot = await getDocs(q);
        const pool = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            coverImage: data.image || data.coverImage || "",
            chapterCount: Number(data.chapters || 0),
          };
        });
        if (mounted) setSearchPool(pool);
      } catch (error) {
        console.error("Error preloading manga search pool:", error);
      }
    };
    preloadSearchPool();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle navigasi saat item menu diklik
  const handleNavigation = (item) => {
    setActivePage(item);

    const pathMap = {
      Home: "/",
      "All Manga": "/manga",
      Genre: "/genre",
      Recommendation: "/recommendation",
    };

    const targetPath = pathMap[item];
    if (targetPath) {
      router.push(targetPath);
    } else {
      console.warn(`No path found for menu item: ${item}`);
    }
  };

  // Implementasi fungsi pencarian dengan jumlah chapter
  const searchManga = async (term) => {
    try {
      const searchTermLower = term.toLowerCase();
      const limitedResults = searchPool
        .filter((item) => item.title.toLowerCase().includes(searchTermLower))
        .slice(0, 10);

      setSearchResults(limitedResults);
      setShowResults(limitedResults.length > 0);
    } catch (error) {
      console.error("Error searching manga:", error);
      setSearchResults([]);
    }
  };

  // Debounce fungsi pencarian dengan delay lebih panjang untuk performance
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        // Minimum 2 karakter
        searchManga(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const menuItems = ["Home", "All Manga", "Genre", "Recommendation"];

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
                      href={
                        item === "Home"
                          ? "/"
                          : item === "All Manga"
                          ? "/manga"
                          : item === "Genre"
                          ? "/genre"
                          : item === "Recommendation"
                          ? "/recommendation"
                          : "#"
                      }
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
                  href={
                    item === "Home"
                      ? "/"
                      : item === "All Manga"
                      ? "/manga"
                      : item === "Genre"
                      ? "/genre"
                      : item === "Recommendation"
                      ? "/recommendation"
                      : "#"
                  }
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

"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase"; // Assuming you have a firebase config file

export default function Popular() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Fetch data from Firestore database
  useEffect(() => {
    const fetchMangas = async () => {
      try {
        const mangaRef = collection(db, "manga");
        const q = query(mangaRef, orderBy("popularity", "asc"), limit(6)); // Order by popularity ascending (smallest first)
        const querySnapshot = await getDocs(q);

        const mangaData = querySnapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Unknown Title",
            author: data.author || "Unknown Author",
            rating: data.rating?.toString() || "0.0",
            chapter: data.chapters || 0,
            image: data.image || "/default-cover.jpg",
            status: data.status || "Ongoing",
            origin: data.origin || "JP", // Added origin field (JP/KR/CN)
          };
        });

        setMangas(mangaData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching manga data:", error);
        setLoading(false);
      }
    };

    fetchMangas();
  }, []);

  // Fungsi untuk mendeteksi ukuran layar
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fungsi untuk navigasi carousel
  const itemsPerSlide = 2;
  const totalSlides = Math.ceil(mangas.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Handle touch events for swiping
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left, go to next slide
      nextSlide();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right, go to previous slide
      prevSlide();
    }
  };

  // Auto slide untuk carousel
  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isMobile, currentSlide]);

  if (loading) {
    return (
      <div className="py-10 px-2">
        <main className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-white mb-12 tracking-wide">
            Popular Manga this Week
          </h1>
          <div className="flex justify-center">
            <div className="animate-pulse text-white">
              Loading manga data...
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Item Card Component using the same design as Latest Update
  const MangaCard = ({ manga }) => (
    <Link href={`/manga/${manga.id}`}>
      <div className="group relative bg-gradient-to-b from-gray-800/40 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:transform hover:scale-[1.03] border border-gray-700/50">
        {/* Card glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
        </div>

        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
          <Image
            src={manga.image}
            alt={manga.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            loading="lazy"
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMDIwMzAiLz48L3N2Zz4="
            onError={(e) => {
              e.target.src = "/api/placeholder/240/320";
            }}
          />

          {/* Status badge - right side (Ongoing/Completed) */}
          <div className="absolute top-2 right-2 backdrop-blur-md bg-indigo-600/60 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
            {manga.status}
          </div>

          {/* Origin status badge - left side (JP/KR/CN) */}
          <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
            {manga.origin || "JP"}
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
        </div>

        <div className="relative p-3 md:p-4">
          {/* Title */}
          <h3 className="text-base md:text-lg font-bold truncate text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
            {manga.title}
          </h3>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">Chapter {manga.chapter}</div>
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium">{manga.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="py-10 px-2">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12 tracking-wide">
          Popular Manga this Week
        </h1>

        {/* Desktop Grid (6 items per row) */}
        {!isMobile && (
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}

        {/* Mobile Carousel (2 items per slide tanpa tombol navigasi) */}
        {isMobile && (
          <div className="md:hidden relative">
            <div
              className="overflow-hidden rounded-2xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                    <div className="grid grid-cols-2 gap-3">
                      {mangas
                        .slice(
                          slideIndex * itemsPerSlide,
                          slideIndex * itemsPerSlide + itemsPerSlide
                        )
                        .map((manga) => (
                          <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Indikator Slide */}
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-purple-600 w-10"
                      : "bg-gray-600 w-6"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

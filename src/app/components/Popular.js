"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Popular() {
  const [mangas] = useState([
    {
      id: 1,
      title: "One Piece",
      author: "Eiichiro Oda",
      rating: "4.8",
      chapters: 1100,
      image: "/cover.jpg",
      genre: "Adventure",
      status: "Ongoing",
    },
    {
      id: 2,
      title: "Chainsaw Man",
      author: "Tatsuki Fujimoto",
      rating: "4.6",
      chapters: 135,
      image: "/cover1.jpg",
      genre: "Dark Fantasy",
      status: "Ongoing",
    },
    {
      id: 3,
      title: "Jujutsu Kaisen",
      author: "Gege Akutami",
      rating: "4.7",
      chapters: 250,
      image: "/cover2.jpg",
      genre: "Supernatural",
      status: "Ongoing",
    },
    {
      id: 4,
      title: "My Hero Academia",
      author: "Kohei Horikoshi",
      rating: "4.5",
      chapters: 420,
      image: "/cover.jpg",
      genre: "Superhero",
      status: "Completed",
    },
    {
      id: 5,
      title: "Demon Slayer",
      author: "Koyoharu Gotouge",
      rating: "4.9",
      chapters: 205,
      image: "/cover1.jpg",
      genre: "Dark Fantasy",
      status: "Completed",
    },
    {
      id: 6,
      title: "Hunter x Hunter",
      author: "Yoshihiro Togashi",
      rating: "4.8",
      chapters: 400,
      image: "/cover2.jpg",
      genre: "Adventure",
      status: "Hiatus",
    },
  ]);

  // State untuk carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  // Fungsi untuk menampilkan badge status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Ongoing":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500 bg-opacity-20 text-green-400 font-medium">
            Ongoing
          </span>
        );
      case "Completed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-500 bg-opacity-20 text-blue-400 font-medium">
            Completed
          </span>
        );
      case "Hiatus":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 bg-opacity-20 text-yellow-400 font-medium">
            Hiatus
          </span>
        );
      default:
        return null;
    }
  };

  // Komponen Rating Star
  const RatingStars = ({ rating }) => {
    const numRating = parseFloat(rating);
    return (
      <div className="flex items-center">
        <div className="flex mr-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star <= numRating
                  ? "text-yellow-300"
                  : star - 0.5 <= numRating
                  ? "text-yellow-300"
                  : "text-gray-400"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-white text-opacity-70">{rating}</span>
      </div>
    );
  };

  return (
    <div className=" py-10 px-2 ">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-12 tracking-wide">
          Popular Manga this Week
        </h1>

        {/* Desktop Grid (6 items per row) */}
        {!isMobile && (
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mangas.map((manga) => (
              <div
                key={manga.id}
                className="bg-gray-800 rounded-2xl overflow-hidden transition-transform hover:-translate-y-2 shadow-lg border border-gray-700 hover:border-purple-500"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={manga.image}
                    alt={manga.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(manga.status)}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <span className="inline-block px-2 py-1 rounded-md bg-purple-600 text-white text-xs mb-1">
                      {manga.genre}
                    </span>
                    <RatingStars rating={manga.rating} />
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="font-bold text-white text-lg truncate">
                    {manga.title}
                  </h2>
                  <p className="text-white text-opacity-70 text-sm mb-3">
                    by {manga.author}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-white text-opacity-90 text-sm">
                        {manga.chapters} Ch
                      </span>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-full transition-colors">
                      Read
                    </button>
                  </div>
                </div>
              </div>
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
                          <div
                            key={manga.id}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700"
                          >
                            <div className="relative aspect-[3/4]">
                              <Image
                                src={manga.image}
                                alt={manga.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                {getStatusBadge(manga.status)}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-purple-600 text-white text-xs mb-1">
                                  {manga.genre}
                                </span>
                                <RatingStars rating={manga.rating} />
                              </div>
                            </div>

                            <div className="p-3">
                              <h2 className="font-bold text-white text-sm truncate">
                                {manga.title}
                              </h2>
                              <p className="text-white text-opacity-70 text-xs mb-2">
                                by {manga.author}
                              </p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 mr-1 text-purple-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <span className="text-white text-opacity-90 text-xs">
                                    {manga.chapters}
                                  </span>
                                </div>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-0.5 rounded-full transition-colors">
                                  Read
                                </button>
                              </div>
                            </div>
                          </div>
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

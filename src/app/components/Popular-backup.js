"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function Popular() {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Fetch data from Firestore database
    useEffect(() => {
        const fetchMangas = async () => {
            try {
                const mangaRef = collection(db, "manga");
                const q = query(mangaRef, orderBy("popularity", "asc"), limit(6));
                const querySnapshot = await getDocs(q);

                const mangaData = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || "Unknown Title",
                        author: data.author || "Unknown Author",
                        rating: data.rating?.toString() || "0.0",
                        chapter: data.chapters || 0,
                        image: data.image || "/default-cover.jpg",
                        status: data.status || "Ongoing",
                        origin: data.origin || "JP",
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

    // Detect mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    const MangaCard = ({ manga }) => (
        <Link href={`/manga/${manga.id}`}>
            <div className="group relative bg-gradient-to-b from-gray-800/40 to-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:transform hover:scale-[1.03] border border-gray-700/50">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                        src={manga.image}
                        alt={manga.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        width="240"
                        height="320"
                        decoding="async"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/240x320/333/fff?text=No+Image";
                        }}
                    />

                    <div className="absolute top-2 right-2 backdrop-blur-md bg-indigo-600/60 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg">
                        {manga.status}
                    </div>

                    <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-md font-medium shadow-lg ${manga.origin === "KR"
                            ? "bg-gradient-to-r from-red-500 to-pink-600"
                            : manga.origin === "CN"
                                ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}>
                        {manga.origin || "JP"}
                    </div>
                </div>

                <div className="relative p-3 md:p-4">
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

    return (
        <div className="py-10 px-2">
            <main className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-white mb-12 tracking-wide">
                    Popular Manga this Week
                </h1>

                {/* Desktop Grid */}
                {!isMobile && (
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {mangas.map((manga) => (
                            <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                )}

                {/* Mobile Carousel */}
                {isMobile && (
                    <div className="md:hidden">
                        <div className="grid grid-cols-2 gap-3">
                            {mangas.slice(0, 4).map((manga) => (
                                <MangaCard key={manga.id} manga={manga} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
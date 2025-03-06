"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// Memoized GenreCard component with improved design
const GenreCard = memo(({ genre, index }) => {
  return (
    <div className="flex items-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group">
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800/70 mr-3 text-gray-300 text-xs font-semibold border border-gray-700/50 group-hover:bg-indigo-600/70 group-hover:text-white transition-colors">
        {index + 1}
      </div>
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gray-700/70 group-hover:border-indigo-500/30 transition-all">
        <Image
          src={genre.image}
          alt={genre.name}
          fill
          sizes="(max-width: 640px) 48px, 56px"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMDMwNDAiLz48L3N2Zz4="
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/56/56";
          }}
        />
      </div>
      <div className="ml-2 sm:ml-3 flex-1 min-w-0">
        <h3 className="font-medium text-sm sm:text-base text-white truncate group-hover:text-indigo-300 transition-colors">
          {genre.name}
        </h3>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                genre.trend === "up" ? "bg-emerald-400" : "bg-emerald-400"
              }`}
            ></span>
            <span className="text-xs text-gray-300 truncate">
              {genre.count}{" "}
              {genre.trend === "up" ? "titles (rising)" : "titles"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Ensure name appears in React DevTools
GenreCard.displayName = "GenreCard";

// Memoized TimeframeButton component with improved design
const TimeframeButton = memo(({ timeframe, activeTimeframe, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 sm:px-5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
        activeTimeframe === timeframe
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
      }`}
    >
      {timeframe}
    </button>
  );
});

TimeframeButton.displayName = "TimeframeButton";

export default function Genre() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("1 Day");
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // Function to get genre image from manga database
  const fetchGenres = useCallback(async () => {
    try {
      setIsLoading(true);

      // Object to store genres and their count
      const genreCounts = {};
      const genreImages = {};

      // Get manga data to count by genre and get images
      const mangaQuery = query(
        collection(db, "manga"),
        limit(100) // Limit number of processed manga for performance
      );

      const querySnapshot = await getDocs(mangaQuery);

      // Count manga per genre and find representative image
      querySnapshot.docs.forEach((doc) => {
        const mangaData = doc.data();
        const genres = mangaData.genre || [];
        const image = mangaData.image;

        genres.forEach((genre) => {
          // Count manga per genre
          if (genreCounts[genre]) {
            genreCounts[genre] += 1;
          } else {
            genreCounts[genre] = 1;
          }

          // Set image for genre if not yet set or update randomly
          // To ensure we get different images
          if (!genreImages[genre] || Math.random() > 0.8) {
            genreImages[genre] = image;
          }
        });
      });

      // Convert to array format for display
      const genreArray = Object.keys(genreCounts).map((name) => {
        return {
          id: name,
          name: name,
          image: genreImages[name] || "/api/placeholder/56/56",
          count: genreCounts[name].toLocaleString(),
          trend: Math.random() > 0.5 ? "up" : "down", // Simulate trend up/down
        };
      });

      // Sort by most manga count
      genreArray.sort((a, b) => {
        return (
          parseInt(b.count.replace(/,/g, "")) -
          parseInt(a.count.replace(/,/g, ""))
        );
      });

      setGenres(genreArray.slice(0, 9)); // Take top 9 genres only
    } catch (error) {
      console.error("Error fetching genres:", error);
      // Use static data as fallback if there's an error
      setGenres([
        {
          id: 1,
          name: "Action",
          image: "/api/placeholder/56/56",
          count: "10,450",
          trend: "up",
        },
        {
          id: 2,
          name: "Romance",
          image: "/api/placeholder/56/56",
          count: "5,344",
          trend: "up",
        },
        {
          id: 3,
          name: "Fantasy",
          image: "/api/placeholder/56/56",
          count: "33,457",
          trend: "down",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get genre data
    fetchGenres();

    // Detect window width to determine number of genres to display
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial window width
    handleResize();

    // Add resize event listener with throttling
    let timeout;
    const throttledResize = () => {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          handleResize();
        }, 200); // Only update every 200ms to prevent excessive rerenders
      }
    };

    window.addEventListener("resize", throttledResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", throttledResize);
      clearTimeout(timeout);
    };
  }, [fetchGenres]);

  // Determine number of genres to display based on conditions
  const displayGenres =
    showAllGenres || windowWidth >= 640 ? genres : genres.slice(0, 5);

  // Timeframe button handler with useCallback
  const handleTimeframeClick = useCallback((timeframe) => {
    setActiveTimeframe(timeframe);
    // Logic to filter data based on timeframe can be added here
  }, []);

  return (
    <div className="w-full px-2 py-4 md:p-6 bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-800/50">
      <div className="mb-4 px-2 md:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-blue-100 bg-clip-text text-transparent">
              Top Genres
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Most popular manga categories
            </p>
          </div>

          <div className="flex items-center self-start sm:self-auto gap-1 sm:gap-2 bg-gray-800/60 p-1 rounded-full">
            {["1 Day", "7 Days", "30 Days"].map((timeframe) => (
              <TimeframeButton
                key={timeframe}
                timeframe={timeframe}
                activeTimeframe={activeTimeframe}
                onClick={() => handleTimeframeClick(timeframe)}
              />
            ))}
          </div>
        </div>

        {isLoading ? (
          // Loading skeleton with improved design
          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-gray-900/80 backdrop-blur-sm border border-gray-700/50"
              >
                <div className="w-6 h-6 rounded-full bg-gray-700/70 mr-3 animate-pulse"></div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-700/70 animate-pulse"></div>
                <div className="ml-2 sm:ml-3 flex-1">
                  <div className="h-5 bg-gray-700/70 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700/70 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
              {displayGenres.map((genre, index) => (
                <GenreCard key={genre.id} genre={genre} index={index} />
              ))}
            </div>

            {windowWidth < 640 && genres.length > 5 && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => setShowAllGenres(!showAllGenres)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-5 py-2.5 rounded-full font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  {showAllGenres ? "Show Less" : "Show More Genres"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

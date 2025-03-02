// app/components/MangaGenres.js
"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function Genre() {
  const [activeTimeframe, setActiveTimeframe] = useState("1 Day");
  const [showAllGenres, setShowAllGenres] = useState(false);

  const topGenres = [
    {
      id: 1,
      name: "Action",
      image: "/cover.jpg",
      count: "10,450.00",
      trend: "up",
    },
    {
      id: 2,
      name: "Romance",
      image: "/cover1.jpg",
      count: "5344.13",
      trend: "up",
    },
    {
      id: 3,
      name: "Fantasy",
      image: "/cover2.jpg",
      count: "33457.59",
      trend: "down",
    },
    {
      id: 4,
      name: "Horror",
      image: "/cover.jpg",
      count: "19,320.00",
      trend: "up",
    },
    {
      id: 5,
      name: "Slice of Life",
      image: "/cover1.jpg",
      count: "4579.40",
      trend: "down",
    },
    {
      id: 6,
      name: "Supernatural",
      image: "/cover2.jpg",
      count: "5343.13",
      trend: "up",
    },
    {
      id: 7,
      name: "Isekai",
      image: "/cover.jpg",
      count: "13457.59",
      trend: "up",
    },
    {
      id: 8,
      name: "School",
      image: "/cover1.jpg",
      count: "3355.20",
      trend: "down",
    },
    {
      id: 9,
      name: "Comedy",
      image: "/cover2.jpg",
      count: "6890.34",
      trend: "up",
    },
  ];

  // For mobile: display limited genres initially
  // On desktop, always show all genres regardless of showAllGenres state
  const displayGenres =
    showAllGenres || window.innerWidth >= 640
      ? topGenres
      : topGenres.slice(0, 5);

  return (
    <div className="w-full px-2 py-4 md:p-6">
      <div className="mb-4 px-2 md:px-8">
        {/* Header with time filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-0">
            Top Genres
          </h2>

          {/* Time filters - more compact on mobile */}
          <div className="flex items-center self-start sm:self-auto gap-1 sm:gap-2 bg-gray-800/40 p-1 rounded-full">
            {["1 Day", "7 Days", "30 Days"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setActiveTimeframe(timeframe)}
                className={`px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded-full transition-all ${
                  activeTimeframe === timeframe
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-optimized layout for genres */}
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {displayGenres.map((genre, index) => (
            <div
              key={genre.id}
              className="flex items-center p-2 sm:p-3 rounded-xl bg-gradient-to-r from-gray-800/40 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              {/* Rank number - smaller on mobile */}
              <div className="w-5 mr-2 text-gray-400 text-sm font-medium">
                {index + 1}
              </div>

              {/* Image container - smaller on mobile */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-700/70">
                <Image
                  src={genre.image}
                  alt={genre.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/40/40";
                  }}
                />
              </div>

              {/* Genre details - more compact on mobile */}
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base text-white truncate group-hover:text-blue-300 transition-colors">
                  {genre.name}
                </h3>
                <div className="flex items-center mt-0.5">
                  {genre.trend === "up" ? (
                    <span className="text-green-400 mr-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-red-400 mr-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="text-xs text-gray-400 truncate">
                    {genre.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More / Show Less button for mobile only */}
        <div className="mt-3 sm:hidden flex justify-center">
          <button
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="bg-gradient-to-r from-indigo-600/80 to-blue-600/80 text-white text-xs px-4 py-2 rounded-lg font-medium hover:from-indigo-500 hover:to-blue-500 transition-all duration-300"
          >
            {showAllGenres ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>
    </div>
  );
}

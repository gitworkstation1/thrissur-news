"use client";
import React, { useState, Fragment } from "react";
import { Search, X, MapPin, TrendingUp } from "lucide-react";
import NewsCard from "@/components/cards/NewsCard";
import { Article } from "@/lib/types";

const quickFilters = [
  "Kodungallur",
  "Crime",
  "Irinjalakuda",
  "Sports",
  "Thrissur Town",
  "Politics",
];

export default function SearchClient({
  initialArticles,
  sidebarAd,
}: {
  initialArticles: Article[];
  sidebarAd?: React.ReactNode; 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredArticles = initialArticles.filter((article) => {
    if (article.category === "Advertisement" || article.category === "Shorts") {
      return false;
    }

    const query = activeFilter || searchQuery;
    if (!query) return true;

    const lowerQuery = query.toLowerCase();
    const matchHeadline = article.headline?.toLowerCase().includes(lowerQuery);
    const matchCategory = article.category?.toLowerCase().includes(lowerQuery);
    const matchWard = article.location?.ward?.toLowerCase().includes(lowerQuery);
    const matchLandmark = article.location?.landmark?.toLowerCase().includes(lowerQuery);

    return matchHeadline || matchCategory || matchWard || matchLandmark;
  });

  const handleClear = () => {
    setSearchQuery("");
    setActiveFilter(null);
  };

  return (
    <div className="max-w-[96%] 2xl:max-w-[1500px] mx-auto px-4 py-4 flex flex-row gap-8 justify-center items-start relative">
      
      {/* ⚡ THE ULTIMATE SCROLLBAR KILLER ⚡ */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* ================= LEFT AD COLUMN ================= */}
      <div className="hidden lg:flex w-[250px] xl:w-[300px] shrink-0 h-[calc(100dvh-120px)] overflow-y-auto hide-scrollbar flex-col gap-6 pb-12">
        {sidebarAd}
      </div>

      {/* ================= MAIN SEARCH COLUMN ================= */}
      <div className="w-full max-w-3xl flex-1 flex flex-col h-[calc(100dvh-120px)]">
        
        {/* SEARCH BAR HEAD */}
        <div className="shrink-0 z-30 bg-[#fafafa] dark:bg-[#0a0a0a] pb-2 transition-colors duration-300">
          
          <div className="relative group transition-transform duration-300 ease-out focus-within:scale-[1.02]">
            <div className="relative flex items-center bg-white dark:bg-[#111] border-2 border-black dark:border-gray-500 focus-within:border-[#e3000f] dark:focus-within:border-[#e3000f] rounded-full shadow-sm focus-within:shadow-md focus-within:ring-4 focus-within:ring-[#e3000f]/10 dark:focus-within:ring-[#e3000f]/20 transition-all duration-300 p-1.5 overflow-hidden">
              
              <div className="flex items-center justify-center pl-4 pr-2 text-gray-400 group-focus-within:text-[#e3000f] transition-colors duration-300">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <input
                type="text"
                placeholder="Search news, locations, or topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveFilter(null);
                }}
                className="w-full bg-transparent text-gray-900 dark:text-white text-base sm:text-lg font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none px-2 py-2.5"
              />

              {(searchQuery || activeFilter) && (
                <button
                  onClick={handleClear}
                  className="mr-2 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* QUICK FILTERS */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap mt-6 pb-2 hide-scrollbar">
            <TrendingUp className="w-4 h-4 text-[#e3000f] dark:text-red-500 flex-shrink-0 mr-1" />
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(activeFilter === filter ? null : filter);
                  setSearchQuery("");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-[#e3000f] text-white border-[#e3000f] dark:bg-red-600 dark:border-red-600 shadow-md scale-105"
                    : "bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH RESULTS */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-2 sm:px-4 pb-32">
          
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#fafafa] dark:bg-[#0a0a0a] z-10 py-2">
            <h2 className="text-sm font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
              {searchQuery || activeFilter
                ? "Search Results"
                : "Recent Articles"}
            </h2>
            <span className="text-xs font-bold text-red-800 dark:text-red-100 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-700 shadow-sm transition-colors duration-300">
              {filteredArticles.length} found
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="space-y-3">
              {filteredArticles.map((article, index) => (
                <Fragment key={article._id}>
                  {/* 1. Render the actual News Card */}
                  <NewsCard article={article} />
                  
                  {/* ⚡ 2. IN-FEED MOBILE AD: Shows up after EVERY 4th card (index 3, 7, 11, etc.) ⚡ */}
                  {(index + 1) % 4 === 0 && (
                    <div className="flex lg:hidden w-full justify-center my-4 overflow-hidden rounded-2xl shadow-sm border border-red-500/30">
                      {sidebarAd}
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 transition-colors duration-300">
                <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">
                No results found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] transition-colors duration-300">
                We couldn't find any news matching "
                {searchQuery || activeFilter}". Try searching for a different
                ward or topic.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT AD COLUMN ================= */}
      <div className="hidden lg:flex w-[250px] xl:w-[300px] shrink-0 h-[calc(100dvh-120px)] overflow-y-auto hide-scrollbar flex-col gap-6 pb-12">
        {sidebarAd}
      </div>
      
    </div>
  );
}
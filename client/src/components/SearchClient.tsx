"use client";
import React, { useState } from "react";
import { Search, X, MapPin, TrendingUp } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { Article } from "@/lib/types";

// ================= DESKTOP SIDEBAR AD =================
const SidebarAd = () => (
  <div className="w-full h-[600px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-2">
      Advertisement
    </span>
    <p className="text-xs text-gray-400 dark:text-gray-600 font-medium">
      Premium Ad Space<br />(300 x 600)
    </p>
  </div>
);

// ================= MOBILE IN-FEED AD =================
const MobileInlineAd = () => (
  // Notice the lg:hidden -> it disappears on desktop where the sidebars take over!
  <div className="w-full h-[120px] lg:hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50 flex flex-col items-center justify-center p-4 text-center my-4 transition-colors duration-300">
    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">
      Advertisement
    </span>
    <p className="text-xs text-gray-400 dark:text-gray-600 font-medium">
      Sponsored Content
    </p>
  </div>
);

const quickFilters = ["Kodungallur", "Crime", "Irinjalakuda", "Sports", "Thrissur Town", "Politics"];

export default function SearchClient({ initialArticles }: { initialArticles: Article[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredArticles = initialArticles.filter((article) => {
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
    <div className="max-w-[96%] 2xl:max-w-[1500px] mx-auto px-4 py-6 flex flex-row gap-8 justify-center items-start relative">
      
      {/* ================= LEFT AD COLUMN ================= */}
      <div className="hidden lg:flex w-[250px] xl:w-[300px] shrink-0 sticky top-24 flex-col gap-6">
        <SidebarAd />
      </div>

      {/* ================= MAIN SEARCH COLUMN ================= */}
      <div className="w-full max-w-3xl flex-1">
        
        {/* SEARCH BAR */}
        <div className="sticky top-[72px] z-40 bg-white dark:bg-[#111] pb-4 pt-2 transition-colors duration-300">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#e3000f] dark:group-focus-within:text-red-500 transition-colors" />
            
            <input
              type="text"
              placeholder="Search news, locations, or topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveFilter(null);
              }}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white border border-transparent focus:border-red-200 dark:focus:border-red-900/50 rounded-2xl py-3.5 pl-12 pr-10 outline-none focus:ring-4 focus:ring-red-50 dark:focus:ring-red-900/20 transition-all shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
            />

            {(searchQuery || activeFilter) && (
              <button 
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* QUICK FILTERS */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap mt-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    ? "bg-[#e3000f] text-white border-[#e3000f] dark:bg-red-600 dark:border-red-600 shadow-md"
                    : "bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH RESULTS */}
        <div className="mt-2 mb-8 min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
              {searchQuery || activeFilter ? "Search Results" : "Recent Articles"}
            </h2>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md transition-colors duration-300">
              {filteredArticles.length} found
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="space-y-3">
              {filteredArticles.map((article, index) => (
                <React.Fragment key={article._id}>
                  {/* INJECT MOBILE AD EVERY 4th ARTICLE */}
                  {index > 0 && index % 4 === 0 && <MobileInlineAd />}
                  
                  <NewsCard article={article} />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 transition-colors duration-300">
                <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">No results found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] transition-colors duration-300">
                We couldn't find any news matching "{searchQuery || activeFilter}". Try searching for a different ward or topic.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ================= RIGHT AD COLUMN ================= */}
      <div className="hidden lg:flex w-[250px] xl:w-[300px] shrink-0 sticky top-24 flex-col gap-6">
        <SidebarAd />
      </div>

    </div>
  );
}
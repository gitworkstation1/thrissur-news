"use client";
import { useState } from "react";
import { Search, X, MapPin, TrendingUp } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { Article } from "@/lib/types";

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* ================= SEARCH BAR ================= */}
      {/* FIXED: Changed dark:bg-gray-900 to dark:bg-[#111] to remove the blue box */}
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

        {/* ================= QUICK FILTERS ================= */}
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

      {/* ================= SEARCH RESULTS ================= */}
      <div className="mt-2 mb-8">
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
            {filteredArticles.map((article) => (
              <NewsCard key={article._id} article={article} />
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
  );
}
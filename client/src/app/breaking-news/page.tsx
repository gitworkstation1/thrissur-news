"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // <-- NEW: Next.js Image component
import { fetchArticles } from "@/lib/api";
import { Loader2, Calendar, MapPin, Filter } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryMenu from "@/components/layout/CategoryMenu";

const THRISSUR_WARDS = [
  "All Places", "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad"
];

const CATEGORIES = ["All", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"];

export default function BreakingNewsHub() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWard, setSelectedWard] = useState("All Places");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadBreakingNews = async () => {
      setIsLoading(true);
      try {
        // Fetch using our new parameters: isBreaking = true, plus the selected date
        const response = await fetchArticles(
          selectedCategory, 
          "", 
          1, 
          50, 
          "published", 
          selectedWard, 
          true, // isBreaking = true
          selectedDate // passed as YYYY-MM-DD
        );
        setArticles(response.articles || []);
      } catch (error) {
        console.error("Failed to load breaking news", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreakingNews();
  }, [selectedDate, selectedWard, selectedCategory]); // Re-fetch when filters change

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      <Navbar />
      <CategoryMenu />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3000f] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#e3000f]"></span>
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-wide">
              Breaking News Hub
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Live updates and major headlines across Thrissur.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="flex items-center gap-2 w-full md:w-auto text-gray-600 dark:text-gray-300">
            <Calendar className="w-5 h-5 text-[#e3000f]" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#e3000f] w-full md:w-auto"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto text-gray-600 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-[#e3000f]" />
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#e3000f] w-full md:w-auto cursor-pointer"
            >
              {THRISSUR_WARDS.map(ward => <option key={ward} value={ward}>{ward}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto text-gray-600 dark:text-gray-300">
            <Filter className="w-5 h-5 text-[#e3000f]" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#e3000f] w-full md:w-auto cursor-pointer"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedDate || selectedWard !== "All Places" || selectedCategory !== "All") && (
            <button 
              onClick={() => { setSelectedDate(""); setSelectedWard("All Places"); setSelectedCategory("All"); }}
              className="text-xs font-bold text-gray-500 hover:text-[#e3000f] underline uppercase tracking-wider whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#e3000f]" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl border-dashed">
            <span className="text-4xl mb-4">📭</span>
            <p className="font-medium text-lg text-gray-600 dark:text-gray-300">No breaking news found for these filters.</p>
            <p className="text-sm mt-1">Try adjusting the date, location, or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link 
                href={`/full-coverage/${article._id}`} 
                key={article._id}
                className="group flex flex-col bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image 
                    src={article.media?.[0]?.url || "https://picsum.photos/400/250"} 
                    alt={article.headline} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#e3000f] text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-md">
                    Breaking
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[#e3000f] text-[10px] font-black uppercase tracking-widest mb-2 border-[#e3000f] inline-block">
                    {article.category} {article.location?.ward && `• ${article.location.ward}`}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-[#e3000f] transition-colors line-clamp-3">
                    {article.headline}
                  </h2>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400">
                    {formatDate(article.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
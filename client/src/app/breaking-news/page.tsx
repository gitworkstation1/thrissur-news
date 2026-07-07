"use client";

import { useState, useEffect, Suspense, useRef } from "react"; 
import Link from "next/link";
import Image from "next/image";
import { fetchArticles } from "@/lib/api";
import { Loader2, Calendar, MapPin, Filter, ChevronDown, X, Check, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Custom Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<"location" | "category" | "date" | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Custom Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadBreakingNews = async () => {
      setIsLoading(true);
      try {
        const response = await fetchArticles(
          selectedCategory, 
          "", 
          1, 
          50, 
          "published", 
          selectedWard, 
          true, 
          selectedDate 
        );
        setArticles(response.articles || []);
      } catch (error) {
        console.error("Failed to load breaking news", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreakingNews();
  }, [selectedDate, selectedWard, selectedCategory]); 

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getDisplayDate = () => {
    if (!selectedDate) return "Anytime";
    return new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD for the API
    const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    setSelectedDate(formatted);
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
        .dark .custom-scroll::-webkit-scrollbar-thumb { background: #333; }
      `}} />

      <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-50 dark:bg-gray-800"></div>}>
        <CategoryMenu />
      </Suspense>

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

        {/* CUSTOM PREMIUM FILTER TOOLBAR */}
        <div 
          ref={filterRef}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-1.5 rounded-2xl md:rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-10 flex flex-col md:flex-row items-stretch justify-between relative max-w-5xl mx-auto z-40"
        >
          
          {/* 1. Custom Date Filter */}
          <div className="relative w-full md:flex-1">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "date" ? null : "date")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl md:rounded-full transition-all group outline-none"
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-[#e3000f] group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1 text-left relative pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Date</span>
                <span className={`text-sm font-bold truncate pr-6 transition-colors ${activeDropdown === "date" || selectedDate ? "text-[#e3000f]" : "text-gray-900 dark:text-white"}`}>
                  {getDisplayDate()}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-0 bottom-0 transition-transform duration-300 ${activeDropdown === "date" ? "rotate-180 text-[#e3000f]" : ""}`} />
              </div>
            </button>

            {/* CUSTOM CALENDAR DROPDOWN */}
            {activeDropdown === "date" && (
              <div className="absolute top-[calc(100%+8px)] left-0 md:left-4 w-[280px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-black text-gray-900 dark:text-white tracking-wide">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </span>
                  <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before 1st of month */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {/* Actual days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const currentDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    const isSelected = selectedDate === currentDateStr;
                    const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber).toDateString();
                    
                    return (
                      <button
                        key={dayNumber}
                        onClick={() => handleDateSelect(dayNumber)}
                        className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200
                          ${isSelected 
                            ? 'bg-[#e3000f] text-white shadow-md scale-105' 
                            : isToday
                              ? 'text-[#e3000f] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {dayNumber}
                      </button>
                    );
                  })}
                </div>
                
                {/* Clear Date Action */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                  <button 
                    onClick={() => { setSelectedDate(""); setActiveDropdown(null); }}
                    className="text-xs font-bold text-gray-500 hover:text-[#e3000f] uppercase tracking-widest transition-colors"
                  >
                    Clear Date
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800 my-2"></div>

          {/* 2. Custom Location Filter */}
          <div className="relative w-full md:flex-1">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl md:rounded-full transition-all group outline-none"
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-[#e3000f] group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1 text-left relative pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Location</span>
                <span className={`text-sm font-bold truncate pr-6 transition-colors ${activeDropdown === "location" || selectedWard !== "All Places" ? "text-[#e3000f]" : "text-gray-900 dark:text-white"}`}>
                  {selectedWard}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-0 bottom-0 transition-transform duration-300 ${activeDropdown === "location" ? "rotate-180 text-[#e3000f]" : ""}`} />
              </div>
            </button>

            {/* Location Dropdown Menu */}
            {activeDropdown === "location" && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-[280px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto custom-scroll animate-in fade-in slide-in-from-top-2 duration-200">
                {THRISSUR_WARDS.map(ward => (
                  <button
                    key={ward}
                    onClick={() => { setSelectedWard(ward); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-colors outline-none
                      ${selectedWard === ward 
                        ? 'bg-red-50 dark:bg-red-900/20 text-[#e3000f]' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span>{ward}</span>
                    {selectedWard === ward && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800 my-2"></div>

          {/* 3. Custom Category Filter */}
          <div className="relative w-full md:flex-1">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl md:rounded-full transition-all group outline-none"
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-[#e3000f] group-hover:scale-110 transition-transform">
                <Filter className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1 text-left relative pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Category</span>
                <span className={`text-sm font-bold truncate pr-6 transition-colors ${activeDropdown === "category" || selectedCategory !== "All" ? "text-[#e3000f]" : "text-gray-900 dark:text-white"}`}>
                  {selectedCategory}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-0 bottom-0 transition-transform duration-300 ${activeDropdown === "category" ? "rotate-180 text-[#e3000f]" : ""}`} />
              </div>
            </button>

            {/* Category Dropdown Menu */}
            {activeDropdown === "category" && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-full md:w-[240px] bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-colors outline-none
                      ${selectedCategory === cat 
                        ? 'bg-red-50 dark:bg-red-900/20 text-[#e3000f]' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Button */}
          {(selectedDate || selectedWard !== "All Places" || selectedCategory !== "All") && (
            <div className="px-2 py-2 md:py-0 flex items-center justify-center border-t md:border-t-0 border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => { setSelectedDate(""); setSelectedWard("All Places"); setSelectedCategory("All"); setActiveDropdown(null); }}
                className="flex items-center justify-center w-full md:w-12 md:h-12 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-[#e3000f] rounded-xl md:rounded-full transition-colors group p-3 md:p-0"
                title="Clear Filters"
              >
                <span className="md:hidden text-xs font-bold uppercase tracking-widest mr-2">Clear Filters</span>
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#e3000f]" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-3xl border-dashed">
            <span className="text-5xl mb-4 opacity-50 text-gray-300 dark:text-gray-700">📭</span>
            <p className="font-bold text-xl text-gray-800 dark:text-gray-200">No breaking news found</p>
            <p className="text-sm mt-2 text-gray-500">Try adjusting the date, location, or category.</p>
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
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[#e3000f] text-[10px] font-black uppercase tracking-widest mb-2">
                    {article.category} • {article.location?.ward || 'General'}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-3 line-clamp-3">
                    {article.headline}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>{formatDate(article.createdAt)}</span>
                    <span className="text-[#e3000f] font-bold group-hover:underline">Read Full Story →</span>
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
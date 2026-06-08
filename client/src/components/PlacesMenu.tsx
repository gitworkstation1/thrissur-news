"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The exact wards from your MongoDB model
const THRISSUR_WARDS = [
  "All Places",
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad"
];

export default function PlacesMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWard = searchParams.get("ward") || "All Places";
  const currentCategory = searchParams.get("category");

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (distance: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  const handleSelect = (ward: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (ward === "All Places") {
      params.delete("ward");
    } else {
      params.set("ward", ward);
    }

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full mb-6">
      
      {/* BULLETPROOF SCROLLBAR HIDING */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
          Local Updates
        </h2>
      </div>

      <div className="relative w-full group/track">
        
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll(-250)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                     bg-white/95 dark:bg-black/90 backdrop-blur-sm 
                     p-2 rounded-full shadow-lg 
                     text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white
                     transition-all duration-300 opacity-0 md:group-hover/track:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* The Scrollable Track - Scrollbar hidden completely */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing snap-x snap-mandatory px-2 md:px-10 hide-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {THRISSUR_WARDS.map((ward) => {
            const isActive = currentWard === ward;
            return (
              <button
                key={ward}
                onClick={() => handleSelect(ward)}
                className={`snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm ${
                  isActive 
                    ? "bg-black text-white dark:bg-white dark:text-black scale-105" 
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 dark:bg-[#111] dark:border-gray-800 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {ward}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll(250)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                     bg-white/95 dark:bg-black/90 backdrop-blur-sm 
                     p-2 rounded-full shadow-lg 
                     text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white
                     transition-all duration-300 opacity-0 md:group-hover/track:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
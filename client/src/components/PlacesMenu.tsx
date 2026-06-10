"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const PLACES = ["All Places", "Thrissur Central", "East Fort", "Viyyur", "Ollur", "Cheruthuruthy", "Kodungallur"];

export default function PlacesMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedPlace = searchParams.get("ward") || "All Places";

  const handleSelect = (place: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (place === "All Places") {
      params.delete("ward");
    } else {
      params.set("ward", place);
    }
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between border-b-[3px] border-[#e3000f] pb-1.5">
        <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase">
          Local Updates
        </h2>

        {/* Inline Selector Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#e3000f] transition-colors bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-full"
        >
          <span className="truncate max-w-[120px]">{selectedPlace}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {PLACES.map((place) => (
            <button
              key={place}
              onClick={() => handleSelect(place)}
              className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 ${
                selectedPlace === place ? "text-[#e3000f] font-bold" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {place}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
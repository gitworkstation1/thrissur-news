"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Layers } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const categories = [
  "News", "Crime", "Politics", "Sports", "Business", 
  "Entertainment", "Technology", "Health", "Education",
  "Automotive", "Real Estate", "Lifestyle", "Obituary"
];

export default function CategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Smart active state: Check if we are on the dedicated obituary route, 
  // otherwise look for the category search parameter, defaulting to News.
  let selectedCategory = searchParams.get("category") || "News"; 
  if (pathname === "/obituary") {
    selectedCategory = "Obituary";
  }

  const handleCategoryClick = (cat: string) => {
    if (cat === "News") {
      router.push("/"); 
    } else if (cat === "Obituary") {
      // Route specifically to our custom dedicated page
      router.push("/obituary");
    } else {
      router.push(`/?category=${cat}`);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      if (window.scrollY > 60) setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    // FIXED: Changed z-40 to z-[70] to ensure the entire category bar sits above page content
    <div className={`w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800/60 sticky top-14 z-[999] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      isScrolled ? '-translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
    }`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}} />

      <div className="w-full px-4 h-12 flex items-center justify-between">

        <div 
          className="flex-1 flex items-center gap-6 overflow-x-auto pr-4 hide-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`whitespace-nowrap text-[11px] font-black tracking-widest uppercase transition-colors outline-none
                ${selectedCategory === cat 
                  ? 'text-[#e3000f]' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-100'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0 pl-3 border-l border-gray-200 dark:border-gray-700 ml-1" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none group"
            aria-label="More categories"
          >
            <ChevronDown 
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isOpen ? 'rotate-180 text-[#e3000f]' : ''
              }`} 
            />
          </button>

          {isOpen && (
            // FIXED: Changed z-50 to z-[100] so the dropdown escapes its parent boundaries and floats above everything
<div className="absolute top-[calc(100%+10px)] right-0 w-56 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-200/60 dark:border-gray-700/50 overflow-hidden py-2 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">              
              <div className="px-4 py-2 mb-1 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">All Categories</span>
              </div>

              <div 
                className="max-h-[60vh] overflow-y-auto hide-scroll"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors outline-none
                      ${selectedCategory === cat 
                        ? 'text-[#e3000f] bg-red-50 dark:bg-red-900/10' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                      }
                    `}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
              
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
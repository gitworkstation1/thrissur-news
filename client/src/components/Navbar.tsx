"use client";
import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { Menu, MapPin, User, Check, Moon, Sun, Search, PlaySquare, Home } from "lucide-react"; 
import Link from "next/link";
import { usePathname } from "next/navigation";

const places = [
  "All", "Irinjalakuda", "Kodungallur", "Chalakudy", "Guruvayur",
  "Wadakkanchery", "Kunnamkulam", "Ollur", "Thrissur Town",
  "Mala", "Chavakkad", "Puthukkad", "Anthikad",
];

export default function Navbar() {
  const pathname = usePathname();
  const [showLocations, setShowLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All"); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocations(false);
      }
    }
    if (showLocations) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showLocations]);

  const toggleTheme = (event: React.MouseEvent) => {
    const willBeDark = !isDarkMode;
    if (!document.startViewTransition) {
      setIsDarkMode(willBeDark);
      localStorage.setItem('theme', willBeDark ? 'dark' : 'light'); 
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(willBeDark);
        localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
      });
    });
    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate({ clipPath }, { duration: 600, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" });
    });
  };

  if (pathname === "/shorts") return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm dark:bg-[#111] dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        
        <div className="flex items-center gap-4">
          <button className="text-[#002244] dark:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors md:hidden" aria-label="Menu">
            <Menu className="h-7 w-7" />
          </button>
          
          <Link href="/" className="text-2xl font-black tracking-tighter">
            <span className="text-black dark:text-white transition-colors duration-300">Thrissur</span>
            <span className="text-[#e3000f]">News</span>
          </Link>
        </div>

        {/* DESKTOP LINKS: Restored #e3000f for active states */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wide">
          <Link href="/" className={`flex items-center gap-1.5 transition-colors ${pathname === '/' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/search" className={`flex items-center gap-1.5 transition-colors ${pathname === '/search' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
            <Search className="w-4 h-4" /> Search
          </Link>
          <Link href="/shorts" className={`flex items-center gap-1.5 transition-colors ${pathname === '/shorts' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
            <PlaySquare className="w-4 h-4" /> Shorts
          </Link>
        </div>

        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowLocations(!showLocations)} 
            className={`flex flex-col items-center justify-center w-[64px] py-1 rounded-lg transition-colors ${showLocations ? 'bg-red-50 text-[#e3000f] dark:bg-red-900/30' : 'text-[#002244] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <MapPin className="h-5 w-5 mb-0.5" />
            <span className="text-[8px] font-extrabold tracking-wider uppercase w-full text-center truncate px-1">
              {selectedLocation}
            </span>
          </button>

          <button onClick={toggleTheme} className="text-[#002244] dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="text-[#002244] dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors hidden sm:block">
            <User className="h-6 w-6" />
          </Link>
          
          {showLocations && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[70vh] overflow-y-auto z-50">
              <div className="bg-gray-50 dark:bg-[#111] px-4 py-2 border-b border-gray-100 dark:border-gray-800 sticky top-0">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Region</span>
              </div>
              <div className="flex flex-col">
                {places.map((place) => (
                  <button 
                    key={place} 
                    onClick={() => { setSelectedLocation(place); setShowLocations(false); }}
                    className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-50 dark:border-gray-800/50 last:border-none transition-colors outline-none
                      ${selectedLocation === place ? 'bg-red-50 text-[#e3000f] dark:bg-red-900/20' : 'hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-[#2b3582] dark:hover:text-blue-400 text-gray-700 dark:text-gray-200'}`}
                  >
                    <span>{place}</span>
                    {selectedLocation === place && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
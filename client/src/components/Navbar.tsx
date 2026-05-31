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
  
  // NEW: State to track if the user has scrolled
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener for the morphing pill effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // KEPT: The exact circular expanding animation from your provided code
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
    <header className="sticky top-0 z-50 w-full h-14">
      
      {/* MORPHING BACKGROUND: Slides up and fades out when scrolled */}
      <div className={`absolute inset-0 w-full h-full bg-white/90 backdrop-blur-lg border-b border-gray-200/60 shadow-sm dark:bg-[#111]/90 dark:border-gray-800 transition-all duration-500 ease-in-out origin-top ${
        isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`} />

      <div className="max-w-7xl mx-auto h-full relative">
        
        {/* LEFT CONTENT (Logo & Links): Slides up and fades away when scrolled */}
        <div className={`flex items-center justify-between h-full px-4 pr-44 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isScrolled ? '-translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}>
          
          <div className="flex items-center gap-4">
            <button className="text-[#002244] dark:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors md:hidden" aria-label="Menu">
              <Menu className="h-7 w-7" />
            </button>
            
            <Link href="/" className="text-2xl font-black tracking-tighter">
              <span className="text-black dark:text-white transition-colors duration-300">Integrity</span>
              <span className="text-[#e3000f]">News</span>
            </Link>
          </div>

          {/* DESKTOP LINKS */}
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
        </div>

        {/* RIGHT CONTENT (The Morphing Pill): Turns into a glassy floating island when scrolled */}
        <div 
          ref={dropdownRef}
          className={`absolute right-4 flex items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 ${
            isScrolled 
              ? 'top-4 gap-0.5 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-full px-1.5 py-1' 
              : 'top-1/2 -translate-y-1/2 gap-2 bg-transparent border-transparent px-0 py-0 shadow-none'
          }`}
        >
          <button 
            onClick={() => setShowLocations(!showLocations)} 
            className={`flex flex-col items-center justify-center w-[64px] py-1 transition-colors ${
              isScrolled ? 'rounded-full' : 'rounded-lg'
            } ${showLocations ? 'bg-red-50 text-[#e3000f] dark:bg-red-900/30' : 'text-[#002244] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <MapPin className="h-5 w-5 mb-0.5" />
            <span className="text-[8px] font-extrabold tracking-wider uppercase w-full text-center truncate px-1">
              {selectedLocation}
            </span>
          </button>

          <button onClick={toggleTheme} className="text-[#002244] dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* USER ICON: Shrinks and disappears when scrolled into a pill */}
          <Link href="/dashboard" className={`text-[#002244] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-400 hidden sm:flex items-center justify-center overflow-hidden ${
            isScrolled ? 'w-0 h-0 opacity-0 scale-0 p-0 m-0' : 'w-9 h-9 opacity-100 scale-100 p-1.5 ml-1'
          }`}>
            <User className="h-6 w-6 flex-shrink-0" />
          </Link>
          
          {showLocations && (
            <div className="absolute top-[calc(100%+12px)] right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[70vh] overflow-y-auto z-50">
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
"use client";
import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { 
  MapPin, User, Check, Moon, Sun, Search, PlaySquare, Home, Bookmark, X, 
  ChevronDown, ChevronRight 
} from "lucide-react"; 
import Link from "next/link";
import Image from "next/image"; 
import { usePathname } from "next/navigation";
import LiquidGlassButton from "@/components/ui/LiquidGlassButton"; // <-- IMPORTED HERE

export default function Navbar() {
  const pathname = usePathname();
  const [showLocations, setShowLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Regions"); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ⚡ NEW: Live Database States
  const [regionData, setRegionData] = useState<any[]>([]);
  const [expandedState, setExpandedState] = useState<string>("");
  const [expandedDistrict, setExpandedDistrict] = useState<string>("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ⚡ NEW: Fetch Regions from your backend on Load
  // ⚡ FETCH REGIONS ON LOAD (BULLETPROOF VERSION)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        // 1. Clean the URL
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

        const res = await fetch(`${baseUrl}/api/regions`);
        
        if (!res.ok) throw new Error("Failed to fetch regions");
        const data = await res.json();
        
        // 2. Prevent the .map() crash
        if (data && Array.isArray(data) && data.length > 0) {
          setRegionData(data);
          
          setExpandedState(data[0].state);
          if (data[0].districts && data[0].districts.length > 0) {
            setExpandedDistrict(data[0].districts[0].name);
            if (selectedLocation === "All Regions" && data[0].districts[0].locals[0]) {
              setSelectedLocation(data[0].districts[0].locals[0]);
            }
          }
        }
      } catch (error) {
        console.error("Navbar region fetch bypassed safely:", error);
        // Fallback so the UI never breaks
        setRegionData([{ state: "Kerala", districts: [{ name: "Thrissur", locals: ["Irinjalakuda"] }] }]);
      }
    };
    fetchRegions();
  }, [selectedLocation]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

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
    <>
      {/* --- SIDE DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ease-out ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Drawer Container */}
      <div className={`fixed top-0 left-0 h-full w-[85vw] sm:w-[320px] max-w-[400px] bg-white dark:bg-[#111] z-[101] shadow-[30px_0_60px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100 dark:border-gray-800/60">
          <span className="font-black tracking-tighter text-lg text-black dark:text-white">
            Fides<span className="text-[#e3000f]">Menu</span>
          </span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-all duration-500 transform ${
              isMobileMenuOpen ? "rotate-0 opacity-100 delay-300" : "-rotate-90 opacity-0"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col p-3 gap-1.5 overflow-y-auto overflow-x-hidden">
          <Link 
            href="/saved" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-[#e3000f] hover:bg-red-100 dark:hover:bg-red-900/20 group mb-2 transition-all duration-500 transform ${
              isMobileMenuOpen ? "translate-x-0 opacity-100 delay-100" : "-translate-x-8 opacity-0"
            }`}
          >
            <Bookmark className="w-5 h-5 fill-current opacity-80 group-hover:opacity-100 transition-opacity" /> 
            <span className="font-bold text-sm tracking-wide">Saved News</span>
          </Link>

          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 text-[#002244] dark:text-gray-200 font-semibold text-sm transition-all duration-500 transform ${
              isMobileMenuOpen ? "translate-x-0 opacity-100 delay-150" : "-translate-x-8 opacity-0"
            }`}
          >
            <Home className="w-5 h-5 text-gray-400" /> Home
          </Link>
          
          <Link 
            href="/search" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 text-[#002244] dark:text-gray-200 font-semibold text-sm transition-all duration-500 transform ${
              isMobileMenuOpen ? "translate-x-0 opacity-100 delay-200" : "-translate-x-8 opacity-0"
            }`}
          >
            <Search className="w-5 h-5 text-gray-400" /> Search
          </Link>

          <Link 
            href="/shorts" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 text-[#002244] dark:text-gray-200 font-semibold text-sm transition-all duration-500 transform ${
              isMobileMenuOpen ? "translate-x-0 opacity-100 delay-[250ms]" : "-translate-x-8 opacity-0"
            }`}
          >
            <PlaySquare className="w-5 h-5 text-gray-400" /> Shorts
          </Link>
          
          <div className={`w-full h-px bg-gray-100 dark:bg-gray-800/60 my-2 transition-all duration-700 transform ${
            isMobileMenuOpen ? "scale-x-100 opacity-100 delay-300" : "scale-x-0 opacity-0"
          }`} />
          
          <Link 
            href="/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 text-[#002244] dark:text-gray-200 font-semibold text-sm transition-all duration-500 transform ${
              isMobileMenuOpen ? "translate-x-0 opacity-100 delay-[350ms]" : "-translate-x-8 opacity-0"
            }`}
          >
            <User className="w-5 h-5 text-gray-400" /> My Profile
          </Link>
        </div>
      </div>
      {/* --- END DRAWER --- */}

      <header className="sticky top-0 z-50 w-full h-14">
        
        {/* SOLID BACKGROUND */}
        <div className={`absolute inset-0 w-full h-full bg-white border-b border-gray-200 shadow-sm dark:bg-[#111] dark:border-gray-800 transition-all duration-500 ease-in-out origin-top ${
          isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`} />

        <div className="w-full h-full relative flex items-center px-4">
          
          {/* 1. LEFT: LOGO AS MENU TOGGLE */}
          <div className="h-full flex items-center relative z-20">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`h-full flex items-center transition-all duration-500 outline-none group ${
                isScrolled ? '-translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
              }`}
              aria-label="Open Menu"
            >
              <Image 
                src="/fides-logo.png" 
                alt="Fides Menu" 
                width={120} 
                height={56}
                className="h-full w-auto object-contain transform transition-all duration-300 origin-left group-hover:scale-105 group-active:scale-95" 
                priority 
              />
            </button>
          </div>
          
          {/* 2. CENTER: PERMANENTLY CENTERED TEXT */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 z-10 ${
            isScrolled ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
            <Link 
              href="/" 
              className="pointer-events-auto text-xl md:text-2xl font-black tracking-tighter whitespace-nowrap"
            >
              <span className="text-black dark:text-white transition-colors duration-300">Fides</span>
              <span className="text-[#e3000f]">News</span>
            </Link>
          </div>

          {/* 3. RIGHT: ICON GROUP */}
          <div className="ml-auto flex items-center gap-4 xl:gap-6 relative z-20">
            
            {/* Nav Links */}
            <div className={`hidden md:flex items-center gap-4 xl:gap-6 font-bold text-sm tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isScrolled ? '-translate-y-8 opacity-0 pointer-events-none scale-95' : 'translate-y-0 opacity-100 scale-100'
            }`}>
              <Link href="/" className={`flex items-center gap-1.5 p-1 transition-colors ${pathname === '/' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                <Home className="w-5 h-5 xl:w-4 xl:h-4" /> 
                <span className="hidden xl:block">Home</span>
              </Link>
              <Link href="/search" className={`flex items-center gap-1.5 p-1 transition-colors ${pathname === '/search' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                <Search className="w-5 h-5 xl:w-4 xl:h-4" /> 
                <span className="hidden xl:block">Search</span>
              </Link>
              <Link href="/shorts" className={`flex items-center gap-1.5 p-1 transition-colors ${pathname === '/shorts' ? 'text-[#e3000f]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                <PlaySquare className="w-5 h-5 xl:w-4 xl:h-4" /> 
                <span className="hidden xl:block">Shorts</span>
              </Link>
            </div>

            {/* SOLID MENU PILL & ANIMATED THEME SWITCHER */}
            <div 
              ref={dropdownRef}
              className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 ${
                isScrolled 
                  ? 'absolute top-1 right-4 gap-0.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-full px-1.5 py-1' 
                  : 'relative gap-4 xl:gap-6 bg-transparent border-transparent px-0 py-0 shadow-none'
              }`}
            >
              {/* LIQUID GLASS: Location Button */}
              <LiquidGlassButton 
                onClick={() => setShowLocations(!showLocations)} 
                className={`flex flex-col items-center justify-center w-[48px] sm:w-[64px] py-1 transition-colors relative z-50 ${
                  isScrolled ? 'rounded-full' : 'rounded-lg'
                } ${showLocations 
                  ? 'text-[#e3000f]' 
                  : 'text-[#002244] dark:text-gray-200'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]' 
                  : 'text-[#002244] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <MapPin className="h-5 w-5 mb-0.5" />
                <span className="text-[8px] font-extrabold tracking-wider uppercase w-full text-center truncate px-1">
                  {selectedLocation}
                </span>
              </LiquidGlassButton>

              {/* LIQUID GLASS: Animated Theme Button */}
              <LiquidGlassButton 
                onClick={toggleTheme} 
                aria-label="Toggle Theme"
                className={`relative z-10 w-8 h-8 flex items-center justify-center overflow-hidden rounded-full transition-colors text-[#002244] dark:text-gray-200`}
              >
                <Sun 
                  className={`absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isDarkMode ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                  }`} 
                />
                <Moon 
                  className={`absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isDarkMode ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`} 
                />
              </LiquidGlassButton>

              <Link href="/dashboard" className={`text-[#002244] dark:text-gray-200 rounded-full transition-all duration-400 hidden sm:flex items-center justify-center overflow-hidden ${
                isScrolled 
                  ? 'w-0 h-0 opacity-0 scale-0 p-0 m-0' 
                  : 'w-9 h-9 opacity-100 scale-100 p-1.5 ml-1 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                <User className="h-6 w-6 flex-shrink-0" />
              </Link>
              
              {/* FOOLPROOF MOBILE OVERLAY */}
              <div 
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                  showLocations ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLocations(false);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setShowLocations(false);
                }}
              />
              
              {/* DRILL-DOWN HIERARCHICAL DROPDOWN CONTAINER */}
              <div 
                className={`absolute top-[calc(100%+12px)] right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[75vh] overflow-y-auto z-50 origin-top-right transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] custom-scrollbar ${
                  showLocations ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-75 -translate-y-4 pointer-events-none"
                }`}
              >
                <div className="bg-gray-50 dark:bg-[#111] px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-10 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Region</span>
                </div>
                
                <div className="flex flex-col relative z-0">
                  {/* ⚡ NEW: Mapping over live database fetch */}
                  {regionData.length === 0 ? (
                    <div className="p-8 text-center text-sm font-bold text-gray-400">Loading regions...</div>
                  ) : (
                    regionData.map((stateObj) => (
                      <div key={stateObj.state} className="flex flex-col border-b border-gray-100 dark:border-gray-800/50 last:border-none">
                        
                        {/* State Level */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setExpandedState(expandedState === stateObj.state ? "" : stateObj.state); 
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm font-black text-[#547A6B] dark:text-[#7DA492] bg-gray-50/50 dark:bg-[#111] hover:bg-[#547A6B]/10 transition-colors outline-none"
                        >
                          <span className="uppercase tracking-wider">{stateObj.state}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedState === stateObj.state ? "rotate-180" : ""}`} />
                        </button>

                        {/* District Level (Accordion) */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedState === stateObj.state ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                          {stateObj.districts.map((district: any) => (
                            <div key={district.name} className="flex flex-col">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setExpandedDistrict(expandedDistrict === district.name ? "" : district.name); 
                                }}
                                className="flex items-center justify-between w-full px-4 py-3 pl-6 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] border-t border-gray-50 dark:border-gray-800/50 transition-colors outline-none"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full shadow-[0_0_8px_rgba(255,107,107,0.6)]"></span>
                                  {district.name}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedDistrict === district.name ? "rotate-90" : ""}`} />
                              </button>

                              {/* Locals Level (Accordion) */}
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 dark:bg-black/20 ${expandedDistrict === district.name ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                {district.locals.map((local: string) => {
                                  const isSelected = selectedLocation === local;
                                  return (
                                    <button
                                      key={local}
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedLocation(local); 
                                        setShowLocations(false); 
                                      }}
                                      className={`flex items-center justify-between w-full px-4 py-2.5 pl-11 text-sm font-semibold transition-colors outline-none
                                        ${isSelected 
                                          ? 'bg-[#FF6B6B]/10 text-[#FF6B6B] dark:bg-[#FF6B6B]/20' 
                                          : 'hover:bg-white dark:hover:bg-gray-800 hover:text-[#547A6B] dark:hover:text-[#7DA492] text-gray-600 dark:text-gray-400'}`}
                                    >
                                      <span>{local}</span>
                                      {isSelected && <Check className="w-4 h-4 text-[#FF6B6B]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
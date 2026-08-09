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
import LiquidGlassButton from "@/components/ui/LiquidGlassButton";

type WavePoint = { x: number; y: number };

/**
 * Threads a smooth Catmull-Rom -> cubic-bezier curve through a series of
 * points, instead of connecting them with straight lines. This is what
 * turns a jagged sine "polygon" into a soft, rounded liquid edge.
 * Returns SVG path commands (assumes the pen is already at points[0]).
 */
function smoothCurveThrough(points: WavePoint[]) {
  const n = points.length;
  if (n < 2) return "";

  let d = "";
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < n ? i + 2 : n - 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += `C${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d;
}

/**
 * Builds a rounded, blob-like "liquid wave" clip-path (an SVG path, in
 * viewport pixels — clip-path: path() doesn't support percentages).
 *
 * The shape covers the viewport from y=0 down to a soft, curvy line made
 * of two overlapping sine waves (a big lazy swell + a small fast ripple,
 * like a real liquid surface instead of one perfect sine). As `progress`
 * goes 0 -> 1 that line sweeps from above the screen to below it.
 *
 * A gaussian "bias" pulls the wave down faster near `originX` (the click
 * position), so it reads as pouring out from the toggle, then leveling out.
 */
function generateLiquidClipPath(
  progress: number,
  vw: number,
  vh: number,
  {
    originX = vw / 2,
    amplitude = vh * 0.05,
    amplitude2 = vh * 0.02,
    waveCount = 1.6,
    waveCount2 = 4.2,
    steps = 30,
    biasAmplitude = vh * 0.13,
    sigma = vw * 0.3,
    phase = 0,
  }: {
    originX?: number;
    amplitude?: number;
    amplitude2?: number;
    waveCount?: number;
    waveCount2?: number;
    steps?: number;
    biasAmplitude?: number;
    sigma?: number;
    phase?: number;
  } = {}
) {
  const baseline = progress * (vh + amplitude * 2) - amplitude;
  const pts: WavePoint[] = [];

  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * vw;
    const wobble =
      amplitude * Math.sin((x / vw) * Math.PI * 2 * waveCount + phase) +
      amplitude2 * Math.sin((x / vw) * Math.PI * 2 * waveCount2 - phase * 1.4 + 1.1);
    const dist = x - originX;
    const bias =
      biasAmplitude * (1 - progress) * Math.exp(-(dist * dist) / (2 * sigma * sigma));
    pts.push({ x, y: baseline + wobble - bias });
  }

  const curve = smoothCurveThrough(pts);
  return `path('M0 0 L${vw.toFixed(2)} 0 L${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} ${curve}L0 0 Z')`;
}

/** Eases a 0-1 progress value for a softer, more viscous "pour" feel. */
function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export default function Navbar() {
  const pathname = usePathname();
  const [showLocations, setShowLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Regions");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [regionData, setRegionData] = useState<any[]>([]);
  const [expandedState, setExpandedState] = useState<string>("");
  const [expandedDistrict, setExpandedDistrict] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

        const res = await fetch(`${baseUrl}/api/regions`);

        if (!res.ok) throw new Error("Failed to fetch regions");
        const data = await res.json();

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

  // 🌊 LIQUID WAVE THEME TOGGLE 🌊
  const toggleTheme = (event: React.MouseEvent) => {
    const willBeDark = !isDarkMode;

    if (!document.startViewTransition) {
      setIsDarkMode(willBeDark);
      localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
      return;
    }

    // Where the wave should appear to "pour" from, in viewport pixels
    // (clip-path: path() coordinates are px, not %).
    const originX = event.clientX;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxBlur = 14; // px, how hazy the liquid looks as it's moving

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(willBeDark);
        localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
      });
    });

    transition.ready.then(() => {
      const frameCount = 16;
      const keyframes = Array.from({ length: frameCount + 1 }, (_, f) => {
        const rawP = f / frameCount;
        const p = easeInOutCubic(rawP);
        // The wave's phase keeps evolving as it sweeps, so the swell
        // travels and wobbles instead of just growing in place.
        const phase = rawP * Math.PI * 1.6;
        // Blur is strongest while the liquid is still in motion, and
        // eases out to fully sharp by the time it finishes settling.
        const blur = maxBlur * Math.pow(1 - p, 2);

        return {
          clipPath: generateLiquidClipPath(p, vw, vh, { originX, phase }),
          filter: `blur(${blur.toFixed(2)}px)`,
          offset: rawP,
        };
      });

      document.documentElement.animate(keyframes, {
        duration: 1100,
        easing: "linear", // easing is already baked into each frame above
        pseudoElement: "::view-transition-new(root)",
        fill: "forwards",
      });
    });
  };

  if (pathname === "/shorts") return null;

  return (
    <>
      {/* --- SIDE DRAWER BACKDROP (z-[100]) --- */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ease-out ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* --- SIDE DRAWER CONTAINER (z-[101]) --- */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] sm:w-[320px] max-w-[400px] bg-white dark:bg-[#111] z-[101] shadow-[30px_0_60px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

          <div
            className={`w-full h-px bg-gray-100 dark:bg-gray-800/60 my-2 transition-all duration-700 transform ${
              isMobileMenuOpen ? "scale-x-100 opacity-100 delay-300" : "scale-x-0 opacity-0"
            }`}
          />

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

      {/* --- HEADER ROOT (z-[90] keeps navbar & dropdowns above main page content) --- */}
      <header className="sticky top-0 z-[90] w-full h-14">

        {/* SOLID BACKGROUND */}
        <div
          className={`absolute inset-0 w-full h-full bg-white border-b border-gray-200 shadow-sm dark:bg-[#111] dark:border-gray-800 transition-all duration-500 ease-in-out origin-top ${
            isScrolled ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
          }`}
        />

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
                className="h-full w-auto object-contain transform transition-all duration-300 origin-left group-hover:scale-105 group-active:scale-95 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                priority
              />
            </button>
          </div>

          {/* 2. CENTER: PERMANENTLY CENTERED TEXT */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 z-10 ${
              isScrolled ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
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
            <div
              className={`hidden md:flex items-center gap-4 xl:gap-6 font-bold text-sm tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isScrolled ? '-translate-y-8 opacity-0 pointer-events-none scale-95' : 'translate-y-0 opacity-100 scale-100'
              }`}
            >
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

            {/* GLASS PILL & ANIMATED THEME SWITCHER */}
            <div
              ref={dropdownRef}
              className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 ${
                isScrolled ? 'absolute top-1 right-4' : 'relative gap-4 xl:gap-6'
              }`}
            >

              {/* SINGLE UNIFIED GLASS PILL (z-50) */}
              <LiquidGlassButton
                glassOptions={{ scale: -40, border: 0.15, mapBlur: 8 }}
                className="flex items-center gap-1 rounded-full p-1 shadow-md cursor-default relative z-50"
              >
                {/* Location Button */}
                <div
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setShowLocations((prev) => !prev); 
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex flex-col items-center justify-center w-[48px] sm:w-[64px] py-1 transition-colors relative z-50 rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${
                    showLocations ? 'text-[#e3000f]' : 'text-[#002244] dark:text-gray-200'
                  }`}
                >
                  <MapPin className="h-5 w-5 mb-0.5" />
                  <span className="text-[8px] font-extrabold tracking-wider uppercase w-full text-center truncate px-1">
                    {selectedLocation}
                  </span>
                </div>

                {/* Subtle Divider Line */}
                <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 rounded-full" />

                {/* Animated Theme Toggle */}
                <div
                  onClick={(e) => { e.stopPropagation(); toggleTheme(e); }}
                  aria-label="Toggle Theme"
                  role="button"
                  className="relative z-10 w-9 h-9 flex items-center justify-center overflow-hidden rounded-full transition-colors cursor-pointer text-[#002244] dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10"
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
                </div>

              </LiquidGlassButton>

              <Link href="/dashboard" className={`text-[#002244] dark:text-gray-200 rounded-full transition-all duration-400 hidden sm:flex items-center justify-center overflow-hidden ${
                isScrolled
                  ? 'w-0 h-0 opacity-0 scale-0 p-0 m-0'
                  : 'w-9 h-9 opacity-100 scale-100 p-1.5 ml-1 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                <User className="h-6 w-6 flex-shrink-0" />
              </Link>

              {/* OVERLAY FOR CLOSING DROPDOWN ON MOBILE TAP (z-40) */}
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

              {/* REGION ACCORDION DROPDOWN CONTAINER (z-[60] keeps dropdown above pill & overlay) */}
              <div
                className={`absolute top-[calc(100%+12px)] right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#1a1a1a] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden max-h-[75vh] overflow-y-auto z-[60] transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-[80%_-10%] custom-scrollbar ${
                  showLocations 
                    ? "opacity-100 scale-100 translate-y-0 rounded-xl blur-0 pointer-events-auto" 
                    : "opacity-0 scale-75 scale-y-50 -translate-y-8 rounded-[4rem] blur-sm pointer-events-none"
                }`}
              >
                <div className="bg-gray-50 dark:bg-[#111] px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-10 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select Region</span>
                </div>

                <div className="flex flex-col relative z-0">
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

                        {/* District Level */}
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

                              {/* Locals Level */}
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
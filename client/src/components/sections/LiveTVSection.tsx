"use client";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function LiveTVSection() {
  const [isFloating, setIsFloating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const checkLayoutAndScroll = () => {
      if (!containerRef.current || isDismissed) return;
      
      // ⚡ THE FIX: Check if we are on a mobile/tablet screen (< 1024px)
      const isMobileView = window.innerWidth < 1024;
      
      if (isMobileView) {
        // Always float immediately on smaller screens
        setIsFloating(true);
      } else {
        // Desktop behavior: Only float when scrolled past the container
        const rect = containerRef.current.getBoundingClientRect();
        setIsFloating(rect.top < -50);
      }
    };

    window.addEventListener("scroll", checkLayoutAndScroll, { passive: true });
    window.addEventListener("resize", checkLayoutAndScroll, { passive: true }); // Catch device rotation
    
    checkLayoutAndScroll(); // Initial check on load
    
    return () => {
      window.removeEventListener("scroll", checkLayoutAndScroll);
      window.removeEventListener("resize", checkLayoutAndScroll);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  // --- REUSABLE UI BLOCKS ---
  
  const headerContent = (
    <div className={`flex items-center justify-between transition-colors duration-300 ${isFloating ? 'p-1.5 sm:p-2 bg-black border-b border-white/10 rounded-t-xl' : 'p-3 border-b border-gray-100 dark:border-white/5'}`}>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className={`relative flex ${isFloating ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className={`relative inline-flex rounded-full bg-[#e3000f] ${isFloating ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}></span>
        </div>
        <h2 className={`font-black tracking-wide uppercase flex items-center gap-1 ${isFloating ? 'text-white text-[8px] sm:text-[10px] md:text-[11px]' : 'text-black dark:text-white text-sm'}`}>
          Live TV
        </h2>
      </div>
      
      <div className="flex items-center">
        {!isFloating ? (
          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-[#e3000f] text-[9px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-500/20">
            Streaming
          </span>
        ) : (
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-0.5 sm:p-1 rounded-md bg-white/10 text-gray-300 hover:text-white hover:bg-[#e3000f] transition-colors"
            title="Close Live TV"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  const playerContent = (
    <div className={`w-full aspect-video bg-black relative transition-all duration-300 ${isFloating ? 'rounded-b-xl overflow-hidden' : 'rounded-b-2xl overflow-hidden'}`}>
      <iframe
        className="absolute inset-0 w-full h-full relative z-10"
        src="https://www.youtube.com/embed/live_stream?channel=UCf8w5m0YsRa8MHQ5bwSGmbw&autoplay=1&mute=1"
        title="Asianet News Live TV"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy" 
      ></iframe>
    </div>
  );

  // FLOATING PLAYER PORTAL (Rendered exactly the same, but now triggers instantly on mobile)
  const floatingWidget = mounted && isFloating ? createPortal(
    <div className="fixed bottom-[140px] md:bottom-[180px] right-2 md:right-4 w-[160px] sm:w-[200px] md:w-[320px] shadow-[0_10px_40px_rgba(227,0,15,0.3)] rounded-xl border border-[#e3000f]/80 bg-black z-[9999] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
      {headerContent}
      {playerContent}
    </div>,
    document.body
  ) : null;

  return (
    // ⚡ THE FIX: Removed margin-bottom on mobile (`lg:mb-6`) so it doesn't leave an empty gap above the Top Ten News
    <div ref={containerRef} className="w-full relative lg:mb-6">
      
      {/* 1. INLINE PLAYER */}
      {!isFloating && (
        // ⚡ THE FIX: Added `hidden lg:flex` so this block physically doesn't exist on mobile layouts
        <div className="hidden lg:flex relative w-full rounded-2xl border border-[#e3000f]/30 bg-white dark:bg-[#111] shadow-sm flex-col z-10 animate-in fade-in duration-500">
          {headerContent}
          {playerContent}
        </div>
      )}

      {/* 2. FLOATING PLAYER PORTAL */}
      {floatingWidget}
      
      {/* 3. GHOST PLACEHOLDER */}
      {isFloating && (
        // ⚡ THE FIX: Added `hidden lg:flex` so the ghost placeholder is only shown on Desktop when scrolling
        <div className="hidden lg:flex w-full aspect-video bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 items-center justify-center animate-in fade-in duration-500">
           <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-center px-4">
             Live TV Playing in Mini-Player
           </span>
        </div>
      )}
      
    </div>
  );
}
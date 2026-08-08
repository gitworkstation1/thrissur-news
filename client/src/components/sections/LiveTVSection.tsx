"use client";

import { X, Tv, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function LiveTVSection() {
  const [isFloating, setIsFloating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const checkLayoutAndScroll = () => {
      if (!containerRef.current) return;

      const isMobileView = window.innerWidth < 1024;

      if (isMobileView) {
        setIsFloating(true);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        setIsFloating(rect.top < -50);
      }
    };

    window.addEventListener("scroll", checkLayoutAndScroll, { passive: true });
    window.addEventListener("resize", checkLayoutAndScroll, { passive: true });

    checkLayoutAndScroll();

    return () => {
      window.removeEventListener("scroll", checkLayoutAndScroll);
      window.removeEventListener("resize", checkLayoutAndScroll);
    };
  }, []);

  // Broadcast TV state changes so other UI elements (like Flash Read) can react dynamically
  useEffect(() => {
    if (!mounted) return;
    const event = new CustomEvent("live-tv-state", {
      detail: { isFloating, isDismissed, isExpanded },
    });
    window.dispatchEvent(event);
  }, [isFloating, isDismissed, isExpanded, mounted]);

  // --- REUSABLE UI BLOCKS ---

  const headerContent = (
    <div
      className={`flex items-center justify-between transition-colors duration-300 ${
        isFloating || isExpanded
          ? "p-1.5 sm:p-2 bg-black border-b border-white/10 rounded-t-xl"
          : "p-3 border-b border-gray-100 dark:border-white/5"
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={`relative flex ${
            isFloating || isExpanded ? "h-1.5 w-1.5" : "h-2 w-2"
          }`}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span
            className={`relative inline-flex rounded-full bg-[#e3000f] ${
              isFloating || isExpanded ? "h-1.5 w-1.5" : "h-2 w-2"
            }`}
          />
        </div>
        <h2
          className={`font-black tracking-wide uppercase flex items-center gap-1 ${
            isFloating && !isExpanded
              ? "text-white text-[8px] sm:text-[10px] md:text-[11px]"
              : "text-black dark:text-white text-sm"
          }`}
        >
          Live TV
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {!isFloating && !isExpanded ? (
          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-[#e3000f] text-[9px] font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-500/20">
            Streaming
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md bg-white/10 text-gray-300 hover:text-white hover:bg-[#e3000f] transition-colors outline-none"
              title={isExpanded ? "Minimize" : "Expand"}
              aria-label={isExpanded ? "Minimize Live TV" : "Expand Live TV"}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
                setIsExpanded(false);
              }}
              className="p-1 rounded-md bg-white/10 text-gray-300 hover:text-white hover:bg-[#e3000f] transition-colors outline-none"
              title="Close Live TV"
              aria-label="Close Live TV"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const playerContent = (
    <div
      className={`w-full bg-black relative transition-all duration-300 ${
        isExpanded
          ? "flex-1 rounded-b-xl overflow-hidden"
          : isFloating
          ? "aspect-video rounded-b-xl overflow-hidden"
          : "aspect-video rounded-b-2xl overflow-hidden"
      }`}
    >
      <iframe
        className="absolute inset-0 w-full h-full z-10"
        src="https://www.youtube.com/embed/live_stream?channel=UCf8w5m0YsRa8MHQ5bwSGmbw&autoplay=1&mute=1"
        title="Asianet News Live TV"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );

  // ⚡ z-index lowered so nav-level dropdowns (e.g. category dropdown) render above the mini-player
  const widgetClasses = isExpanded
    ? "fixed inset-4 sm:inset-10 md:inset-20 z-[1000] bg-black rounded-xl border border-[#e3000f]/80 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out"
    : `fixed bottom-20 sm:bottom-24 right-4 w-44 sm:w-56 md:w-80 shadow-[0_10px_40px_rgba(227,0,15,0.3)] rounded-xl border border-[#e3000f]/80 bg-black z-[70] transition-all duration-500 ease-out origin-bottom-right ${
        isDismissed
          ? "opacity-0 scale-50 pointer-events-none"
          : "opacity-100 scale-100 pointer-events-auto"
      }`;

  // Floating Mini-Player Portal
  const floatingWidget =
    mounted && isFloating
      ? createPortal(
          <>
            {isExpanded && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] animate-in fade-in duration-200"
                onClick={() => setIsExpanded(false)}
              />
            )}
            <div className={widgetClasses}>
              {headerContent}
              {playerContent}
            </div>
          </>,
          document.body
        )
      : null;

  // Collapsed Floating Tv Bubble Portal
  const collapsedBubble =
    mounted && isFloating
      ? createPortal(
          <button
            type="button"
            onClick={() => setIsDismissed(false)}
            className={`fixed bottom-20 sm:bottom-24 right-4 w-12 h-12 bg-[#e3000f] text-white rounded-full shadow-[0_4px_14px_rgba(227,0,15,0.5)] flex items-center justify-center z-[69] transition-all duration-500 ease-out origin-center outline-none ${
              isDismissed
                ? "opacity-100 scale-100 hover:scale-110 hover:bg-red-700 pointer-events-auto"
                : "opacity-0 scale-50 pointer-events-none"
            }`}
            title="Open Live TV"
            aria-label="Open Live TV"
          >
            <Tv className="w-5 h-5" />
          </button>,
          document.body
        )
      : null;

  return (
    <div ref={containerRef} className="w-full relative lg:mb-6">
      {/* Desktop Standard Inline Player */}
      {!isFloating && !isDismissed && (
        <div className="hidden lg:flex relative w-full rounded-2xl border border-[#e3000f]/30 bg-white dark:bg-[#111] shadow-sm flex-col z-10 animate-in fade-in duration-500">
          {headerContent}
          {playerContent}
        </div>
      )}

      {floatingWidget}
      {collapsedBubble}

      {/* Inline Placeholder when Floating */}
      {isFloating && !isDismissed && (
        <div className="hidden lg:flex w-full aspect-video bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 items-center justify-center animate-in fade-in duration-500">
          <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-center px-4">
            Live TV Playing in Mini-Player
          </span>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(windowScroll > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]
        transform-gpu will-change-[opacity,transform]
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <button
        onClick={scrollToTop}
        className="
          flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl
          bg-white/95 dark:bg-black/95 backdrop-blur-md border border-gray-200 dark:border-gray-800
          text-black dark:text-white text-[11px] font-black uppercase tracking-wider
          hover:scale-105 active:scale-95 transition-transform duration-200
        "
        aria-label="Scroll back to top"
      >
        <ArrowUp className="w-4 h-4 text-[#e3000f] stroke-[3px]" />
        Back to Top
      </button>
    </div>
  );
}
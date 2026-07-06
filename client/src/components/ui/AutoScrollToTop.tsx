"use client";

import { useEffect } from "react";

export default function AutoScrollToTop() {
  useEffect(() => {
    // Scroll the main window to the top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Fallback: If you have a custom scroll container in your layout 
    // (like a div with overflow-y-auto), this will scroll that too.
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, []);

  return null; // This component is invisible
}
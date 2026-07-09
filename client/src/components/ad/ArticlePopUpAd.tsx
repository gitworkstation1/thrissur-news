"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; 
import { X } from "lucide-react";
import Link from "next/link";

export default function ArticlePopUpAd({ ad }: { ad: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 

  // Safely mount on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!ad) return;

    // ⚡ THE FIX: Removed sessionStorage so it fires every time the component loads!
    // Triggers 2 seconds after the article page opens
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [ad]);

  // Lock the background from scrolling when the pop-up is active
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Don't render anything if it's closed, there's no ad, or it hasn't mounted yet
  if (!isOpen || !ad || !mounted) return null;

  // Safely extract the image URL
  const imageUrl = Array.isArray(ad.media) ? ad.media[0]?.url : ad.media?.url;

  // Package the entire pop-up into a variable
  const popupContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 pointer-events-auto">
      <div className="relative max-w-lg w-full bg-white dark:bg-[#121212] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ad Content */}
        <Link 
          href={ad.externalLink || "#"} 
          target="_blank" 
          onClick={() => setIsOpen(false)}
          className="block group"
        >
          <img
            src={imageUrl}
            alt={ad.headline || "Advertisement"}
            className="w-full h-auto object-cover max-h-[50vh] sm:max-h-[60vh]"
          />
          <div className="p-4 sm:p-5 text-center bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
              {ad.headline}
            </h3>
            <span className="inline-block mt-3 px-6 py-2 bg-red-600 text-white text-xs sm:text-sm font-bold rounded-full hover:bg-red-700 transition-colors shadow-md">
              Learn More
            </span>
          </div>
        </Link>
      </div>
    </div>
  );

  // Teleport the packaged pop-up directly to the document body!
  return createPortal(popupContent, document.body);
}
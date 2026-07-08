"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export default function ArticlePopUpAd({ ad }: { ad: any }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If there is no ad assigned to this zone, do nothing
    if (!ad) return;

    // Check if the user has already seen the pop-up this session
    const hasSeenPopup = sessionStorage.getItem("hasSeenArticlePopup");

    if (!hasSeenPopup) {
      // 3-second delay so they can start reading before the pop-up appears
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenArticlePopup", "true");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [ad]);

  if (!isOpen || !ad) return null;

  // Safely extract the image URL
  const imageUrl = Array.isArray(ad.media) ? ad.media[0]?.url : ad.media?.url;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
            className="w-full h-auto object-cover max-h-[60vh]"
          />
          <div className="p-5 text-center bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/10">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
              {ad.headline}
            </h3>
            <span className="inline-block mt-3 px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors shadow-md">
              Learn More
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
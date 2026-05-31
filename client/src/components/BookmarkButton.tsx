"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";

export default function BookmarkButton({ className }: { className?: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    // This stops the click from accidentally opening the news article!
    e.preventDefault();
    e.stopPropagation(); 
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button 
      onClick={toggleBookmark}
      className={`group flex items-center justify-center transition-all duration-300 active:scale-75 ${className}`}
      aria-label="Save for later"
    >
      <Bookmark 
        className={`transition-all duration-300 ${
          isBookmarked 
            ? "fill-[#e3000f] text-[#e3000f] w-5 h-5" 
            : "text-gray-400 group-hover:text-[#1C1C1E] dark:text-gray-500 dark:group-hover:text-gray-200 stroke-[2px] w-[18px] h-[18px]"
        }`} 
      />
    </button>
  );
}
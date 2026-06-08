"use client";
import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Article } from "@/lib/types";

interface BookmarkButtonProps {
  className?: string;
  article: Article; // ✅ Fixed: Define the contract so TypeScript knows what data is coming in
}

export default function BookmarkButton({ className, article }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // ✅ Read from local storage when the page loads
  useEffect(() => {
    const saved = localStorage.getItem("thrissur_news_bookmarks");
    if (saved) {
      const bookmarks: Article[] = JSON.parse(saved);
      // Check if this specific article id exists in our saved array
      const exists = bookmarks.some((item) => item._id === article._id);
      setIsBookmarked(exists);
    }
  }, [article._id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 

    // ✅ Write changes back to local storage
    const saved = localStorage.getItem("thrissur_news_bookmarks");
    let bookmarks: Article[] = saved ? JSON.parse(saved) : [];

    if (isBookmarked) {
      // Remove the article if it's already there
      bookmarks = bookmarks.filter((item) => item._id !== article._id);
    } else {
      // Save the entire article object so we can show it later on a "Saved Stories" page
      bookmarks.push(article);
    }

    localStorage.setItem("thrissur_news_bookmarks", JSON.stringify(bookmarks));
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
            : "text-gray-800 group-hover:text-black dark:text-white dark:group-hover:text-gray-200 stroke-[2px] w-[18px] h-[18px]"
        }`} 
      />
    </button>
  );
}
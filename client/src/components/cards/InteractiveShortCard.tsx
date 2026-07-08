"use client";
import { useState, useEffect } from "react";
import Image from "next/image"; 
import { Article } from "@/lib/types";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import Link from "next/link";

export default function InteractiveShortCard({ article }: { article: Article }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("thrissur_news_bookmarks") || "[]");
    setIsBookmarked(saved.some((b: any) => b._id === article._id));
  }, [article._id]);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem("thrissur_news_bookmarks") || "[]");
    let updated = [];
    
    if (isBookmarked) {
      updated = saved.filter((b: any) => b._id !== article._id);
    } else {
      updated = [...saved, article];
    }
    
    localStorage.setItem("thrissur_news_bookmarks", JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.body ? article.body.slice(0, 100) + "..." : article.headline,
          url: `${window.location.origin}/article/${article._id}`
        });
      } catch (err) {
        console.log("Sharing cancelled");
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/article/${article._id}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    // 1. Changed h-dvh to min-h-dvh and adjusted padding to allow the card to move up
    <div className="relative w-full min-h-dvh snap-start bg-gray-50 dark:bg-[#0a0a0a] flex flex-col md:items-center md:justify-center p-2 sm:p-4 md:p-8 overflow-hidden">
      
      {/* THE MAIN CONSOLE */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
        
        {/* 2. REDUCED IMAGE HEIGHT - 'h-[30vh]' instead of 'h-[40dvh]' to save space */}
        <div className="relative h-[25vh] w-full overflow-hidden bg-gray-100 dark:bg-neutral-900">
          <Image 
            src={article.media?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'} 
            alt={article.headline} 
            fill
            className="object-cover select-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#121212] via-transparent to-transparent" />
        </div>

        {/* TEXT DETAILS PANEL */}
        <div className="px-6 py-4 flex flex-col relative -mt-10">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-[#e3000f] bg-[#e3000f]/10 border border-[#e3000f]/20 px-3 py-1 rounded-full tracking-wider uppercase">
              {article.category || 'NEWS'}
            </span>
            
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 text-gray-500 hover:text-black dark:hover:text-white">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={toggleBookmark} className={`p-2 transition-colors ${isBookmarked ? "text-[#e3000f]" : "text-gray-500"}`}>
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <h2 className="text-black dark:text-white font-extrabold text-xl leading-snug tracking-tight mb-4">
            {article.headline}
          </h2>

          {/* 3. CONSTRAINED TEXT AREA */}
          <div className="max-h-[30vh] overflow-y-auto text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 hide-scrollbar">
            <p>{article.body || "Swipe to read more..."}</p>
          </div>

          {/* 4. VISIBLE BUTTON - Positioned relative to content, not fixed to screen */}
          <div className="mt-auto pb-4">
            <Link 
              href={`/article/${article._id}`}
              className="block w-full py-4 text-center bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
            >
              Read Full Detailed Coverage
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
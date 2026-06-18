"use client";
import { useState, useEffect } from "react";
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
    // Base wrapper adapts to light/dark
    <div className="relative w-full h-dvh snap-start bg-gray-50 dark:bg-[#0a0a0a] flex flex-col md:items-center md:justify-center md:p-8 overflow-hidden">
      
      {/* DESKTOP BACKGROUND BLUR */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <img 
          src={article.media?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'} 
          alt="" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-3xl scale-110 pointer-events-none select-none" 
        />
        {/* Dynamic overlay to soften the blurred background */}
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* THE MAIN CONSOLE: Now defaults to white, switches to #121212 in dark mode */}
      <div className="relative z-10 w-full h-full md:h-[75vh] md:max-w-5xl flex flex-col md:flex-row bg-white dark:bg-[#121212] md:rounded-2xl md:border border-gray-200 dark:border-white/10 overflow-hidden shadow-none md:shadow-[0_25px_70px_rgba(0,0,0,0.08)] dark:md:shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        
        {/* IMAGE COMPONENT */}
        <div className="relative h-[40dvh] md:h-full w-full md:w-[45%]  bg-gray-100 dark:bg-neutral-900 shrink-0 overflow-hidden">
          <img 
            src={article.media?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'} 
            alt="" 
            className="w-full h-full object-cover select-none" 
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent md:bg-linear-to-r md:from-transparent md:to-black/10 dark:md:to-black/30" />
        </div>

        {/* TEXT DETAILS SIDE PANEL */}
        <div className="flex-1 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-white/10 md:border-t-0 p-5 pb-24 md:p-8 md:pb-6 flex flex-col justify-between overflow-hidden relative rounded-t-2xl md:rounded-t-none -mt-5 md:mt-0 shadow-[0_-15px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-15px_30px_rgba(0,0,0,0.6)] md:shadow-none">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <span className="text-[10px] font-black text-[#e3000f] bg-[#e3000f]/10 border border-[#e3000f]/20 px-2.5 py-1 rounded-md tracking-wider uppercase backdrop-blur-md">
              {article.category || 'LATEST'} {article.location?.ward && `• ${article.location.ward}`}
            </span>
            
            {/* Interaction buttons (Adapted for high contrast in light mode) */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={handleShare}
                className="text-gray-500 dark:text-white/70 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-2 rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-all border active:scale-90 ${
                  isBookmarked 
                    ? "bg-[#e3000f]/10 dark:bg-[#e3000f]/20 border-[#e3000f]/30 dark:border-[#e3000f]/40 text-[#e3000f]" 
                    : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Headline (Black in light mode, White in dark mode) */}
          <h2 className="text-black dark:text-white font-extrabold text-lg md:text-2xl leading-snug tracking-tight mb-4 line-clamp-3 md:line-clamp-4 shrink-0">
            {article.headline}
          </h2>

          {/* Attached the supercharged hide-scrollbar class here as well */}
          <div className="flex-1 overflow-y-auto pr-1 md:pr-2 text-gray-600 dark:text-gray-400 text-[13px] md:text-sm leading-relaxed font-normal space-y-3 mb-6 hide-scrollbar">
            <p className="opacity-95">
              {article.body || "Swipe vertically to look across remaining breaking updates across the community region..."}
            </p>
          </div>

          {/* Footer Navigation Button (Inverts text/bg based on theme) */}
          {/* Footer Navigation Button - Added container with margin to clear BottomNav */}
          <div className="mb-10 md:mb-0 shrink-0">
            <Link 
              href={`/article/${article._id}`}
              className="block w-full py-3 text-center bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl tracking-wide hover:bg-gray-800 dark:hover:bg-gray-100 active:bg-gray-700 dark:active:bg-gray-200 transition-colors active:scale-[0.99] shadow-lg"
            >
              Read Full Detailed Coverage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
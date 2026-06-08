"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Article } from "@/lib/types";

export default function BreakingNewsCarousel({ articles }: { articles: Article[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Swipe/Drag States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  // Auto-play
  useEffect(() => {
    if (!articles || articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles]);

  if (!articles || articles.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % articles.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  const handleSlideClick = (articleId: string) => {
    if (!isSwiping) router.push(`/article/${articleId}`);
    setIsSwiping(false);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3000f] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e3000f]"></span>
        </span>
        <h2 className="text-[#e3000f] font-black text-lg tracking-wide uppercase">Breaking News</h2>
      </div>

      <div
        className={`relative w-full rounded-2xl overflow-hidden group shadow-md border border-gray-200 dark:border-gray-800 touch-pan-y select-none bg-white dark:bg-[#111] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onTouchStart={(e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); setIsSwiping(false); }}
        onTouchMove={(e) => { setTouchEnd(e.targetTouches[0].clientX); setIsSwiping(true); }}
        onTouchEnd={handleSwipe}
        onMouseDown={(e) => { setIsDragging(true); setTouchEnd(null); setTouchStart(e.clientX); setIsSwiping(false); }}
        onMouseMove={(e) => { if (isDragging) { setTouchEnd(e.clientX); setIsSwiping(true); } }}
        onMouseUp={() => { setIsDragging(false); handleSwipe(); }}
        onMouseLeave={() => { if (isDragging) { setIsDragging(false); handleSwipe(); } }}
      >
        {articles.map((article, index) => (
          <div
            key={article._id}
            onClick={() => handleSlideClick(article._id)}
            className={`transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"}`}
          >
            <div className="flex flex-col h-full">
              {/* Fixed Image Container */}
              <div className="relative w-full h-48 md:h-64 flex-shrink-0 overflow-hidden">
                <img
                  src={article.media?.[0]?.url || "https://picsum.photos/1200/800"}
                  alt={article.headline}
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              </div>

              {/* Text Container - Expands naturally for 3-line headlines */}
              <div className="flex flex-col gap-1 px-4 py-3">
                <span className="inline-block text-[#e3000f] text-[10px] font-black uppercase tracking-widest">
                  {article.category || "Alert"} • {article.location?.ward || "Latest"}
                </span>
                <h3 className="text-black dark:text-white font-bold text-lg md:text-2xl leading-tight line-clamp-3">
                  {article.headline}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-2">
                  {new Date(article.createdAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <div className="absolute inset-0 z-30 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"><ChevronLeft /></button>
          <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"><ChevronRight /></button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 right-5 z-30 flex gap-2 pointer-events-none">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${idx === currentIndex ? "bg-[#e3000f] w-6" : "bg-gray-300 dark:bg-white/50 hover:bg-gray-400 dark:hover:bg-white/80"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
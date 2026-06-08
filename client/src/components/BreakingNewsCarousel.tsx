"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Article } from "@/lib/types";

export default function BreakingNewsCarousel({ articles }: { articles: Article[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  
  // States for touch and mouse events
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

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

  // --- UNIFIED SWIPE CALCULATION ---
  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // --- TOUCH HANDLERS (Mobile) ---
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchEnd = () => {
    handleSwipe();
  };

  // --- MOUSE HANDLERS (Desktop) ---
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsSwiping(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return; 
    setTouchEnd(e.clientX);
    setIsSwiping(true);
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    handleSwipe();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      handleSwipe();
    }
  };

  // Handle clicking/tapping the slide
  const handleSlideClick = (articleId: string) => {
    if (!isSwiping) {
      router.push(`/news/${articleId}`);
    }
    setIsSwiping(false); 
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3000f] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e3000f]"></span>
        </span>
        <h2 className="text-[#00e308] font-black text-lg tracking-wide uppercase flex items-center gap-1">
          Breaking News <ChevronRight className="w-5 h-5 -ml-1 stroke-[3px]" />
        </h2>
      </div>

      <div 
        className={`relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] rounded-2xl overflow-hidden group shadow-md border border-gray-200 dark:border-gray-800 touch-pan-y select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        // Touch events
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        // Mouse events
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        
        {articles.map((article, index) => (
          <div
            key={article._id}
            onClick={() => handleSlideClick(article._id)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={article.media?.[0]?.url || "https://picsum.photos/1200/800"}
              alt={article.headline}
              className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-105 pointer-events-none"
              draggable="false" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 w-full p-5 md:p-8 flex flex-col justify-end pointer-events-none">
              <div className="max-w-3xl pointer-events-auto">
                <span className="inline-block px-2.5 py-1 bg-[#e3000f] text-white text-[10px] font-black uppercase tracking-widest rounded mb-3">
                  {article.category || "Alert"}
                </span>
                
                <h3 className="text-white font-bold text-xl md:text-3xl lg:text-4xl leading-tight mb-3 line-clamp-3 drop-shadow-md">
                  {article.headline}
                </h3>
                
                <div className="flex items-center justify-between">
                  {/* NOTE: Fixed hydration error here with 'en-GB' */}
                  <p className="text-gray-300 text-xs md:text-sm font-medium flex items-center gap-2">
                    {new Date(article.createdAt).toLocaleDateString('en-GB')} • {article.location?.ward || "Kerala"}
                  </p>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/news/${article._id}`);
                    }}
                    className="hidden md:inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        ))}

        <div className="absolute inset-0 z-30 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-4 right-5 z-30 flex gap-2 pointer-events-none">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${
                idx === currentIndex ? "bg-[#e3000f] w-6" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
"use client";
import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Article } from "@/lib/types";

export default function BreakingNewsCarousel({ articles }: { articles: Article[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!articles || articles.length === 0) return null;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollRef.current.scrollLeft / width);
    setActiveIndex(newIndex);
  };

  // --- MOUSE DRAG LOGIC (Strictly for Desktop) ---
  const handleMouseDown = (e: ReactMouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  
  // FIX: Force drag state to false instantly if a touch event is detected
  const handleTouchReset = () => setIsDragging(false);
  
  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  return (
    <div className="mb-8 relative w-full">
      
      {/* HEADER */}
      <div className="flex items-center text-[#e3000f] mb-4 font-black text-lg tracking-wide uppercase">
        BREAKING NEWS <ChevronRight className="w-5 h-5 ml-0.5 stroke-[3]" />
      </div>

      <div className="lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:rounded-xl lg:p-5 lg:bg-white lg:dark:bg-[#111] relative overflow-hidden">
        
        {/* CAROUSEL CONTAINER */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          // MOBILE OVERRIDES: These ensure snapping never gets stuck on phones
          onTouchStart={handleTouchReset}
          onTouchEnd={handleTouchReset}
          onTouchCancel={handleTouchReset}
          // Added gap-4 instead of padding so the snap-center math is perfect
          className={`flex gap-4 lg:gap-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
          }`}
        >
          {articles.map((article) => {
            const dateObj = new Date(article.createdAt);
            const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

            return (
              <div key={article._id} className="min-w-full w-full snap-center flex-shrink-0 flex flex-col pointer-events-none sm:pointer-events-auto select-none">
                
                <div className="mb-3">
                  <span className="text-[#e3000f] font-bold text-xs tracking-tight uppercase border-t-[3px] border-[#e3000f] pt-1 inline-block">
                    {article.category || 'Kerala'}
                  </span>
                </div>

                <h1 className="text-[22px] md:text-3xl font-bold leading-[1.35] text-black dark:text-gray-100 mb-2">
                  {article.headline}
                </h1>

                <p className="text-gray-500 dark:text-gray-400 text-[12px] font-medium mb-4">
                  {formattedDate} • {article.location?.ward || 'Thrissur'}
                </p>

                <div className="relative w-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-xl lg:rounded-lg overflow-hidden">
                  <img
                    src={article.media?.[0]?.url || 'https://picsum.photos/800/500'}
                    alt={article.headline}
                    className="w-full h-[220px] md:h-[400px] object-cover pointer-events-none"
                    draggable="false"
                  />
                </div>
                
              </div>
            );
          })}
        </div>

        {/* Desktop Controls */}
        {activeIndex > 0 && (
          <button 
            onClick={() => scrollTo(activeIndex - 1)}
            className="hidden lg:flex absolute left-8 bottom-[210px] bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-full transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        
        {activeIndex < articles.length - 1 && (
          <button 
            onClick={() => scrollTo(activeIndex + 1)}
            className="hidden lg:flex absolute right-8 bottom-[210px] bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-full transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Pagination Dots */}
        <div className="flex items-center gap-2 mt-6">
          {articles.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => scrollTo(idx)}
              className={`h-1 rounded-full transition-all duration-300 flex-1 max-w-[40px] ${
                activeIndex === idx ? 'bg-[#e3000f]' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
}
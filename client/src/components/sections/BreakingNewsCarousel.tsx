"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Article } from "@/lib/types";
import { injectAds } from "@/lib/adUtils";
import CarouselAdCard from "../ad/CarouselAdCard";
import Link from "next/link";

export default function BreakingNewsCarousel({ articles }: { articles: Article[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Inject an ad every 3 slides (you can adjust this number)
  const slideItems = useMemo(() => injectAds(articles, 3), [articles]);

  // Swipe/Drag States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  // Auto-play
  useEffect(() => {
    if (!slideItems || slideItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideItems]);

  if (!articles || articles.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slideItems.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slideItems.length) % slideItems.length);

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    else if (distance < -minSwipeDistance) prevSlide();
  };

  const handleSlideClick = (item: any) => {
    if (!isSwiping) {
      if (item.type === 'news') {
        router.push(`/full-coverage/${item.data._id}`);
      } else {
        console.log("Carousel Ad Clicked!");
      }
    }
    setIsSwiping(false);
  };

  return (
    // ⚡ FIX: Added rounded-2xl, border-[#e3000f]/30, and overflow-hidden to the parent container
    <div className="w-full flex flex-col rounded-2xl border border-[#e3000f]/70 dark:border-[#e3000f]/70 overflow-hidden bg-white dark:bg-[#111]">
      <Link href="/breaking-news" className="flex items-center gap-2 mb-4 mt-3 ml-3 group w-max cursor-pointer z-10 relative">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e3000f] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e3000f]"></span>
        </span>
        <div className="flex items-center">
          <h2 className="text-[#e3000f] font-black text-lg tracking-wide uppercase group-hover:underline decoration-2 underline-offset-4">
            Breaking News
          </h2>
          <span className="text-[#e3000f] text-2xl leading-none ml-1 -mt-0.5 font-medium transition-transform duration-300 group-hover:translate-x-1.5">
            ›
          </span>
        </div>
      </Link>

      <div
        className={`relative w-full flex-1 group touch-pan-y select-none bg-white dark:bg-[#111] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onTouchStart={(e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); setIsSwiping(false); }}
        onTouchMove={(e) => { setTouchEnd(e.targetTouches[0].clientX); setIsSwiping(true); }}
        onTouchEnd={handleSwipe}
        onMouseDown={(e) => { setIsDragging(true); setTouchEnd(null); setTouchStart(e.clientX); setIsSwiping(false); }}
        onMouseMove={(e) => { if (isDragging) { setTouchEnd(e.clientX); setIsSwiping(true); } }}
        onMouseUp={() => { setIsDragging(false); handleSwipe(); }}
        onMouseLeave={() => { if (isDragging) { setIsDragging(false); handleSwipe(); } }}
      >
        {slideItems.map((item, index) => (
          <div
            key={item.type === 'news' ? item.data._id : `ad-${index}`}
            onClick={() => handleSlideClick(item)}
            className={`transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"}`}
          >
            {item.type === 'news' ? (
              <div className="flex flex-col h-full">
                <div className="relative w-full h-48 md:h-64 shrink-0 overflow-hidden">
                  <Image
                    src={item.data.media?.[0]?.url || "https://picsum.photos/1200/800"}
                    alt={item.data.headline || "Breaking News"}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 65vw"
                    className="object-cover"
                    draggable="false"
                  />
                </div>

                <div className="flex flex-col gap-1 px-4 py-3 pb-5">
                  <span className="inline-block text-[#e3000f] text-[10px] font-black uppercase tracking-widest">
                    {item.data.category || "Alert"} • {item.data.location?.ward || "Latest"}
                  </span>
                  <h3 className="text-black dark:text-white font-bold text-lg md:text-2xl leading-tight line-clamp-3">
                    {item.data.headline}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-2">
                    {new Date(item.data.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <CarouselAdCard />
              </div>
            )}
          </div>
        ))}

        <div className="absolute inset-0 z-30 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"><ChevronLeft /></button>
          <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="w-10 h-10 rounded-full bg-black/40 hover:bg-[#e3000f] backdrop-blur-md flex items-center justify-center text-white pointer-events-auto transition-colors border border-white/10"><ChevronRight /></button>
        </div>

        <div className="absolute bottom-4 right-5 z-30 flex gap-2 pointer-events-none">
          {slideItems.map((_, idx) => (
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
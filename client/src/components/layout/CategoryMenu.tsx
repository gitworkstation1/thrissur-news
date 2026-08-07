"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Layers, PlayCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { fetchArticles, fetchCategories } from "@/lib/api";

const DEFAULT_CATEGORIES = [
  "News",
  "Local",
  "Crime",
  "Politics",
  "Sports",
  "Business",
  "Entertainment",
  "Technology",
  "Health",
  "Education",
  "Automotive",
  "Real Estate",
  "Lifestyle",
  "Food",
  "Music",
  "Trending",
  "Astro",
  "Career",
  "Agriculture",
  "Lottery",
  "Obituary",
];

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getMediaUrl = (article: any) => {
  const media = article?.media?.[0];
  if (!media?.url) return "https://picsum.photos/400/250";
  if (media.type === "youtube-short" || media.url.includes("youtube.com")) {
    const videoId = media.url.split("/").pop()?.split("?")[0];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return media.url;
};

export default function CategoryMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Mega Menu States
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryDataCache, setCategoryDataCache] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  let selectedCategory = searchParams.get("category") || "News";
  if (pathname === "/obituary") {
    selectedCategory = "Obituary";
  }

  useEffect(() => {
    const loadDynamicCategories = async () => {
      try {
        const activeCategories = await fetchCategories();

        if (activeCategories && activeCategories.length > 0) {
          const visibleCategoryNames = activeCategories
            .filter((cat: any) => cat.isVisible)
            .sort((a: any, b: any) => a.order - b.order)
            .map((cat: any) => cat.name);

          if (visibleCategoryNames.length > 0) {
            setCategories(visibleCategoryNames);
          }
        }
      } catch (error) {
        console.error("Failed to load dynamic categories:", error);
      }
    };

    loadDynamicCategories();
  }, []);

  const handleCategoryHover = async (cat: string) => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return;
    }

    setHoveredCategory(cat);
    if (categoryDataCache[cat]) return;

    setIsLoading(true);
    try {
      const data = await fetchArticles(
        cat,
        "",
        1,
        5, 
        "published",
        "All Places",
      );
      setCategoryDataCache((prev) => ({
        ...prev,
        [cat]: data.articles || [],
      }));
    } catch (err) {
      console.error(`Failed to fetch preview for ${cat}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (cat: string) => {
    if (cat === "News") {
      router.push("/");
    } else if (cat === "Obituary") {
      router.push("/obituary");
    } else {
      router.push(`/?category=${cat}`);
    }
    setIsOpen(false);
    setHoveredCategory(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      if (window.scrollY > 60) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const activeArticles = hoveredCategory
    ? categoryDataCache[hoveredCategory] || []
    : [];

  return (
    <div
      className={`w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800/60 sticky top-14 z-[95] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isScrolled
          ? "-translate-y-8 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .hide-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `,
        }}
      />

      <div className="w-full px-4 h-12 flex items-center justify-between relative max-w-[1600px] mx-auto">
        {/* Horizontal Category List */}
        <div
          className="flex-1 flex items-center gap-6 overflow-x-auto pr-4 hide-scroll h-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isHovered = hoveredCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                onMouseEnter={() => handleCategoryHover(cat)}
                className={`relative whitespace-nowrap h-full flex items-center text-[11px] font-black tracking-widest uppercase transition-colors outline-none border-b-[3px]
                  ${
                    isSelected
                      ? "text-[#e3000f] border-[#e3000f]"
                      : isHovered
                      ? "text-[#e3000f] border-transparent"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-100 border-transparent"
                  }
                `}
              >
                {cat}

                <div
                  className={`absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#e3000f] transition-all duration-300 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Category Dropdown Wrapper */}
        <div
          className="relative flex-shrink-0 pl-3 border-l border-gray-200 dark:border-gray-700 ml-1 h-full flex items-center z-[10001]"
          ref={dropdownRef}
          onMouseEnter={() => setHoveredCategory(null)}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none group"
            aria-label="More categories"
          >
            <ChevronDown
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isOpen ? "rotate-180 text-[#e3000f]" : ""
              }`}
            />
          </button>

          {/* All Categories Dropdown */}
          {isOpen && (
            <div className="absolute top-[calc(100%+0px)] right-0 w-56 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-t-2 border-t-[#e3000f] border-gray-200/60 dark:border-gray-700/50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[10050]">
              <div className="px-4 py-2 mb-1 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2 text-[#e3000f]">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  All Categories
                </span>
              </div>

              {/* Capped at Automotive height with scroll support */}
              <div className="max-h-[460px] overflow-y-auto hide-scroll">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors outline-none
                      ${
                        selectedCategory === cat
                          ? "text-[#e3000f] bg-red-50/80 dark:bg-red-900/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      }
                    `}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub News Mega Menu */}
      {hoveredCategory && (
        <div className="absolute top-full left-0 w-full bg-white/98 dark:bg-[#111]/98 backdrop-blur-xl shadow-2xl border-t-2 border-t-[#e3000f] border-b border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-1 duration-200 z-[10000]">
          <div className="max-w-[1600px] mx-auto px-4 py-4 h-32 flex items-center gap-8">
            {isLoading && activeArticles.length === 0 ? (
              <div className="flex w-full items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#e3000f]" />
                <span className="text-xs font-bold uppercase tracking-wider">Loading stories...</span>
              </div>
            ) : activeArticles.length === 0 ? (
              <div className="w-full text-center text-gray-400 text-sm font-semibold">
                No recent stories found in {hoveredCategory}.
              </div>
            ) : (
              <>
                <div className="w-48 shrink-0 h-full flex flex-col justify-center border-r border-gray-200 dark:border-gray-800 pr-6 pl-3 border-l-2 border-l-[#e3000f] bg-gradient-to-r from-red-50/40 dark:from-red-950/10 to-transparent">
                  <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight truncate">
                    {hoveredCategory}
                  </h3>
                  <button
                    onClick={() => handleCategoryClick(hoveredCategory)}
                    className="mt-2 text-[#e3000f] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline transition-all"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-6 overflow-x-auto hide-scroll h-full pr-4">
                  {activeArticles.slice(0, 5).map((article: any) => (
                    <div
                      key={article._id}
                      onClick={() => {
                        router.push(`/full-coverage/${article._id}`);
                        setHoveredCategory(null);
                      }}
                      className="flex items-center gap-4 group cursor-pointer w-[280px] shrink-0"
                    >
                      <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                        <img
                          src={getMediaUrl(article)}
                          alt={article.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {(article.media?.some((m: any) => m.type === "video" || m.type === "youtube-short") || article.body?.includes("<iframe")) && (
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <PlayCircle className="w-6 h-6 text-white drop-shadow-md" />
                           </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="font-bold text-xs leading-snug text-gray-900 dark:text-white group-hover:text-[#e3000f] transition-colors line-clamp-2">
                          {article.headline}
                        </h4>
                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                          {getTimeAgo(article.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
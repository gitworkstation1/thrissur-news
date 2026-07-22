"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Layers, PlayCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { fetchArticles, fetchCategories } from "@/lib/api"; // You will also import fetchCategories here soon

// ⚡ THESE ARE NOW JUST FALLBACKS.
// The real list will be fetched from your database.
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

  // 👇 Removed the newCategoryName and isCreating states from here!

  let selectedCategory = searchParams.get("category") || "News";
  if (pathname === "/obituary") {
    selectedCategory = "Obituary";
  }

  // Replace your existing useEffect with this one:
  useEffect(() => {
    const loadDynamicCategories = async () => {
      try {
        const activeCategories = await fetchCategories();

        if (activeCategories && activeCategories.length > 0) {
          // Filter out hidden categories, sort by order, and extract the names
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
    setHoveredCategory(cat);
    if (categoryDataCache[cat]) return;

    setIsLoading(true);
    try {
      const data = await fetchArticles(
        cat,
        "",
        1,
        3,
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
      className={`w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800/60 sticky top-14 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isScrolled
          ? "-translate-y-8 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
      `,
        }}
      />

      <div className="w-full px-4 h-12 flex items-center justify-between relative max-w-[1600px] mx-auto">
        <div
          className="flex-1 flex items-center gap-6 overflow-x-auto pr-4 hide-scroll h-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              onMouseEnter={() => handleCategoryHover(cat)}
              className={`whitespace-nowrap h-full flex items-center text-[11px] font-black tracking-widest uppercase transition-colors outline-none border-b-2
                ${
                  selectedCategory === cat
                    ? "text-[#e3000f] border-[#e3000f]"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-gray-100 border-transparent"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="relative flex-shrink-0 pl-3 border-l border-gray-200 dark:border-gray-700 ml-1 h-full flex items-center"
          ref={dropdownRef}
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

          {isOpen && (
            <div className="absolute top-[calc(100%+0px)] right-0 w-56 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-t-0 border-gray-200/60 dark:border-gray-700/50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 mb-1 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  All Categories
                </span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto hide-scroll">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors outline-none
                      ${
                        selectedCategory === cat
                          ? "text-[#e3000f] bg-red-50 dark:bg-red-900/10"
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

      {hoveredCategory && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-t border-gray-100 dark:border-gray-800 hidden lg:block animate-in fade-in slide-in-from-top-1 duration-200 z-[10000]">
          <div className="max-w-[1400px] mx-auto p-8">
            {isLoading && activeArticles.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#e3000f]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Loading stories...
                </span>
              </div>
            ) : activeArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm font-semibold">
                No recent stories found in {hoveredCategory}.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-8">
                <div className="flex flex-col justify-between border-r border-gray-100 dark:border-gray-800 pr-6">
                  <div>
                    <span className="text-[10px] font-bold text-[#e3000f] uppercase tracking-widest">
                      Category
                    </span>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tight mt-1">
                      {hoveredCategory}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Catch up on the latest local reports and updates for{" "}
                      {hoveredCategory}.
                    </p>
                  </div>

                  <button
                    onClick={() => handleCategoryClick(hoveredCategory)}
                    className="mt-6 w-full py-2.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-[#e3000f] hover:text-white dark:hover:bg-[#e3000f] text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                  >
                    View All {hoveredCategory}
                  </button>
                </div>

                {activeArticles.slice(0, 3).map((article: any) => (
                  <div
                    key={article._id}
                    onClick={() => {
                      router.push(`/full-coverage/${article._id}`);
                      setHoveredCategory(null);
                    }}
                    className="flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getMediaUrl(article)}
                        alt={article.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-[#e3000f] transition-colors line-clamp-2">
                      {article.headline}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {getTimeAgo(article.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

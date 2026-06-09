import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";
import Link from "next/link";

import PageTransition from "@/components/PageTransition";

import CategoryMenu from "@/components/CategoryMenu";
import BreakingNewsCarousel from "@/components/BreakingNewsCarousel";
import QuickReadButton from "@/components/QuickReadButton";
import BookmarkButton from "@/components/BookmarkButton";
import PlacesMenu from "@/components/PlacesMenu";

// Helper function to keep our date formatting clean and reusable
const formatArticleDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedDate} • ${hours}:${formattedMinutes} ${ampm}`;
};

// 1. Wrap the searchParams type in a Promise
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; ward?: string }>;
}) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams?.category;
  const selectedWard = resolvedParams?.ward;

  // We now split the data so local filters don't break the global feed!
  let globalData = { articles: [] as Article[] };
  let localData = { articles: [] as Article[] };

  try {
    // Fetch 1: Global/Category News 
    // Args: category, search, page, limit, status, ward
    globalData = await fetchArticles(selectedCategory, "", 1, 20, "published", "All Places");

    // Fetch 2: Local News (Only fetches if a specific place is clicked)
    if (selectedWard && selectedWard !== "All Places") {
      // Pass the selectedWard in the 6th position so it maps correctly!
      localData = await fetchArticles(selectedCategory, "", 1, 15, "published", selectedWard);
    } else {
      localData = globalData; // If "All Places", just use the global pool
    }
  } catch (err) {
    console.error(err);
  }

  const allGlobalArticles = globalData.articles || [];

  // ==========================================
  // GLOBAL LAYOUT LOGIC (Hero & Top 10)
  // ==========================================

  // 1. First, grab all the actual breaking news
  let carouselArticles = allGlobalArticles.filter((a) => a.isBreaking);

  // 2. If we have less than 5 slides, fill the rest with the freshest normal news
  const MIN_CAROUSEL_SLIDES = 5;
  if (carouselArticles.length < MIN_CAROUSEL_SLIDES) {
    // Find all articles that ARE NOT breaking news
    const nonBreakingNews = allGlobalArticles.filter((a) => !a.isBreaking);

    // Calculate exactly how many more slides we need to reach 5
    const neededSlides = MIN_CAROUSEL_SLIDES - carouselArticles.length;

    // Slice that exact amount from the top of the normal news pile
    const fillerArticles = nonBreakingNews.slice(0, neededSlides);

    // Combine them together!
    carouselArticles = [...carouselArticles, ...fillerArticles];
  }

  const topTenNews = allGlobalArticles.slice(0, 10);
  const mainArticle = topTenNews[0];
  const scrollingArticles = topTenNews.slice(1);

  // Deduplicate for the bottom grids
  const shownArticleIds = new Set(topTenNews.map((a) => a._id));
  const remainingGlobalArticles = allGlobalArticles.filter(
    (a) => !shownArticleIds.has(a._id),
  );

  // ==========================================
  // COLUMN SPLIT LOGIC (The Fix!)
  // ==========================================
  let localFeedArticles: Article[] = [];
  let moreStoriesArticles: Article[] = [];

  if (selectedWard && selectedWard !== "All Places") {
    // If a specific place is clicked: Left gets that place, Right gets everything else
    localFeedArticles = localData.articles
      ? localData.articles.slice(0, 15)
      : [];
    moreStoriesArticles = remainingGlobalArticles;
  } else {
    // If "All Places" is active: Split the remaining news evenly between columns!
    localFeedArticles = remainingGlobalArticles.slice(0, 10); // Next 10 go to left
    moreStoriesArticles = remainingGlobalArticles.slice(10); // The rest go to right
  }

  const transitionKey = `${selectedCategory || "News"}-${selectedWard || "AllPlaces"}`; // 1. Global Key: Changes ONLY when the main category changes
  const globalKey = selectedCategory || "News";

  // 2. Local Key: Changes when the category OR the location changes
  const localKey = `${selectedCategory || "News"}-${selectedWard || "AllPlaces"}`;

  return (
    <div className="pb-24 relative w-full">
      <CategoryMenu />

      <PageTransition transitionKey={globalKey}>
        {/* --- HERO SECTION: CAROUSEL & TOP 10 --- */}
        <div
          id="hero-top-ten"
          className="max-w-[96%] mx-auto px-4 py-6 flex flex-col md:flex-row gap-8 lg:gap-10 items-start"
        >
          <div className="w-full md:w-[62%] lg:w-[65%] shrink-0">
            <BreakingNewsCarousel articles={carouselArticles} />
          </div>

          <div className="w-full md:w-[38%] lg:w-[35%] md:sticky md:top-20 mt-4 md:mt-0">
            <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase mb-4">
              TOP TEN NEWS
            </h2>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] overflow-hidden flex flex-col h-[500px] md:h-[600px] lg:h-[calc(100vh-140px)] shadow-sm">
              {/* 1. PINNED MAIN ARTICLE */}
              {mainArticle && (
                <Link
                  href={`/full-coverage/${mainArticle._id}`}
                  className="block relative border-b border-gray-200 dark:border-gray-800/80 p-4 bg-white dark:bg-[#111] flex-shrink-0 z-20 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <span className="absolute -right-2 -bottom-4 text-[110px] leading-none font-black text-[#e3000f] opacity-5 dark:opacity-[0.03] z-0 pointer-events-none select-none tracking-tighter transition-all group-hover:scale-110">
                    1
                  </span>

                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="relative">
                      <img
                        src={
                          mainArticle.media?.[0]?.url ||
                          "https://picsum.photos/400/250"
                        }
                        className="w-full h-44 object-cover rounded-lg shadow-sm"
                        alt="Thumbnail"
                      />
                      <BookmarkButton
                        article={mainArticle}
                        className="absolute top-3 right-3 bg-white/95 dark:bg-black/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#e3000f] font-black uppercase border-t-[3px] border-[#e3000f] pt-1 inline-block mb-1 tracking-wider">
                        {mainArticle.category || "Latest"}{" "}
                        {mainArticle.location?.ward &&
                          `• ${mainArticle.location.ward}`}
                      </span>
                      <h3 className="font-bold text-base md:text-lg leading-snug text-black dark:text-white group-hover:text-[#e3000f] transition-colors">
                        {mainArticle.headline}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatArticleDate(mainArticle.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* 2. SCROLLING SUB-ARTICLES */}
              <div className="flex-1 overflow-y-auto relative">
                <div className="flex flex-col">
                  {scrollingArticles.map((item, idx) => {
                    return (
                      <Link
                        href={`/full-coverage/${item._id}`}
                        key={item._id}
                        className="block relative border-b border-gray-100 dark:border-gray-800/60 p-4 last:border-0 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors overflow-hidden"
                      >
                        <span className="absolute -right-2 -bottom-4 text-[110px] leading-none font-black text-[#e3000f] opacity-5 dark:opacity-[0.03] z-0 pointer-events-none select-none tracking-tighter transition-all group-hover:scale-110">
                          {idx + 2}
                        </span>
                        <div className="relative z-10 flex gap-4 items-start">
                          <img
                            src={
                              item.media?.[0]?.url ||
                              "https://picsum.photos/100/100"
                            }
                            className="w-24 h-16 object-cover rounded shadow-sm flex-shrink-0"
                            alt="Thumbnail"
                          />
                          <div className="flex-1 pr-8">
                            <span className="text-[9px] text-[#e3000f] font-black uppercase border-[#e3000f] pt-0.5 inline-block mb-1 tracking-wider">
                              {item.category || "Latest"}{" "}
                              {item.location?.ward && `• ${item.location.ward}`}
                            </span>
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-black dark:text-white group-hover:text-[#e3000f] transition-colors">
                              {item.headline}
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                              {formatArticleDate(item.createdAt)}
                            </p>
                          </div>
                          <BookmarkButton
                            article={item}
                            className="absolute top-0 right-0 p-1"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      {/* --- BOTTOM GRID: PLACES & MORE STORIES --- */}
      <div className="max-w-[96%] mx-auto px-4 py-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          
          {/* LEFT COLUMN: PLACES FEED */}
          <div className="flex flex-col h-full">
            <PlacesMenu />

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col gap-6 flex-1">
                {localFeedArticles.length > 0 ? (
                  localFeedArticles.map((item) => (
                    <Link
                      href={`/full-coverage/${item._id}`}
                      key={item._id}
                      className="group cursor-pointer flex gap-4 items-start border-b border-gray-100 dark:border-gray-800/60 pb-6 last:border-0"
                    >
                      <img
                        src={
                          item.media?.[0]?.url ||
                          "https://picsum.photos/400/250"
                        }
                        className="w-32 h-24 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                        alt={item.headline}
                      />
                      <div className="flex-1">
                        <span className="text-[10px] text-[#e3000f] font-black uppercase tracking-widest mb-1.5 block">
                          {item.category} • {item.location?.ward}
                        </span>
                        <h3 className="font-bold text-base leading-snug text-black dark:text-white group-hover:text-[#e3000f] transition-colors mb-2">
                          {item.headline}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatArticleDate(item.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    No recent updates available.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

          {/* RIGHT COLUMN: MORE STORIES (Chronological feed) */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                More Stories
              </h2>
            </div>

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col gap-6">
                {moreStoriesArticles.length > 0 ? (
                  moreStoriesArticles.map((item) => (
                    <Link
                      href={`/full-coverage/${item._id}`}
                      key={item._id}
                      className="group cursor-pointer flex gap-4 items-center"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            item.media?.[0]?.url ||
                            "https://picsum.photos/200/150"
                          }
                          className="w-28 h-20 object-cover rounded-md shadow-sm transition-transform duration-500 group-hover:scale-105"
                          alt="News thumbnail"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] text-[#e3000f] font-black uppercase tracking-wider mb-1 block">
                          {item.category || "Latest"} • {item.location?.ward}
                        </span>
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-black dark:text-white group-hover:text-[#e3000f] transition-colors mb-1.5">
                          {item.headline}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {formatArticleDate(item.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    More stories coming soon! Stay tuned for the latest updates.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
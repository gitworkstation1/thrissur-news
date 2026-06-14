import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";
import Link from "next/link";
import React from "react"; 
import DesktopHeroAd from "@/components/DesktopHeroAd";

import PageTransition from "@/components/PageTransition";
import CategoryMenu from "@/components/CategoryMenu";
import BreakingNewsCarousel from "@/components/BreakingNewsCarousel";
import QuickReadButton from "@/components/QuickReadButton";
import BookmarkButton from "@/components/BookmarkButton";
import PlacesMenu from "@/components/PlacesMenu";
import HomeAdCard from "@/components/HomeAdCard"; 
import ShowsSection from "@/components/ShowsSection";
import LiveTVSection from "@/components/LiveTVSection";

export const dynamic = 'force-dynamic';

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; ward?: string }>;
}) {
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams?.category;
  const selectedWard = resolvedParams?.ward;

  let globalData = { articles: [] as Article[] };
  let localData = { articles: [] as Article[] };

  try {
    globalData = await fetchArticles(selectedCategory, "", 1, 20, "published", "All Places");

    if (selectedWard && selectedWard !== "All Places") {
      localData = await fetchArticles(selectedCategory, "", 1, 15, "published", selectedWard);
    } else {
      localData = globalData;
    }
  } catch (err) {
    console.error(err);
  }

  const allGlobalArticles = (globalData.articles || []).filter(
    (a) => a.category !== 'Shorts' && a.category !== 'Advertisement'
  );

  if (localData.articles) {
    localData.articles = localData.articles.filter(
      (a) => a.category !== 'Shorts' && a.category !== 'Advertisement'
    );
  }

  let carouselArticles = allGlobalArticles.filter((a) => a.isBreaking);

  const MIN_CAROUSEL_SLIDES = 5;
  if (carouselArticles.length < MIN_CAROUSEL_SLIDES) {
    const nonBreakingNews = allGlobalArticles.filter((a) => !a.isBreaking);
    const neededSlides = MIN_CAROUSEL_SLIDES - carouselArticles.length;
    const fillerArticles = nonBreakingNews.slice(0, neededSlides);
    carouselArticles = [...carouselArticles, ...fillerArticles];
  }

  const topTenNews = allGlobalArticles.slice(0, 10);
  const mainArticle = topTenNews[0];
  const scrollingArticles = topTenNews.slice(1);

  const shownArticleIds = new Set(topTenNews.map((a) => a._id));
  const remainingGlobalArticles = allGlobalArticles.filter(
    (a) => !shownArticleIds.has(a._id),
  );

  let localFeedArticles: Article[] = [];
  let moreStoriesArticles: Article[] = [];
  let editorsPickArticles: Article[] = [];

  // --- 3-COLUMN DATA SPLIT LOGIC ---
  if (selectedWard && selectedWard !== "All Places") {
    localFeedArticles = localData.articles ? localData.articles.slice(0, 15) : [];
    moreStoriesArticles = remainingGlobalArticles.slice(0, 8);
    editorsPickArticles = remainingGlobalArticles.slice(8, 16);
  } else {
    localFeedArticles = remainingGlobalArticles.slice(0, 10);
    moreStoriesArticles = remainingGlobalArticles.slice(10, 18);
    editorsPickArticles = remainingGlobalArticles.slice(18, 26);
  }

  // --- HARDCODED ARTICLES INJECTION ---
  const hardcodedExtraStories: any[] = [
    {
      _id: "hc-1",
      category: "Tech",
      location: { ward: "Silicon Valley" },
      headline: "New AI Model Promises to Revolutionize Web Development",
      createdAt: new Date().toISOString(),
      media: [{ url: "https://picsum.photos/seed/ai/200/150" }]
    },
    {
      _id: "hc-2",
      category: "Business",
      location: { ward: "Downtown" },
      headline: "Local Startups See Record Funding in Q3",
      createdAt: new Date().toISOString(),
      media: [{ url: "https://picsum.photos/seed/business/200/150" }]
    },
    {
      _id: "hc-3",
      category: "Science",
      location: { ward: "Research Center" },
      headline: "Astronomers Discover New Earth-Like Exoplanet",
      createdAt: new Date().toISOString(),
      media: [{ url: "https://picsum.photos/seed/space/200/150" }]
    },
    {
      _id: "hc-4",
      category: "Health",
      location: { ward: "Medical District" },
      headline: "Breakthrough Study Reveals Benefits of Daily Meditation",
      createdAt: new Date().toISOString(),
      media: [{ url: "https://picsum.photos/seed/health/200/150" }]
    },
    {
      _id: "hc-5",
      category: "Sports",
      location: { ward: "City Arena" },
      headline: "Championship Finals Set to Break Viewership Records",
      createdAt: new Date().toISOString(),
      media: [{ url: "https://picsum.photos/seed/sports/200/150" }]
    }
  ];

  moreStoriesArticles = [...moreStoriesArticles, ...hardcodedExtraStories];

  if (editorsPickArticles.length === 0) {
    editorsPickArticles = allGlobalArticles.slice(0, 6);
  }

  const transitionKey = `${selectedCategory || "News"}-${selectedWard || "AllPlaces"}`;
  const globalKey = selectedCategory || "News";
  const localKey = `${selectedCategory || "News"}-${selectedWard || "AllPlaces"}`;

  return (
    <div className="pb-24 relative w-full">
      <CategoryMenu />

      <PageTransition transitionKey={globalKey}>
        <div
          id="hero-top-ten"
          className="max-w-[96%] mx-auto px-4 py-6 flex flex-col md:flex-row gap-8 lg:gap-10 items-stretch"
        >
          {/* CAROUSEL & DESKTOP AD CONTAINER */}
          <div className="w-full md:w-[62%] lg:w-[65%] shrink-0 flex flex-col">
            <BreakingNewsCarousel articles={carouselArticles} />
            
            {/* === INJECTED DESKTOP HERO AD === */}
            <div className="flex-1 flex flex-col">
              <DesktopHeroAd />
            </div>
          </div>

          <div className="w-full md:w-[38%] lg:w-[35%] md:sticky md:top-20 mt-4 md:mt-0">
            <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase mb-4">
              TOP TEN NEWS
            </h2>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] overflow-hidden flex flex-col md:h-[600px] lg:h-[calc(100vh-140px)] shadow-sm">
              
              {/* Main Article */}
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

              {/* Scrolling List Container */}
              <div className="h-[320px] md:h-auto md:flex-1 overflow-y-auto relative">
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

      {/* --- INJECTED LIVE TV SECTION --- */}
      <LiveTVSection />

      <div className="max-w-[96%] mx-auto px-4 py-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* COLUMN 1: PLACES FEED */}
          <div className="flex flex-col">

            {/* Top Ad Space (Mobile Only) */}
            <div className="mb-8 w-full md:hidden">
              <HomeAdCard />
            </div>

            <PlacesMenu />

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col flex-1">
                {localFeedArticles.length > 0 ? (
                  localFeedArticles.map((item, index) => (
                    <React.Fragment key={item._id}>
                      {/* Inject Ad after every 4th article (All Screens) */}
                      {index > 0 && index % 4 === 0 && (
                        <div className="pb-6">
                          <HomeAdCard />
                        </div>
                      )}
                      <Link
                        href={`/full-coverage/${item._id}`}
                        className="group cursor-pointer flex gap-4 items-start border-b border-gray-100 dark:border-gray-800/60 pb-6 mb-6 last:border-0 last:mb-0 last:pb-0"
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
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    No recent updates available.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

          {/* COLUMN 2: MORE STORIES */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                More Stories
              </h2>
            </div>

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col">
                {moreStoriesArticles.length > 0 ? (
                  moreStoriesArticles.map((item, index) => (
                    <React.Fragment key={item._id}>
                      {/* Inject Ad after every 4th article (All Screens) */}
                      {index > 0 && index % 4 === 0 && (
                        <div className="pb-6">
                          <HomeAdCard />
                        </div>
                      )}
                      <Link
                        href={`/full-coverage/${item._id}`}
                        className="group cursor-pointer flex gap-4 items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800/60 last:border-0 last:mb-0 last:pb-0"
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
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    More stories coming soon! Stay tuned for the latest updates.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

          {/* COLUMN 3: EDITOR'S PICK */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                Editor's Pick
              </h2>
            </div>

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col">
                {editorsPickArticles.length > 0 ? (
                  editorsPickArticles.map((item, index) => (
                    <React.Fragment key={`editor-${item._id}`}>
                      {/* Inject Ad after every 4th article (All Screens) */}
                      {index > 0 && index % 4 === 0 && (
                        <div className="pb-6">
                          <HomeAdCard />
                        </div>
                      )}
                      <Link
                        href={`/full-coverage/${item._id}`}
                        className="group cursor-pointer flex gap-4 items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800/60 last:border-0 last:mb-0 last:pb-0"
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
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Editor's picks coming soon!
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

        </div>
      </div>

      {/* --- INJECTED SHOWS SECTION --- */}
      <ShowsSection />

    </div>
  );
}
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Play } from "lucide-react";

import PageTransition from "@/components/layout/PageTransition";
import CategoryMenu from "@/components/layout/CategoryMenu";
import BreakingNewsCarousel from "@/components/sections/BreakingNewsCarousel";
import QuickReadButton from "@/components/ui/QuickReadButton";
import BookmarkButton from "@/components/ui/BookmarkButton";
import PlacesMenu from "@/components/layout/PlacesMenu";
import HomeAdCard from "@/components/ad/HomeAdCard";
import ShowsSection from "@/components/sections/ShowsSection";
import LiveTVSection from "@/components/sections/LiveTVSection";

export const revalidate = 60; // <-- PHASE 2: ISR Caching added. Database protected!

// <-- PHASE 3: Global SEO added for social media sharing
export const metadata = {
  title: 'Integrity News | Thrissur Local Updates',
  description: 'Your trusted source for hyper-local breaking news, politics, and live updates across Thrissur.',
  openGraph: {
    title: 'Integrity News | Thrissur Local Updates',
    description: 'Your trusted source for hyper-local breaking news, politics, and live updates across Thrissur.',
    url: 'https://yourdomain.com',
    siteName: 'Integrity News',
    images: [
      {
        url: 'https://picsum.photos/1200/630', // TODO: Swap with your main website banner URL
        width: 1200,
        height: 630,
        alt: 'Integrity News Banner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

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
  let adsData = { articles: [] as any[] };

  try {
    globalData = await fetchArticles(
      selectedCategory,
      "",
      1,
      20,
      "published",
      "All Places",
    );

    // --- FETCH LIVE ADS ---
    adsData = await fetchArticles(
      "Advertisement",
      "",
      1,
      15,
      "published",
      "All Places",
    );

    if (selectedWard && selectedWard !== "All Places") {
      localData = await fetchArticles(
        selectedCategory,
        "",
        1,
        15,
        "published",
        selectedWard,
      );
    } else {
      localData = globalData;
    }
  } catch (err) {
    console.error(err);
  }

  // --- FILTER ADS FOR HOMEPAGE HERO ZONE ---
  const activeAds = adsData.articles || [];
  const heroAds = activeAds.filter(
    (ad) => ad.location?.landmark === "Homepage Hero",
  );
  const shuffledHeroAds = heroAds.sort(() => 0.5 - Math.random());
  const leftAd = shuffledHeroAds[0] || null;
  const rightAd = shuffledHeroAds[1] || null;

  const allGlobalArticles = (globalData.articles || []).filter(
    (a) => a.category !== "Shorts" && a.category !== "Advertisement",
  );

  if (localData.articles) {
    localData.articles = localData.articles.filter(
      (a) => a.category !== "Shorts" && a.category !== "Advertisement",
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

  // Check if main article has video
  const mainHasVideo =
    mainArticle?.body?.includes("<iframe") ||
    mainArticle?.media?.some(
      (m: any) => m.type === "video" || m.type === "youtube-short",
    );

  const shownArticleIds = new Set(topTenNews.map((a) => a._id));
  const remainingGlobalArticles = allGlobalArticles.filter(
    (a) => !shownArticleIds.has(a._id),
  );

  let localFeedArticles: Article[] = [];
  let moreStoriesArticles: Article[] = [];
  let editorsPickArticles: Article[] = [];

  // --- 3-COLUMN DATA SPLIT LOGIC ---
  if (selectedWard && selectedWard !== "All Places") {
    localFeedArticles = localData.articles
      ? localData.articles.slice(0, 15)
      : [];
    moreStoriesArticles = remainingGlobalArticles.slice(0, 8);
    editorsPickArticles = remainingGlobalArticles.slice(8, 16);
  } else {
    localFeedArticles = remainingGlobalArticles.slice(0, 10);
    moreStoriesArticles = remainingGlobalArticles.slice(10, 18);
    editorsPickArticles = remainingGlobalArticles.slice(18, 26);
  }

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
          className="max-w-[96%] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8 lg:gap-10 lg:h-[680px] xl:h-[720px]"
        >
          {/* CAROUSEL & DESKTOP AD CONTAINER */}
          <div className="w-full lg:w-[65%] shrink-0 flex flex-col h-full min-h-0">
            <div className="w-full flex-1 min-h-0 relative rounded-2xl overflow-hidden shadow-sm">
              <BreakingNewsCarousel articles={carouselArticles} />
            </div>

            {/* === ADVERTISEMENT SECTION === */}
            <div className="w-full shrink-0 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Advertisement
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Ad */}
                <a
                  href={leftAd?.externalLink || "#"}
                  target={leftAd ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="group relative block w-full h-[100px] sm:h-[120px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {leftAd?.media?.[0]?.url ? (
                    <>
                      <Image
                        src={leftAd.media[0].url}
                        alt="Ad Thumbnail"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
                        Sponsored
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-transparent">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">🛍️</span>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Premium Sponsor
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                            Placeholder Ad Space
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </a>

                {/* Right Ad */}
                <a
                  href={rightAd?.externalLink || "#"}
                  target={rightAd ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="group relative block w-full h-[100px] sm:h-[120px] bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {rightAd?.media?.[0]?.url ? (
                    <>
                      <Image
                        src={rightAd.media[0].url}
                        alt="Ad Thumbnail"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
                        Sponsored
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-transparent">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">⚡</span>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Local Business Ad
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                            Placeholder Ad Space
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </a>
              </div>
            </div>
          </div>

          {/* TOP TEN NEWS CONTAINER */}
          <div className="w-full lg:w-[35%] flex flex-col h-full min-h-0 mt-8 lg:mt-0">
            <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase mb-4 shrink-0">
              TOP TEN NEWS
            </h2>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
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
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={
                          mainArticle.media?.[0]?.url ||
                          "https://picsum.photos/400/250"
                        }
                        width={600}
                        height={337}
                        priority
                        className="w-full h-44 object-cover shadow-sm group-hover:scale-105 transition-transform duration-500"
                        alt="Thumbnail"
                      />
                      {/* MAIN ARTICLE PLAY ICON (FIXED SHADOW) */}
                      {mainHasVideo && (
                        <div className="absolute bottom-3 left-3 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-[#e3000f] shadow-[0_4px_10px_rgba(0,0,0,0.25)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-5 h-5 text-white fill-white ml-1" />
                        </div>
                      )}
                      <BookmarkButton
                        article={mainArticle}
                        className="absolute top-3 right-3 bg-white/95 dark:bg-black/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform z-20"
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

              {/* ⚡ THE ULTIMATE SCROLLBAR KILLER FOR THIS SECTION ⚡ */}
              <style dangerouslySetInnerHTML={{__html: `
                .hide-top10-scroll::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                .hide-top10-scroll {
                  -ms-overflow-style: none !important;
                  scrollbar-width: none !important;
                }
              `}} />

              {/* Scrolling List Container */}
              <div className="flex-1 max-h-[350px] lg:max-h-[none] overflow-y-auto relative min-h-0 hide-top10-scroll">
                <div className="flex flex-col">
                  {scrollingArticles.map((item, idx) => {
                    const hasVideo =
                      item.body?.includes("<iframe") ||
                      item.media?.some(
                        (m: any) =>
                          m.type === "video" || m.type === "youtube-short",
                      );

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
                          <div className="relative flex-shrink-0 overflow-hidden rounded shadow-sm">
                            <Image
                              src={
                                item.media?.[0]?.url ||
                                "https://picsum.photos/100/100"
                              }
                              width={96}
                              height={64}
                              className="w-24 h-16 object-cover group-hover:scale-105 transition-transform duration-500"
                              alt="Thumbnail"
                            />
                            {/* SCROLLING ARTICLE PLAY ICON */}
                            {hasVideo && (
                              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3000f]/95 backdrop-blur-sm shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

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

      {/* --- WIDE DIVIDER (Doesn't touch corners) --- */}
      <div className="w-[92%] lg:w-[96%] mx-auto border-b border-black-200 dark:border-white/10 my-10"></div>


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
                  localFeedArticles.map((item, index) => {
                    const hasVideo =
                      item.body?.includes("<iframe") ||
                      item.media?.some(
                        (m: any) =>
                          m.type === "video" || m.type === "youtube-short",
                      );

                    return (
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
                          <div className="relative flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                            <Image
                              src={
                                item.media?.[0]?.url ||
                                "https://picsum.photos/400/250"
                              }
                              width={128}
                              height={96}
                              className="w-32 h-24 object-cover group-hover:scale-105 transition-transform duration-500"
                              alt={item.headline}
                            />
                            {/* LOCAL FEED PLAY ICON */}
                            {hasVideo && (
                              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3000f]/95 backdrop-blur-sm shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

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
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-[#111] p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                    No recent updates available.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

          {/* COLUMN 2: MORE STORIES */}
          <div className="flex flex-col md:border-l md:border-gray-300 md:dark:border-gray-700 md:pl-8 lg:pl-12">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                More Stories
              </h2>
            </div>

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col">
                {moreStoriesArticles.length > 0 ? (
                  moreStoriesArticles.map((item, index) => {
                    const hasVideo =
                      item.body?.includes("<iframe") ||
                      item.media?.some(
                        (m: any) =>
                          m.type === "video" || m.type === "youtube-short",
                      );

                    return (
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
                          <div className="relative flex-shrink-0 overflow-hidden rounded-md shadow-sm">
                            <Image
                              src={
                                item.media?.[0]?.url ||
                                "https://picsum.photos/200/150"
                              }
                              width={112}
                              height={80}
                              className="w-28 h-20 object-cover transition-transform duration-500 group-hover:scale-105"
                              alt="News thumbnail"
                            />
                            {/* MORE STORIES PLAY ICON */}
                            {hasVideo && (
                              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3000f]/95 backdrop-blur-sm shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <span className="text-[9px] text-[#e3000f] font-black uppercase tracking-wider mb-1 block">
                              {item.category || "Latest"} •{" "}
                              {item.location?.ward}
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
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    More stories coming soon! Stay tuned for the latest updates.
                  </p>
                )}
              </div>
            </PageTransition>
          </div>

          {/* COLUMN 3: EDITOR'S PICK */}
          <div className="flex flex-col lg:border-l lg:border-gray-300 lg:dark:border-gray-700 lg:pl-12">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                Editor's Pick
              </h2>
            </div>

            <PageTransition transitionKey={localKey}>
              <div className="flex flex-col">
                {editorsPickArticles.length > 0 ? (
                  editorsPickArticles.map((item, index) => {
                    const hasVideo =
                      item.body?.includes("<iframe") ||
                      item.media?.some(
                        (m: any) =>
                          m.type === "video" || m.type === "youtube-short",
                      );

                    return (
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
                          <div className="relative flex-shrink-0 overflow-hidden rounded-md shadow-sm">
                            <Image
                              src={
                                item.media?.[0]?.url ||
                                "https://picsum.photos/200/150"
                              }
                              width={112}
                              height={80}
                              className="w-28 h-20 object-cover transition-transform duration-500 group-hover:scale-105"
                              alt="News thumbnail"
                            />
                            {/* EDITORS PICK PLAY ICON */}
                            {hasVideo && (
                              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e3000f]/95 backdrop-blur-sm shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <span className="text-[9px] text-[#e3000f] font-black uppercase tracking-wider mb-1 block">
                              {item.category || "Latest"} •{" "}
                              {item.location?.ward}
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
                    );
                  })
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
// client/src/app/shorts/page.tsx
import { fetchArticles } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ShortCard from "@/components/cards/ShortCard";
import AdCard from "@/components/ad/AdCard"; 

export const revalidate = 60;

export const metadata = {
  title: 'Shorts | Fides News',
  description: 'Swipe through the latest breaking news shorts and updates.',
  openGraph: {
    title: 'Shorts | Fides News',
    description: 'Swipe through the latest breaking news shorts and updates.',
    url: 'https://yourdomain.com/shorts',
    siteName: 'Fides News',
    images: [
      {
        url: 'https://picsum.photos/1200/630', 
        width: 1200,
        height: 630,
        alt: 'Fides News Shorts',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function ShortsFeedPage() {
  const shortsData = await fetchArticles("Shorts", "", 1, 30, "published", "All Places");
  const shorts = shortsData.articles || [];

  const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
  const allAds = adsData.articles || [];
  const verticalAds = allAds.filter((ad: any) => ad.location?.landmark === "Shorts Vertical Feed");

  const combinedFeed: any[] = [];
  let adIndex = 0;

  shorts.forEach((short, index) => {
    combinedFeed.push({ ...short, isAd: false });

    if ((index + 1) % 2 === 0 && verticalAds.length > 0) {
      const currentAd = verticalAds[adIndex % verticalAds.length]; 
      combinedFeed.push({ 
        ...currentAd, 
        isAd: true, 
        uniqueKey: `ad-${currentAd._id}-${index}` 
      });
      adIndex++;
    }
  });

  if (adIndex === 0 && verticalAds.length > 0 && shorts.length > 0) {
    combinedFeed.push({ 
      ...verticalAds[0], 
      isAd: true, 
      uniqueKey: `ad-${verticalAds[0]._id}-fallback` 
    });
  }

  return (
    // FIX: Changed h-[calc(100vh-140px)] to h-[100dvh]
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative">
      
      <div className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-white font-bold text-lg tracking-wide drop-shadow-md">Shorts</h1>
        <div className="w-12" />
      </div>

      {combinedFeed.length === 0 ? (
        <div className="flex items-center justify-center h-full text-white/50">
          No content available right now.
        </div>
      ) : (
        <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative pb-24">
          {combinedFeed.map((item) => (
            item.isAd 
              ? <AdCard key={item.uniqueKey} ad={item} />
              : <ShortCard key={item._id} short={item} />
          ))}
        </div>
      )}
    </div>
  );
}
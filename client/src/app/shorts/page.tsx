// client/src/app/shorts/page.tsx
import { fetchArticles } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ShortCard from "@/components/ShortCard";
import AdCard from "@/components/AdCard"; // <-- Import the new Ad UI

export const dynamic = 'force-dynamic';

export default async function ShortsFeedPage() {
  // 1. Fetch regular Shorts
  const shortsData = await fetchArticles("Shorts", "", 1, 30, "published", "All Places");
  const shorts = shortsData.articles || [];

  // 2. Fetch Ads
  const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
  const ads = adsData.articles || [];

  // 3. The Injection Engine (1 Ad every 2 Shorts, plus a fallback)
  const combinedFeed: any[] = [];
  let adIndex = 0;

  shorts.forEach((short, index) => {
    combinedFeed.push({ ...short, isAd: false });

    // Changed from 3 to 2 so you see ads faster during testing
    if ((index + 1) % 2 === 0 && ads.length > 0) {
      const currentAd = ads[adIndex % ads.length]; 
      combinedFeed.push({ 
        ...currentAd, 
        isAd: true, 
        uniqueKey: `ad-${currentAd._id}-${index}` 
      });
      adIndex++;
    }
  });

  // THE FIX: If you had fewer than 2 shorts, the math above never triggered! 
  // This guarantees at least one ad shows up at the end of a short list.
  if (adIndex === 0 && ads.length > 0 && shorts.length > 0) {
    combinedFeed.push({ 
      ...ads[0], 
      isAd: true, 
      uniqueKey: `ad-${ads[0]._id}-fallback` 
    });
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      
      {/* Floating Header */}
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
        /* The Vertical Snap Container */
        <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative">
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
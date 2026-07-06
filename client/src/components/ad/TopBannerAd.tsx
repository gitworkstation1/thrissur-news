import GoogleAd from "./GoogleAd";
import Image from "next/image"; 
import { fetchArticles } from "@/lib/api";

export default async function TopBannerAd() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // 1. Fetch custom ads from your database
  let customAd = null;
  try {
    // Fetch recent advertisements
    const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
    const ads = adsData.articles || [];
    
    // 2. Filter for the specific ad targeted to this exact zone
    customAd = ads.find((ad: any) => ad.location?.landmark === "Top Leaderboard");
  } catch (error) {
    console.error("Failed to fetch custom ads", error);
  }
  
  return (
    // Removed `py-4` so it's fully flush top and bottom. Kept `w-full`.
    <div className="w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 flex justify-center transition-colors duration-300">
      
      {customAd ? (
        /* --- RENDER CUSTOM ADMIN AD --- */
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          // Changed fixed widths to w-full. Removed rounded borders for edge-to-edge look. Adjusted heights slightly for a better full-width aspect ratio.
          className="block w-full h-[60px] md:h-[100px] overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group bg-gray-100 dark:bg-gray-900"
        >
          <Image 
            src={customAd.media?.[0]?.url || "https://picsum.photos/1920/100"} 
            alt={customAd.headline || "Advertisement"}
            fill
            // Updated sizes to 100vw since it takes up the full width of the screen now
            sizes="100vw"
            className="object-cover"
          />
          {/* Subtle sponsored badge so readers know it's an ad */}
          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
            Sponsored
          </div>
        </a>
      ) : isDevelopment ? (
        /* --- RENDER PLACEHOLDER FALLBACK --- */
        // Applied w-full here as well
        <div className="w-full h-[60px] md:h-[100px] bg-gray-50/50 dark:bg-white/[0.02] border-y border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-center transition-colors">
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">
            Advertisement
          </span>
        </div>
      ) : (
        /* --- RENDER GOOGLE ADSENSE FALLBACK --- */
        // Google ads can be tricky with true w-full, but you can pass w-full to your wrapper
        <GoogleAd 
          adSlot="YOUR_LEADERBOARD_AD_ID" 
          className="w-full h-[60px] md:h-[100px]" 
        />
      )}

    </div>
  );
}
import GoogleAd from "./GoogleAd";
import Image from "next/image"; // <-- NEW: Next.js Image component
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
    <div className="w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 flex justify-center py-4 transition-colors duration-300">
      
      {customAd ? (
        /* --- RENDER CUSTOM ADMIN AD --- */
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-[320px] h-[50px] md:w-[728px] md:h-[90px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group bg-gray-100 dark:bg-gray-900"
        >
          <Image 
            src={customAd.media?.[0]?.url || "https://picsum.photos/728/90"} 
            alt={customAd.headline || "Advertisement"}
            fill
            sizes="(max-width: 768px) 320px, 728px"
            className="object-cover"
          />
          {/* Subtle sponsored badge so readers know it's an ad */}
          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
            Sponsored
          </div>
        </a>
      ) : isDevelopment ? (
        /* --- RENDER PLACEHOLDER FALLBACK --- */
        <div className="w-[320px] h-[50px] md:w-[728px] md:h-[90px] bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center text-center transition-colors">
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">
            Advertisement
          </span>
        </div>
      ) : (
        /* --- RENDER GOOGLE ADSENSE FALLBACK --- */
        <GoogleAd 
          adSlot="YOUR_LEADERBOARD_AD_ID" 
          className="w-[320px] h-[50px] md:w-[728px] md:h-[90px]" 
        />
      )}

    </div>
  );
}
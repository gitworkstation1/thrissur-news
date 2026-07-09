import GoogleAd from "./GoogleAd";
import Image from "next/image"; 
import { fetchArticles } from "@/lib/api";
import TopAdWrapper from "./TopAdWrapper"; // ⚡ IMPORT THE NEW WRAPPER

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
    // ⚡ WRAP THE ENTIRE COMPONENT OUTPUT
    <TopAdWrapper>
      <div className="w-full bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 flex justify-center transition-colors duration-300">
        
        {customAd ? (
          /* --- RENDER CUSTOM ADMIN AD --- */
          <a 
            href={customAd.externalLink || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full h-[60px] md:h-[100px] overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group bg-gray-100 dark:bg-gray-900"
          >
            <Image 
              src={customAd.media?.[0]?.url || "https://picsum.photos/1920/100"} 
              alt={customAd.headline || "Advertisement"}
              fill
              sizes="100vw"
              className="object-cover"
            />
            {/* Subtle sponsored badge */}
            <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
              Sponsored
            </div>
          </a>
        ) : isDevelopment ? (
          /* --- RENDER PLACEHOLDER FALLBACK --- */
          <div className="w-full h-[60px] md:h-[100px] bg-gray-50/50 dark:bg-white/[0.02] border-y border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-center transition-colors">
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">
              Advertisement
            </span>
          </div>
        ) : (
          /* --- RENDER GOOGLE ADSENSE FALLBACK --- */
          <GoogleAd 
            adSlot="YOUR_LEADERBOARD_AD_ID" 
            className="w-full h-[60px] md:h-[100px]" 
          />
        )}

      </div>
    </TopAdWrapper>
  );
}
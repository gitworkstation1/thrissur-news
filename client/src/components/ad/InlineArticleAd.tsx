import GoogleAd from "./GoogleAd";
import Image from "next/image"; // <-- NEW: Next.js Image component
import { fetchArticles } from "@/lib/api";

export default async function InlineArticleAd() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // 1. Fetch custom ads from your database
  let customAd = null;
  try {
    const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
    const ads = adsData.articles || [];
    
    // 2. Filter specifically for the "Article Inline" zone
    customAd = ads.find((ad: any) => ad.location?.landmark === "Article Inline");
  } catch (error) {
    console.error("Failed to fetch custom ads", error);
  }

  return (
    <div className="w-full flex justify-center py-8 my-4">
      {customAd ? (
        /* --- RENDER CUSTOM ADMIN AD --- */
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full max-w-[728px] h-[90px] md:h-[120px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group"
        >
          <Image 
            src={customAd.media?.[0]?.url || "https://picsum.photos/728/120"} 
            alt={customAd.headline || "Advertisement"}
            fill
            sizes="(max-width: 768px) 100vw, 728px"
            className="object-cover"
          />
          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
            Sponsored
          </div>
          
          {!customAd.media?.[0]?.url && (
             <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 z-10">
               <h3 className="text-white font-bold text-center text-lg">{customAd.headline}</h3>
             </div>
          )}
        </a>
      ) : isDevelopment ? (
        /* --- RENDER PLACEHOLDER FALLBACK --- */
        <div className="w-full max-w-[728px] h-[90px] md:h-[120px] bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-center transition-colors">
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">
            Advertisement
          </span>
        </div>
      ) : (
        /* --- RENDER GOOGLE ADSENSE FALLBACK --- */
        <GoogleAd 
          adSlot="INLINE_ARTICLE_AD_ID" 
          className="w-full max-w-[728px] h-[90px] md:h-[120px]" 
        />
      )}
    </div>
  );
}
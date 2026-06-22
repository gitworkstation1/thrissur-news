import GoogleAd from "./GoogleAd";
import Image from "next/image"; // <-- NEW: Next.js Image component
import { fetchArticles } from "@/lib/api";

export default async function SidebarAd() {
  const isDevelopment = process.env.NODE_ENV === "development";

  let customAd = null;
  try {
    const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
    const ads = adsData.articles || [];
    customAd = ads.find((ad: any) => ad.location?.landmark === "Sidebar Banner");
  } catch (error) {
    console.error("Failed to fetch custom ads", error);
  }

  return (
    <div className="flex justify-center w-full">
      {customAd ? (
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-[300px] h-[600px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group"
        >
          <Image 
            src={customAd.media?.[0]?.url || "https://picsum.photos/300/600"} 
            alt={customAd.headline || "Advertisement"}
            fill
            sizes="300px"
            className="object-cover"
          />
          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">
            Sponsored
          </div>
          {!customAd.media?.[0]?.url && (
             <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-gray-800 z-10">
               <h3 className="text-white font-bold text-center text-xl">{customAd.headline}</h3>
             </div>
          )}
        </a>
      ) : isDevelopment ? (
        <div className="w-[300px] h-[600px] bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center text-center transition-colors">
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">
            Advertisement
          </span>
        </div>
      ) : (
        <GoogleAd adSlot="SIDEBAR_AD_ID" className="w-[300px] h-[600px]" />
      )}
    </div>
  );
}
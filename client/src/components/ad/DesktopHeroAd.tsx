import GoogleAd from '@/components/ad/GoogleAd';
import { fetchArticles } from "@/lib/api";

export default async function DesktopHeroAd() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // 1. Fetch custom ads from your database
  let customAd = null;
  try {
    const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
    const ads = adsData.articles || [];
    
    // 2. Filter specifically for the Homepage Hero zone
    customAd = ads.find((ad: any) => ad.location?.landmark === "Homepage Hero");
  } catch (error) {
    console.error("Failed to fetch custom ads", error);
  }

  return (
    <div className="hidden md:flex flex-col h-full w-full mt-6">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-sm">
          Advertisement
        </span>
      </div>

      {/* --- CONDITIONAL AD RENDERING --- */}
      {customAd ? (
        /* 1. RENDER CUSTOM ADMIN AD (Full Width Banner) */
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group block"
        >
          <img 
            src={customAd.media?.[0]?.url || "https://picsum.photos/800/120"} 
            alt={customAd.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">
            Sponsored
          </div>
          
          {!customAd.media?.[0]?.url && (
             <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-r from-gray-900 to-gray-800">
               <h3 className="text-white font-bold text-center text-lg">{customAd.headline}</h3>
             </div>
          )}
        </a>
      ) : isDevelopment ? (
        /* 2. RENDER PLACEHOLDER FALLBACK (Your Dual-Card Design) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 w-full">
          
          {/* Ad Spot 1 */}
          <div className="w-full h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer shadow-sm relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
            <div className="flex gap-4 items-center justify-center lg:justify-start relative z-10 w-full lg:flex-row flex-col text-center lg:text-left">
              <div className="w-16 h-16 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm flex items-center justify-center text-2xl shrink-0">
                🛍️
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                  Premium Sponsor
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3">
                  Click here to replace this placeholder with your actual ad network script.
                </p>
              </div>
            </div>
          </div>

          {/* Ad Spot 2 */}
          <div className="w-full h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer shadow-sm relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#e3000f]/10 rounded-full blur-xl group-hover:bg-[#e3000f]/20 transition-colors" />
            <div className="flex gap-4 items-center justify-center lg:justify-start relative z-10 w-full lg:flex-row flex-col text-center lg:text-left">
              <div className="w-16 h-16 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm flex items-center justify-center text-2xl shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                  Local Business Ad
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3">
                  Perfect space for local businesses to advertise next to breaking news.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* 3. RENDER GOOGLE ADSENSE FALLBACK */
        <div className="flex-1 w-full min-h-[120px]">
          <GoogleAd 
            adSlot="HERO_BANNER_AD_ID" 
            className="w-full h-full" 
          />
        </div>
      )}

    </div>
  );
}
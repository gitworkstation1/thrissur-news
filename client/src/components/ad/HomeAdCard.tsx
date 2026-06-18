import GoogleAd from "./GoogleAd";
import { fetchArticles } from "@/lib/api";

export default async function HomeAdCard() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // 1. Fetch custom ads from your database
  let customAd = null;
  try {
    const adsData = await fetchArticles("Advertisement", "", 1, 10, "published", "All Places");
    const ads = adsData.articles || [];
    
    // 2. Filter for the specific ad targeted to this exact zone
    customAd = ads.find((ad: any) => ad.location?.landmark === "Home Feed Inject");
  } catch (error) {
    console.error("Failed to fetch custom ads", error);
  }

  return (
    <div className="w-full flex justify-center py-4">
      {customAd ? (
        /* --- RENDER CUSTOM ADMIN AD --- */
        <a 
          href={customAd.externalLink || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full max-w-[350px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group bg-gray-100 dark:bg-gray-900"
        >
          <img 
            src={customAd.media?.[0]?.url || "https://picsum.photos/300/250"} 
            alt={customAd.headline}
            className="w-full h-auto object-cover aspect-[4/3]"
          />
          {/* Subtle sponsored badge so readers know it's an ad */}
          <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-br-lg">
            Sponsored
          </div>
          
          {/* Overlay text if the admin didn't upload a poster, but wrote a headline instead */}
          {!customAd.media?.[0]?.url && (
             <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-tr from-blue-900 to-blue-600">
               <h3 className="text-white font-bold text-center text-lg">{customAd.headline}</h3>
             </div>
          )}
        </a>
      ) : isDevelopment ? (
        /* --- RENDER STYLIZED PLACEHOLDER (Self-Promo) --- */
        <div className="w-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden group">
          {/* Decorative background glow */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#e3000f]/5 rounded-full blur-2xl group-hover:bg-[#e3000f]/10 transition-colors" />

          <div className="flex justify-between items-center mb-3 relative z-10">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-sm">
              Sponsored
            </span>
          </div>
          
          <div className="flex gap-4 items-center relative z-10">
            <div className="w-20 h-20 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
              <span className="text-3xl">🚀</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                Promote Your Business Here
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                Reach thousands of daily readers across Thrissur. Click here to view our local advertising plans.
              </p>
              <button className="text-[10px] font-black uppercase text-[#e3000f] tracking-wider hover:underline">
                Learn More
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- RENDER GOOGLE ADSENSE FALLBACK --- */
        <GoogleAd 
          adSlot="HOME_FEED_AD_ID" 
          className="w-[300px] h-[250px]" 
        />
      )}
    </div>
  );
}
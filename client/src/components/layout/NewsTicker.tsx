import Link from "next/link";
import { fetchArticles } from "@/lib/api";

export default async function NewsTicker() {
  let articles: any[] = [];
  try {
    // 1. Fetch the latest published articles
    const res = await fetchArticles("All", "", 1, 10, "published", "All Places");
    
    // 2. Prioritize breaking news if it exists, otherwise fallback to the 8 most recent articles
    const breaking = (res.articles || []).filter((a: any) => a.isBreaking);
    articles = breaking.length > 0 ? breaking : (res.articles || []).slice(0, 8);
  } catch (error) {
    console.error("Failed to fetch ticker news", error);
  }

  // Hide the ticker if the database is completely empty
  if (articles.length === 0) return null;

  return (
    <div className="w-full bg-gray-900 dark:bg-black text-gray-200 flex items-center h-10 md:h-11 overflow-hidden border-b border-gray-800 relative z-30">
      
      {/* --- FIXED BADGE ON LEFT --- */}
      <div className="absolute left-0 top-0 bottom-0 bg-[#e3000f] text-white font-black text-[10px] md:text-xs uppercase px-3 md:px-5 flex items-center z-20 shadow-[8px_0_20px_-5px_rgba(0,0,0,0.8)] tracking-widest">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2 md:mr-3"></span>
        <span className="hidden md:inline">Latest News</span>
        <span className="md:hidden">Latest</span>
      </div>

      {/* --- SCROLLING CONTENT --- */}
      <div className="flex-1 h-full overflow-hidden relative flex items-center ml-[90px] md:ml-[140px]">
        
        {/* Inline CSS for the continuous marquee animation */}
        <style>
          {`
            @keyframes ticker {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
            .animate-ticker {
              display: inline-flex;
              white-space: nowrap;
              animation: ticker 35s linear infinite;
              will-change: transform;
            }
            /* Pause the scrolling when the user hovers over a headline with their mouse */
            .animate-ticker:hover {
              animation-play-state: paused;
            }
          `}
        </style>

        <div className="animate-ticker flex items-center">
          {articles.map((article, index) => (
            <div key={article._id || index} className="flex items-center">
              <Link 
                href={`/news/${article.slug || article._id}`}
                className="hover:text-white hover:underline underline-offset-4 transition-all text-xs md:text-sm font-medium tracking-wide"
              >
                {article.headline}
              </Link>
              {/* Separator Pipe */}
              <span className="mx-6 text-gray-600">|</span>
            </div>
          ))}
        </div>

        {/* --- RIGHT EDGE FADE OUT --- */}
        {/* Adds a premium gradient fade so text doesn't sharply clip at the edge of the screen */}
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-gray-900 dark:from-black to-transparent z-10 pointer-events-none"></div>
      </div>

    </div>
  );
}
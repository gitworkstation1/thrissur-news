import { fetchArticles } from "@/lib/api";
import TickerClient from "./TickerClient"; // ⚡ Import our new client component

export default async function NewsTicker() {
  let articles: any[] = [];
  let globalSpeed = 30; // ⚡ Fallback default speed
  
  try {
    // 1. Fetch a larger pool of recent articles
    const res = await fetchArticles("All", "", 1, 20, "published", "All Places");
    const allArticles = res.articles || [];

    // 2. Separate into priority buckets
    const adminSelected = allArticles.filter((a: any) => a.isTicker);
    const breakingNews = allArticles.filter((a: any) => a.isBreaking && !a.isTicker);

    // 3. Combine them
    const combinedTicker = [...adminSelected, ...breakingNews];

    // 4. Fallback: If nothing is selected, show the 8 latest
    articles = combinedTicker.length > 0 ? combinedTicker : allArticles.slice(0, 8);

    // ⚡ 5. Fetch the universal settings for the ticker speed
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
      cache: 'no-store' // Ensure it always gets the freshest speed from MongoDB
    });
    
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      if (settings?.tickerSpeed) {
        globalSpeed = settings.tickerSpeed;
      }
    }
    
  } catch (error) {
    console.error("Failed to fetch ticker data", error);
  }

  // Hide the ticker if the database is completely empty
  if (articles.length === 0) return null;

  return (
    <div className="w-full bg-black dark:bg-white text-white dark:text-black flex items-center h-10 md:h-11 overflow-hidden border-b border-gray-900 dark:border-gray-200 relative z-30 transition-colors duration-300">
      
      {/* --- FIXED BADGE ON LEFT --- */}
      <div className="absolute left-0 top-0 bottom-0 bg-[#e3000f] text-white font-black text-[10px] md:text-xs uppercase px-3 md:px-5 flex items-center z-20 shadow-[8px_0_20px_-5px_rgba(0,0,0,0.8)] tracking-widest">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2 md:mr-3"></span>
        <span className="hidden md:inline">Latest News</span>
        <span className="md:hidden">Latest</span>
      </div>

      {/* --- SCROLLING CONTENT DELEGATED TO CLIENT COMPONENT --- */}
      {/* ⚡ Pass the global database speed into the client component */}
      <TickerClient articles={articles} initialSpeed={globalSpeed} />

    </div>
  );
}
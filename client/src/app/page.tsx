import CategoryMenu from "@/components/CategoryMenu";
import BreakingNewsCarousel from "@/components/BreakingNewsCarousel";
import QuickReadButton from "@/components/QuickReadButton";
import BookmarkButton from "@/components/BookmarkButton"; 
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

// Helper function to keep our date formatting clean and reusable
const formatArticleDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedDate} • ${hours}:${formattedMinutes} ${ampm}`;
};

export default async function Home({ searchParams }: { searchParams: { category?: string } }) {
  let data = { articles: [] as Article[] };
  try { data = await fetchArticles(); } catch (err) { console.error(err); }

  let allArticles = data.articles || [];
  
  // ==========================================
  // 🧪 TEST DATA INJECTOR
  // Automatically fills the list to support Top 10 + Crime + 10 Other Stories
  // ==========================================
  if (allArticles.length < 25) {
    const testArticles = [
      // Top 10 Filler
      { _id: "test-main-1", headline: "State Government Announces New Tech Park in Thrissur, Expecting 10,000 Jobs", category: "Business", isBreaking: true, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), location: { ward: "City Center" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=1' }] },
      { _id: "test-main-2", headline: "Heavy Rainfall Alert: Schools and Colleges to Remain Closed Tomorrow", category: "Weather", isBreaking: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), location: { ward: "District Wide" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=2' }] },
      { _id: "test-main-3", headline: "Local Sports Club Wins State Championship in Thrilling Final Match", category: "Sports", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), location: { ward: "Stadium Area" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=3' }] },
      { _id: "test-main-4", headline: "New Traffic Regulations Implemented Around Swaraj Round to Reduce Congestion", category: "Civic", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), location: { ward: "Swaraj Round" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=4' }] },
      { _id: "test-main-5", headline: "Annual Cultural Festival Dates Announced, Expected to Draw Record Crowds", category: "Culture", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), location: { ward: "Vadakkunnathan" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=5' }] },
      { _id: "test-main-6", headline: "Major Healthcare Facility Upgrade Completed at District Hospital", category: "Health", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), location: { ward: "Medical College" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=6' }] },
      { _id: "test-main-7", headline: "Tech Startup from Local Incubator Raises $2M in Seed Funding", category: "Technology", isBreaking: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), location: { ward: "Koratty" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=7' }] },
      { _id: "test-main-8", headline: "New Metro Line Proposal Submitted to Central Government for Approval", category: "Transport", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(), location: { ward: "Railway Station" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=8' }] },
      { _id: "test-main-9", headline: "Prices of Gold Hit Record High Before Festive Season Begins", category: "Economy", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(), location: { ward: "Market" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=9' }] },
      { _id: "test-main-10", headline: "Inter-State Bus Services Resumed After Temporary Suspension", category: "Transport", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 95).toISOString(), location: { ward: "Bus Stand" }, media: [{ type: 'image', url: 'https://picsum.photos/800/500?random=10' }] },
      
      // Crime Filler
      { _id: "test-crime-1", headline: "Local Police Bust Major Cyber Fraud Ring Operating from Apartment", category: "Crime", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), location: { ward: "East Fort" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=11' }] },
      { _id: "test-crime-2", headline: "Two Arrested in Connection with Late-Night Gold Heist at Jewelry Store", category: "Crime", isBreaking: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), location: { ward: "High Road" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=12' }] },
      { _id: "test-crime-3", headline: "Vigilance Department Conducts Surprise Raid at Regional Transport Office", category: "Crime", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), location: { ward: "Ayyanthole" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=13' }] },
      
      // 10 "Other Stories" Filler
      { _id: "test-other-1", headline: "Renowned Malayalam Actor Announces Directorial Debut Film", category: "Entertainment", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), location: { ward: "Film City" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=14' }] },
      { _id: "test-other-2", headline: "Stock Market Sees Bullish Trend as Local Startups Show Massive Growth", category: "Finance", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), location: { ward: "Global" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=15' }] },
      { _id: "test-other-3", headline: "New AI Tech Developed by KTU Students Wins National Innovation Award", category: "Tech", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), location: { ward: "University Campus" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=16' }] },
      { _id: "test-other-4", headline: "Traditional Boat Race Dates Confirmed for Next Month", category: "Culture", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), location: { ward: "Riverfront" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=17' }] },
      { _id: "test-other-5", headline: "Famous Bakery Chain Opens 50th Outlet in Kerala", category: "Business", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), location: { ward: "Downtown" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=18' }] },
      { _id: "test-other-6", headline: "State Tourism Board Launches New Backwater Cruise Packages", category: "Travel", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), location: { ward: "Tourism Hub" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=19' }] },
      { _id: "test-other-7", headline: "Vintage Car Rally Draws Huge Crowds in City Center", category: "Lifestyle", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), location: { ward: "Swaraj Round" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=20' }] },
      { _id: "test-other-8", headline: "Regional University Ranks Top 10 in National Engineering List", category: "Education", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), location: { ward: "Campus" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=21' }] },
      { _id: "test-other-9", headline: "Local Chef Wins International Culinary Award in Dubai", category: "Food", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 55).toISOString(), location: { ward: "City Hub" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=22' }] },
      { _id: "test-other-10", headline: "Wildlife Photographers Capture Rare Sighting in Western Ghats", category: "Environment", isBreaking: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 62).toISOString(), location: { ward: "Forest Reserve" }, media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=23' }] },
    ] as Article[];
    
    allArticles = [...allArticles, ...testArticles];
  }
  // ==========================================

  const selectedCategory = searchParams?.category;

  if (selectedCategory && selectedCategory !== "News") {
    allArticles = allArticles.filter(a => 
      a.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  const breakingNews = allArticles.filter(a => a.isBreaking);
  
  // Isolate the top 10 news items
  const topTenNews = allArticles.slice(0, 10);
  const mainArticle = topTenNews[0];
  const scrollingArticles = topTenNews.slice(1);

  // Keep track of what we already showed so we don't repeat articles
  const shownArticleIds = new Set(topTenNews.map(a => a._id));
  const remainingArticles = allArticles.filter(a => !shownArticleIds.has(a._id));

  // Filter out Crime and Other news for the bottom sections
  const crimeNews = remainingArticles.filter(a => a.category?.toLowerCase() === 'crime').slice(0, 3);
  
  // THE FIX: Increased the limit from 3 to 10 right here!
  const otherNews = remainingArticles.filter(a => a.category?.toLowerCase() !== 'crime').slice(0, 10);

  return (
    <div className="pb-24 relative max-w-[96%] mx-auto">
      <CategoryMenu />

      {/* --- HERO SECTION: CAROUSEL & TOP 10 --- */}
      <div id="hero-top-ten" className="px-4 py-6 flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
        <div className="w-full md:w-[62%] lg:w-[65%] flex-shrink-0">
          <BreakingNewsCarousel articles={breakingNews} />
        </div>

        <div className="w-full md:w-[38%] lg:w-[35%] md:sticky md:top-20 mt-4 md:mt-0">
          <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase mb-4">
            TOP TEN NEWS
          </h2>

          <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] overflow-hidden flex flex-col h-[500px] md:h-[600px] lg:h-[calc(100vh-140px)] shadow-sm">
            {/* 1. PINNED MAIN ARTICLE */}
            {mainArticle && (
              <div className="relative border-b border-gray-200 dark:border-gray-800/80 p-4 bg-white dark:bg-[#111] flex-shrink-0 z-20 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <span className="absolute -right-2 -bottom-4 text-[110px] leading-none font-black text-[#e3000f] opacity-5 dark:opacity-[0.03] z-0 pointer-events-none select-none tracking-tighter transition-all group-hover:scale-110">
                  1
                </span>

                <div className="relative z-10 flex flex-col gap-3">
                  <div className="relative">
                    <img src={mainArticle.media?.[0]?.url || 'https://picsum.photos/400/250'} className="w-full h-44 object-cover rounded-lg shadow-sm" alt="Thumbnail" />
                    <BookmarkButton article={mainArticle} className="absolute top-3 right-3 bg-white/95 dark:bg-black/80 backdrop-blur-md p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#e3000f] font-black uppercase border-t-[3px] border-[#e3000f] pt-1 inline-block mb-1 tracking-wider">
                      {mainArticle.category || 'Latest'}
                    </span>
                    <h3 className="font-bold text-base md:text-lg leading-snug text-black dark:text-white group-hover:text-[#e3000f] transition-colors">
                      {mainArticle.headline}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatArticleDate(mainArticle.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCROLLING SUB-ARTICLES */}
            <div className="flex-1 overflow-y-auto relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex flex-col">
                {scrollingArticles.map((item, idx) => {
                  return (
                    <div key={item._id} className="relative border-b border-gray-100 dark:border-gray-800/60 p-4 last:border-0 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors overflow-hidden">
                      <span className="absolute -right-2 -bottom-4 text-[110px] leading-none font-black text-[#e3000f] opacity-5 dark:opacity-[0.03] z-0 pointer-events-none select-none tracking-tighter transition-all group-hover:scale-110">
                        {idx + 2}
                      </span>
                      <div className="relative z-10 flex gap-4 items-start">
                        <img src={item.media?.[0]?.url || 'https://picsum.photos/100/100'} className="w-24 h-16 object-cover rounded shadow-sm flex-shrink-0" alt="Thumbnail" />
                        <div className="flex-1 pr-8">
                          <span className="text-[9px] text-[#e3000f] font-black uppercase border-t-2 border-[#e3000f] pt-0.5 inline-block mb-1 tracking-wider">
                            {item.category || 'Latest'}
                          </span>
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-black dark:text-white group-hover:text-[#e3000f] transition-colors">
                            {item.headline}
                          </h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{formatArticleDate(item.createdAt)}</p>
                        </div>
                        <BookmarkButton article={item} className="absolute top-0 right-0 p-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM GRID: CRIME & OTHER NEWS --- */}
      <div className="px-4 py-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          
          {/* CRIME NEWS COLUMN */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                Crime News
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {crimeNews.length > 0 ? crimeNews.map((item) => (
                <div key={item._id} className="group cursor-pointer flex gap-4 items-center">
                  <div className="relative flex-shrink-0">
                    <img src={item.media?.[0]?.url || 'https://picsum.photos/200/150'} className="w-28 h-20 object-cover rounded-md shadow-sm transition-transform duration-500 group-hover:scale-105" alt="Crime news" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-black dark:text-white group-hover:text-[#e3000f] transition-colors mb-1.5">
                      {item.headline}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatArticleDate(item.createdAt)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">No recent crime news.</p>
              )}
            </div>
          </div>

          {/* OTHER NEWS COLUMN */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase border-b-[3px] border-[#e3000f] pb-1">
                More Stories
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {otherNews.length > 0 ? otherNews.map((item) => (
                <div key={item._id} className="group cursor-pointer flex gap-4 items-center">
                  <div className="relative flex-shrink-0">
                    <img src={item.media?.[0]?.url || 'https://picsum.photos/200/150'} className="w-28 h-20 object-cover rounded-md shadow-sm transition-transform duration-500 group-hover:scale-105" alt="Other news" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] text-[#e3000f] font-black uppercase tracking-wider mb-1 block">
                      {item.category || 'Latest'}
                    </span>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-black dark:text-white group-hover:text-[#e3000f] transition-colors mb-1.5">
                      {item.headline}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatArticleDate(item.createdAt)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 italic">More stories coming soon.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      <QuickReadButton />
      <ScrollToTopButton />

    </div>
  );
}
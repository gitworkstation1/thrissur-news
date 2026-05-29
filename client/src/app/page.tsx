import Navbar from "@/components/Navbar";
import CategoryMenu from "@/components/CategoryMenu";
import NewsCard from "@/components/NewsCard";
import BottomNav from "@/components/BottomNav";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

export default async function Home() {
  // 1. Fetch live data from MongoDB
  let data = { articles: [] as Article[] };
  try {
    data = await fetchArticles();
  } catch (err) {
    console.error("Failed to load articles", err);
  }

  const allArticles = data.articles || [];

  // 2. Data Sorting Logic (Updated for Categories!)
  const breakingNews = allArticles.filter(a => a.isBreaking);
  const mainBreaking = breakingNews[0]; 
  const subBreaking = breakingNews.slice(1, 3); 

  // Filter by Category
  const crimeNews = allArticles.filter(a => a.category === 'Crime');
  const sportsNews = allArticles.filter(a => a.category === 'Sports');
  const politicsNews = allArticles.filter(a => a.category === 'Politics');
  const otherNews = allArticles.filter(a => !['Crime', 'Sports', 'Politics'].includes(a.category));

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <Navbar />
      <CategoryMenu />

      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* ================= BREAKING NEWS SECTION ================= */}
        {mainBreaking && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-red-600 font-extrabold text-lg tracking-wide uppercase">BREAKING NEWS</h2>
              <span className="text-red-600 text-xl">›</span>
            </div>

            {/* MAIN BREAKING HERO */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-6 border border-gray-100">
              <img
                src={mainBreaking.media?.[0]?.url || 'https://picsum.photos/900/500'}
                alt="Breaking News"
                className="w-full h-[260px] object-cover"
              />
              <div className="p-5">
                <p className="text-green-700 text-sm font-extrabold uppercase mb-2 tracking-wider">
                  {mainBreaking.location.ward}
                </p>
                <h1 className="text-2xl font-bold leading-tight text-black mb-3 line-clamp-3">
                  {mainBreaking.headline}
                </h1>
                <p className="text-gray-500 text-sm font-medium">Just Now</p>
              </div>
            </div>

            {/* SUB BREAKING NEWS GRID */}
            {subBreaking.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-5">
                {subBreaking.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <img
                      src={item.media?.[0]?.url || 'https://picsum.photos/400/300'}
                      alt="Sub News"
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-sm leading-snug text-black line-clamp-3">
                        {item.headline}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ================= LATEST FEED ================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-3">Latest News</h2>
          </div>
          <div className="space-y-4">
            {otherNews.slice(0, 10).map((item) => <NewsCard key={item._id} article={item} />)}
          </div>
        </div>  


        {/* ================= CRIME NEWS ================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-3 uppercase">Crime News</h2>
            <button className="text-red-600 font-semibold text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {crimeNews.length > 0 ? (
              crimeNews.slice(0, 3).map((item) => <NewsCard key={item._id} article={item} />)
            ) : (
              <p className="text-gray-400 text-sm italic">No recent crime updates.</p>
            )}
          </div>
        </div>

        {/* ================= SPORTS NEWS ================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-3 uppercase">Sports News</h2>
            <button className="text-red-600 font-semibold text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {sportsNews.length > 0 ? (
              sportsNews.slice(0, 3).map((item) => <NewsCard key={item._id} article={item} />)
            ) : (
              <p className="text-gray-400 text-sm italic">No recent sports updates.</p>
            )}
          </div>
        </div>

        {/* ================= POLITICS NEWS ================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-3 uppercase">Politics News</h2>
            <button className="text-red-600 font-semibold text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {politicsNews.length > 0 ? (
              politicsNews.slice(0, 3).map((item) => <NewsCard key={item._id} article={item} />)
            ) : (
              <p className="text-gray-400 text-sm italic">No recent political updates.</p>
            )}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
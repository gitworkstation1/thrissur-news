import CategoryMenu from "@/components/CategoryMenu";
import BreakingNewsCarousel from "@/components/BreakingNewsCarousel";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

export default async function Home() {
  let data = { articles: [] as Article[] };
  try { data = await fetchArticles(); } catch (err) { console.error(err); }

  const allArticles = data.articles || [];
  let breakingNews = allArticles.filter(a => a.isBreaking);

  if (breakingNews.length < 3) {
    const dummyNews = [
      { _id: "test-1", headline: "Heavy rainfall expected across Central Kerala, Red Alert issued", category: "Weather", isBreaking: true, createdAt: new Date().toISOString(), location: { ward: "Thrissur" }, media: [{ type: 'image', url: 'https://picsum.photos/801/500?grayscale' }] } as Article,
      { _id: "test-2", headline: "New tech hub proposed in Thrissur expected to generate thousands of local jobs", category: "Business", isBreaking: true, createdAt: new Date().toISOString(), location: { ward: "Koratty" }, media: [{ type: 'image', url: 'https://picsum.photos/802/500?grayscale' }] } as Article
    ];
    breakingNews = [...breakingNews, ...dummyNews];
  }

  const topTenNews = allArticles.slice(0, 10);

  return (
    <div className="pb-24 relative max-w-7xl mx-auto">
      <CategoryMenu />

      <div className="px-4 py-6 flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
        
        <div className="w-full md:w-[62%] lg:w-[65%] flex-shrink-0">
          <BreakingNewsCarousel articles={breakingNews} />
        </div>

        <div className="w-full md:w-[38%] lg:w-[35%] md:sticky md:top-20 mt-4 md:mt-0">
          
          <h2 className="text-black dark:text-white font-black text-lg tracking-wide uppercase mb-4">
            TOP TEN NEWS
          </h2>

          <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] overflow-y-auto h-[500px] md:h-[600px] lg:h-[calc(100vh-140px)] relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full shadow-sm">
            <div className="flex flex-col">
              {topTenNews.map((item, idx) => {
                const isFirst = idx === 0;
                const dateObj = new Date(item.createdAt);
                const timeStr = `${dateObj.getHours()}:${dateObj.getMinutes() < 10 ? '0' : ''}${dateObj.getMinutes()}`;

                return (
                  <div key={item._id} className="relative border-b border-gray-100 dark:border-gray-800/60 p-4 last:border-0 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors overflow-hidden">
                    
                    {/* Watermark: Restored to #e3000f */}
                    <span className="absolute -right-2 -bottom-4 text-[110px] leading-none font-black text-[#e3000f] opacity-5 dark:opacity-[0.03] z-0 pointer-events-none select-none tracking-tighter transition-all group-hover:scale-110">
                      {idx + 1}
                    </span>

                    <div className="relative z-10">
                      {isFirst ? (
                        <div className="flex flex-col gap-3">
                          <img src={item.media?.[0]?.url || 'https://picsum.photos/400/250'} className="w-full h-44 object-cover rounded-lg shadow-sm" alt="Thumbnail" />
                          <div>
                            {/* Tags: Restored to #e3000f */}
                            <span className="text-[10px] text-[#e3000f] font-black uppercase border-t-[3px] border-[#e3000f] pt-1 inline-block mb-1 tracking-wider">
                              {item.category || 'Latest'}
                            </span>
                            {/* Preserved dark mode text fix */}
                            <h3 className="font-bold text-base md:text-lg leading-snug text-black dark:text-white group-hover:text-[#e3000f] transition-colors">
                              {item.headline}
                            </h3>
                            <p className="text-xs text-gray-400 mt-2">{timeStr}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-start">
                          <img src={item.media?.[0]?.url || 'https://picsum.photos/100/100'} className="w-24 h-16 object-cover rounded shadow-sm flex-shrink-0" alt="Thumbnail" />
                          <div className="flex-1">
                            {/* Tags: Restored to #e3000f */}
                            <span className="text-[9px] text-[#e3000f] font-black uppercase border-t-2 border-[#e3000f] pt-0.5 inline-block mb-1 tracking-wider">
                              {item.category || 'Latest'}
                            </span>
                            {/* Preserved dark mode text fix */}
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-black dark:text-gray-100 group-hover:text-[#e3000f] transition-colors">
                              {item.headline}
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">{timeStr}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
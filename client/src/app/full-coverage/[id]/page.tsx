"use client"; // Required for DOMParser to run in the browser
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, Clock } from "lucide-react"; // <-- Added Clock icon
import BookmarkButton from "@/components/ui/BookmarkButton";
import { fetchArticleById, fetchArticles } from "@/lib/api";
import ShareButton from "@/components/ui/ShareButton";
import GoogleAd from "@/components/ad/GoogleAd";

const formatDetailedDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
};

// --- NEW: Helper function to calculate estimated reading time ---
const calculateReadTime = (htmlContent: string) => {
  if (!htmlContent) return 1;
  // Strip HTML tags to just get the raw text
  const text = htmlContent.replace(/<[^>]*>?/gm, '');
  // Count words by splitting on spaces
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  // Average reading speed is ~200 words per minute. Math.ceil ensures it's at least 1 min.
  const readingTime = Math.ceil(wordCount / 200);
  return readingTime;
};

export default function FullCoveragePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [resolvedParams, setResolvedParams] = useState<any>(null);
  
  // Hold our specific Admin Ads
  const [sidebarAd, setSidebarAd] = useState<any>(null);
  const [inlineAd, setInlineAd] = useState<any>(null);

  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
      fetchArticleById(p.id).then(article => {
        setData(article);
        
        // Fetch Related News
        fetchArticles(article.category, "", 1, 4, "published", "All Places").then(relatedData => {
          setRelatedArticles(relatedData.articles
            .filter((a: any) => a._id !== article._id && a.category !== "Shorts" && a.category !== "Advertisement")
            .slice(0, 3));
        });

        // FETCH ADS: Grab the Admin Ads and filter them to their specific zones!
        fetchArticles("Advertisement", "", 1, 10, "published", "All Places").then(adsData => {
          const ads = adsData.articles || [];
          setSidebarAd(ads.find((ad: any) => ad.location?.landmark === "Sidebar Banner"));
          setInlineAd(ads.find((ad: any) => ad.location?.landmark === "Article Inline"));
        });
      });
    });
  }, [params]);

  if (!data) return null;

  const article = data;
  const imageMedia = article.media?.filter((m: any) => m.type === "image") || [];

  return (
    <div className="w-full min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pb-24 selection:bg-red-200 dark:selection:bg-red-900/50">

      {/* GLASSMORPHISM NAVBAR */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 h-16 flex items-center justify-between px-4 sm:px-6 transition-all">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 -ml-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 font-medium text-sm">
          <ChevronLeft className="w-5 h-5" /> Back to News
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <BookmarkButton article={article} />
        </div>
      </div>

      <main className="w-full pt-8">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="text-xs text-gray-500 mb-6 flex gap-2">
            <span>Home</span> | <span>{article.category}</span> | <span>Latest</span>
          </div>
          <h1 lang="ml" className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-6 text-left hyphens-auto">
            {article.headline}
          </h1>
          
          {/* UPDATED DATE & READ TIME ROW */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 dark:border-white/10 py-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="whitespace-nowrap">Published on {formatDetailedDate(article.createdAt)}</span>
              <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">•</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap font-bold text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-red-600" />
                {calculateReadTime(article.body)} min read
              </span>
            </div>
            <ShareButton title={article.headline} url={`https://yourdomain.com/full-coverage/${article._id}`} />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          <article className="lg:col-span-6">
            
            {/* REPORTER CREDIT */}
            {article.reportedBy && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 border-l-4 border-red-600 rounded-r-lg">
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Reported By: <span className="text-red-600">{article.reportedBy}</span>
                </p>
              </div>
            )}

            {/* MULTIPLE PHOTOS WITH CREDITS */}
            {imageMedia.length > 0 && (
              <div className="space-y-8 mb-8">
                {imageMedia.map((img: any, index: number) => (
                  <figure key={index} className="w-full flex flex-col gap-2">
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                      <img src={img.url} alt={`${article.headline} - Image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {img.credit && (
                      <figcaption className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-right px-2">
                        📸 Photo by: <span className="text-gray-900 dark:text-gray-300">{img.credit}</span>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
            
            <div lang="ml" className="prose prose-base md:prose-lg dark:prose-invert max-w-none prose-p:mb-4 prose-p:leading-7 prose-p:text-justify prose-p:hyphens-auto prose-a:text-red-600 prose-img:rounded-xl">
              
              {/* UPDATED INLINE AD INJECTION */}
              {(() => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(article.body || article.content || '', 'text/html');
                const paragraphs = Array.from(doc.querySelectorAll('p'));
                
                return paragraphs.map((p, index) => {
                  // LOGIC: Show an ad every 4 paragraphs, but stop after 2 ads (index < 10 limits it to index 3 and 7)
                  const showAd = (index + 1) % 4 === 0 && index !== paragraphs.length - 1 && index < 10;

                  return (
                    <div key={index}>
                      <p dangerouslySetInnerHTML={{ __html: p.innerHTML }} />
                      
                      {showAd && (
                        <div className="my-10 flex justify-center w-full">
                          {inlineAd ? (
                            <a href={inlineAd.externalLink || "#"} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] h-[90px] md:h-[120px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group">
                              <img src={inlineAd.media?.[0]?.url || "https://picsum.photos/728/120"} alt={inlineAd.headline} className="w-full h-full object-cover" />
                              <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">Sponsored</div>
                              {!inlineAd.media?.[0]?.url && (
                                <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-r from-gray-900 to-gray-800">
                                  <h3 className="text-white font-bold text-center text-lg">{inlineAd.headline}</h3>
                                </div>
                              )}
                            </a>
                          ) : isDevelopment ? (
                            <div className="w-[320px] h-[50px] md:w-[728px] md:h-[90px] bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center text-center transition-colors">
                              <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">Advertisement</span>
                            </div>
                          ) : (
                            <GoogleAd adSlot="IN_ARTICLE_AD_ID" className="w-[320px] h-[50px] md:w-[728px] md:h-[90px]" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

            </div>
          </article>

          <aside className="lg:col-span-6 space-y-8">
            <div className="bg-white/50 dark:bg-[#111]/50 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-sm">
              <h3 className="font-black text-lg uppercase tracking-widest mb-6 border-b-2 border-red-600 pb-2">Key Takeaways</h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                <li className="flex gap-3"><span className="text-red-600 font-bold">•</span> Summary points here.</li>
                <li className="flex gap-3"><span className="text-red-600 font-bold">•</span> Key editorial context.</li>
              </ul>
            </div>
            
            {/* SIDEBAR AD INJECTION */}
            <div className="flex justify-center w-full sticky top-24">
              {sidebarAd ? (
                <a href={sidebarAd.externalLink || "#"} target="_blank" rel="noopener noreferrer" className="block w-[300px] h-[600px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group">
                  <img src={sidebarAd.media?.[0]?.url || "https://picsum.photos/300/600"} alt={sidebarAd.headline} className="w-full h-full object-cover" />
                  <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">Sponsored</div>
                  {!sidebarAd.media?.[0]?.url && (
                     <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-gray-800">
                       <h3 className="text-white font-bold text-center text-xl">{sidebarAd.headline}</h3>
                     </div>
                  )}
                </a>
              ) : isDevelopment ? (
                <div className="w-[300px] h-[600px] bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center text-center transition-colors">
                  <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-[0.2em] select-none">Advertisement</span>
                </div>
              ) : (
                <GoogleAd adSlot="SIDEBAR_AD_ID" className="w-[300px] h-[600px]" />
              )}
            </div>
          </aside>
        </div>

        {relatedArticles.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-gray-200 dark:border-white/10">
            <h2 className="text-xl font-black uppercase mb-8 border-b-2 border-red-600 inline-block pb-1">More in {article.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((related: any) => (
                <Link href={`/full-coverage/${related._id}`} key={related._id} className="group block">
                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                    <img src={related.media?.[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2">{related.headline}</h3>
                  <span className="text-xs text-red-600 font-bold uppercase">{formatShortDate(related.createdAt)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
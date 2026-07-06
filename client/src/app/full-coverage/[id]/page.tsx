"use client"; 
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import DOMPurify from "isomorphic-dompurify"; 
import { Clock } from "lucide-react"; 
import AutoScrollToTop from "@/components/ui/AutoScrollToTop";
import ArticleNavbar from "@/components/layout/ArticleNavbar";
import { fetchArticleById, fetchArticles } from "@/lib/api";
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

const calculateReadTime = (htmlContent: string) => {
  if (!htmlContent) return 1;
  const text = htmlContent.replace(/<[^>]*>?/gm, '');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);
  return readingTime;
};

export default function FullCoveragePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [resolvedParams, setResolvedParams] = useState<any>(null);
  
  const [sidebarAd, setSidebarAd] = useState<any>(null);
  const [inlineAd, setInlineAd] = useState<any>(null);

  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
      fetchArticleById(p.id).then(article => {
        setData(article);
        
        fetchArticles(article.category, "", 1, 4, "published", "All Places").then(relatedData => {
          setRelatedArticles(relatedData.articles
            .filter((a: any) => a._id !== article._id && a.category !== "Shorts" && a.category !== "Advertisement")
            .slice(0, 3));
        });

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

      {/* Invisible component that forces scroll to top */}
      <AutoScrollToTop />

      {/* Interactive Navbar handles back, share, and bookmark */}
      <ArticleNavbar article={article} />

      {/* pt-20 ensures the headline clears the fixed navbar */}
      <main className="w-full pt-20">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="text-xs text-gray-500 mb-6 flex gap-2">
            <span>Home</span> | <span>{article.category}</span> | <span>Latest</span>
          </div>
          <h1 lang="ml" className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-6 text-left hyphens-auto">
            {article.headline}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-y border-gray-100 dark:border-white/10 py-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">Published on {formatDetailedDate(article.createdAt)}</span>
            <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap font-bold text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-red-600" />
              {calculateReadTime(article.body)} min read
            </span>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          <article className="lg:col-span-6">
            
            {/* Frosted Glass Credits Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 rounded-2xl bg-white/40 dark:bg-[#222]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
              
              <div className="flex items-center gap-3 flex-1">
                {article.credits?.reporter?.avatarUrl ? (
                  <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0 shadow-sm">
                    <Image src={article.credits.reporter.avatarUrl} alt={article.credits?.reporter?.name || "Anonymous"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                    <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                      {(article.credits?.reporter?.name || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reporter</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.credits?.reporter?.name || "Anonymous"}</span>
                </div>
              </div>

              {article.credits?.photographer?.name && (
                <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700/50"></div>
              )}

              {article.credits?.photographer?.name && (
                <div className="flex items-center gap-3 flex-1">
                  {article.credits.photographer.avatarUrl ? (
                    <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0 shadow-sm">
                      <Image src={article.credits.photographer.avatarUrl} alt={article.credits.photographer.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                        {article.credits.photographer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Photographer</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{article.credits.photographer.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* MULTIPLE PHOTOS WITH ANONYMOUS FALLBACK CREDITS */}
            {imageMedia.length > 0 && (
              <div className="space-y-8 mb-8">
                {imageMedia.map((img: any, index: number) => {
                  
                  // Determine the credit for this specific image, fallback to main photographer, then Anonymous
                  const photoCredit = img.credit || article.credits?.photographer?.name || "Anonymous";

                  return (
                    <figure key={index} className="w-full flex flex-col gap-2">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                        <Image 
                          src={img.url} 
                          alt={`${article.headline} - Image ${index + 1}`} 
                          fill
                          priority={index === 0} 
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover" 
                        />
                      </div>
                      
                      <figcaption className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-right px-2">
                        📸 Photo: <span className="text-gray-900 dark:text-gray-300">{photoCredit}</span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
            
            <div lang="ml" className="article-body prose prose-base md:prose-lg dark:prose-invert max-w-none prose-p:mb-4 prose-p:leading-7 prose-p:text-justify prose-p:hyphens-auto prose-a:text-red-600 prose-img:rounded-xl">
              
              {(() => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(article.body || article.content || '', 'text/html');
                
                const elements = Array.from(doc.body.children);
                let pCount = 0;
                
                return elements.map((el, index) => {
                  const isParagraph = el.tagName.toLowerCase() === 'p';
                  if (isParagraph && el.textContent?.trim().length) pCount++;
                  
                  const showAd = isParagraph && pCount % 4 === 0 && pCount <= 8 && index !== elements.length - 1;

                  return (
                    <div key={index} className="w-full">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(el.outerHTML) }} />
                      
                      {showAd && (
                        <div className="my-10 flex justify-center w-full">
                          {inlineAd ? (
                            <a href={inlineAd.externalLink || "#"} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] h-[90px] md:h-[120px] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group">
                              <Image 
                                src={inlineAd.media?.[0]?.url || "https://picsum.photos/728/120"} 
                                alt={inlineAd.headline} 
                                fill
                                sizes="(max-width: 768px) 100vw, 728px"
                                className="object-cover" 
                              />
                              <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">Sponsored</div>
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
            
            <div className="flex justify-center w-full sticky top-24">
              {sidebarAd ? (
                <a href={sidebarAd.externalLink || "#"} target="_blank" rel="noopener noreferrer" className="block w-[300px] h-[600px] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-gray-100 dark:bg-gray-900 group">
                  <Image 
                    src={sidebarAd.media?.[0]?.url || "https://picsum.photos/300/600"} 
                    alt={sidebarAd.headline} 
                    fill
                    sizes="300px"
                    className="object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-[8px] text-white font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg z-10">Sponsored</div>
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
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                    <Image 
                      src={related.media?.[0]?.url || "https://picsum.photos/400/225"} 
                      alt={related.headline}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
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
// client/src/app/full-coverage/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, MapPin, Clock, Calendar } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { fetchArticleById, fetchArticles } from "@/lib/api"; // <-- Added fetchArticles

const formatDetailedDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
};

export default async function FullCoveragePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 1. Fetch the main article
  const article = await fetchArticleById(resolvedParams.id).catch(() => null);
  if (!article) notFound();

  // 2. Fetch related articles from the same category
  // Args: category, search, page, limit, status, ward
  const relatedData = await fetchArticles(article.category, "", 1, 4, "published", "All Places");

  
  
  // Filter out the current article, Shorts, and Ads from the related list and grab the top 3
  const relatedArticles = relatedData.articles
    .filter((a: any) => 
      a._id !== article._id && 
      a.category !== "Shorts" && 
      a.category !== "Advertisement"
    )
    .slice(0, 3);

  const hasImage = article.media && article.media.length > 0 && article.media[0].url;

  return (
    <div className="w-full min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pb-24 selection:bg-red-200 dark:selection:bg-red-900/50">
      
      {/* --- GLASSMORPHISM NAVBAR --- */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 h-16 flex items-center justify-between px-4 sm:px-6 transition-all">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-3 py-2 -ml-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 font-medium text-sm"
        >
          <ChevronLeft className="w-5 h-5" /> Back to News
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <BookmarkButton article={article} />
        </div>
      </div>

      <main className="w-full">
        
        {/* --- HEADER SECTION --- */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-full">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Breaking
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
            {article.headline}
          </h1>

          <div className="flex flex-wrap items-center gap-y-4 gap-x-8 border-y border-gray-200 dark:border-white/10 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDetailedDate(article.createdAt)}
            </div>
            {article.location?.ward && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {article.location.ward}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              {/* Rough estimate: 200 words per minute */}
              {Math.max(1, Math.ceil((article.body?.length || 0) / 1000))} min read
            </div>
          </div>
        </header>

        {/* --- IMMERSIVE HERO IMAGE --- */}
        {hasImage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
            <div className="w-full aspect-video md:aspect-[21/9] bg-gray-100 dark:bg-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm relative">
              <img 
                src={article.media![0].url} 
                alt={article.headline}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* --- ARTICLE BODY --- */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 mb-16">
          <div 
            className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight 
              prose-a:text-red-600 dark:prose-a:text-red-400 hover:prose-a:text-red-700 
              prose-img:rounded-2xl prose-img:shadow-sm
              prose-blockquote:border-l-red-600 prose-blockquote:bg-red-50 dark:prose-blockquote:bg-red-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
              [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-sm"
            dangerouslySetInnerHTML={{ __html: article.body || article.content || '' }} 
          />
        </article>

        {/* --- RELATED ARTICLES SECTION --- */}
        {relatedArticles.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 pt-12 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-black dark:text-white font-black text-xl tracking-wide uppercase border-b-[3px] border-red-600 pb-1">
                More in {article.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {relatedArticles.map((related) => (
                <Link 
                  href={`/full-coverage/${related._id}`} 
                  key={related._id}
                  className="group flex flex-col gap-4 bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5 relative">
                    <img 
                      src={related.media?.[0]?.url || "https://picsum.photos/400/250"} 
                      alt={related.headline}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-red-600 font-black uppercase tracking-wider mb-2">
                      {related.category} {related.location?.ward && `• ${related.location.ward}`}
                    </span>
                    <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white group-hover:text-red-600 transition-colors mb-3 line-clamp-3">
                      {related.headline}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>{formatShortDate(related.createdAt)}</span>
                      <span className="flex items-center gap-1 text-red-600 group-hover:translate-x-1 transition-transform">
                        Read <ChevronLeft className="w-3 h-3 rotate-180" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
"use client"; // Required for DOMParser to run in the browser
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2 } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { fetchArticleById, fetchArticles } from "@/lib/api";
import ShareButton from "@/components/ShareButton";

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

export default function FullCoveragePage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [resolvedParams, setResolvedParams] = useState<any>(null);

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
      });
    });
  }, [params]);

  if (!data) return null;

  const article = data;
  const hasImage = article.media && article.media.length > 0 && article.media[0].url;

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
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 dark:border-white/10 py-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="whitespace-nowrap">Published on {formatDetailedDate(article.createdAt)}</span>
            <ShareButton title={article.headline} url={`https://yourdomain.com/full-coverage/${article._id}`} />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          <article className="lg:col-span-6">
            {hasImage && (
              <div className="w-full aspect-video rounded-xl overflow-hidden shadow-sm mb-8">
                <img src={article.media![0].url} alt={article.headline} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div lang="ml" className="prose prose-base md:prose-lg dark:prose-invert max-w-none prose-p:mb-4 prose-p:leading-7 prose-p:text-justify prose-p:hyphens-auto prose-a:text-red-600 prose-img:rounded-xl">
              {/* Ad Injected Body Content */}
              {(() => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(article.body || article.content || '', 'text/html');
                const paragraphs = Array.from(doc.querySelectorAll('p'));
                return paragraphs.map((p, index) => (
                  <div key={index}>
                    <p dangerouslySetInnerHTML={{ __html: p.innerHTML }} />
                    {(index + 1) % 2 === 0 && index !== paragraphs.length - 1 && (
                      <div className="my-8 bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl p-6 border border-dashed border-gray-300 dark:border-gray-700 text-center">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Advertisement</span>
                      </div>
                    )}
                  </div>
                ));
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
            <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-3xl p-8 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Advertisement</span>
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
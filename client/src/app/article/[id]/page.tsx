import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { ArrowRight } from "lucide-react";
import AutoScrollToTop from "@/components/ui/AutoScrollToTop";
import ArticleNavbar from "@/components/layout/ArticleNavbar";
import { fetchArticleById } from "@/lib/api";

export const revalidate = 60;

const formatArticleDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
  return `${formattedDate} • ${dateObj.getHours()}:${dateObj.getMinutes()}`;
};

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await fetchArticleById(resolvedParams.id).catch(() => null);

  if (!article) notFound();

  // Determine fallback names
  const reporterName = article.credits?.reporter?.name || "Anonymous";
  const reporterAvatar = article.credits?.reporter?.avatarUrl;

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#111] pb-24">
      
      {/* Invisible component that forces scroll to top */}
      <AutoScrollToTop />

      {/* Interactive Navbar handles back, share, and bookmark */}
      <ArticleNavbar article={article} />

      {/* Article Content - pt-20 ensures it clears the new fixed navbar */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-20">
        <h1 className="text-3xl font-black mb-6 text-gray-900 dark:text-white leading-tight">
          {article.headline}
        </h1>

        {/* Optimized Next.js Image with Anonymous Photographer Fallback */}
        {article.media?.[0]?.url && (
          <figure className="mb-6 flex flex-col gap-2 w-full">
            <div className="relative w-full aspect-video rounded-xl shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={article.media[0].url}
                alt={article.headline}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Always show caption, default to Anonymous */}
            <figcaption className="text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right px-2">
              📸 Photo: <span className="text-gray-900 dark:text-gray-200">
                {article.media[0].credit || article.credits?.photographer?.name || "Anonymous"}
              </span>
            </figcaption>
          </figure>
        )}

        {/* Frosted Glass Credits Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 rounded-2xl bg-white/40 dark:bg-[#222]/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          
          {/* Reporter Credit (Always shows) */}
          <div className="flex items-center gap-3 flex-1">
            {reporterAvatar ? (
              <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0 shadow-sm">
                <Image src={reporterAvatar} alt={reporterName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                  {reporterName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reporter</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{reporterName}</span>
            </div>
          </div>

          {/* Desktop Divider */}
          {article.credits?.photographer?.name && (
            <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700/50"></div>
          )}

          {/* Photographer Profile Credit (Only shows if explicitly provided in the article settings) */}
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

        {/* THE WYSIWYG RICH TEXT RENDERER */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-[#e3000f] hover:prose-a:text-red-700 dark:prose-a:text-red-400 mb-8"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(article.body || article.content || '')
          }}
        />

        {/* FIXED OVERLAP */}
        <div className="mt-12 mb-52">
          <Link
            href={`/full-coverage/${article._id}`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#e3000f] text-white font-bold rounded-xl hover:bg-red-800 transition-all active:scale-[0.98] shadow-md"
          >
            Read Full Detailed Coverage <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
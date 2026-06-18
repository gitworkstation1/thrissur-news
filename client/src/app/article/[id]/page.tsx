import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Share2, ArrowRight } from "lucide-react";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { fetchArticleById } from "@/lib/api";

const formatArticleDate = (dateStr: string) => {
  const dateObj = new Date(dateStr);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
  return `${formattedDate} • ${dateObj.getHours()}:${dateObj.getMinutes()}`;
};

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await fetchArticleById(resolvedParams.id).catch(() => null);
  
  if (!article) notFound();

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#111] pb-24">
      {/* Navbar */}
      <div className="sticky top-14 z-40 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
          <BookmarkButton article={article} />
        </div>
      </div>

      {/* Article Content */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-6">
        <h1 className="text-3xl font-black mb-6 text-gray-900 dark:text-white leading-tight">
          {article.headline}
        </h1>
        
        {article.media?.[0]?.url && (
          <img 
            src={article.media[0].url} 
            alt={article.headline}
            className="w-full aspect-video object-cover rounded-xl mb-8 shadow-sm" 
          />
        )}
        
        {/* --- THE WYSIWYG RICH TEXT RENDERER --- */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-[#e3000f] hover:prose-a:text-red-700 dark:prose-a:text-red-400 mb-8"
          dangerouslySetInnerHTML={{ __html: article.body || article.content || '' }} 
        />

        {/* --- FIXED OVERLAP: Added margin to ensure button clears the BottomNav --- */}
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
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InteractiveShortCard from "@/components/cards/InteractiveShortCard";
import InteractiveAdCard from "@/components/cards/InteractiveAdCard";


export const revalidate = 60;

// ⚡ THE HYBRID FALLBACK FUNCTION
const getQuickReadSummary = (article: Article) => {
  // 1. Use the editorial summary if the reporter wrote one
  if (article.quickSummary && article.quickSummary.trim() !== "") {
    return article.quickSummary;
  }

  // 2. Fallback: Strip HTML from the main 'body' and truncate
  if (!article.body) return "";

  const strippedText = article.body.replace(/(<([^>]+)>)/gi, "");
  const cleanText = strippedText.replace(/\s+/g, " ").trim();

  if (cleanText.length > 250) {
    return cleanText.substring(0, 250) + "...";
  }

  return cleanText;
};

export default async function QuickReadPage() {
  let data = { articles: [] as Article[] };
  try {
    data = await fetchArticles();
    console.log("RAW FEED DATA:", JSON.stringify(data.articles.slice(0, 3), null, 2));
  } catch (err) {
    console.error(err);
  }

  const articles = data.articles || [];

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#0a0a0a] z-50 flex justify-center selection:bg-[#e3000f]/30">
      <Link
        href="/"
        className="absolute top-6 left-6 z-60 bg-white/80 dark:bg-black/40 backdrop-blur-md p-3 rounded-full text-black dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-black/60 transition-all active:scale-95 shadow-sm"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* Inside your QuickReadPage return statement */}
      <div className="w-full md:max-w-none h-dvh overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-50 dark:bg-[#0a0a0a] hide-scrollbar">
        {articles.map((item) => {
          // ⚡ Check if the item is an advertisement (adjust property based on your API)
          if (item.category === "Advertisement") {
            return <InteractiveAdCard key={`ad-${item._id}`} ad={item} />;
          }

          // Otherwise, render the standard news card
          return (
            <InteractiveShortCard
              key={`article-${item._id}`}
              article={item as Article}
              summaryText={getQuickReadSummary(item as Article)}
            />
          );
        })}
      </div>
    </div>
  );
}

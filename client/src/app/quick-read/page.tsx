import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InteractiveShortCard from "@/components/InteractiveShortCard"; // Imported the modular card engine

export default async function QuickReadPage() {
  let data = { articles: [] as Article[] };
  try {
    data = await fetchArticles();
  } catch (err) {
    console.error(err);
  }

  const articles = data.articles || [];

  return (
    // 1. Adapted backgrounds to adapt between gray-50 (light) and #0a0a0a (dark)
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#0a0a0a] z-50 flex justify-center selection:bg-[#e3000f]/30">
      
      {/* 2. Adapted Back Button for high contrast in both modes */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-[60] bg-white/80 dark:bg-black/40 backdrop-blur-md p-3 rounded-full text-black dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-black/60 transition-all active:scale-95 shadow-sm"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* Attached the supercharged hide-scrollbar class */}
      <div className="w-full md:max-w-none h-dvh overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-50 dark:bg-[#0a0a0a] hide-scrollbar">
        {articles.map((article) => (
          <InteractiveShortCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}
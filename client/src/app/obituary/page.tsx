"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image"; // <-- NEW: Next.js Image component
import DOMPurify from "isomorphic-dompurify"; // <-- NEW: Security import
import { fetchArticles } from "@/lib/api";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryMenu from "@/components/layout/CategoryMenu";

function ObituaryContent() {
  const [obituaries, setObituaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadObituaries = async () => {
      try {
        const response = await fetchArticles("Obituary", "", 1, 20, "published", "All Places");
        setObituaries(response.articles || []);
      } catch (error) {
        console.error("Failed to load obituaries", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadObituaries();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      <CategoryMenu />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
            Obituaries
          </h1>
          <div className="w-24 h-1 bg-gray-300 dark:bg-gray-700 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm md:text-base">
            Honoring and remembering the lives of those we've lost in our community.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : obituaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>No obituaries found at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {obituaries.map((obituary) => {
              // 1. Sanitize the HTML first to remove malicious scripts
              const cleanHtml = DOMPurify.sanitize(obituary.body || '');
              // 2. Strip safe HTML tags to create a plain text summary snippet
              const plainTextSummary = cleanHtml.replace(/<[^>]*>?/gm, '');

              return (
                <Link 
                  href={`/full-coverage/${obituary._id}`} 
                  key={obituary._id}
                  className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    {obituary.media?.[0]?.url ? (
                      <Image 
                        src={obituary.media[0].url} 
                        alt={obituary.headline} 
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-serif text-4xl">
                        {obituary.headline.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2">
                        {obituary.headline}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                         {plainTextSummary}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <span>{obituary.location?.ward || "Thrissur"}</span>
                      <span>{formatDate(obituary.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ObituaryPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ObituaryContent />
    </Suspense>
  );
}
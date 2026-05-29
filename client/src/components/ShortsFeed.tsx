"use client";
import { Article } from "@/lib/types";
import { Share2, Bookmark, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShortsFeed({ articles }: { articles: Article[] }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-black text-white">
        <p>No shorts available right now.</p>
      </div>
    );
  }

  return (
    // h-[100dvh] ensures it takes exactly the height of a mobile screen, even ignoring the browser address bar
    <div className="h-[100dvh] w-full bg-black overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* Floating Back Button */}
      <Link href="/" className="fixed top-6 left-4 z-50 bg-black/40 backdrop-blur-md p-2.5 rounded-full border border-white/10 shadow-lg">
        <ArrowLeft className="w-5 h-5 text-white" />
      </Link>

      {articles.map((article) => {
        const dateObj = new Date(article.createdAt);
        const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

        return (
          <div key={article._id} className="h-[100dvh] w-full snap-start relative bg-[#111]">
            
            {/* Background Image */}
            <img
              src={article.media?.[0]?.url || 'https://picsum.photos/400/800'}
              className="w-full h-full object-cover opacity-90"
              alt={article.headline}
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/95"></div>

            {/* Main Text Content */}
            {/* bottom-28 ensures it sits nicely above your floating BottomNav Dock */}
            <div className="absolute bottom-28 left-4 right-20 text-white z-10">
              <span className="bg-[#e3000f] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-3 inline-block shadow-md">
                {article.category || 'QUICK READ'}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-[1.2] mb-2 drop-shadow-lg">
                {article.headline}
              </h2>
              <p className="text-sm text-gray-300 line-clamp-3 font-medium mb-2 drop-shadow-md">
                {article.content || "Swipe up to read the next breaking story from your local area..."}
              </p>
              <p className="text-[10px] text-gray-400 font-bold tracking-wider">
                {article.location?.ward || 'Thrissur'} • {formattedDate}
              </p>
            </div>

            {/* Action Buttons (Right side) */}
            <div className="absolute bottom-28 right-4 flex flex-col gap-6 items-center z-10">
              <button className="flex flex-col items-center gap-1.5 group">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white font-bold drop-shadow-md">Save</span>
              </button>
              
              <button className="flex flex-col items-center gap-1.5 group">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-white font-bold drop-shadow-md">Share</span>
              </button>
            </div>
            
          </div>
        );
      })}
    </div>
  );
}
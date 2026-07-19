"use client";
import Image from "next/image"; 
import { ExternalLink } from "lucide-react"; // Good icon to show it leaves the app

export default function InteractiveAdCard({ ad }: { ad: any }) {
  return (
    <div className="relative w-full min-h-dvh snap-start bg-gray-50 dark:bg-[#0a0a0a] flex flex-col md:items-center md:justify-center p-2 sm:p-4 md:p-8 overflow-hidden">
      
      {/* THE MAIN CONSOLE - Subtle border change to differentiate from news */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col bg-white dark:bg-[#121212] rounded-3xl border-2 border-gray-100 dark:border-white/5 overflow-hidden shadow-xl">
        
        {/* IMAGE AREA */}
        <div className="relative h-[25vh] w-full overflow-hidden bg-gray-100 dark:bg-neutral-900">
          <Image 
            src={ad.mediaUrl || ad.media?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600'} 
            alt="Advertisement" 
            fill
            className="object-cover select-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#121212] via-transparent to-transparent" />
        </div>

        {/* AD DETAILS PANEL */}
        <div className="px-6 py-4 flex flex-col relative -mt-10">
          
          {/* Header Row - Removed Bookmarks/Share */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-[10px] font-black text-gray-500 bg-gray-200 dark:bg-gray-800 dark:text-gray-400 px-3 py-1 rounded-full tracking-wider uppercase">
              SPONSORED
            </span>
          </div>

          {/* Ad Headline */}
          <h2 className="font-headline font-extrabold text-xl tracking-tight leading-snug mb-2 text-black dark:text-white">
            {ad.headline || ad.title}
          </h2>

          {/* Ad Description */}
          <div className="font-body max-h-[30vh] overflow-y-auto text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 hide-scrollbar">
            <p>{ad.body || ad.description || "Sponsored Advertisement"}</p>
          </div>

          {/* EXTERNAL AD LINK - Replaces the 'Read Full Coverage' button */}
          <div className="mt-auto pb-4">
            <a 
              href={ad.targetUrl || ad.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body flex items-center justify-center gap-2 w-full py-4 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold text-sm rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Learn More <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
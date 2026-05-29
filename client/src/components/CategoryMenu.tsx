"use client";
import { Home } from "lucide-react";
import Link from "next/link";

const categories = ["News", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"];
const trendingTopics = ["Thrissur Pooram", "Weather Alert", "Traffic Block", "Gold Rate"];

export default function CategoryMenu() {
  return (
    <div className="bg-white dark:bg-[#111] flex flex-col shadow-sm transition-colors duration-300">
      
      {/* Tier 1: Main Categories */}
      <div className="flex items-center overflow-x-auto whitespace-nowrap px-2 py-2.5 border-b border-gray-200 dark:border-gray-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <Link href="/" className="px-4 text-[#002244] dark:text-gray-200 border-r border-gray-300 dark:border-gray-700 hover:text-[#e3000f] dark:hover:text-[#e3000f] transition-colors">
          <Home className="w-5 h-5" />
        </Link>
        
        {categories.map((item) => (
          <Link 
            href={`/category/${item.toLowerCase()}`} 
            key={item} 
            className="px-4 text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight hover:text-[#e3000f] dark:hover:text-[#e3000f] transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Tier 2: Quick Links (Trending) */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="text-[13px] font-extrabold text-[#002244] dark:text-gray-200 mr-2">Quick Links</span>
        
        {trendingTopics.map((topic) => (
          <Link 
            href="#" 
            key={topic} 
            className="px-3 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-full text-[#e3000f] dark:text-red-400 text-[11px] font-bold shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {topic}
          </Link>
        ))}
      </div>
      
    </div>
  );
}
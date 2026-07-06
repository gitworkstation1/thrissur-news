"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, Share2 } from "lucide-react";
import BookmarkButton from "@/components/ui/BookmarkButton";

export default function ArticleNavbar({ article }: { article: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.headline || "Fides News Article",
          text: "Check out this article on Fides News",
          url: window.location.href,
        });
      } catch (err) {
        console.log("User canceled share or error occurred");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const fullNavbar = (
    <div 
      className={`fixed top-0 inset-x-0 z-[90] bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-14 flex items-center justify-between transition-transform duration-300 ease-in-out ${
        isScrolled ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Link href="/" className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-black dark:text-white">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-bold">Back to News</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
          <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </button>
        <BookmarkButton article={article} />
      </div>
    </div>
  );

  // 2. The Floating Circular Back Pill (Teleported via Portal)
  // Sizes perfectly matched to standard UI pills (h-10 or h-12)
  const floatingPill = (
    <div 
      className={`transition-opacity duration-300 ease-in-out z-[9999] ${
        isScrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        position: 'fixed',
        top: '35px', // Change this specific number to match your right-side pill (e.g., 16px, 20px, or 24px)
        left: '16px'
      }}
    >
      <Link 
        href="/" 
        className="flex items-center justify-center w-11 h-11 bg-white dark:bg-[#1a1a1a] shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 rounded-full hover:scale-105 active:scale-95 transition-all text-black dark:text-white"
      >
        <ChevronLeft className="w-6 h-6 -ml-0.5 text-gray-800 dark:text-gray-200" />
      </Link>
    </div>
  );

  return (
    <>
      {fullNavbar}
      {/* This forces the button out of all layouts and pins it to the screen */}
      {mounted && createPortal(floatingPill, document.body)}
    </>
  );
}
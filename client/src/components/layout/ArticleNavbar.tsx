"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation"; 
import { ChevronLeft, Share2 } from "lucide-react";
import BookmarkButton from "@/components/ui/BookmarkButton";
import LiquidGlassButton from "@/components/ui/LiquidGlassButton"; 

export default function ArticleNavbar({ article }: { article: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const router = useRouter(); 

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

  // ⚡ THE FIX: Smart Back Function
  const handleBack = () => {
    if (window.history.length > 2) {
      router.back(); // Restores scroll position natively
    } else {
      router.push("/"); // Safe fallback if they opened the link in a new tab
    }
  };

  const fullNavbar = (
    <div 
      className={`fixed top-0 inset-x-0 z-[90] bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 h-14 flex items-center justify-between transition-transform duration-300 ease-in-out ${
        isScrolled ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* 1. LIQUID GLASS MAIN BACK BUTTON */}
      <LiquidGlassButton 
        onClick={handleBack} // ⚡ Updated to use handleBack
        className="flex items-center gap-2 p-2 -ml-2 text-black dark:text-white"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-bold">Back to News</span>
      </LiquidGlassButton>
      
      <div className="flex items-center gap-3">
        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
          <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </button>
        <BookmarkButton article={article} />
      </div>
    </div>
  );

  const floatingPill = (
    <div 
      className={`transition-opacity duration-300 ease-in-out z-[9999] ${
        isScrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        position: 'fixed',
        top: '35px', 
        left: '16px'
      }}
    >
      {/* 2. LIQUID GLASS FLOATING BACK BUTTON */}
      <LiquidGlassButton 
        onClick={handleBack} // ⚡ Updated to use handleBack
        className="flex items-center justify-center w-11 h-11 text-black dark:text-white"
      >
        <ChevronLeft className="w-6 h-6 -ml-0.5 text-gray-800 dark:text-gray-200" />
      </LiquidGlassButton>
    </div>
  );

  return (
    <>
      {fullNavbar}
      {mounted && createPortal(floatingPill, document.body)}
    </>
  );
}
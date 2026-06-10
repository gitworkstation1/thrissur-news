"use client";
import { Share2 } from "lucide-react";

export default function ShareButton({ title, url }: { title: string, url: string }) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: url,
        });
      } else {
        // Fallback: Copy to clipboard if Web Share API isn't supported
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 hover:text-red-600 transition-colors font-semibold ml-auto"
    >
      <Share2 className="w-4 h-4" /> Share
    </button>
  );
}
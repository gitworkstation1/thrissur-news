"use client";
import { Article } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ShortCard from "../cards/ShortCard"; // ⚡ Import the actual component

export default function ShortsFeed({ articles }: { articles: Article[] }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-black text-white">
        <p>No shorts available right now.</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      <Link href="/" className="fixed top-6 left-4 z-50 bg-black/40 backdrop-blur-md p-2.5 rounded-full border border-white/10 shadow-lg">
        <ArrowLeft className="w-5 h-5 text-white" />
      </Link>

      {/* ⚡ Delegate rendering entirely to the smart ShortCard component */}
      {articles.map((article) => (
        <ShortCard key={article._id} short={article} />
      ))}
      
    </div>
  );
}
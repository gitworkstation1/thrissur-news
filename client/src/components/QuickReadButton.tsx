"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export default function QuickReadButton() {
  const pathname = usePathname();

  // Hide the button if we are not on the homepage
  if (pathname !== "/") return null;

  return (
    <Link
      href="/shorts"
      className="fixed bottom-24 right-4 bg-white/40 dark:bg-black/40 border border-white/60 dark:border-gray-500/50 text-[#002244] dark:text-gray-100 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_8px_20px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.5)] z-[60] hover:bg-white/60 dark:hover:bg-black/60 transition-all duration-300"
    >
      <Zap className="w-4 h-4" fill="currentColor" />
      <span className="font-bold text-sm tracking-wide">QUICK READ</span>
    </Link>
  );
}
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-50">
      <div className="flex items-center justify-around py-3">
        <Link href="/" className={`flex flex-col items-center text-sm ${pathname === "/" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          <span>🏠</span><span>Home</span>
        </Link>
        <Link href="/search" className={`flex flex-col items-center text-sm ${pathname === "/search" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          <span>🔍</span><span>Search</span>
        </Link>
        <Link href="/shorts" className={`flex flex-col items-center text-sm ${pathname === "/shorts" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          <span>🎬</span><span>Shorts</span>
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center text-sm ${pathname === "/dashboard" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
          <span>✍️</span><span>Post</span>
        </Link>
      </div>
    </div>
  );
}
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlaySquare, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  
  // (REMOVED: The if-statement hiding the nav on the /shorts route)

  const navItems = [
    { name: "HOME", path: "/", icon: Home },
    { name: "SEARCH", path: "/search", icon: Search },
    { name: "SHORTS", path: "/shorts", icon: PlaySquare },
    { name: "ADMIN", path: "/dashboard", icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md md:hidden z-50">
      <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg border border-gray-200/80 dark:border-gray-700/50 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] rounded-full px-6 py-3.5 transition-colors duration-300">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16 ${
                  isActive 
                    ? "text-[#e3000f] -translate-y-1" 
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? "stroke-[2.5px]" : "stroke-2"
                  }`} 
                />
                <span 
                  className={`text-[9px] tracking-wider transition-all duration-300 ${
                    isActive ? "font-black opacity-100" : "font-semibold opacity-0 h-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; 
import Link from "next/link"; 

export default function QuickReadButton() {
  const pathname = usePathname(); 
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const isWindowScrolled = window.scrollY > 50;
      let isSidebarScrolled = false;
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto');
      
      scrollableContainers.forEach((container) => {
        if (container.scrollTop > 50) {
          isSidebarScrolled = true;
        }
      });

      if (isWindowScrolled || isSidebarScrolled) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", checkScroll, true);
    checkScroll(); 
    
    return () => window.removeEventListener("scroll", checkScroll, true);
  }, []);

  if (pathname === "/search" || pathname === "/quick-read" || pathname === "/shorts") {
    return null;
  }

  return (
    <Link 
      href="/quick-read"
      className={`
        /* ⚡ Set to z-30 so it sits above content, but below menus */
        fixed right-4 bottom-24 z-30 
        flex items-center justify-center rounded-full
        transition-all duration-300 ease-in-out overflow-hidden h-10 
        
        bg-[#e3000f] text-white
        border border-[#ff4d58]
        shadow-[0_8px_20px_rgba(227,0,15,0.4)] hover:shadow-[0_12px_25px_rgba(227,0,15,0.6)]
        hover:bg-[#c2000c] hover:scale-105 active:scale-95
        
        ${isScrolled ? 'w-10 px-0 gap-0' : 'w-[140px] px-4 gap-2'}
        [.socials-open_&]:w-10
        [.socials-open_&]:px-0
        [.socials-open_&]:gap-0
      `}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
      </svg>
      <span className={`font-bold text-[11px] tracking-wide whitespace-nowrap transition-all duration-300 
        ${isScrolled ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[100px]'}
        [.socials-open_&]:opacity-0 
        [.socials-open_&]:max-w-0 
      `}>
        FLASH READ
      </span>
    </Link>
  );
}
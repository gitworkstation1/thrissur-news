import "./globals.css";

import Script from "next/script";

import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import QuickReadButton from "@/components/ui/QuickReadButton";
import NewsTicker from "@/components/layout/NewsTicker";
import TopBannerAd from "@/components/ad/TopBannerAd";
import HideOnShorts from "@/components/layout/HideOnShorts";
import HideOnDashboard from "@/components/layout/HideOnDashboard";

export const metadata = {
  title: "Thrissur News",
  description: "Hyperlocal news for Thrissur",
};

// src/app/layout.js
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Adds the AdSense Master Script safely */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden">
        
        {/* 1. WRAP THE TOP ELEMENTS */}
        <HideOnShorts>
          <HideOnDashboard>
            <TopBannerAd />
          </HideOnDashboard>
          <Navbar />
          <NewsTicker />
        </HideOnShorts>
        
        {/* The main content area where your pages actually load */}
        <main className="w-full relative pb-28"> 
          {children}
        </main>
        
        {/* 2. WRAP THE BOTTOM / FLOATING ELEMENTS */}
        <HideOnShorts>
          <QuickReadButton />
          <ScrollToTopButton />
          <BottomNav />
        </HideOnShorts>

      </body>
    </html>
  );
}
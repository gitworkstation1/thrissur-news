import "./globals.css";
import Script from "next/script";
import { Metadata, Viewport } from "next";

import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import QuickReadButton from "@/components/ui/QuickReadButton";
import NewsTicker from "@/components/layout/NewsTicker";
import TopBannerAd from "@/components/ad/TopBannerAd";
import HideOnShorts from "@/components/layout/HideOnShorts";
import HideOnDashboard from "@/components/layout/HideOnDashboard";
import Footer from "@/components/layout/Footer";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: { default: "Fides News | Thrissur Local Updates", template: "%s | Fides News" },
  description: "Your trusted source for hyper-local news.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* ADDED THIS: Liquid Glass Library */}
        <Script 
          src="/liquid-glass.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body className="bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden min-h-screen flex flex-col">
        
        <HideOnShorts>
          <HideOnDashboard>
            <TopBannerAd />
          </HideOnDashboard>
          <Navbar />
          <NewsTicker />
        </HideOnShorts>
        
        {/* Removed pb-28 from here */}
        <main className="w-full relative flex-grow"> 
          {children}
        </main>
        
        <HideOnShorts>
          <Footer />
          <QuickReadButton />
          <ScrollToTopButton />
          <BottomNav />
        </HideOnShorts>

      </body>
    </html>
  );
}
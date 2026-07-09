import "./globals.css";
import Script from "next/script";
import { Metadata, Viewport } from "next";

// ⚡ 1. IMPORT THE FONTS
import { Anek_Malayalam, Mukta_Malar } from 'next/font/google';
import { Noto_Sans_Malayalam } from 'next/font/google';

import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import QuickReadButton from "@/components/ui/QuickReadButton";
import NewsTicker from "@/components/layout/NewsTicker";
import TopBannerAd from "@/components/ad/TopBannerAd";
import HideOnShorts from "@/components/layout/HideOnShorts";
import HideOnDashboard from "@/components/layout/HideOnDashboard";
import Footer from "@/components/layout/Footer";

// ⚡ 2. CONFIGURE THE FONTS
const anek = Anek_Malayalam({ 
  subsets: ['malayalam'],
  variable: '--font-anek',
  display: 'swap',
});

// 2. Update the font configuration:
const malayalamFont = Noto_Sans_Malayalam({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['malayalam'], // ✅ This is now perfectly valid!
  variable: '--font-malayalam',
  display: 'swap',
});

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
        {/* ⚡ THE BULLETPROOF CDN LINK */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css" />
        
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
      {/* ⚡ 3. INJECT FONT VARIABLES INTO THE BODY */}
      <body className={`bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden min-h-screen flex flex-col ${anek.variable} ${malayalamFont.variable}`}>
        
        <HideOnShorts>
          <HideOnDashboard>
            <TopBannerAd />
          </HideOnDashboard>
          <Navbar />
          <NewsTicker />
        </HideOnShorts>
        
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
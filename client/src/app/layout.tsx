import "./globals.css";
import Script from "next/script";
import { Metadata, Viewport } from "next";

// ⚡ 1. Import NextTopLoader
import NextTopLoader from 'nextjs-toploader';
import { Anek_Malayalam, Mukta_Malar } from 'next/font/google';

import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import QuickReadButton from "@/components/ui/QuickReadButton";
import NewsTicker from "@/components/layout/NewsTicker";
import TopBannerAd from "@/components/ad/TopBannerAd";
import HideOnShorts from "@/components/layout/HideOnShorts";
import HideOnDashboard from "@/components/layout/HideOnDashboard";
import Footer from "@/components/layout/Footer";

const anek = Anek_Malayalam({ 
  subsets: ['malayalam'],
  variable: '--font-anek',
  display: 'swap',
});

const mukta = Mukta_Malar({
  weight: ['400', '500', '600', '700', '800'],
  // ⚡ THE FIX: Changed 'malayalam' to 'latin' to satisfy TypeScript
  subsets: ['latin'], 
  variable: '--font-mukta',
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css" />
        
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        <Script 
          src="/liquid-glass.js" 
          strategy="afterInteractive" 
        />
      </head>
      <body className={`bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden min-h-screen flex flex-col ${anek.variable} ${mukta.variable}`}>
        
        {/* ⚡ 2. Add the TopLoader component with your brand color! */}
        <NextTopLoader 
          color="#e3000f" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #e3000f,0 0 5px #e3000f" 
        />
        
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
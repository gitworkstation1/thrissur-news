import "./globals.css";

import Script from "next/script";
import { Metadata, Viewport } from "next"; // <-- NEW: Type imports

import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import QuickReadButton from "@/components/ui/QuickReadButton";
import NewsTicker from "@/components/layout/NewsTicker";
import TopBannerAd from "@/components/ad/TopBannerAd";
import HideOnShorts from "@/components/layout/HideOnShorts";
import HideOnDashboard from "@/components/layout/HideOnDashboard";

// --- PHASE 3: GLOBAL VIEWPORT SETTINGS ---
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// --- PHASE 3: GLOBAL SEO FALLBACKS ---
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"), // TODO: Replace with your actual live URL
  title: {
    default: "Integrity News | Thrissur Local Updates",
    template: "%s | Integrity News", // Automatically appends the brand name to child pages!
  },
  description: "Your trusted source for hyper-local breaking news, politics, and live updates across Thrissur.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Integrity News",
    images: [
      {
        url: "https://picsum.photos/1200/630", // TODO: Replace with your global social share image
        width: 1200,
        height: 630,
        alt: "Integrity News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrity News | Thrissur Local Updates",
    description: "Your trusted source for hyper-local breaking news, politics, and live updates across Thrissur.",
    images: ["https://picsum.photos/1200/630"], // TODO: Same fallback image as above
  },
};

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
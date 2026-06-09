import "./globals.css";

import ScrollToTopButton from "@/components/ScrollToTopButton";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import QuickReadButton from "@/components/QuickReadButton";

export const metadata = {
  title: "Thrissur News",
  description: "Hyperlocal news for Thrissur",
};

// src/app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden">
        <Navbar />
        
        {/* ADDED pb-20 TO CREATE A BOTTOM SAFE ZONE */}
        <main className="w-full relative pb-28"> 
          {children}
        </main>
        
        <QuickReadButton />
        <ScrollToTopButton />
      </body>
    </html>
  );
}

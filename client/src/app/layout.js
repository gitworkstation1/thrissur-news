import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import QuickReadButton from "@/components/QuickReadButton";
import "./globals.css";

export const metadata = {
  title: "Thrissur News",
  description: "Hyperlocal news for Thrissur",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-[#111] transition-colors duration-300 antialiased overflow-x-hidden">
        
        <Navbar />
        
        <main className="w-full relative">
          {children}
        </main>
        
        {/* Drop it safely outside the animated <main> wrapper! */}
        <QuickReadButton />
        <BottomNav />
        
      </body>
    </html>
  );
}
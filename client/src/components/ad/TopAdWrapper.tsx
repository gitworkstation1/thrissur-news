"use client";
import { usePathname } from "next/navigation";

export default function TopAdWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the ad completely on these specific pages
  if (pathname === "/search" || pathname === "/quick-read" || pathname === "/shorts") {
    return null; 
  }

  // Otherwise, render the Server Component ad!
  return <>{children}</>;
}
"use client";

import { usePathname } from "next/navigation";

export default function HideOnShorts({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we are on the shorts page, don't render anything wrapped in this
  if (pathname === "/shorts") {
    return null;
  }

  return <>{children}</>;
}
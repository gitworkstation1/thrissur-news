"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function HideOnShorts({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If the user is on the Shorts page, return nothing (hide the children)
  if (pathname?.startsWith("/shorts")) {
    return null;
  }

  // Otherwise, render the children normally
  return <>{children}</>;
}
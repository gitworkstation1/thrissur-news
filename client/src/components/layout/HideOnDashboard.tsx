"use client";
import { usePathname } from "next/navigation";

export default function HideOnDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ONLY hide on the dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return <>{children}</>;
}
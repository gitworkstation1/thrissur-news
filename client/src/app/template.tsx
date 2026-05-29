"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animateState, setAnimateState] = useState("");

  // This ensures the initial page load is visible.
  // When the path changes, it snaps hidden to the right, then glides in smoothly.
  useEffect(() => {
    setAnimateState("opacity-0 translate-x-8");
    
    const animationFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateState("opacity-100 translate-x-0");
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [pathname]);

  return (
    <div 
      // Removed the invalid cubic-bezier class and used standard ease-out
      className={`transition-all duration-300 ease-out w-full ${animateState || "opacity-100 translate-x-0"}`}
    >
      {children}
    </div>
  );
}
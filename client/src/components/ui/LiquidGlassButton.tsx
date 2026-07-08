"use client";
import React, { useEffect, useRef } from "react";

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function LiquidGlassButton({ children, className = "", ...props }: LiquidGlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 1. Check if the element exists and if the script has loaded
    // @ts-ignore - Ignoring TS error because liquidGlass is attached to the window object
    if (!buttonRef.current || typeof window.liquidGlass === "undefined") return;

    // 2. Apply the effect with settings optimized for small buttons/pills
    // @ts-ignore
    const glass = window.liquidGlass(buttonRef.current, {
      scale: -60,       // Subtle bulge
      chroma: 4,        // Slight rainbow edge
      blur: 2,          // Internal blur
      border: 0.1,      // Neutral center
    });

    // 3. Clean up the effect if the button is removed from the screen
    return () => {
      if (glass && typeof glass.destroy === "function") {
        glass.destroy();
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`glass-material relative z-10 transition-transform active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
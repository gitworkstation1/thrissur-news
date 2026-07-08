"use client";
import React, { useEffect, useRef } from "react";

// ⚡ Added glassOptions here
interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glassOptions?: any; 
}

export default function LiquidGlassButton({ children, className = "", glassOptions, ...props }: LiquidGlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (!buttonRef.current || typeof window.liquidGlass === "undefined") return;

    // @ts-ignore
    const glass = window.liquidGlass(buttonRef.current, {
      scale: -60,       
      chroma: 2,        
      blur: 2,          
      border: 0.1,      
      ...glassOptions // ⚡ This lets us override the settings per-button!
    });

    return () => {
      if (glass && typeof glass.destroy === "function") {
        glass.destroy();
      }
    };
  }, [glassOptions]);

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
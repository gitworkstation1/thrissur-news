"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function PageTransition({ children, transitionKey }: { children: ReactNode; transitionKey: string }) {
  return (
    <motion.div
      // The 'key' tells Framer Motion to re-run the animation whenever the URL parameters change
      key={transitionKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      // This custom cubic-bezier easing provides that highly polished, Apple/Vercel-style fluid motion
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}   
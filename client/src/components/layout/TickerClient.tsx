"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TickerClient({ articles }: { articles: any[] }) {
  const [speed, setSpeed] = useState<number>(35); // Default speed

  // Read the saved speed from AppSettings
  useEffect(() => {
    const updateSpeedFromStorage = () => {
      const savedSpeed = localStorage.getItem("fides_ticker_speed");
      if (savedSpeed) {
        setSpeed(Number(savedSpeed));
      }
    };

    updateSpeedFromStorage(); // Initial load

    // Only listen for the final save event now!
    window.addEventListener("tickerSpeedChanged", updateSpeedFromStorage);

    return () => {
      window.removeEventListener("tickerSpeedChanged", updateSpeedFromStorage);
    };
  }, []);

  return (
    <div className="flex-1 h-full overflow-hidden relative flex items-center ml-[90px] md:ml-[140px]">
      {/* 1. Make the CSS static. Remove the duration from here! */}
      <style>
        {`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker {
            display: flex;
            flex-wrap: nowrap; /* ⚡ Prevents the flexbox from stacking */
            white-space: nowrap; /* ⚡ Forces text into a single line */
            width: max-content; 
            animation-name: ticker;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* 2. ⚡ Apply the dynamic speed directly inline here */}
      <div 
        key={speed} // ⚡ THE MAGIC FIX: Forces the browser to restart the animation!
        className="animate-ticker flex items-center"
        style={{ animationDuration: `${speed}s` }}
      >
        {articles.map((article, index) => (
          <div key={article._id || index} className="flex items-center">
            <Link
              href={`/full-coverage/${article._id}`}
              className="hover:opacity-70 hover:underline underline-offset-4 transition-all text-xs md:text-sm font-bold tracking-wide"
            >
              {article.headline}
            </Link>
            {/* Separator Pipe */}
            <span className="mx-6 text-gray-500 dark:text-gray-400 font-light">
              |
            </span>
          </div>
        ))}
      </div>

      {/* --- RIGHT EDGE FADE OUT --- */}
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-black dark:from-white to-transparent z-10 pointer-events-none transition-colors duration-300"></div>
    </div>
  );
}
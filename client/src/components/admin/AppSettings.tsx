"use client";

import { useState, useEffect } from "react";
import { Save, Settings, Activity } from "lucide-react";

export default function AppSettings() {
  const [tickerSpeed, setTickerSpeed] = useState<number>(30); // Default fallback
  const [isSaving, setIsSaving] = useState(false);

  // ⚡ FIX: This ensures the slider reads the saved value as soon as you open the settings page!
  useEffect(() => {
    const savedSpeed = localStorage.getItem("fides_ticker_speed");
    if (savedSpeed) {
      setTickerSpeed(Number(savedSpeed));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("fides_ticker_speed", tickerSpeed.toString());
      
      // Tell the TickerClient that the speed changed
      window.dispatchEvent(new Event("tickerSpeedChanged"));
      
      alert(`Settings saved! Ticker speed set to ${tickerSpeed}s.`);
    } catch (error) {
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-red-600" /> App Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage global configurations for the Fides News platform.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* SETTINGS MODULE: TICKER SPEED */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Breaking News Ticker Speed
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Adjust how fast the red breaking news banner scrolls across the screen. A lower number means it completes the loop faster.
              </p>
            </div>
          </div>

          {/* --- LIVE PREVIEW BOX --- */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Live Preview
        </h3>
        
        {/* We use specific preview CSS so it stays perfectly inside this small box */}
        <style>
          {`
            @keyframes previewTicker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-preview {
              display: flex;
              flex-wrap: nowrap;
              white-space: nowrap;
              width: max-content;
              animation-name: previewTicker;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              will-change: transform;
            }
          `}
        </style>

        {/* The Mock Ticker Container */}
        <div className="w-full bg-black dark:bg-white text-white dark:text-black h-10 overflow-hidden relative flex items-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm">
          
          {/* Fake Badge */}
          <div className="absolute left-0 top-0 bottom-0 bg-[#e3000f] text-white font-black text-[10px] md:text-xs uppercase px-3 flex items-center z-20 shadow-[8px_0_20px_-5px_rgba(0,0,0,0.8)] tracking-widest">
            PREVIEW
          </div>

          {/* Scrolling Preview Text */}
          <div className="flex-1 h-full overflow-hidden relative flex items-center ml-[90px]">
            <div 
              key={tickerSpeed} // ⚡ Forces the animation to restart cleanly as you drag
              className="animate-preview items-center"
              style={{ animationDuration: `${tickerSpeed}s` }}
            >
              {/* --- BATCH 1 --- */}
              <div className="flex items-center shrink-0">
                <span className="text-sm font-bold tracking-wide">
                  This is a live preview of your ticker speed. Adjust the slider below to see how fast this text scrolls! 
                </span>
                <span className="mx-6 text-gray-500 font-light">|</span>
                <span className="text-sm font-bold tracking-wide">
                  Breaking News: Fides News dashboard ticker updated successfully.
                </span>
                <span className="mx-6 text-gray-500 font-light">|</span>
              </div>

              {/* --- BATCH 2 (Exact Duplicate for seamless loop) --- */}
              <div className="flex items-center shrink-0">
                <span className="text-sm font-bold tracking-wide">
                  This is a live preview of your ticker speed. Adjust the slider below to see how fast this text scrolls! 
                </span>
                <span className="mx-6 text-gray-500 font-light">|</span>
                <span className="text-sm font-bold tracking-wide">
                  Breaking News: Fides News dashboard ticker updated successfully.
                </span>
                <span className="mx-6 text-gray-500 font-light">|</span>
              </div>
            </div>
          </div>
          
          {/* Right Edge Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black dark:from-white to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>

          <div className="max-w-xl pl-16">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Duration: <span className="text-red-600 dark:text-red-400 text-sm">{tickerSpeed}s</span> / loop
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="2"
              value={tickerSpeed}
              onChange={(e) => setTickerSpeed(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-2">
              <span>⚡ Fast (10s)</span>
              <span>Normal (30s)</span>
              <span>🐢 Slow (60s)</span>
            </div>
          </div>
        </div>

        {/* SAVE BAR */}
        <div className="p-6 bg-gray-50 dark:bg-white/5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
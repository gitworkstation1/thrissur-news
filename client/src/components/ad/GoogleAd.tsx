"use client";
import { useEffect } from "react";

export default function GoogleAd({ adSlot, className }: { adSlot: string; className?: string }) {
  useEffect(() => {
    // This tells Google to fill the ad space once the component appears on screen
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`overflow-hidden flex items-center justify-center ${className}`}>
      <ins
        className="adsbygoogle w-full h-full block"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" /* <-- REPLACE WITH YOUR GOOGLE PUBLISHER ID */
        data-ad-slot={adSlot}                    /* Each ad unit on your site gets a unique ID */
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
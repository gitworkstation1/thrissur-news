'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX, ExternalLink } from 'lucide-react';
import GoogleAd from "./GoogleAd"; // <-- IMPORT YOUR GLOBAL GOOGLE AD COMPONENT

export default function AdCard({ ad }: { ad: any }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // 1. DETECT THE CURRENT SYSTEM ENVIRONMENT
  const isDevelopment = process.env.NODE_ENV === "development";

  const mediaType = ad.media?.[0]?.type;
  const mediaUrl = ad.media?.[0]?.url;
  const targetLink = ad.externalLink || '#';
  const videoId = ad.media?.[0]?.url;

  const toggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }), 
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full h-[100dvh] snap-start snap-always relative flex items-center justify-center bg-black">
      
      {isDevelopment ? (
        /* ================= DEVELOPMENT MODE (YOUR CUSTOM LOCAL ADS) ================= */
        <>
          {/* Media Content Box */}
          {mediaType === 'youtube-short' && mediaUrl ? (
            <iframe
              ref={iframeRef}
              className="w-full max-w-md h-[100dvh] object-cover block bg-black pointer-events-auto"
              src={`https://www.youtube.com/embed/${mediaUrl}?autoplay=1&mute=1&loop=1&playlist=${mediaUrl}&controls=0&rel=0&modestbranding=1&enablejsapi=1`}
              title={ad.headline}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img 
              src={mediaUrl || "https://picsum.photos/400/800"} 
              alt={ad.headline}
              className="w-full max-w-md h-[100dvh] object-cover"
            />
          )}

          {/* Ad Overlay UI layer */}
          <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto p-6 pb-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none flex flex-col justify-end h-1/2">
            <div className="flex items-center justify-between pointer-events-auto mb-4">
              <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-full">
                Sponsored
              </span>
              
              {videoId && mediaType === 'youtube-short' && (
                <button onClick={toggleMute} className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg text-white hover:bg-white/20 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
            </div>

            <h2 className="text-white text-xl font-bold leading-snug drop-shadow-lg mb-4 pointer-events-auto">
              {ad.headline}
            </h2>

            {/* CTA Button */}
            <a 
              href={targetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white text-black font-bold text-center rounded-xl pointer-events-auto flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors active:scale-[0.98]"
            >
              Learn More <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </>
      ) : (
        /* ================= PRODUCTION MODE (LIVE GOOGLE ADSENSE) ================= */
        <div className="w-full max-w-md h-full pt-16 pb-24 px-4 bg-[#0a0a0a] flex items-center justify-center">
          {/* We pass a dedicated slot ID for full-viewport interstitial or vertical ads.
            The surrounding parent keeps it centered and bounded on desktop browsers!
          */}
          <GoogleAd 
            adSlot="SHORTS_VERTICAL_AD_ID" 
            className="w-full h-full rounded-2xl overflow-hidden" 
          />
        </div>
      )}

    </div>
  );
}
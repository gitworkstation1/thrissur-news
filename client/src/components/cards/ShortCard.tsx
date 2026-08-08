// client/src/components/cards/ShortCard.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Share2, Volume2, VolumeX } from 'lucide-react';
import BookmarkButton from '../ui/BookmarkButton';

const getYouTubeId = (urlStr: string) => {
  if (!urlStr) return "";
  if (!urlStr.startsWith("http")) return urlStr; 
  return urlStr.split("/").pop()?.split("?")[0] || "";
};

export default function ShortCard({ short }: { short: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoId = getYouTubeId(short.media?.[0]?.url);

  // ⚡ Intersection Observer to track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          if (entry.isIntersecting) {
            // Video is in view -> Play
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), 
              '*'
            );
          } else {
            // Video is out of view -> Pause and ensure it's muted
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), 
              '*'
            );
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'mute', args: [] }), 
              '*'
            );
            setIsMuted(true); // Reset local state
          }
        }
      },
      { threshold: 0.5 } // Triggers when 50% of the card is visible on screen
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  const handleShare = async () => {
    const url = `${window.location.origin}/full-coverage/${short._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: short.headline,
          text: 'Check out this news short from FidesNews',
          url: url
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (!videoId) return null;

  return (
    <div ref={containerRef} className="w-full h-[100dvh] snap-start snap-always relative flex items-center justify-center bg-black">
      
      <iframe
        ref={iframeRef}
        className="w-full max-w-md h-[100dvh] object-cover block bg-black pointer-events-auto"
        // ⚡ Note: autoplay=1 removed so the observer handles the initial playback reliably
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`}
        title={short.headline}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto p-6 pb-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex items-end justify-between">
        
        <div className="flex-1 pr-4 pointer-events-auto">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full">
            FidesNews
          </span>
          <h2 className="text-white text-xl font-bold leading-snug drop-shadow-lg">
            {short.headline}
          </h2>
        </div>

        <div className="flex flex-col gap-6 pointer-events-auto items-center">
          
          <button onClick={toggleMute} className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors group">
            <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover:bg-white/20 border border-white/10 shadow-lg">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </div>
          </button>

          <div className="text-white hover:text-red-400 transition-colors group cursor-pointer flex flex-col items-center">
            <div className="p-2.5 bg-black/40 backdrop-blur-md rounded-full group-hover:bg-white/20 border border-white/10 shadow-lg flex items-center justify-center">
              <BookmarkButton article={short} />
            </div>
          </div>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors group">
            <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover:bg-white/20 border border-white/10 shadow-lg">
              <Share2 className="w-6 h-6" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
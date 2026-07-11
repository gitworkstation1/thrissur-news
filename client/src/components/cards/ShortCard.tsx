// client/src/components/ShortCard.tsx
'use client';

import { useRef, useState } from 'react';
import { Share2, Volume2, VolumeX } from 'lucide-react';
import BookmarkButton from '../ui/BookmarkButton';

export default function ShortCard({ short }: { short: any }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoId = short.media?.[0]?.url;

  // Magically controls the YouTube iframe without reloading
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

  // Uses the native mobile share sheet, or falls back to copy link
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
    <div className="w-full h-[100dvh] snap-start snap-always relative flex items-center justify-center bg-black">
      
      {/* Note the added &enablejsapi=1 to allow our mute button to talk to YouTube */}
      <iframe
        ref={iframeRef}
        // CHANGED: Added 'block bg-black' to the classes below
        className="w-full max-w-md h-[100dvh] object-cover block bg-black pointer-events-auto"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&enablejsapi=1`}
        title={short.headline}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Overlaid UI Elements */}
      <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto p-6 pb-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex items-end justify-between">
        
        {/* Left Side: Headline */}
        <div className="flex-1 pr-4 pointer-events-auto">
          <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full">
            FidesNews
          </span>
          <h2 className="text-white text-xl font-bold leading-snug drop-shadow-lg">
            {short.headline}
          </h2>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-col gap-6 pointer-events-auto items-center">
          
          {/* Mute/Unmute Button */}
          <button onClick={toggleMute} className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors group">
            <div className="p-3 bg-black/40 backdrop-blur-md rounded-full group-hover:bg-white/20 border border-white/10 shadow-lg">
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </div>
          </button>

          {/* Bookmark Button (Wrapped to match the exact styling) */}
          <div className="text-white hover:text-red-400 transition-colors group cursor-pointer flex flex-col items-center">
            <div className="p-2.5 bg-black/40 backdrop-blur-md rounded-full group-hover:bg-white/20 border border-white/10 shadow-lg flex items-center justify-center">
              <BookmarkButton article={short} />
            </div>
          </div>

          {/* Share Button */}
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
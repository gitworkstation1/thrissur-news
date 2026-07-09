"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image"; 
import DOMPurify from "isomorphic-dompurify"; 
import { fetchArticles } from "@/lib/api";
import { Search, Loader2, X, Flame, Flower2 } from "lucide-react";
import CategoryMenu from "@/components/layout/CategoryMenu";
import { createPortal } from "react-dom"; 

const HARDCODED_OBITUARIES = [
  {
    _id: "hardcoded-1",
    headline: "K. Devan, 74",
    body: "<p>K. Devan, a beloved retired school teacher and long-time resident of Thrissur Town, passed away peacefully on Sunday. He dedicated 40 years of his life to educating the youth at St. Thomas High School. He is survived by his wife, Radha, and two children.</p>",
    media: [{ url: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&q=80&w=400" }],
    location: { ward: "Thrissur Town" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "hardcoded-2",
    headline: "Lakshmi Amma, 82",
    body: "<p>Lakshmi Amma, a familiar and loving presence in the Ollur community, breathed her last early Monday morning due to age-related ailments. Known for her immense kindness and charitable work at the local temple, she will be deeply missed by her extensive family and neighbors.</p>",
    media: [{ url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400" }],
    location: { ward: "Ollur" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

function ObituaryContent() {
  const [obituaries, setObituaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeObituary, setActiveObituary] = useState<any | null>(null);
  const [hasLitCandle, setHasLitCandle] = useState(false);
  
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const [particles, setParticles] = useState<Array<{left: string, top: string, duration: string, delay: string, size: string, isPetal: boolean}>>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setParticles(
      Array.from({ length: 15 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${15 + Math.random() * 20}s`,
        delay: `-${Math.random() * 20}s`,
        size: `${2 + Math.random() * 4}px`,
        isPetal: i % 4 === 0
      }))
    );
  }, []);

  useEffect(() => {
    if (activeObituary || fullscreenImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeObituary, fullscreenImage]);

  useEffect(() => {
    const loadObituaries = async () => {
      try {
        const response = await fetchArticles("Obituary", "", 1, 20, "published", "All Places");
        const fetchedArticles = response.articles || [];
        setObituaries([...fetchedArticles, ...HARDCODED_OBITUARIES]);
      } catch (error) {
        setObituaries(HARDCODED_OBITUARIES);
      } finally {
        setIsLoading(false);
      }
    };
    loadObituaries();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  const handleLightCandle = () => {
    setHasLitCandle(true);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#050505] relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
        
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {particles.map((p, i) => (
            p.isPetal ? (
              <Flower2
                key={i}
                strokeWidth={1}
                className="absolute text-black/10 dark:text-white/15"
                style={{
                  left: p.left, top: p.top,
                  width: `calc(${p.size} * 3)`, height: `calc(${p.size} * 3)`,
                  animation: `floatUpFade ${p.duration} linear infinite`,
                  animationDelay: p.delay
                }}
              />
            ) : (
              <div 
                key={i}
                className="absolute bg-black/10 dark:bg-white/20 rounded-full blur-[1px]"
                style={{
                  left: p.left, top: p.top, width: p.size, height: p.size,
                  animation: `floatUpFade ${p.duration} linear infinite`,
                  animationDelay: p.delay
                }}
              />
            )
          ))}
        </div>

        <style jsx global>{`
          @keyframes floatUpFade {
            0% { transform: translateY(10vh) scale(0.8); opacity: 0; }
            20% { opacity: 0.4; }
            80% { opacity: 0.4; }
            100% { transform: translateY(-30vh) scale(1.2); opacity: 0; }
          }
          @keyframes candleGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
            50% { box-shadow: 0 0 25px rgba(249, 115, 22, 0.8); }
          }
        `}</style>
        
        <div className="relative z-[100]">
          <CategoryMenu />
        </div>

        <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-8 md:py-12">
          
          {/* Plain Card with Glowing Flame and Colored Flower */}
          <div className="relative pt-16 pb-14 mb-8 sm:mb-12 flex flex-col items-center justify-center text-center rounded-3xl bg-white dark:bg-[#111] shadow-sm border border-gray-200/50 dark:border-white/5">
            
            <div className="relative z-10 flex flex-col items-center">
              
              <div className="relative mb-4 flex items-center justify-center">
                <Flame className="w-8 h-8 text-orange-500 relative z-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] " fill="currentColor" />
                <div className="absolute w-8 h-8 bg-orange-500/50 blur-md rounded-full " />
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-gray-900 dark:text-white mb-4 sm:mb-5 tracking-tight drop-shadow-sm">
                In Loving Memory
              </h1>
              
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 sm:mb-6" aria-hidden="true">
                <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-gray-400 dark:to-gray-500 rounded-full" />
                <Flower2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 dark:text-rose-400" strokeWidth={2} />
                <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-gray-400 dark:to-gray-500 rounded-full" />
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl text-xs sm:text-sm md:text-base px-6 font-sans font-medium">
                Honoring the lives, stories, and legacies of those we've lost in our community.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 xl:gap-8">
              {obituaries.map((obituary) => (
                <div 
                  key={obituary._id}
                  onClick={() => setActiveObituary(obituary)}
                  className="group relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl"
                >
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-30 flex items-center gap-1 sm:gap-1.5 bg-black/70 backdrop-blur-md text-white/90 text-[7px] sm:text-[9px] uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
                    <span className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" />
                    <span className="hidden sm:inline">In Memoriam</span>
                    <span className="sm:hidden">Memorial</span>
                  </div>

                  <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <Image 
                      src={obituary.media?.[0]?.url || ""} 
                      alt={obituary.headline} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out grayscale-[20%]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="p-3 sm:p-6 relative flex flex-col flex-grow justify-between overflow-hidden">
                    {/* ⚡ UPDATED: Changed from gray to a subtle red watermark */}
                    <Flower2
                      aria-hidden="true"
                      strokeWidth={1}
                      className="absolute -bottom-2 -right-2 w-14 h-14 sm:w-20 sm:h-20 text-red-500 opacity-10 dark:opacity-20 pointer-events-none"
                    />
                    <div className="relative z-10">
                      <h2 className="text-sm sm:text-xl font-bold font-serif text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-2 leading-snug">{obituary.headline}</h2>
                      <p className="text-[10px] sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">{obituary.body?.replace(/<[^>]*>?/gm, '')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL PORTAL --- */}
      {isMounted && activeObituary && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 touch-none">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity pointer-events-auto" 
            onClick={() => { setActiveObituary(null); setHasLitCandle(false); }} 
          />
          
          {/* ⚡ UPDATED: Added hidden scrollbar classes to this container */}
          <div className="relative bg-[#fafafa] dark:bg-[#111] max-w-lg w-full max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-2xl sm:rounded-3xl p-0 shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in duration-300 pointer-events-auto">
            
            <div 
              className="relative w-full h-80 sm:h-[400px] overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in group"
              onClick={() => {
                if (activeObituary.media?.[0]?.url) {
                  setFullscreenImage(activeObituary.media[0].url);
                }
              }}
            >
              {activeObituary.media?.[0]?.url && (
                <Image 
                  src={activeObituary.media[0].url} 
                  alt={activeObituary.headline} 
                  fill 
                  className="object-cover grayscale-[10%] group-hover:scale-105 transition-transform duration-500" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveObituary(null); 
                  setHasLitCandle(false); 
                }} 
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 relative -mt-12 bg-[#fafafa] dark:bg-[#111] rounded-t-2xl sm:rounded-t-3xl z-10 pointer-events-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">{activeObituary.headline}</h2>
              <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-200 dark:border-white/10 pb-6">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold flex flex-col gap-1">
                  <span className="flex items-center gap-1.5">
                    <Flower2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300 dark:text-gray-600 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {activeObituary.location?.ward}
                  </span>
                  <span className="text-gray-400 pl-[18px] sm:pl-5">{formatDate(activeObituary.createdAt)}</span>
                </p>
                
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={handleLightCandle} 
                    className={`p-3 sm:p-4 rounded-full transition-all duration-500 shadow-sm outline-none ${
                      hasLitCandle 
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 scale-110 animate-[candleGlow_2s_ease-in-out_infinite]' 
                        : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${hasLitCandle ? 'fill-current animate-pulse' : ''}`} />
                  </button>
                  <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasLitCandle ? 'text-orange-500' : 'text-gray-400'}`}>
                    {hasLitCandle ? "Candle Lit" : "Light a Candle"}
                  </span>
                </div>
              </div>
              
              <div className="prose dark:prose-invert font-sans text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeObituary.body || '') }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- FULLSCREEN IMAGE LIGHTBOX PORTAL --- */}
      {isMounted && fullscreenImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] bg-black/95 flex items-center justify-center p-2 sm:p-8 touch-none animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all z-50"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          <div className="relative w-full h-full max-w-5xl max-h-screen">
            <Image 
              src={fullscreenImage} 
              alt="Fullscreen view" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function ObituaryPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>}><ObituaryContent /></Suspense>;
}
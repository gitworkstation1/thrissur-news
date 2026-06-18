export default function CarouselAdCard() {
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#111]">
      {/* 1. AD IMAGE CONTAINER - Matches the exact height of news images */}
      <div className="relative w-full h-48 md:h-64 flex-shrink-0 overflow-hidden bg-gradient-to-tr from-blue-900 to-purple-900 flex items-center justify-center">
        {/* Ad Badge overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            Advertisement
          </span>
        </div>
        
        {/* Placeholder for Graphic/Banner */}
        <span className="text-6xl drop-shadow-lg">✨</span>
      </div>

      {/* 2. AD TEXT CONTAINER */}
      <div className="flex flex-col gap-1 px-4 py-3 flex-1 overflow-hidden justify-between">
        <div>
          <span className="inline-block text-[#8b5cf6] text-[10px] font-black uppercase tracking-widest mb-1">
            Sponsored • Premium Partner
          </span>
          
          <h3 className="text-black dark:text-white font-bold text-lg md:text-2xl leading-tight line-clamp-3">
            Unlock exclusive local deals and premium features today.
          </h3>
        </div>
        
        <div className="mt-3">
          <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors shadow-md">
            Explore Offer
          </button>
        </div>
      </div>
    </div>
  );
}
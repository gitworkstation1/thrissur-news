import Link from "next/link";
import Image from "next/image"; // <-- NEW: Next.js Image component
import { PlayCircle, ChevronRight } from "lucide-react";

export default function ShowsSection({ shows = [] }: { shows?: any[] }) {
  // Placeholder data for layout testing
  const displayShows = shows.length > 0 ? shows : [
    { _id: "1", title: "Thrissur Food Trail", episode: "Ep 1: The Best Appam", image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?q=80&w=600&auto=format&fit=crop" },
    { _id: "2", title: "Heritage Walks", episode: "Ep 4: Vadakkunnathan", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop" },
    { _id: "3", title: "Local Legends", episode: "Ep 2: The Elephant Keepers", image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop" },
  ];

  return (
    <section className="w-full mt-10 pt-12 pb-8 bg-gradient-to-b from-red-50/60 to-transparent dark:from-red-900/10 dark:to-transparent border-t border-red-100 dark:border-red-900/20">
      
      {/* --- THE CONSTRAINED CONTENT CONTAINER --- */}
      <div className="max-w-[96%] mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-black dark:text-white font-black text-xl tracking-wide uppercase">
              Original Shows
            </h2>
          </div>
          <Link href="/shows" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Scrolling Carousel */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory hide-scrollbar">
          {displayShows.map((show, idx) => (
            <Link 
              key={show._id || idx} 
              href={`/shows/${show._id}`}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-black/5 dark:border-white/5">
                <Image 
                  src={show.image || show.media?.[0]?.url || "https://picsum.photos/600/338"} 
                  alt={show.title || show.headline || "Show Thumbnail"} 
                  fill
                  sizes="(max-width: 640px) 280px, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                    <PlayCircle className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] text-red-600 font-black uppercase tracking-wider mb-1 block">
                  {show.episode || "New Episode"}
                </span>
                <h3 className="font-bold text-base leading-snug text-black dark:text-white group-hover:text-red-600 transition-colors">
                  {show.title || show.headline}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
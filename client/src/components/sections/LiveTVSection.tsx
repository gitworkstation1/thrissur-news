import { Radio, Calendar } from "lucide-react";

export default function LiveTVSection() {
  // A sleek placeholder schedule to fill out the new right-hand column!
  const schedule = [
    { time: "08:00 AM", title: "Morning News Bulletin", active: false },
    { time: "12:00 PM", title: "Mid-Day Kerala Updates", active: false },
    { time: "03:00 PM", title: "Live from Thrissur Pooram Grounds", active: true },
    { time: "06:00 PM", title: "Evening Debate", active: false },
    { time: "09:00 PM", title: "Prime Time News", active: false },
  ];

  return (
    <section className="max-w-[96%] mx-auto px-4 my-10">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* --- LEFT SIDE: The Video Player (70% on Desktop) --- */}
        <div className="w-full lg:w-[70%] flex flex-col">
          
          <div className="flex flex-row items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3 md:h-4 md:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-[#e3000f]"></span>
              </div>
              <h2 className="text-black dark:text-white font-black text-xl md:text-2xl tracking-wide uppercase flex items-center gap-2">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-[#e3000f]" /> Live TV
              </h2>
            </div>
            
            <span className="inline-flex items-center px-3 md:px-4 py-1.5 bg-red-50 dark:bg-red-500/10 text-[#e3000f] text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full border border-red-200 dark:border-red-500/20">
              Streaming Now
            </span>
          </div>

          <div className="w-full bg-black rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 aspect-video relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 -z-10"></div>
            <iframe
              className="absolute inset-0 w-full h-full relative z-10"
              src="https://www.youtube.com/embed/live_stream?channel=UCf8w5m0YsRa8MHQ5bwSGmbw&autoplay=1&mute=1" 
              title="Asianet News Live TV"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy" // <-- THE MAGIC ATTRIBUTE!
            ></iframe>
          </div>
        </div>

        {/* --- RIGHT SIDE: The Schedule Panel (30% on Desktop) --- */}
        <div className="w-full lg:w-[30%] flex flex-col mt-2 lg:mt-[68px]"> 
          {/* Note: The lg:mt-[68px] aligns the top of the white box perfectly with the top of the video player! */}
          
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-5 md:p-6 shadow-sm flex flex-col h-full">
            
            <div className="flex items-center gap-2 mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                Today's Lineup
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {schedule.map((slot, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-4 p-3.5 rounded-xl transition-colors ${
                    slot.active 
                      ? 'bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={`text-xs font-bold whitespace-nowrap pt-0.5 ${slot.active ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {slot.time}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold leading-snug ${slot.active ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {slot.title}
                    </span>
                    {slot.active && (
                      <span className="text-[10px] text-red-600 font-black uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> On Air
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              Full Schedule
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
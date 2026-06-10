export default function DesktopHeroAd() {
  return (
    // Changed to h-full and flex-col
    <div className="hidden md:flex flex-col h-full w-full mt-6">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded-sm">
          Advertisement
        </span>
      </div>

      {/* Added flex-1 to the grid so it stretches to fill the container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        
        {/* Ad Spot 1 - Removed h-[120px], added h-full */}
        <div className="w-full h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer shadow-sm relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex gap-4 items-center justify-center lg:justify-start relative z-10 w-full lg:flex-row flex-col text-center lg:text-left">
            <div className="w-16 h-16 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm flex items-center justify-center text-2xl shrink-0">
              🛍️
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                Premium Sponsor
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3">
                Click here to replace this placeholder with your actual ad network script.
              </p>
            </div>
          </div>
        </div>

        {/* Ad Spot 2 - Removed h-[120px], added h-full */}
        <div className="w-full h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer shadow-sm relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#e3000f]/10 rounded-full blur-xl group-hover:bg-[#e3000f]/20 transition-colors" />
          <div className="flex gap-4 items-center justify-center lg:justify-start relative z-10 w-full lg:flex-row flex-col text-center lg:text-left">
            <div className="w-16 h-16 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm flex items-center justify-center text-2xl shrink-0">
              ⚡
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                Local Business Ad
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3">
                Perfect space for local businesses to advertise next to breaking news.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default function HomeAdCard() {
  return (
    <div className="w-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#e3000f]/5 rounded-full blur-2xl group-hover:bg-[#e3000f]/10 transition-colors" />

      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-sm">
          Sponsored
        </span>
      </div>
      
      <div className="flex gap-4 items-center relative z-10">
        <div className="w-20 h-20 bg-white dark:bg-black border border-gray-100 dark:border-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm">
          <span className="text-3xl">🚀</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-snug">
            Promote Your Business Here
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
            Reach thousands of daily readers across Thrissur. Click here to view our local advertising plans.
          </p>
          <button className="text-[10px] font-black uppercase text-[#e3000f] tracking-wider hover:underline">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
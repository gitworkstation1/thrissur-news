import { Article } from "@/lib/types";
import Image from "next/image";

export default function NewsCard({ article }: { article: Article }) {
  const imageUrl = article.media && article.media.length > 0 && article.media[0].type === 'image' 
    ? article.media[0].url 
    : 'https://picsum.photos/400/300?grayscale'; 

  const dateObj = new Date(article.createdAt);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  const displayPlace = article.location.landmark 
    ? `${article.location.landmark}, ${article.location.ward}` 
    : article.location.ward;

  // ⚡ NEW: Detect if the headline contains Malayalam characters
  const isMalayalam = /[\u0D00-\u0D7F]/.test(article.headline || "");

  return (
    <div className="flex gap-4 p-4 mb-3 border border-blue-100 dark:border-blue-900/50 rounded-2xl group cursor-pointer bg-blue-50/60 hover:bg-blue-100/60 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 transition-all duration-300 overflow-hidden">
      
      {/* ⚡ THE FIX: Added min-w-0 to prevent long words from pushing the layout wide */}
      <div className="flex-1 flex flex-col justify-start min-w-0">
        {/* ⚡ Applied font-body here for meta strings to keep them readable */}
        <p className="font-body text-[#2b3582] dark:text-blue-400 text-[10px] tracking-wider font-extrabold uppercase mb-1.5 shrink-0">
          {article.category || 'LATEST NEWS'} 
        </p>
        
        {/* ⚡ THE FIX: Injected font-headline for sleek typography pairing */}
        <h2 
          lang={isMalayalam ? "ml" : "en"} // ⚡ Dynamic language attribute for hyphens
          className={`font-headline font-bold leading-[1.35] text-gray-900 dark:text-gray-100 group-hover:text-[#2b3582] dark:group-hover:text-blue-400 transition-colors line-clamp-3 hyphens-auto ${ // ⚡ Use automatic hyphens
            isMalayalam ? 'text-[13px] md:text-base tracking-normal' : 'text-[17px] md:text-lg tracking-tight'
          }`}>
          {article.headline}
        </h2>
        
        {/* --- Credit Display in Card --- */}
        {article.credits && (article.credits.reporter || article.credits.photographer) && (
          <div className="flex items-center gap-2 mt-2 shrink-0">
            {(article.credits.reporter || article.credits.photographer) && (
              <div className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 py-0.5 px-2 rounded-full border border-blue-100/50 dark:border-blue-800/30 w-fit max-w-full">
                {(article.credits.reporter?.avatarUrl || article.credits.photographer?.avatarUrl) && (
                  <div className="w-3.5 h-3.5 relative rounded-full overflow-hidden shrink-0">
                    <Image 
                      src={article.credits.reporter?.avatarUrl || article.credits.photographer?.avatarUrl || ''} 
                      alt="Author" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                {/* ⚡ Styled reporter name with font-body font variant */}
                <span className="font-body text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate">
                  By {article.credits.reporter?.name || article.credits.photographer?.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ⚡ Styled date/location metrics with font-body font variant */}
        <p className="font-body text-gray-500 dark:text-gray-400 text-[11px] mt-auto pt-2 font-medium shrink-0 truncate">
          {displayPlace} • {formattedDate}
        </p>
      </div>

      <Image
        src={imageUrl}
        alt={article.headline}
        width={120}
        height={120}
        className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover rounded-xl shrink-0 bg-blue-100/50 dark:bg-gray-800"
      />
    </div>
  );
}
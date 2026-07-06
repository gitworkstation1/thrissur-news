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

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 group cursor-pointer bg-white dark:bg-transparent transition-colors duration-300">
      
      <div className="flex-1 flex flex-col justify-start">
        <p className="text-[#2b3582] dark:text-blue-400 text-[10px] tracking-wider font-extrabold uppercase mb-1.5">
          {article.category || 'LATEST NEWS'} 
        </p>
        
        <h2 className="text-[17px] md:text-lg font-semibold leading-[1.35] text-black dark:text-gray-100 group-hover:text-[#2b3582] dark:group-hover:text-blue-400 transition-colors line-clamp-3">
          {article.headline}
        </h2>
        
        {/* --- NEW: Credit Display in Card --- */}
        {article.credits && (article.credits.reporter || article.credits.photographer) && (
          <div className="flex items-center gap-2 mt-2">
            {(article.credits.reporter || article.credits.photographer) && (
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 py-0.5 px-2 rounded-full border border-gray-100 dark:border-gray-700 w-fit">
                {/* Prefer reporter avatar, fallback to photographer avatar */}
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
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                  By {article.credits.reporter?.name || article.credits.photographer?.name}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-auto pt-2 font-medium">
          {displayPlace} • {formattedDate}
        </p>
      </div>

      <Image
        src={imageUrl}
        alt={article.headline}
        width={120}
        height={120}
        className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800"
      />
    </div>
  );
}
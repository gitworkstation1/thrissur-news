import { Article } from "@/lib/types";

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
    // Added dark:bg-transparent and dark:border-gray-800
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 group cursor-pointer bg-white dark:bg-transparent transition-colors duration-300">
      
      <div className="flex-1 flex flex-col justify-start">
        <p className="text-[#2b3582] dark:text-blue-400 text-[10px] tracking-wider font-extrabold uppercase mb-1.5">
          {article.category || 'LATEST NEWS'} 
        </p>
        {/* Added dark:text-gray-100 */}
        <h2 className="text-[17px] md:text-lg font-semibold leading-[1.35] text-black dark:text-gray-100 group-hover:text-[#2b3582] dark:group-hover:text-blue-400 transition-colors line-clamp-3">
          {article.headline}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-auto pt-2 font-medium">
          {displayPlace} • {formattedDate}
        </p>
      </div>

      <img
        src={imageUrl}
        alt={article.headline}
        className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800"
      />
    </div>
  );
}
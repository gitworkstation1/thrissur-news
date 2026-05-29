import { Article } from "@/lib/types";

export default function NewsCard({ article }: { article: Article }) {
  // Gracefully handle missing images
  const imageUrl = article.media && article.media.length > 0 && article.media[0].type === 'image' 
    ? article.media[0].url 
    : 'https://picsum.photos/400/300?grayscale'; // Fallback image

  // Format the date nicely
  const dateObj = new Date(article.createdAt);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  // Use landmark if available, otherwise just use the ward
  const displayPlace = article.location.landmark 
    ? `${article.location.landmark}, ${article.location.ward}` 
    : article.location.ward;

  return (
    <div className="flex gap-4 bg-white rounded-2xl p-3 shadow-sm border border-gray-50 hover:shadow-lg hover:scale-[1.02] transition duration-300 cursor-pointer">
      <img
        src={imageUrl}
        alt={article.headline}
        className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
      />
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-red-600 text-[10px] tracking-wider font-extrabold uppercase">
          {article.category || 'News'} 
        </p>
        <h2 className="font-bold leading-snug mt-1 line-clamp-2 text-gray-900">
          {article.headline}
        </h2>
        <p className="text-gray-500 text-xs mt-2 font-medium">
          {displayPlace} • {formattedDate}
        </p>
      </div>
    </div>
  );
}
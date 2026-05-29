import ShortsFeed from "@/components/ShortsFeed";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

export const metadata = {
  title: 'Shorts | Thrissur News',
  description: 'Fast, swipeable news updates',
};

export default async function ShortsPage() {
  let data = { articles: [] as Article[] };
  try {
    data = await fetchArticles();
  } catch (err) {
    console.error("Failed to load articles for shorts", err);
  }

  return (
    // We wrap this in a black background so there are no white flashes while swiping
    <div className="bg-black w-full min-h-screen">
      <ShortsFeed articles={data.articles || []} />
    </div>
  );
}
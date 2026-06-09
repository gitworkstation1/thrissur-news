import SearchClient from "@/components/SearchClient";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search | Thrissur News',
  description: 'Search hyperlocal news in Thrissur',
};

export default async function SearchPage() {
  let data = { articles: [] as Article[] };
  try {
    data = await fetchArticles();
  } catch (err) {
    console.error("Failed to load articles for search", err);
  }

  return (
    <div className="pb-24">
      {/* The Search logic remains the same, Navbar and BottomNav are gone! */}
      <SearchClient initialArticles={data.articles || []} />
    </div>
  );
}
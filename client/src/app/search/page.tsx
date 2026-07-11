import SearchClient from "@/components/sections/SearchClient";
import SidebarAd from "@/components/ad/SidebarAd"; // <-- Import the Sidebar Ad component
import { fetchArticles } from "@/lib/api";
import { Article } from "@/lib/types";

export const revalidate = 60; // <-- Phase 2: ISR Caching 

// <-- Phase 3: Enhanced SEO & Social Media Metadata
export const metadata = {
  title: 'Search | Fides News',
  description: 'Search hyperlocal news and live updates in Thrissur.',
  openGraph: {
    title: 'Search | Fides News',
    description: 'Search hyperlocal news and live updates in Thrissur.',
    url: 'https://yourdomain.com/search',
    siteName: 'Fides News',
    images: [
      {
        url: 'https://picsum.photos/1200/630', // TODO: Swap with your actual website logo/banner URL!
        width: 1200,
        height: 630,
        alt: 'Fides News Search',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function SearchPage() {
  let data = { articles: [] as Article[] };
  let cleanArticles: Article[] = []; // Create a new array for the filtered news

  try {
    data = await fetchArticles();

    // THE FIX: Filter out Ads and Shorts on the server before sending to the client
    cleanArticles = (data.articles || []).filter(
      (article) => article.category !== "Advertisement" && article.category !== "Shorts"
    );
  } catch (err) {
    console.error("Failed to load articles for search", err);
  }

  return (
    <div className="pb-24 bg-[#fafafa] dark:bg-[#0a0a0a] min-h-screen">
      {/* Pass the clean articles and the sidebar ad to the client! */}
      <SearchClient 
        initialArticles={cleanArticles} 
        sidebarAd={<SidebarAd />} 
      />
    </div>
  );
}
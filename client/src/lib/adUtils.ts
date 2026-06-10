// src/lib/adUtils.ts
import { Article } from "@/lib/types";

// This helper flattens your articles into a feed with injected ads
export const injectAds = (articles: Article[], frequency: number = 4) => {
  if (!articles || articles.length === 0) return [];
  
  return articles.reduce((acc: any[], article, index) => {
    acc.push({ type: 'news', data: article });
    
    // Inject ad based on the specified frequency
    if ((index + 1) % frequency === 0) {
      acc.push({ type: 'ad' });
    }
    
    return acc;
  }, []);
};
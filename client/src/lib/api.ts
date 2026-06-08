import { Article } from './types';

// 1. Fetch Articles (Now handles both category and ward!)
export async function fetchArticles(category?: string, ward?: string): Promise<{ articles: Article[] }> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/news`;
  
  // Use URLSearchParams to cleanly build our query string
  const params = new URLSearchParams();
  
  if (category && category !== 'News') params.append('category', category);
  if (ward && ward !== 'All Places') params.append('ward', ward);

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch articles');
  return data;
}

// 2. Create Article (Expects a partial Article object, returns any for now)
export async function createArticle(articleData: Partial<Article>): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.details?.[0] || 'Failed to publish article');
  return data;
}

// 3. Upload Image (Expects a standard File object, returns a string URL)
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/upload`, {
    method: 'POST',
    body: formData 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image');
  return data.url; 
}
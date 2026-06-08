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
  
  // Robust error handling to avoid parsing HTML as JSON
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to fetch articles');
  }

  const data = await res.json();
  return data;
}

// 2. Fetch a Single Article by ID
export async function fetchArticleById(id: string): Promise<Article> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}`, { 
    cache: 'no-store' 
  });
  
  // Check if the response is OK before attempting to parse JSON
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to fetch article: ${res.status}`);
  }
  
  const data = await res.json();
  return data;
}

// 3. Create Article
export async function createArticle(articleData: Partial<Article>): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData)
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || data.details?.[0] || 'Failed to publish article');
  }
  
  return await res.json();
}

// 4. Upload Image
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/upload`, {
    method: 'POST',
    body: formData 
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to upload image');
  }
  
  const data = await res.json();
  return data.url; 
}
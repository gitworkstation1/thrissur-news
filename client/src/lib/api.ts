import { Article } from './types';

// Use a single, unified base URL for all functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 1. Fetch Articles (Now handles both category and ward)
// client/src/lib/api.ts

// 1. Fetch Articles (Now handles pagination and server-side search!)
// Update the parameters to accept status
// Add 'ward' to the very end of the parameters
export async function fetchArticles(
  category: string = 'All', 
  search: string = '', 
  page: number = 1, 
  limit: number = 10,
  status: string = 'published', // <-- Defaults to safe public viewing
  ward: string = 'All Places'   // <-- Brought ward back!
): Promise<{ articles: Article[], totalPages: number, currentPage: number }> {
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  let url = `${API_URL}/api/news`;
  
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  if (ward && ward !== 'All Places') params.append('ward', ward); // Attach ward to URL
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('status', status); 

  url += `?${params.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to fetch articles');
  }

  return await res.json();
}
// 2. Fetch a Single Article by ID
export async function fetchArticleById(id: string): Promise<Article> {
  const res = await fetch(`${API_URL}/api/news/${id}`, { 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to fetch article: ${res.status}`);
  }
  
  return await res.json();
}

// 3. Create Article
export async function createArticle(articleData: Partial<Article>): Promise<any> {
  const res = await fetch(`${API_URL}/api/news`, {
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

// 4. Update Article (Now fully typed!)
export async function updateArticle(id: string, articleData: Partial<Article>): Promise<Article> {
  const res = await fetch(`${API_URL}/api/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to update article');
  }

  return await res.json();
}

// 5. Delete Article (Now fully typed!)
export async function deleteArticle(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/news/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to delete article');
  }

  return await res.json();
}

// 6. Upload Image (Now accepts headline for Cloudinary organization)
export async function uploadImage(file: File, headline: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('headline', headline || 'Untitled-Story'); // Append the title

  const res = await fetch(`${API_URL}/api/media/upload`, {
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


// 7. Fetch Admin Dashboard Stats
export async function fetchStats(): Promise<{ total: number, published: number, drafts: number, breaking: number }> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_URL}/api/news/stats`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return await res.json();
}
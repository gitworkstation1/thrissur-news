import { Article } from './types';

// Use a single, unified base URL for all functions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 1. Fetch Articles (Now handles category, ward, breaking status, and date)
export async function fetchArticles(
  category: string = 'All', 
  search: string = '', 
  page: number = 1, 
  limit: number = 10,
  status: string = 'published', // Defaults to safe public viewing
  ward: string = 'All Places',  // Brought ward back!
  isBreaking?: boolean,         // <-- NEW: Added breaking parameter
  date?: string                 // <-- NEW: Added date parameter
): Promise<{ articles: Article[], totalPages: number, currentPage: number }> {
  
  let url = `${API_URL}/api/news`;
  
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  if (ward && ward !== 'All Places') params.append('ward', ward); 
  
  // --- NEW FILTERS ---
  if (isBreaking) params.append('isBreaking', 'true');
  if (date) params.append('date', date);
  // -------------------

  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('status', status); 

  url += `?${params.toString()}`;

  // FIX: Applied Option B (ISR) - Cache for 60 seconds on public pages
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to fetch articles');
  }

  return await res.json();
}

// 2. Fetch a Single Article by ID
export async function fetchArticleById(id: string): Promise<Article> {
  // FIX: Applied Option B (ISR) - Cache individual articles for 60 seconds
  const res = await fetch(`${API_URL}/api/news/${id}`, { 
    next: { revalidate: 60 } 
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to fetch article: ${res.status}`);
  }
  
  return await res.json();
}

// 3. Create Article (Tunnel)
export async function createArticle(articleData: Partial<Article>): Promise<any> {
  const res = await fetch('/backend/news', { // ⚡ CHANGED to use the proxy tunnel
    method: 'POST',
    credentials: 'include', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData)
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || data.details?.[0] || 'Failed to publish article');
  }
  
  return await res.json();
}

// 4. Update Article (Tunnel)
export async function updateArticle(id: string, articleData: Partial<Article>): Promise<Article> {
  const res = await fetch(`/backend/news/${id}`, { // ⚡ CHANGED
    method: 'PUT',
    credentials: 'include', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articleData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to update article');
  }

  return await res.json();
}

// 5. Delete Article (Tunnel)
export async function deleteArticle(id: string): Promise<{ message: string }> {
  const res = await fetch(`/backend/news/${id}`, { // ⚡ CHANGED
    method: 'DELETE',
    credentials: 'include', 
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to delete article');
  }

  return await res.json();
}

// 6. Upload Image (Tunnel)
export async function uploadImage(file: File, headline: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('headline', headline || 'Untitled-Story'); 

  const res = await fetch('/backend/media/upload', { // ⚡ CHANGED
    method: 'POST',
    credentials: 'include', 
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
  // KEPT AS OPTION A: Admins need live, uncached data for their dashboard stats
  const res = await fetch(`${API_URL}/api/news/stats`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return await res.json();
}
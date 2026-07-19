import { Article } from './types';

// ⚡ BULLETPROOF URL CLEANER
// We strip out any trailing "/api" so it doesn't double-stack with your fetch functions!
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
API_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

// Leave the rest of your file (fetchArticles, etc.) exactly as it is below this line!

// 1. Fetch Articles (Now handles category, ward, breaking status, and date)
export async function fetchArticles(
  category: string = 'All', 
  search: string = '', 
  page: number = 1, 
  limit: number = 10,
  status: string = 'published', // Defaults to safe public viewing
  ward: string = 'All Places',  // Brought ward back!
  isBreaking?: boolean,         // <-- NEW: Added breaking parameter
  date?: string,                 // <-- NEW: Added date parameter
  isAdmin: boolean = false
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
  const fetchOptions = isAdmin 
    ? { cache: 'no-store' as RequestCache } 
    : { next: { revalidate: 60 } };

  const res = await fetch(url, fetchOptions);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to fetch articles');
  }

  return await res.json();
}

// 2. Fetch a Single Article by ID
export async function fetchArticleById(
  id: string, 
  isEditing: boolean = false // ⚡ NEW: Toggle to bypass cache for admins
): Promise<Article> {
  
  // Admins get fresh data instantly (no-store). Readers get the 60s cache.
  const fetchOptions = isEditing 
    ? { cache: 'no-store' as RequestCache } 
    : { next: { revalidate: 60 } };

  const res = await fetch(`${API_URL}/api/news/${id}`, fetchOptions);
  
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

// ==========================================
// 🧑‍💼 STAFF DIRECTORY API
// ==========================================

// 8. Fetch All Staff (Public/Uncached for accurate dashboard)
export async function fetchStaff(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/staff`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch staff');
  return await res.json();
}

// 9. Create Staff Member (Tunnel)
export async function createStaffMember(staffData: { name: string; role: string; avatarUrl?: string }): Promise<any> {
  const res = await fetch('/backend/staff', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData)
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create staff member');
  }
  return await res.json();
}

// 10. Delete Staff Member (Tunnel)
export async function deleteStaffMember(id: string): Promise<{ message: string }> {
  const res = await fetch(`/backend/staff/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to delete staff member');
  }
  return await res.json();
}
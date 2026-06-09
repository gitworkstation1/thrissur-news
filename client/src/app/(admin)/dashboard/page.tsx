// client/src/app/(admin)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createArticle, uploadImage, fetchArticles, updateArticle, deleteArticle, fetchStats } from '@/lib/api'; // <-- Added fetchStats
import { Edit2, Trash2, Plus, Search, X, AlertCircle, Loader2, LayoutDashboard, Newspaper, Users, Settings, LogOut, ChevronLeft, ChevronRight, EyeOff, Globe, Zap, Database } from 'lucide-react'; // <-- Added Zap & Database

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-400">
      Loading story workspace...
    </div>
  ),
});

// --- TYPESCRIPT INTERFACES ---
interface LocationData {
  ward: string;
  landmark?: string;
}

interface ArticleFormData {
  headline: string;
  body: string;
  isBreaking: boolean;
  category: string;
  location: LocationData;
  status?: 'published' | 'draft';
}

interface Article extends ArticleFormData {
  _id: string;
  createdAt: string;
  media?: { type: string; url: string }[];
}

const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad"
];

const CATEGORIES = ["News", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"];

const INITIAL_FORM_STATE: ArticleFormData = {
  headline: '',
  body: '',
  isBreaking: false,
  category: 'News',
  location: { ward: '', landmark: '' },
  status: 'published'
};

export default function AdminDashboard() {
  const router = useRouter();
  
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // NEW: Analytics State
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, breaking: 0 });
  
  const [activeView, setActiveView] = useState<'published' | 'draft'>('published');
  const [articles, setArticles] = useState<Article[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(INITIAL_FORM_STATE);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      loadArticlesForPage(1);
      loadDashboardStats(); // Refresh stats when filters change
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [filterCategory, searchQuery, activeView]); 

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // NEW: Fetch Stats Function
  const loadDashboardStats = async () => {
    try {
      const metrics = await fetchStats();
      setStats(metrics);
    } catch (err) {
      console.error("Failed to load metrics", err);
    }
  };

  const loadArticlesForPage = async (targetPage: number) => {
    setIsLoading(true);
    try {
      const data = await fetchArticles(filterCategory, searchQuery, targetPage, 12, activeView);
      setArticles(data.articles || []);
      setTotalPages(data.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadArticlesForPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name.startsWith('location.')) {
      const child = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [child]: finalValue }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let finalMedia: { type: string; url: string }[] = [];

      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, formData.headline);
        finalMedia.push({ type: 'image', url: imageUrl });
      }

      const articlePayload: any = { ...formData };
      if (finalMedia.length > 0) {
        articlePayload.media = finalMedia;
      }

      if (editingId) {
        await updateArticle(editingId, articlePayload);
      } else {
        await createArticle(articlePayload);
      }
      
      setFormData(INITIAL_FORM_STATE);
      setImageFile(null);
      setEditingId(null);
      setIsPanelOpen(false);
      
      if (formData.status === 'published' && activeView === 'draft') {
        setActiveView('published');
      } else {
        loadArticlesForPage(1);
      }
      
      loadDashboardStats(); // Update numbers immediately after saving
      
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      headline: article.headline,
      body: article.body,
      isBreaking: article.isBreaking || false,
      category: article.category || 'News',
      location: article.location || { ward: '', landmark: '' },
      status: article.status || 'published'
    });
    setEditingId(article._id);
    setImageFile(null); 
    setError('');
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await deleteArticle(id);
      loadArticlesForPage(page);
      loadDashboardStats(); // Update numbers immediately after deleting
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  const startNewPost = () => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setImageFile(null);
    setError('');
    setIsPanelOpen(true);
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
              page === i
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {i}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        pages.push(
          <span key={i} className="px-2 text-gray-400">...</span>
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-x-hidden">
      
      {/* ---------------- FIXED LEFT SIDEBAR ---------------- */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-slate-300 flex-col hidden lg:flex z-30 shadow-xl">
        <div className="p-6 mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Integrity<span className="text-red-600">News</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Command Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white font-medium rounded-xl shadow-sm transition-all">
            <Newspaper className="w-5 h-5" />
            <span>Content Library</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
            <LayoutDashboard className="w-5 h-5" />
            <span>Analytics Hub</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
            <Users className="w-5 h-5" />
            <span>Journalists</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
            <Settings className="w-5 h-5" />
            <span>App Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout} // <-- Add this onClick handler
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-medium rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative pb-8">
        <main className="flex-1 p-6 sm:p-8 md:p-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Content Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage and publish news to your community.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full shadow-inner border border-gray-200 dark:border-white/5 w-full sm:w-auto">
                <button
                  onClick={() => setActiveView('published')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                    activeView === 'published'
                      ? 'bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Published
                </button>
                <button
                  onClick={() => setActiveView('draft')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                    activeView === 'draft'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" /> Drafts
                </button>
              </div>

              <button
                type="button"
                onClick={startNewPost}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full active:scale-[0.98] transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Story
              </button>
            </div>
          </div>

          {/* NEW: QUICK STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Stories</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.published}</p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <EyeOff className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.drafts}</p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4"></div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 relative z-10">
                <Zap className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Active Alerts</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white relative z-10">{stats.breaking}</p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Stored</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-[#121212] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search headlines..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="w-px bg-gray-100 dark:bg-white/10 hidden sm:block"></div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-3 px-4 bg-transparent text-sm font-medium outline-none cursor-pointer text-gray-700 dark:text-gray-300 min-w-40"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#121212] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
              <Newspaper className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No {activeView} articles found.</p>
            </div>
          ) : (
            <div className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {articles.map((article) => {
                  const hasImage = article.media && article.media.length > 0 && article.media[0].url;
                  const isDraft = article.status === 'draft';

                  return (
                    <div key={article._id} className={`group bg-white dark:bg-[#121212] border ${isDraft ? 'border-amber-200 dark:border-amber-900/50' : 'border-gray-100 dark:border-white/10'} rounded-2xl p-5 flex flex-col h-full hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 relative`}>
                      
                      {isDraft && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <span className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-200 dark:border-amber-800">
                            <EyeOff className="w-3.5 h-3.5" /> Draft
                          </span>
                        </div>
                      )}

                      {hasImage && (
                        <div className={`w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 relative shrink-0 ${isDraft ? 'opacity-80' : ''}`}>
                          <img 
                            src={article.media![0].url} 
                            alt={article.headline} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 px-2.5 py-1 rounded-md">
                            {article.category}
                          </span>
                          {article.isBreaking && (
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2.5 py-1 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Breaking
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button" onClick={() => handleEdit(article)}
                            className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" onClick={() => handleDelete(article._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className={`font-bold text-lg leading-snug mb-4 line-clamp-3 ${isDraft ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {article.headline}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-medium text-gray-500">
                        <span className="truncate pr-2 flex items-center gap-1">
                          {article.location?.ward || 'Thrissur'}
                        </span>
                        <span className="shrink-0">
                          {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center pt-8 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-2 bg-white dark:bg-[#121212] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {renderPaginationNumbers()}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ---------------- SLIDING SIDE PANEL DRAPER ---------------- */}
      
      {isPanelOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-125 md:w-150 bg-white dark:bg-[#0f172a] z-50 shadow-2xl border-l border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#0f172a]">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Article' : 'Compose Story'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm transition-all hover:scale-105"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/20 text-sm font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-max border border-gray-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'published' })}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                formData.status === 'published' 
                  ? 'bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" /> Published
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'draft' })}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                formData.status === 'draft' 
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <EyeOff className="w-4 h-4" /> Draft
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Headline</label>
            <input
              type="text" name="headline" required
              value={formData.headline} onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all text-sm shadow-sm"
              placeholder="e.g., Thrissur Pooram preparations begin..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Article Body</label>
            <RichTextEditor
              value={formData.body}
              onChange={(content) => setFormData(prev => ({ ...prev, body: content }))}
              placeholder="Write the full story here with formatting..."
            />
          </div>

          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 border-dashed">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {editingId ? 'Update Image (Leave blank to keep current)' : 'Media Attachment'}
            </label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-colors cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Category</label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer shadow-sm"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Ward (Optional)</label>
              <select
                name="location.ward" value={formData.location.ward} onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer shadow-sm"
              >
                <option value="">-- Select --</option>
                {THRISSUR_WARDS.map(ward => <option key={ward} value={ward}>{ward}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Landmark</label>
              <input
                type="text" name="location.landmark" value={formData.location.landmark} onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none shadow-sm"
                placeholder="e.g., Vadakkunnathan"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox" name="isBreaking" id="isBreaking"
              checked={formData.isBreaking} onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
            />
            <label htmlFor="isBreaking" className="text-sm font-bold text-red-600 dark:text-red-400 cursor-pointer select-none">
              🚨 Mark as Breaking News
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex gap-3 sticky bottom-0 bg-white dark:bg-[#0f172a] pb-4">
            <button 
              type="button" 
              onClick={() => setIsPanelOpen(false)}
              className="px-6 py-3.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-red-400 dark:bg-red-800 cursor-not-allowed' 
                  : formData.status === 'draft' 
                    ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.99]'
                    : 'bg-red-600 hover:bg-red-700 active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : formData.status === 'draft' ? (
                editingId ? 'Update Draft' : 'Save as Draft'
              ) : (
                editingId ? 'Update Live Article' : 'Publish to Live Feed'
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
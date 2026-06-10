// client/src/app/(admin)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  createArticle,
  uploadImage,
  fetchArticles,
  updateArticle,
  deleteArticle,
  fetchStats,
} from "@/lib/api";
import {
  Edit2,
  PenTool,
  Trash2,
  Plus,
  Search,
  AlertCircle,
  Loader2,
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Globe,
  Zap,
  Database,
  Megaphone, // <-- NEW: Added for Ads Manager
} from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
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
  status?: "published" | "draft";
  externalLink?: string;
}

interface Article extends ArticleFormData {
  _id: string;
  createdAt: string;
  media?: { type: string; url: string }[];
}

const THRISSUR_WARDS = [
  "Thrissur Central",
  "East Fort",
  "Viyyur",
  "Ollur",
  "Cheruthuruthy",
  "Kodungallur",
  "Guruvayur",
  "Puthukkad",
  "Chavakkad",
  "Kunnamkulam",
  "Wadakkanchery",
  "Anthikkad",
];

const CATEGORIES = [
  "News",
  "Crime",
  "Politics",
  "Sports",
  "Business",
  "Education",
  "Local",
  "Health",
];

const INITIAL_FORM_STATE: ArticleFormData = {
  headline: "",
  body: "",
  isBreaking: false,
  category: "News",
  location: { ward: "", landmark: "" },
  status: "published",
  externalLink: "",
};

export default function AdminDashboard() {
  const router = useRouter();

  // --- APP STATE ---
  // Expanded to include 'ads' view
  const [currentView, setCurrentView] = useState<"library" | "compose" | "ads">("library");
  // NEW: Controls the News vs Shorts toggle inside the Library
  const [contentTab, setContentTab] = useState<"news" | "shorts">("news");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    breaking: 0,
  });

  const [activeView, setActiveView] = useState<"published" | "draft">("published");
  const [articles, setArticles] = useState<Article[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(INITIAL_FORM_STATE);

  const [editorMode, setEditorMode] = useState<"news" | "shorts" | "ad">("news");
  const [shortUrl, setShortUrl] = useState<string>("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      loadArticlesForPage(1);
      loadDashboardStats();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filterCategory, searchQuery, activeView, currentView, contentTab]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

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
      // Smart Fetching based on the active tab/view
      let fetchCat = filterCategory;
      if (currentView === "ads") {
        fetchCat = "Advertisement";
      } else if (currentView === "library" && contentTab === "shorts") {
        fetchCat = "Shorts";
      }

      const data = await fetchArticles(
        fetchCat,
        searchQuery,
        targetPage,
        12,
        activeView,
      );
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === "checkbox" ? checked : value;

    if (name.startsWith("location.")) {
      const child = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [child]: finalValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let articlePayload: any = { ...formData };

      if (editorMode === "shorts") {
        const youtubeId = shortUrl.split("/").pop()?.split("?")[0];
        if (!youtubeId) throw new Error("Invalid YouTube Shorts URL");

        articlePayload = {
          headline: formData.headline,
          body: "YouTube Short",
          category: "Shorts",
          location: { ward: "All Places" },
          status: formData.status || "published",
          isBreaking: false,
          media: [{ type: "youtube-short", url: youtubeId }],
        };
      } else if (editorMode === "ad") {
        let finalMedia: { type: string; url: string }[] = [];
        
        if (shortUrl) {
          const youtubeId = shortUrl.split("/").pop()?.split("?")[0];
          if (youtubeId) finalMedia.push({ type: "youtube-short", url: youtubeId });
        } else if (imageFile) {
          const imageUrl = await uploadImage(imageFile, formData.headline);
          finalMedia.push({ type: "image", url: imageUrl });
        }

        articlePayload = {
          headline: formData.headline,
          body: "Sponsored Advertisement",
          category: "Advertisement",
          location: { ward: "All Places" },
          status: formData.status || "published",
          isBreaking: false,
          externalLink: formData.externalLink,
          media: finalMedia,
        };
      } else {
        let finalMedia: { type: string; url: string }[] = [];
        if (imageFile) {
          const imageUrl = await uploadImage(imageFile, formData.headline);
          finalMedia.push({ type: "image", url: imageUrl });
        }
        if (finalMedia.length > 0) {
          articlePayload.media = finalMedia;
        }
      }

      if (editingId) {
        await updateArticle(editingId, articlePayload);
      } else {
        await createArticle(articlePayload);
      }

      setFormData(INITIAL_FORM_STATE);
      setImageFile(null);
      setShortUrl("");
      setEditingId(null);
      
      // Send them back to the right view after saving
      if (editorMode === "ad") setCurrentView("ads");
      else setCurrentView("library");

      loadArticlesForPage(1);
      loadDashboardStats();
    } catch (err: any) {
      setError(err.message || "Failed to save content");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      headline: article.headline,
      body: article.body,
      isBreaking: article.isBreaking || false,
      category: article.category || "News",
      location: article.location || { ward: "", landmark: "" },
      status: article.status || "published",
      externalLink: article.externalLink || "",
    });
    setEditingId(article._id);
    setImageFile(null);
    setError("");
    
    if (article.category === "Shorts") setEditorMode("shorts");
    else if (article.category === "Advertisement") setEditorMode("ad");
    else setEditorMode("news");

    if ((article.category === "Shorts" || article.category === "Advertisement") && article.media?.[0]?.type === 'youtube-short') {
      setShortUrl(`https://youtube.com/shorts/${article.media[0].url}`);
    } else {
      setShortUrl("");
    }
    
    setCurrentView("compose");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await deleteArticle(id);
      loadArticlesForPage(page);
      loadDashboardStats();
    } catch (err) {
      alert("Failed to delete article");
    }
  };

  // Pre-select the correct form mode based on where they clicked "Add New"
  const startNewPost = (defaultMode: "news" | "ad" = "news") => {
    setFormData(INITIAL_FORM_STATE);
    setEditingId(null);
    setImageFile(null);
    setError("");
    setEditorMode(defaultMode);
    setCurrentView("compose");
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
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            {i}
          </button>,
        );
      } else if (i === page - 2 || i === page + 2) {
        pages.push(
          <span key={i} className="px-2 text-gray-400">
            ...
          </span>,
        );
      }
    }
    return pages;
  };

  // 1. Double check the frontend mapping so categories never mix
  const displayedArticles = articles.filter(article => {
    if (currentView === "ads") return article.category === "Advertisement";
    if (currentView === "library") {
      if (contentTab === "shorts") return article.category === "Shorts";
      if (contentTab === "news") return article.category !== "Shorts" && article.category !== "Advertisement";
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-x-hidden">
      {/* ---------------- FIXED LEFT SIDEBAR ---------------- */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-slate-300 flex-col hidden lg:flex z-30 shadow-xl">
        <div className="p-6 mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Integrity<span className="text-red-600">News</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
            Command Center
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setCurrentView("library")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "library" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span>Content Library</span>
          </button>
          
          {/* NEW: Ads Manager Button */}
          <button 
            onClick={() => setCurrentView("ads")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "ads" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span>Ads Manager</span>
          </button>

          <button 
            onClick={() => startNewPost(currentView === "ads" ? "ad" : "news")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "compose" 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <PenTool className="w-5 h-5" />
            <span>{currentView === "ads" ? "Create New Ad" : "Compose Story"}</span>
          </button>
          
          <div className="my-4 border-t border-white/10" />

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
            onClick={handleLogout}
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
          
          {currentView !== "compose" ? (
            // ==========================================
            // VIEW: CONTENT LIBRARY & ADS MANAGER
            // ==========================================
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {currentView === "ads" ? "Ads Manager" : "Content Management"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentView === "ads" 
                      ? "Manage sponsored posts and injected advertisements." 
                      : "Manage and publish news to your community."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full shadow-inner border border-gray-200 dark:border-white/5 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveView("published")}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                        activeView === "published"
                          ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Published
                    </button>
                    <button
                      onClick={() => setActiveView("draft")}
                      className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                        activeView === "draft"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Drafts
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => startNewPost(currentView === "ads" ? "ad" : "news")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full active:scale-[0.98] transition-all shadow-md shrink-0"
                  >
                    <Plus className="w-4 h-4" /> 
                    {currentView === "ads" ? "Add New Ad" : "Add New Story"}
                  </button>
                </div>
              </div>

              {/* QUICK STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Live Stories
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.published}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <EyeOff className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Drafts
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.drafts}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 relative z-10">
                    <Zap className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Active Alerts
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white relative z-10">
                    {stats.breaking}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Database className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Total Stored
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-[#121212] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white"
                  />
                </div>
                
                {/* Only show categories dropdown in Library mode */}
                {currentView === "library" && (
                  <>
                    <div className="w-px bg-gray-100 dark:bg-white/10 hidden sm:block"></div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="py-3 px-4 bg-transparent text-sm font-medium outline-none cursor-pointer text-gray-700 dark:text-gray-300 min-w-40"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* NEW: NEWS vs SHORTS PILL TOGGLE (Library only) */}
              {currentView === "library" && (
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-max mb-8 border border-gray-200 dark:border-white/5">
                  <button
                    onClick={() => setContentTab("news")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      contentTab === "news"
                        ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Written News
                  </button>
                  <button
                    onClick={() => setContentTab("shorts")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      contentTab === "shorts"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Shorts Feed
                  </button>
                </div>
              )}

              {/* GRID */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                </div>
              ) : displayedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#121212] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                  {currentView === "ads" ? <Megaphone className="w-12 h-12 text-gray-300 mb-4" /> : <Newspaper className="w-12 h-12 text-gray-300 mb-4" />}
                  <p className="text-gray-500 font-medium">
                    No {activeView} {currentView === "ads" ? "advertisements" : contentTab === "news" ? "written articles" : "shorts"} found.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedArticles.map((article) => {
                      const hasImage =
                        article.media &&
                        article.media.length > 0 &&
                        article.media[0].url;
                      const isDraft = article.status === "draft";

                      return (
                        <div
                          key={article._id}
                          className={`group bg-white dark:bg-[#121212] border ${isDraft ? "border-amber-200 dark:border-amber-900/50" : "border-gray-100 dark:border-white/10"} rounded-2xl p-5 flex flex-col h-full hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 relative`}
                        >
                          {isDraft && (
                            <div className="absolute -top-3 -right-3 z-10">
                              <span className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-amber-200 dark:border-amber-800">
                                <EyeOff className="w-3.5 h-3.5" /> Draft
                              </span>
                            </div>
                          )}

                          {hasImage && (
                            <div
                              className={`w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 relative shrink-0 ${isDraft ? "opacity-80" : ""}`}
                            >
                              <img
                                src={
                                  (article.category === "Shorts" || article.category === "Advertisement") && article.media?.[0]?.type === "youtube-short"
                                    ? `https://img.youtube.com/vi/${article.media?.[0]?.url}/hqdefault.jpg`
                                    : article.media?.[0]?.url ||
                                      "https://picsum.photos/400/250"
                                }
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
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>{" "}
                                  Breaking
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(article)}
                                className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(article._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3
                            className={`font-bold text-lg leading-snug mb-4 line-clamp-3 ${isDraft ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
                          >
                            {article.headline}
                          </h3>

                          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-medium text-gray-500">
                            <span className="truncate pr-2 flex items-center gap-1">
                              {article.location?.ward || "Thrissur"}
                            </span>
                            <span className="shrink-0">
                              {new Date(article.createdAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric", year: "numeric" },
                              )}
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
            </>
          ) : (
            // ==========================================
            // VIEW: THE DEDICATED COMPOSER
            // ==========================================
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {editingId ? "Edit Content" : "Compose Content"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Draft, format, and publish to your feeds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView("library")}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mode Selector */}
                  {!editingId && (
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full">
                      <button
                        type="button"
                        onClick={() => setEditorMode("news")}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                          editorMode === "news"
                            ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        }`}
                      >
                        Written Article
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("shorts")}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                          editorMode === "shorts"
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        }`}
                      >
                        YouTube Short
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("ad")}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                          editorMode === "ad"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        }`}
                      >
                        Advertisement
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/20 text-sm font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Status Toggle */}
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-max border border-gray-200 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "published" })}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                        formData.status === "published"
                          ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Globe className="w-4 h-4" /> Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "draft" })}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                        formData.status === "draft"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <EyeOff className="w-4 h-4" /> Draft
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      {editorMode === "shorts" ? "Short Title" : editorMode === "ad" ? "Ad Title / Campaign Name" : "Headline"}
                    </label>
                    <input
                      type="text"
                      name="headline"
                      required
                      value={formData.headline}
                      onChange={handleChange}
                      className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm"
                      placeholder={
                        editorMode === "shorts"
                          ? "Catchy video title..."
                          : editorMode === "ad"
                          ? "e.g., Summer Sale Promo..."
                          : "e.g., Thrissur Pooram preparations begin..."
                      }
                    />
                  </div>

                  {editorMode === "shorts" ? (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        YouTube Shorts Link
                      </label>
                      <input
                        type="url"
                        required
                        value={shortUrl}
                        onChange={(e) => setShortUrl(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm"
                        placeholder="https://www.youtube.com/shorts/..."
                      />
                    </div>
                  ) : editorMode === "ad" ? (
                    // --- NEW ADVERTISEMENT INPUTS ---
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">
                          Target Redirect Link (CTA)
                        </label>
                        <input
                          type="url" required name="externalLink" value={formData.externalLink} onChange={handleChange}
                          className="w-full p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          placeholder="https://your-sponsor-website.com"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Video Ad (YouTube Link)
                          </label>
                          <input
                            type="url" value={shortUrl} onChange={(e) => setShortUrl(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm"
                            placeholder="Optional: https://youtube.com/shorts/..."
                          />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 border-dashed">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            OR Poster Ad (Image Upload)
                          </label>
                          <input
                            type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          Article Body
                        </label>
                        <RichTextEditor
                          value={formData.body}
                          onChange={(content) =>
                            setFormData((prev) => ({ ...prev, body: content }))
                          }
                          placeholder="Write the full story here with formatting..."
                        />
                      </div>

                      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 border-dashed">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          {editingId
                            ? "Update Image (Leave blank to keep current)"
                            : "Media Attachment"}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 transition-colors cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Category
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer shadow-sm"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Ward (Optional)
                          </label>
                          <select
                            name="location.ward"
                            value={formData.location.ward}
                            onChange={handleChange}
                            className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer shadow-sm"
                          >
                            <option value="">-- Select --</option>
                            {THRISSUR_WARDS.map((ward) => (
                              <option key={ward} value={ward}>
                                {ward}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Landmark
                          </label>
                          <input
                            type="text"
                            name="location.landmark"
                            value={formData.location.landmark}
                            onChange={handleChange}
                            className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none shadow-sm"
                            placeholder="e.g., Vadakkunnathan"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-2">
                        <input
                          type="checkbox"
                          name="isBreaking"
                          id="isBreaking"
                          checked={formData.isBreaking}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                        />
                        <label
                          htmlFor="isBreaking"
                          className="text-sm font-bold text-red-600 dark:text-red-400 cursor-pointer select-none"
                        >
                          🚨 Mark as Breaking News
                        </label>
                      </div>
                    </>
                  )}

                  <div className="pt-8 mt-6 border-t border-gray-100 dark:border-white/10 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 rounded-xl text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                        isSubmitting
                          ? "bg-red-400 dark:bg-red-800 cursor-not-allowed"
                          : formData.status === "draft"
                            ? "bg-amber-600 hover:bg-amber-700 active:scale-[0.99]"
                            : editorMode === "ad"
                              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                              : "bg-red-600 hover:bg-red-700 active:scale-[0.99]"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                        </>
                      ) : formData.status === "draft" ? (
                        editingId ? "Update Draft" : "Save as Draft"
                      ) : editingId ? (
                        "Update Live Content"
                      ) : (
                        "Publish to Live Feed"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
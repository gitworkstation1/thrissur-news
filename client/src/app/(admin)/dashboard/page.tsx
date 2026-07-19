"use client";

import { useState, useEffect } from "react";
import {
  fetchArticles,
  deleteArticle,
  fetchStats,
  updateArticle,
} from "@/lib/api";
import {
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  Newspaper,
  EyeOff,
  Globe,
  Zap,
  Database,
  ChevronLeft,
  ChevronRight,
  Users // ⚡ NEW ICON
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminComposer from "@/components/admin/AdminComposer";
import VisualAdManager from "@/components/admin/VisualAdManager";
import StaffManager from "@/components/admin/StaffManager"; // ⚡ NEW IMPORT

const CATEGORIES = [
  "News",
  "Crime",
  "Politics",
  "Sports",
  "Business",
  "Education",
  "Local",
  "Health",
  "Obituary",
];

export const dynamic = 'force-dynamic';

const INITIAL_FORM_STATE = {
  headline: "",
  body: "",
  keyPoints: [], 
  isBreaking: false,
  isTicker: false,
  category: "News",
  location: { ward: "", landmark: "" },
  status: "published",
  externalLink: "",
  media: [],
  reportedBy: "",
  photographedBy: "",
};

export default function AdminDashboard() {
  // ⚡ UPDATED: Added "staff" to currentView state
  const [currentView, setCurrentView] = useState<"library" | "compose" | "ads" | "obituary" | "staff">("library");
  const [contentTab, setContentTab] = useState<"news" | "shorts" | "obituary">("news");
  const [activeView, setActiveView] = useState<"published" | "draft">("published");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    breaking: 0,
  });

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Composer State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [composeData, setComposeData] = useState<any>(INITIAL_FORM_STATE);
  const [composeMode, setComposeMode] = useState<"news" | "shorts" | "ad" | "obituary">("news");
  const [composeShortUrl, setComposeShortUrl] = useState<string>("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      loadArticlesForPage(1);
      loadDashboardStats();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filterCategory, searchQuery, activeView, currentView, contentTab]);

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
      let fetchCat = filterCategory;
      if (currentView === "ads") fetchCat = "Advertisement";
      else if (currentView === "library") {
        if (contentTab === "shorts") fetchCat = "Shorts";
        else if (contentTab === "obituary") fetchCat = "Obituary";
      }

      // Skip fetching articles if we are just looking at the staff manager
      if (currentView === "staff") {
        setIsLoading(false);
        return;
      }

      const data = await fetchArticles(
        fetchCat,
        searchQuery,
        targetPage,
        12,
        activeView,
        "All Places", 
        undefined,    
        undefined,    
        true          
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

  const handleToggleStatus = async (ad: any) => {
    try {
      const newStatus = ad.status === "draft" ? "published" : "draft";
      await updateArticle(ad._id, { ...ad, status: newStatus });
      loadArticlesForPage(page);
      loadDashboardStats();
    } catch (err) {
      alert("Failed to change ad status.");
    }
  };

  const startNewPost = (mode: "news" | "ad" | "obituary" = "news") => {
    const startingData = mode === "obituary" 
      ? { ...INITIAL_FORM_STATE, category: "Obituary" } 
      : INITIAL_FORM_STATE;
      
    setComposeData(startingData);
    setEditingId(null);
    setComposeMode(mode);
    setCurrentView(mode === "obituary" ? "obituary" : "compose");
  };

  const handleEdit = (article: any) => {
    setComposeData({
      headline: article.headline,
      body: article.body,
      keyPoints: article.keyPoints || [],
      isBreaking: article.isBreaking || false,
      isTicker: article.isTicker || false, 
      category: article.category || "News",
      location: article.location || { ward: "", landmark: "" },
      status: article.status || "published",
      externalLink: article.externalLink || "",
      media: article.media || [],
      reportedBy: article.reportedBy || "",
      photographedBy: article.photographedBy || "",
    });

    setEditingId(article._id);

    if (article.category === "Obituary") {
      setComposeMode("obituary");
      setCurrentView("obituary");
    } else if (article.category === "Shorts") {
      setComposeMode("shorts");
      setCurrentView("compose");
    } else if (article.category === "Advertisement") {
      setComposeMode("ad");
      setCurrentView("compose");
    } else {
      setComposeMode("news");
      setCurrentView("compose");
    }

    if (
      (article.category === "Shorts" || article.category === "Advertisement") &&
      article.media?.[0]?.type === "youtube-short"
    ) {
      setComposeShortUrl(`https://youtube.com/shorts/${article.media[0].url}`);
    } else {
      setComposeShortUrl("");
    }
  };

  const displayedArticles = articles.filter((article) => {
    if (currentView === "ads") return article.category === "Advertisement";
    if (currentView === "library") {
      if (contentTab === "shorts") return article.category === "Shorts";
      if (contentTab === "obituary") return article.category === "Obituary";
      if (contentTab === "news")
        return (
          article.category !== "Shorts" && 
          article.category !== "Advertisement" &&
          article.category !== "Obituary" 
        );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-x-hidden">
      <AdminSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        startNewPost={startNewPost}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative pb-8">
        <main className="flex-1 p-6 sm:p-8 md:p-10">
          
          {currentView === "compose" || currentView === "obituary" ? (
            <AdminComposer
              initialData={composeData}
              editingId={editingId}
              defaultMode={composeMode}
              initialShortUrl={composeShortUrl}
              onCancel={() =>
                setCurrentView(composeMode === "ad" ? "ads" : "library")
              }
              onSuccess={() => {
                setCurrentView(composeMode === "ad" ? "ads" : "library");
                loadArticlesForPage(1);
                loadDashboardStats();
              }}
            />
          ) : (
            <>
              {/* ⚡ UPDATED: HEADER DYNAMICS */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {currentView === "ads"
                      ? "Ads Manager"
                      : currentView === "staff"
                      ? "Staff Directory"
                      : "Content Management"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentView === "ads"
                      ? "Visually map and manage your sponsored campaigns."
                      : currentView === "staff"
                      ? "Manage your reporters, photographers, and team profiles."
                      : "Manage and publish news to your community."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {currentView !== "staff" && (
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-full shadow-inner border border-gray-200 dark:border-white/5 w-full sm:w-auto">
                      <button
                        onClick={() => setActiveView("published")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${activeView === "published" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                      >
                        <Globe className="w-3.5 h-3.5" /> Published
                      </button>
                      <button
                        onClick={() => setActiveView("draft")}
                        className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${activeView === "draft" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Drafts
                      </button>
                    </div>
                  )}

                  {currentView === "library" && (
                    <button
                      onClick={() => startNewPost("news")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-full active:scale-[0.98] transition-all shadow-md shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add New Story
                    </button>
                  )}
                </div>
              </div>

              {/* ⚡ NEW: STAFF MANAGER */}
              {currentView === "staff" && (
                <div className="mb-12">
                  <StaffManager />
                </div>
              )}

              {currentView === "ads" && (
                <div className="mb-12">
                  <VisualAdManager
                    activeAds={displayedArticles}
                    onRefresh={() => {
                      loadArticlesForPage(1);
                      loadDashboardStats();
                    }}
                    onDeleteAd={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                </div>
              )}

              {currentView === "library" && (
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
              )}

              {currentView === "library" && (
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
                  {contentTab === "news" && (
                    <>
                      <div className="w-px bg-gray-100 dark:bg-white/10 hidden sm:block"></div>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="py-3 px-4 bg-transparent text-sm font-medium outline-none cursor-pointer text-gray-700 dark:text-gray-300 min-w-40"
                      >
                        <option value="All">All Categories</option>
                        {CATEGORIES.filter(cat => cat !== "Obituary").map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}

              {currentView === "library" && (
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-max mb-8 border border-gray-200 dark:border-white/5 overflow-x-auto hide-scroll">
                  <button
                    onClick={() => setContentTab("news")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${contentTab === "news" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"}`}
                  >
                    Written News
                  </button>
                  <button
                    onClick={() => setContentTab("shorts")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${contentTab === "shorts" ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"}`}
                  >
                    Shorts Feed
                  </button>
                  <button
                    onClick={() => setContentTab("obituary")}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${contentTab === "obituary" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"}`}
                  >
                    Obituaries
                  </button>
                </div>
              )}

              {currentView === "library" && (
                <>
                  {isLoading ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                    </div>
                  ) : displayedArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#121212] border border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                      <Newspaper className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">
                        No {activeView}{" "}
                        {contentTab === "news" ? "written articles" : contentTab === "shorts" ? "shorts" : "obituaries"}{" "}
                        found.
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
                                      (article.category === "Shorts" ||
                                        article.category === "Advertisement") &&
                                      article.media?.[0]?.type ===
                                        "youtube-short"
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
                                    onClick={() => handleEdit(article)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
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
                                <span className="truncate pr-2">
                                  {article.location?.ward || "Thrissur"}
                                </span>
                                <span className="shrink-0">
                                  {new Date(
                                    article.createdAt,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
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
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                              )
                                .filter(
                                  (i) =>
                                    i === 1 ||
                                    i === totalPages ||
                                    (i >= page - 1 && i <= page + 1),
                                )
                                .map((i, index, array) => (
                                  <div key={i} className="flex items-center">
                                    {index > 0 && i - array[index - 1] > 1 && (
                                      <span className="px-2 text-gray-400">
                                        ...
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handlePageChange(i)}
                                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${page === i ? "bg-red-600 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                                    >
                                      {i}
                                    </button>
                                  </div>
                                ))}
                            </div>
                            <button
                              onClick={() => handlePageChange(page + 1)}
                              disabled={page === totalPages}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
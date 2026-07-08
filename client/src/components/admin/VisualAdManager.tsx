"use client";
import { useState } from "react";
import { LayoutTemplate, MonitorSmartphone, Search, FileText, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import AdminComposer from "./AdminComposer";

interface VisualAdManagerProps {
  activeAds: any[];
  onRefresh: () => void;
  onDeleteAd: (id: string) => void;
  onToggleStatus: (ad: any) => void;
}

export default function VisualAdManager({ activeAds, onRefresh, onDeleteAd, onToggleStatus }: VisualAdManagerProps) {
  const [activeLayout, setActiveLayout] = useState<"home" | "article" | "search" | "shorts">("home");
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [editingAd, setEditingAd] = useState<any>(null);

  // Triggered when clicking a dashed blue placeholder
  const handleSlotClick = (zoneName: string) => {
    setSelectedZone(zoneName);
    setEditingAd(null); // Ensure it's a blank slate
    setIsModalOpen(true);
  };

  // Triggered when clicking the Edit icon on an existing ad
  const handleEditClick = (ad: any) => {
    setSelectedZone(ad.location?.landmark || "");
    setEditingAd(ad); // Load the existing ad data
    setIsModalOpen(true);
  };

  // Smart Ad Slot: Renders the Ad, and turns into a Carousel if there are multiples!
  const AdSlot = ({ zone, adIndex = 0, className, label }: { zone: string; adIndex?: number; className: string; label?: string }) => {
    const zoneAds = activeAds.filter((a) => a.location?.landmark === zone);
    
    // State to cycle through ads if there are multiples in this specific spot
    const [localOffset, setLocalOffset] = useState(0);

    // Calculate which ad to show based on the base index + user's carousel clicks
    let actualIndex = adIndex + localOffset;
    
    // Safety check: If they delete an ad and it goes out of bounds, reset the offset
    if (actualIndex >= zoneAds.length && localOffset > 0) {
      actualIndex = adIndex; 
    }
    
    const ad = zoneAds[actualIndex];

    const hasNext = actualIndex < zoneAds.length - 1;
    const hasPrev = localOffset > 0;

    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); setLocalOffset(p => p + 1); };
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); setLocalOffset(p => p - 1); };

    if (ad) {
      const imageUrl = ad.media?.[0]?.type === "youtube-short"
        ? `https://img.youtube.com/vi/${ad.media?.[0]?.url}/hqdefault.jpg`
        : ad.media?.[0]?.url || "https://picsum.photos/400/250";

      const isDraft = ad.status === "draft";

      return (
        <div className={`relative group overflow-hidden shadow-md flex-shrink-0 bg-gray-900 ${className}`}>
          {/* Grayscale and dim the image if it is a draft */}
          <img src={imageUrl} alt={ad.headline} className={`w-full h-full object-cover transition-all duration-300 ${isDraft ? 'opacity-40 grayscale-[50%]' : 'opacity-80'}`} />
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm z-20">
            
            {/* Carousel Previous Arrow */}
            {hasPrev && (
              <button onClick={handlePrev} className="p-1 sm:p-2 bg-white/20 hover:bg-gray-500 text-white rounded-lg transition-colors shadow-sm" title="Previous Ad in Stack">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Core Actions */}
            <button onClick={() => onToggleStatus(ad)} className="p-1 sm:p-2 bg-white/20 hover:bg-amber-500 text-white rounded-lg transition-colors shadow-sm" title={isDraft ? "Publish Ad" : "Hide (Make Draft)"}>
              {isDraft ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            <button onClick={() => handleEditClick(ad)} className="p-1 sm:p-2 bg-white/20 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm" title="Edit Ad">
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => onDeleteAd(ad._id)} className="p-1 sm:p-2 bg-white/20 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm" title="Delete Ad">
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* Carousel Next Arrow */}
            {hasNext && (
              <button onClick={handleNext} className="p-1 sm:p-2 bg-white/20 hover:bg-gray-500 text-white rounded-lg transition-colors shadow-sm" title="Next Ad in Stack">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-8 z-10 pointer-events-none">
            <p className="text-white text-[10px] sm:text-xs font-bold truncate leading-tight">{ad.headline}</p>
          </div>
          
          {/* Status Badge: Red for Live, Amber for Draft */}
          <div className={`absolute top-2 left-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest z-10 pointer-events-none shadow-sm ${isDraft ? 'bg-amber-500' : 'bg-red-600'}`}>
            {isDraft ? 'Draft' : 'Live'}
          </div>

          {/* Rotation Layer Badge (Only shows if multiple ads exist in this spot) */}
          {zoneAds.length > 1 && (
            <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-[3px] uppercase tracking-widest z-10 pointer-events-none shadow-sm flex items-center gap-1">
              <Layers className="w-2 h-2" />
              {actualIndex + 1} OF {zoneAds.length}
            </div>
          )}
        </div>
      );
    }

    // Fallback: Show the Dashed "+ Add" Button
    return (
      <button
        onClick={() => handleSlotClick(zone)}
        className={`border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors flex flex-col items-center justify-center group relative overflow-hidden flex-shrink-0 ${className}`}
      >
        <div className="absolute inset-0 bg-blue-400/5 group-hover:bg-blue-400/10 transition-colors" />
        <span className="text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase text-[10px] md:text-xs group-hover:scale-105 transition-transform z-10 px-2 text-center break-words w-full">
          + Add {label || `"${zone}"`}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 relative">
      
      {/* ================= LEFT MENU: Layout Selector ================= */}
      <div className="w-full xl:w-64 shrink-0 space-y-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Select Page Layout</h3>
        <button onClick={() => setActiveLayout("home")} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeLayout === "home" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"}`}><MonitorSmartphone className="w-5 h-5" /> Homepage</button>
        <button onClick={() => setActiveLayout("article")} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeLayout === "article" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"}`}><FileText className="w-5 h-5" /> Full Coverage</button>
        <button onClick={() => setActiveLayout("search")} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeLayout === "search" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"}`}><Search className="w-5 h-5" /> Search Page</button>
        <button onClick={() => setActiveLayout("shorts")} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeLayout === "shorts" ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"}`}><LayoutTemplate className="w-5 h-5" /> Shorts Feed</button>
      </div>

      {/* ================= RIGHT AREA: The Visual Blueprint ================= */}
      <div className="flex-1 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-4 lg:p-8 flex items-center justify-center min-h-[600px] overflow-hidden relative">
        
        {/* HOMEPAGE BLUEPRINT */}
        {activeLayout === "home" && (
          <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-white/5 animate-in fade-in zoom-in duration-300">
            <AdSlot zone="Top Leaderboard" label="Top Leaderboard" className="w-full h-14 border-x-0 border-t-0 bg-blue-50/50 rounded-none" />
            <div className="h-12 border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-sm" /><div className="w-20 h-3 bg-gray-800 dark:bg-white/80 rounded-sm" /></div>
              <div className="flex gap-2 sm:gap-3"><div className="w-6 sm:w-8 h-2 bg-gray-200 dark:bg-white/10 rounded-full" /><div className="w-6 sm:w-8 h-2 bg-gray-200 dark:bg-white/10 rounded-full" /><div className="w-6 sm:w-8 h-2 bg-gray-200 dark:bg-white/10 rounded-full" /></div>
            </div>
            <div className="p-4 sm:p-6 space-y-6 max-h-[450px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-2 border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]">
                  <div className="w-full h-32 sm:h-40 bg-gray-200 dark:bg-white/10 rounded-xl mb-4" />
                  <div className="w-16 h-2 bg-red-600 rounded-full mb-3" /><div className="w-3/4 h-4 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-1/2 h-4 bg-gray-800 dark:bg-white/80 rounded-sm mb-4" /><div className="w-24 h-2 bg-gray-300 dark:bg-white/20 rounded-sm" />
                </div>
                <div className="col-span-1 flex flex-col gap-4">
                  <div className="flex-1 border border-gray-100 dark:border-white/5 rounded-2xl p-2 flex gap-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-lg shrink-0" /><div className="space-y-2 flex-1 pt-1"><div className="w-8 h-1.5 bg-red-600 rounded-full" /><div className="w-full h-2 bg-gray-800 dark:bg-white/80 rounded-sm" /><div className="w-2/3 h-2 bg-gray-800 dark:bg-white/80 rounded-sm" /></div></div>
                  <div className="flex-1 border border-gray-100 dark:border-white/5 rounded-2xl p-2 flex gap-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-lg shrink-0" /><div className="space-y-2 flex-1 pt-1"><div className="w-8 h-1.5 bg-red-600 rounded-full" /><div className="w-full h-2 bg-gray-800 dark:bg-white/80 rounded-sm" /><div className="w-4/5 h-2 bg-gray-800 dark:bg-white/80 rounded-sm" /></div></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AdSlot zone="Homepage Hero" adIndex={0} label="Local Business" className="w-full h-20 sm:h-24 rounded-2xl" />
                <AdSlot zone="Homepage Hero" adIndex={1} label="Premium Sponsor" className="w-full h-20 sm:h-24 rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                <div className="flex flex-col gap-4">
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-12 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-full h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-2/3 h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-4" /><div className="w-full h-24 bg-gray-200 dark:bg-white/10 rounded-xl" /></div>
                  <AdSlot zone="Home Feed Inject" adIndex={0} label="In-Grid Ad" className="w-full h-32 rounded-2xl" />
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-16 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-full h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-3/4 h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-4" /></div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-10 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-11/12 h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-1/2 h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-4" /></div>
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-14 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-full h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-5/6 h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-4" /><div className="w-full h-20 bg-gray-200 dark:bg-white/10 rounded-xl" /></div>
                  <AdSlot zone="Home Feed Inject" adIndex={1} label="In-Grid Ad" className="w-full h-32 rounded-2xl" />
                </div>
                <div className="hidden md:flex flex-col gap-4">
                  <AdSlot zone="Home Feed Inject" adIndex={2} label="In-Grid Ad" className="w-full h-32 rounded-2xl" />
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-full h-32 bg-gray-200 dark:bg-white/10 rounded-xl mb-4" /><div className="w-12 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-full h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /><div className="w-2/3 h-3 bg-gray-800 dark:bg-white/80 rounded-sm" /></div>
                  <div className="border border-gray-100 dark:border-white/5 rounded-2xl p-3 shadow-sm bg-white dark:bg-white/[0.02]"><div className="w-10 h-1.5 bg-red-600 rounded-full mb-3" /><div className="w-full h-3 bg-gray-800 dark:bg-white/80 rounded-sm mb-2" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ARTICLE BLUEPRINT */}
        {activeLayout === "article" && (
          // ⚡ ADDED 'relative' to this wrapper so the modal overlay positions correctly inside it!
          <div className="w-full max-w-3xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-white/5 flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
            
            {/* The Main Content Skeleton */}
            <div className="flex-1 p-4 sm:p-6 space-y-6">
              <div className="space-y-3"><div className="w-16 h-4 bg-red-100 dark:bg-red-900/30 rounded" /><div className="w-5/6 h-6 sm:h-8 bg-gray-200 dark:bg-white/10 rounded-md" /><div className="w-3/4 h-6 sm:h-8 bg-gray-200 dark:bg-white/10 rounded-md" /></div>
              <div className="w-full h-32 sm:h-48 bg-gray-100 dark:bg-white/5 rounded-xl" />
              <div className="space-y-3"><div className="w-full h-2 sm:h-3 bg-gray-100 dark:bg-white/5 rounded-full" /><div className="w-full h-2 sm:h-3 bg-gray-100 dark:bg-white/5 rounded-full" /><div className="w-4/5 h-2 sm:h-3 bg-gray-100 dark:bg-white/5 rounded-full" /></div>
              
              <AdSlot zone="Article Inline" className="w-full h-24 sm:h-28 rounded-lg" />
              
              <div className="space-y-3"><div className="w-full h-2 sm:h-3 bg-gray-100 dark:bg-white/5 rounded-full" /><div className="w-11/12 h-2 sm:h-3 bg-gray-100 dark:bg-white/5 rounded-full" /></div>
            </div>
            
            {/* The Sidebar Skeleton */}
            <div className="w-full md:w-56 bg-gray-50 dark:bg-black/20 border-l border-gray-100 dark:border-white/5 p-4 sm:p-6 hidden md:block">
              <AdSlot zone="Sidebar Banner" className="w-full h-[300px] sm:h-[400px] rounded-xl" />
            </div>

            {/* ⚡ NEW: THE POP-UP SIMULATOR OVERLAY */}
            {/* Notice pointer-events-none on the wrapper so you can still click the Inline and Sidebar ads "through" it */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-4">
              <div className="w-full max-w-sm bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/20 shadow-2xl rounded-2xl p-4 pointer-events-auto flex flex-col items-center animate-pulse">
                
                {/* Simulated Modal Header */}
                <div className="w-full flex justify-between items-center mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                    Session Pop-up Layer
                  </span>
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-500">X</span>
                  </div>
                </div>

                {/* The Actual Ad Slot */}
                <AdSlot 
                  zone="Full Coverage Pop-up" 
                  label="Pop-up Image" 
                  className="w-full h-40 sm:h-48 rounded-xl shadow-inner" 
                />
              </div>
            </div>

          </div>
        )}

        {/* SEARCH BLUEPRINT */}
        {activeLayout === "search" && (
          <div className="w-full max-w-3xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-white/5 flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="h-16 border-b border-gray-100 dark:border-white/5 flex items-center justify-center p-4">
              <div className="w-1/2 h-10 border border-gray-200 dark:border-white/10 rounded-full flex items-center px-4"><Search className="w-4 h-4 text-gray-300" /></div>
            </div>
            <div className="flex p-4 sm:p-6 gap-4 sm:gap-6 h-[400px] sm:h-[500px]">
              <div className="w-32 sm:w-48 shrink-0 hidden md:block">
                <AdSlot zone="Sidebar Banner" adIndex={0} label="Left Sidebar" className="w-full h-48 sm:h-64 rounded-xl" />
              </div>
              <div className="flex-1 space-y-4 overflow-hidden">
                <AdSlot zone="Top Leaderboard" adIndex={0} className="w-full h-16 sm:h-20 rounded-lg shrink-0" />
                <div className="w-full h-20 sm:h-24 bg-gray-100 dark:bg-white/5 rounded-lg" />
                <div className="w-full h-20 sm:h-24 bg-gray-100 dark:bg-white/5 rounded-lg" />
              </div>
              <div className="w-32 sm:w-48 shrink-0 hidden sm:block">
                <AdSlot zone="Sidebar Banner" adIndex={1} label="Right Sidebar" className="w-full h-64 sm:h-80 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* SHORTS BLUEPRINT */}
        {activeLayout === "shorts" && (
          <div className="w-[280px] sm:w-[300px] h-[500px] sm:h-[550px] bg-black rounded-[2rem] shadow-2xl border-8 border-gray-800 dark:border-gray-700 flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20"><div className="w-24 h-4 bg-gray-800 dark:bg-gray-700 rounded-b-xl" /></div>
            <div className="flex-1 bg-gradient-to-b from-gray-800 to-black p-4 flex flex-col justify-end pb-8">
              <div className="flex justify-between items-end">
                <div className="space-y-3"><div className="w-10 h-10 bg-white/20 rounded-full" /><div className="w-32 h-2 bg-white/40 rounded-full" /><div className="w-48 h-2 bg-white/20 rounded-full" /></div>
                <div className="space-y-4 flex flex-col items-center"><div className="w-8 h-8 bg-white/10 rounded-full" /><div className="w-8 h-8 bg-white/10 rounded-full" /><div className="w-8 h-8 bg-white/10 rounded-full" /></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-6 z-10 backdrop-blur-sm bg-black/40">
              <AdSlot zone="Shorts Vertical Feed" label="Vertical Interstitial" className="w-full h-3/4 rounded-2xl shadow-2xl" />
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL OVERLAY ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto animate-in fade-in slide-in-from-bottom-10 duration-300" onClick={(e) => e.stopPropagation()}>
            <AdminComposer
              defaultMode="ad"
              editingId={editingAd ? editingAd._id : null}
              initialShortUrl={editingAd && editingAd.media?.[0]?.type === 'youtube-short' ? `https://youtube.com/shorts/${editingAd.media[0].url}` : ""}
              initialData={editingAd || {
                headline: "", body: "Sponsored Advertisement", isBreaking: false, category: "Advertisement", location: { ward: "All Places", landmark: selectedZone }, status: "published", externalLink: "", media: []
              }}
              onCancel={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                onRefresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ⚡ NEW: Import React Portal
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  Megaphone,
  PenTool,
  MapPin,
  Feather,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  X
} from "lucide-react";

// ⚡ UPDATED: Added "staff" to the typescript interfaces
interface AdminSidebarProps {
  currentView: "library" | "compose" | "ads" | "obituary" | "staff";
  setCurrentView: (view: "library" | "compose" | "ads" | "obituary" | "staff") => void;
  startNewPost: (mode: "news" | "ad" | "obituary") => void;
}

export default function AdminSidebar({
  currentView,
  setCurrentView,
  startNewPost,
}: AdminSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // ⚡ NEW: Track when it's safe to teleport

  // ⚡ UPDATED: Added "staff" here too
  const handleSelectView = (view: "library" | "compose" | "ads" | "obituary" | "staff") => {
    setCurrentView(view);
    setIsOpen(false);
  };

  const handleStartNewPost = (mode: "news" | "ad" | "obituary") => {
    startNewPost(mode);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // ⚡ NEW: Mount the portal safely on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // ⚡ NEW: We package the button up into a variable so we can teleport it!
  const mobileMenuButton = (
    <button
      onClick={() => setIsOpen(true)}
      className={`lg:hidden fixed bottom-92 left-0 z-[99999] py-4 pr-2 pl-1 bg-[#0f172a]/95 backdrop-blur-md text-white rounded-r-xl shadow-[4px_0_24px_rgba(0,0,0,0.4)] border border-l-0 border-slate-700/50 flex items-center justify-center transition-all duration-300 hover:pr-3 hover:bg-[#0f172a] ${
        isOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <ChevronRight className="w-6 h-6 text-slate-300" />
    </button>
  );

  return (
    <>
      {/* ⚡ TELEPORT THE BUTTON DIRECTLY TO THE BROWSER BODY */}
      {mounted ? createPortal(mobileMenuButton, document.body) : null}

      {/* Frosted Glass Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-slate-300 flex flex-col z-[99999] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Header with Mobile Close Button */}
        <div className="p-6 mb-2 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Fides<span className="text-red-600">News</span>
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              Command Center
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Navigation List (Scrollable on small phones) */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-4">
          <button
            onClick={() => handleSelectView("library")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "library"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Newspaper className="w-5 h-5 shrink-0" />
            <span>Content Library</span>
          </button>

          <button
            onClick={() => handleSelectView("ads")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "ads"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Megaphone className="w-5 h-5 shrink-0" />
            <span>Ads Manager</span>
          </button>

          <button
            onClick={() => handleStartNewPost("news")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "compose"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <PenTool className="w-5 h-5 shrink-0" />
            <span>Compose Story</span>
          </button>

          <button
            onClick={() => handleStartNewPost("obituary")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "obituary"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Feather className="w-5 h-5 shrink-0" />
            <span>Compose Obituary</span>
          </button>

          {/* ⚡ UPDATED: Turned the Journalists placeholder into the active Staff Directory button */}
          <button
            onClick={() => handleSelectView("staff")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
              currentView === "staff"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span>Staff Directory</span>
          </button>

          <Link
            href="/dashboard/regions"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all"
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Territory Manager</span>
          </Link>

          <div className="my-4 border-t border-white/10" />

          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Analytics Hub</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
            <Settings className="w-5 h-5 shrink-0" />
            <span>App Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-medium rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
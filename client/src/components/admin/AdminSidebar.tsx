"use client";

import { useRouter } from "next/navigation";
import {
  Newspaper,
  Megaphone,
  PenTool,
  Feather, // <-- Added for the Obituary icon
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  currentView: "library" | "compose" | "ads" | "obituary"; // <-- Added obituary
  setCurrentView: (view: "library" | "compose" | "ads" | "obituary") => void;
  startNewPost: (mode: "news" | "ad" | "obituary") => void; // <-- Added obituary
}

export default function AdminSidebar({
  currentView,
  setCurrentView,
  startNewPost,
}: AdminSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
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
          onClick={() => startNewPost("news")}
          className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
            currentView === "compose"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span>Compose Story</span>
        </button>

        {/* --- NEW OBITUARY BUTTON --- */}
        <button
          onClick={() => startNewPost("obituary")}
          className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-all ${
            currentView === "obituary"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Feather className="w-5 h-5" />
          <span>Compose Obituary</span>
        </button>

        <div className="my-4 border-t border-white/10" />

        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-all opacity-60 cursor-not-allowed">
          <LayoutDashboard className="w-5 h-5" />
          <span>Analytics Hub</span>
        </button>
        {/* ... Keep remaining buttons identical ... */}
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
  );
}
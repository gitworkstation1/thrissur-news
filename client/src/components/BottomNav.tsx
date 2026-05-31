"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlaySquare, User, Globe } from "lucide-react";

// --- ORIGINAL FULL-COLOR BRAND ICONS ---

const WhatsApp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const Threads = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="currentColor" className={className}>
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.6981 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();
  const [showSocials, setShowSocials] = useState(false);
  
  // FIX: Identify if the user is on the shorts page so we can force white overlay text
  const isShortsPage = pathname?.startsWith("/shorts");
  
  useEffect(() => {
    setShowSocials(false);
  }, [pathname]);

  useEffect(() => {
    if (!showSocials) return;

    const handleScroll = () => {
      setShowSocials(false);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [showSocials]);

  useEffect(() => {
    if (showSocials) {
      document.body.classList.add('socials-open');
    } else {
      document.body.classList.remove('socials-open');
    }
    return () => document.body.classList.remove('socials-open');
  }, [showSocials]);

  const navItems = [
    { name: "HOME", path: "/", icon: Home },
    { name: "SEARCH", path: "/search", icon: Search },
    { name: "SHORTS", path: "/shorts", icon: PlaySquare },
    { name: "CONNECT", action: "toggleSocials", icon: Globe },
    { name: "ADMIN", path: "/dashboard", icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md md:hidden z-[100]">
      
      {/* PURE LIQUID GLASS (POPUP) */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 grid grid-cols-3 gap-x-8 gap-y-6 place-items-center bg-white/5 dark:bg-black/10 backdrop-blur-[40px] saturate-[1.2] border border-white/50 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.2),0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl px-8 py-6 transition-all duration-400 ease-out origin-bottom w-max ${
          showSocials 
            ? 'bottom-[125%] opacity-100 scale-100' 
            : 'bottom-1/2 opacity-0 scale-50 pointer-events-none'
        }`}
      >
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="transition-all hover:scale-110 hover:opacity-80 active:scale-95">
          <WhatsApp className="w-[24px] h-[24px]" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer" className="transition-all hover:scale-110 hover:opacity-80 active:scale-95">
          <Youtube className="w-[24px] h-[24px]" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition-all hover:scale-110 hover:opacity-80 active:scale-95">
          <Instagram className="w-[24px] h-[24px]" />
        </a>
        {/* FIX: Force X/Threads icons to be white if opened on the Shorts page */}
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className={`${isShortsPage ? 'text-white' : 'text-slate-900 dark:text-white'} transition-all hover:scale-110 hover:opacity-80 active:scale-95`}>
          <XLogo className="w-[24px] h-[24px]" />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="transition-all hover:scale-110 hover:opacity-80 active:scale-95">
          <Facebook className="w-[24px] h-[24px]" />
        </a>
        <a href="https://threads.net" target="_blank" rel="noreferrer" className={`${isShortsPage ? 'text-white' : 'text-slate-900 dark:text-white'} transition-all hover:scale-110 hover:opacity-80 active:scale-95`}>
          <Threads className="w-[24px] h-[24px]" />
        </a>
      </div>

      {/* PURE LIQUID GLASS (DOCK) */}
      <div className="bg-white/5 dark:bg-black/10 backdrop-blur-[40px] saturate-[1.2] border border-white/50 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(255,255,255,0.1),0_16px_40px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_4px_rgba(0,0,0,0.2),0_16px_40px_rgba(0,0,0,0.6)] rounded-full px-2 py-3.5 transition-colors duration-300">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.action === "toggleSocials" && showSocials);
            const Icon = item.icon;

            const InnerContent = (
              <>
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? "stroke-[2.5px]" : "stroke-2"
                  }`} 
                />
                <span 
                  className={`text-[9px] tracking-wider transition-all duration-300 ${
                    isActive ? "font-black opacity-100" : "font-semibold opacity-0 h-0"
                  }`}
                >
                  {item.name}
                </span>
              </>
            );

            // FIX: If the user is on the Shorts page, force the unselected icons to be white with a shadow so they pop over the video!
            const baseClasses = `flex flex-col items-center justify-center gap-1 transition-all duration-300 flex-1 ${
              isActive 
                ? "text-[#e3000f] -translate-y-1 drop-shadow-md" 
                : isShortsPage
                  ? "text-white/90 hover:text-white drop-shadow-md"
                  : "text-slate-900 dark:text-gray-100 hover:text-black dark:hover:text-white"
            }`;

            if (item.action === "toggleSocials") {
              return (
                <button 
                  key={item.name} 
                  onClick={() => setShowSocials(!showSocials)} 
                  className={baseClasses}
                >
                  {InnerContent}
                </button>
              );
            }

            return (
              <Link 
                key={item.name} 
                href={item.path as string} 
                onClick={() => setShowSocials(false)}
                className={baseClasses}
              >
                {InnerContent}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
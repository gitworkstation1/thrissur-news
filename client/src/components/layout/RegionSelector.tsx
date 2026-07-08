"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, ChevronRight, Check } from "lucide-react";

// --- DATA STRUCTURE ---
const REGION_DATA = [
  {
    state: "Kerala",
    districts: [
      {
        name: "Thrissur",
        locals: [
          "All Thrissur",
          "Thrissur Town",
          "Irinjalakuda",
          "Poomangalam",
          "Kodungallur",
          "Chalakudy",
          "Guruvayur",
          "Wadakkanchery",
          "Kunnamkulam"
        ]
      },
      {
        name: "Ernakulam",
        locals: [
          "All Ernakulam",
          "Kochi City",
          "Aluva",
          "Angamaly",
          "Kakkanad"
        ]
      }
    ]
  }
];

export default function RegionSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedState, setExpandedState] = useState<string>("Kerala"); // Default to Kerala open
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  
  // Track the currently selected location
  const [selectedLocation, setSelectedLocation] = useState("All Regions");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (local: string) => {
    setSelectedLocation(local);
    setIsOpen(false);
    // TODO: Hook this up to your global context or API fetch logic here
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
      >
        <div className="relative">
          <MapPin className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-white dark:border-[#111]"></span>
        </div>
        <span className="hidden sm:block uppercase tracking-wider text-[11px] truncate max-w-[120px]">
          {selectedLocation}
        </span>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 transform origin-top-right transition-all">
          
          <div className="p-4 bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Region</h3>
            <button 
              onClick={() => handleSelect("All Regions")}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase"
            >
              Reset to All
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {REGION_DATA.map((stateObj) => (
              <div key={stateObj.state} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                
                {/* STATE HEADER */}
                <button
                  onClick={() => setExpandedState(expandedState === stateObj.state ? "" : stateObj.state)}
                  className="w-full flex items-center justify-between p-3 text-sm font-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {stateObj.state}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedState === stateObj.state ? "rotate-180" : ""}`} />
                </button>

                {/* DISTRICTS CONTAINER */}
                {expandedState === stateObj.state && (
                  <div className="bg-white dark:bg-[#1a1a1a]">
                    {stateObj.districts.map((district) => (
                      <div key={district.name}>
                        
                        {/* DISTRICT HEADER */}
                        <button
                          onClick={() => setExpandedDistrict(expandedDistrict === district.name ? null : district.name)}
                          className="w-full flex items-center justify-between py-2.5 pl-6 pr-4 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {district.name} District
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${expandedDistrict === district.name ? "rotate-90" : ""}`} />
                        </button>

                        {/* LOCALS / WARDS LIST */}
                        {expandedDistrict === district.name && (
                          <div className="py-1 bg-gray-50/50 dark:bg-[#111]/50 border-y border-gray-50 dark:border-white/5">
                            {district.locals.map((local) => {
                              const isSelected = selectedLocation === local;
                              return (
                                <button
                                  key={local}
                                  onClick={() => handleSelect(local)}
                                  className={`w-full flex items-center justify-between py-2 pl-10 pr-4 text-sm transition-colors
                                    ${isSelected 
                                      ? "text-red-600 font-bold bg-red-50 dark:bg-red-900/10" 
                                      : "text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                                    }`}
                                >
                                  {local}
                                  {isSelected && <Check className="w-3.5 h-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}
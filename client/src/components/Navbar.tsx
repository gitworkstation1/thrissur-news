"use client";
import { useState } from "react";

const places = [
  "All", "Kodungallur", "Irinjalakuda", "Chalakudy", "Guruvayur",
  "Wadakkanchery", "Kunnamkulam", "Ollur", "Thrissur Town",
  "Mala", "Chavakkad", "Puthukkad", "Anthikad",
];

export default function Navbar() {
  const [showLocations, setShowLocations] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="text-2xl">☰</button>
        <h1 className="text-2xl font-bold text-red-700">Thrissur News</h1>
        <div className="relative">
          <button onClick={() => setShowLocations(!showLocations)} className="text-2xl">📍</button>
          {showLocations && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border overflow-hidden">
              {places.map((place) => (
                <button key={place} className="block w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium border-b last:border-none">
                  {place}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
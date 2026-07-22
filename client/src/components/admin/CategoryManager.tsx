"use client";
import { useState, useEffect } from "react";
import { fetchCategories, updateCategory, seedCategories } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";

const DEFAULT_CATEGORIES = [
  { name: "News", order: 1, isVisible: true },
  { name: "Local", order: 2, isVisible: true },
  { name: "Crime", order: 3, isVisible: true },
  { name: "Politics", order: 4, isVisible: true },
  { name: "Sports", order: 5, isVisible: true },
  { name: "Business", order: 6, isVisible: true },
  { name: "Entertainment", order: 7, isVisible: true },
  { name: "Technology", order: 8, isVisible: true },
  { name: "Health", order: 9, isVisible: true },
  { name: "Education", order: 10, isVisible: true },
  { name: "Automotive", order: 11, isVisible: true },
  { name: "Real Estate", order: 12, isVisible: true },
  { name: "Lifestyle", order: 13, isVisible: true },
  { name: "Food", order: 14, isVisible: true },
  { name: "Music", order: 15, isVisible: true },
  { name: "Trending", order: 16, isVisible: true },
  { name: "Astro", order: 17, isVisible: true },
  { name: "Career", order: 18, isVisible: true },
  { name: "Agriculture", order: 19, isVisible: true },
  { name: "Lottery", order: 20, isVisible: true },
  { name: "Obituary", order: 21, isVisible: true }
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setCategories(categories.map(c => c._id === id ? { ...c, isVisible: !currentStatus } : c));
    
    try {
      await updateCategory(id, { isVisible: !currentStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      loadData(); // Revert on failure
    }
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    await seedCategories(DEFAULT_CATEGORIES);
    await loadData();
  };

  if (isLoading) return <div className="flex items-center gap-2 p-6"><Loader2 className="animate-spin text-red-600" /> Loading Categories...</div>;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase tracking-wider">Nav Menu Manager</h2>
        {categories.length === 0 && (
          <button 
            onClick={handleInitialize}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors"
          >
            Initialize Default Categories
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
            <span className={`font-bold ${!cat.isVisible && 'text-gray-400 line-through'}`}>
              {cat.name}
            </span>
            <button 
              onClick={() => handleToggleVisibility(cat._id, cat.isVisible)}
              className={`p-2 rounded-md transition-colors ${
                cat.isVisible 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-500' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {cat.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
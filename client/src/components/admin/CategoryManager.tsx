"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fetchCategories, updateCategory, seedCategories, createCategory } from "@/lib/api"; // 👈 createCategory goes here!

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ⚡ New states for creating categories
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateCategory(id, { isVisible: !currentStatus });
      loadData();
    } catch (error) {
      alert("Failed to update category");
    }
  };

  // ⚡ Function to handle form submission
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName(""); // Clear the input on success
      loadData(); // Refresh the grid
    } catch (err) {
      alert("Failed to create category. It might already exist.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading categories...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Category Manager</h2>
          <p className="text-gray-500">Control navigation visibility and category structure.</p>
        </div>
      </div>

      {/* ⚡ THE NEW CATEGORY FORM */}
      <form onSubmit={handleCreateCategory} className="mb-8 flex gap-3 bg-white dark:bg-[#121212] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 max-w-xl">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter new category name..."
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-500 transition-colors text-gray-900 dark:text-white"
          disabled={isCreating}
        />
        <button
          type="submit"
          disabled={!newCategoryName.trim() || isCreating}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-bold rounded-xl transition-all shadow-sm whitespace-nowrap"
        >
          {isCreating ? "Adding..." : "+ Add Category"}
        </button>
      </form>

      {/* YOUR EXISTING GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
            <button
              onClick={() => handleToggleVisibility(cat._id, cat.isVisible)}
              className={`p-2 rounded-lg transition-colors ${
                cat.isVisible ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              {cat.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
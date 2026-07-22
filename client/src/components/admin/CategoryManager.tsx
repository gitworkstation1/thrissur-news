"use client";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Pencil, Trash2, GripVertical, Check, X } from "lucide-react";
import { fetchCategories, updateCategory, createCategory, deleteCategory, reorderCategories } from "@/lib/api";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Drag & Drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    // Sort by order initially
    const sortedData = (data || []).sort((a: any, b: any) => a.order - b.order);
    setCategories(sortedData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ⚡ ACTION HANDLERS
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await updateCategory(id, { isVisible: !currentStatus });
      loadData();
    } catch (error) {
      alert("Failed to update category");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName(""); 
      loadData(); 
    } catch (err) {
      alert("Failed to create category. It might already exist.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      loadData();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const handleEditSubmit = async (id: string) => {
    if (!editName.trim()) return setEditingId(null);
    try {
      await updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert("Failed to update category name");
    }
  };

  // ⚡ DRAG AND DROP HANDLERS
  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // Duplicate and reorder array in state instantly for snappy UI
    const _categories = [...categories];
    const draggedItemContent = _categories.splice(dragItem.current, 1)[0];
    _categories.splice(dragOverItem.current, 0, draggedItemContent);
    
    // Re-assign 'order' value based on new array index
    const reordered = _categories.map((cat, index) => ({ ...cat, order: index }));
    setCategories(reordered);
    
    dragItem.current = null;
    dragOverItem.current = null;

    // Send payload to backend to save the new order
    try {
      const payload = reordered.map(c => ({ _id: c._id, order: c.order }));
      await reorderCategories(payload);
    } catch (e) {
      alert("Failed to save new order. Reloading data.");
      loadData(); // Revert to database state if fails
    }
  };

  if (isLoading) return <div className="p-8">Loading categories...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Category Manager</h2>
          <p className="text-gray-500">Control navigation visibility, order, and structure.</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <div 
            key={cat._id} 
            draggable
            onDragStart={() => (dragItem.current = index)}
            onDragEnter={() => (dragOverItem.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1">
              <GripVertical className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              
              {/* EDIT MODE UI */}
              {editingId === cat._id ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded outline-none"
                  />
                  <button onClick={() => handleEditSubmit(cat._id)} className="text-green-600 hover:text-green-700 p-1">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="font-bold text-gray-900 dark:text-white truncate">
                  {cat.name}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS (Hide when editing) */}
            {editingId !== cat._id && (
              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(cat._id);
                    setEditName(cat.name);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Edit Category"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleToggleVisibility(cat._id, cat.isVisible)}
                  className={`p-2 rounded-lg transition-colors ${
                    cat.isVisible ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  }`}
                  title={cat.isVisible ? "Hide in Nav" : "Show in Nav"}
                >
                  {cat.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
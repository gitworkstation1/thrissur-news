"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Camera, User, Loader2 } from "lucide-react";
import { fetchStaff, createStaffMember, deleteStaffMember, uploadImage } from "@/lib/api";

export default function StaffManager() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "Reporter",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    loadStaffDirectory();
  }, []);

  const loadStaffDirectory = async () => {
    try {
      const data = await fetchStaff();
      setStaff(data);
    } catch (error) {
      console.error("Failed to load staff", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name) return;
    
    setIsSubmitting(true);
    try {
      let avatarUrl = "";
      if (avatarFile) {
        // Upload the avatar to Cloudinary using your existing helper
        avatarUrl = await uploadImage(avatarFile, `staff-${newStaff.name.replace(/\s+/g, '-')}`);
      }
      
      await createStaffMember({ ...newStaff, avatarUrl });
      
      // Refresh list and reset form
      await loadStaffDirectory();
      setNewStaff({ name: "", role: "Reporter" });
      setAvatarFile(null);
      setIsAdding(false);
      
    } catch (error) {
      console.error("Failed to add staff", error);
      alert("Failed to add staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      await deleteStaffMember(id);
      setStaff(staff.filter(s => s._id !== id));
    } catch (error) {
      console.error("Failed to delete staff", error);
      alert("Failed to delete staff member.");
    }
  };

  const reporters = staff.filter(s => s.role === "Reporter");
  const photographers = staff.filter(s => s.role === "Photographer");

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* ADD NEW STAFF FORM */}
      <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" /> Manage Team
          </h2>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleAddStaff} className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-sm outline-none cursor-pointer focus:ring-2 focus:ring-red-600"
                >
                  <option value="Reporter">Reporter</option>
                  <option value="Photographer">Photographer</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Avatar (Optional)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <span className="truncate max-w-[100px] text-gray-600 dark:text-gray-300">
                      {avatarFile ? avatarFile.name : "Upload Image"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* STAFF LISTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Reporters */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Reporters</h3>
          <div className="space-y-3">
            {reporters.map(member => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-bold">{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white truncate">{member.name}</span>
                </div>
                <button onClick={() => handleDeleteStaff(member._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {reporters.length === 0 && <p className="text-sm text-gray-400 italic py-4">No reporters added yet.</p>}
          </div>
        </div>

        {/* Photographers */}
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Photographers</h3>
          <div className="space-y-3">
            {photographers.map(member => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-bold">{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white truncate">{member.name}</span>
                </div>
                <button onClick={() => handleDeleteStaff(member._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {photographers.length === 0 && <p className="text-sm text-gray-400 italic py-4">No photographers added yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
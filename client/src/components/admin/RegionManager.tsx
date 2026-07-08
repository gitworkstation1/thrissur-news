"use client";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Map, ChevronRight, Loader2, X } from "lucide-react";
import axios from "axios"; // Assuming you use axios for your API calls

type District = { name: string; locals: string[] };
type Region = { state: string; districts: District[] };

export default function RegionManager() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // 1. Fetch Existing Data on Load
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      // 1. Bulletproof the URL (Strips accidental /api from Vercel env variable)
      let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

      const res = await fetch(`${baseUrl}/api/regions`);
      
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Status ${res.status}: ${errText}`);
      }
      
      const data = await res.json();
      
      // 2. Bulletproof the Array Check (Prevents the e.map crash!)
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Database is empty, provide default template
          setRegions([{ state: "Kerala", districts: [{ name: "Thrissur", locals: ["Irinjalakuda"] }] }]);
        } else {
          // Database has data, load it
          setRegions(data);
        }
      } else {
        throw new Error(data.error || "Backend did not return an array.");
      }
    } catch (error: any) {
      console.error("Fetch error details:", error);
      setMessage({ text: `Connection Issue: ${error.message}`, type: "error" });
      
      // 3. Fallback: Safely load a blank template so the UI NEVER crashes
      setRegions([{ state: "Kerala", districts: [{ name: "Thrissur", locals: ["Irinjalakuda"] }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. State Management Helpers
  const addState = () => {
    setRegions([...regions, { state: "New State", districts: [] }]);
  };

  const addDistrict = (stateIndex: number) => {
    const updated = [...regions];
    updated[stateIndex].districts.push({ name: "New District", locals: [] });
    setRegions(updated);
  };

  const addLocal = (stateIndex: number, districtIndex: number) => {
    const updated = [...regions];
    updated[stateIndex].districts[districtIndex].locals.push("New Location");
    setRegions(updated);
  };

  const updateText = (value: string, indices: { s: number, d?: number, l?: number }) => {
    const updated = [...regions];
    if (indices.l !== undefined && indices.d !== undefined) {
      updated[indices.s].districts[indices.d].locals[indices.l] = value;
    } else if (indices.d !== undefined) {
      updated[indices.s].districts[indices.d].name = value;
    } else {
      updated[indices.s].state = value;
    }
    setRegions(updated);
  };

  const removeNode = (indices: { s: number, d?: number, l?: number }) => {
    const updated = [...regions];
    if (indices.l !== undefined && indices.d !== undefined) {
      updated[indices.s].districts[indices.d].locals.splice(indices.l, 1);
    } else if (indices.d !== undefined) {
      updated[indices.s].districts.splice(indices.d, 1);
    } else {
      updated.splice(indices.s, 1);
    }
    setRegions(updated);
  };

  // 3. Save to Database (Detective Version)
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      // ⚡ CHANGED: We now fetch from a relative URL so it hits the Vercel Middleman!
      // We removed baseUrl and credentials entirely.
      const res = await fetch('/api/regions/sync', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ regions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Server returned Status ${res.status}`);
      }

      setMessage({ text: "Region hierarchy saved successfully!", type: "success" });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `Failed: ${error.message}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6 md:p-8">
      
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-red-600" /> Territory Manager
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure the State ➔ District ➔ Local hierarchy for your navigation.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {regions.map((stateObj, sIndex) => (
          <div key={sIndex} className="bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/10 p-4">
            
            {/* STATE ROW */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest w-16">State</span>
              <input 
                type="text" 
                value={stateObj.state} 
                onChange={(e) => updateText(e.target.value, { s: sIndex })}
                className="flex-1 p-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-lg font-black outline-none focus:border-red-500"
              />
              <button onClick={() => removeNode({ s: sIndex })} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>

            {/* DISTRICTS CONTAINER */}
            <div className="pl-6 md:pl-12 space-y-4 border-l-2 border-gray-200 dark:border-gray-800 ml-3">
              {stateObj.districts.map((district, dIndex) => (
                <div key={dIndex} className="bg-white dark:bg-[#222] rounded-lg border border-gray-200 dark:border-white/5 p-4 relative">
                  
                  {/* DISTRICT ROW */}
                  <div className="flex items-center gap-3 mb-3">
                    <ChevronRight className="w-4 h-4 text-red-500 absolute -left-[27px] bg-gray-50 dark:bg-[#1a1a1a]" />
                    <span className="text-[10px] font-bold uppercase text-red-500 tracking-widest w-16">District</span>
                    <input 
                      type="text" 
                      value={district.name} 
                      onChange={(e) => updateText(e.target.value, { s: sIndex, d: dIndex })}
                      className="flex-1 p-1.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-md font-bold text-sm outline-none focus:border-red-500"
                    />
                    <button onClick={() => removeNode({ s: sIndex, d: dIndex })} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* LOCALS ROW (GRID) */}
                  <div className="pl-8 pt-2">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block mb-2">Local Wards / Towns</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {district.locals.map((local, lIndex) => (
                        <div key={lIndex} className="flex items-center gap-1 group">
                          <input 
                            type="text" 
                            value={local} 
                            onChange={(e) => updateText(e.target.value, { s: sIndex, d: dIndex, l: lIndex })}
                            className="flex-1 p-1.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded text-xs outline-none focus:border-blue-500 transition-colors"
                          />
                          <button onClick={() => removeNode({ s: sIndex, d: dIndex, l: lIndex })} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => addLocal(sIndex, dIndex)} className="flex items-center justify-center gap-1 p-1.5 border border-dashed border-gray-300 dark:border-gray-700 rounded text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>

                </div>
              ))}
              
              <button onClick={() => addDistrict(sIndex)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <Plus className="w-4 h-4" /> Add District to {stateObj.state}
              </button>
            </div>

          </div>
        ))}

        <button onClick={addState} className="w-full flex justify-center items-center gap-2 p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <Plus className="w-5 h-5" /> Add New State
        </button>
      </div>
      
    </div>
  );
}
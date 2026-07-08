"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Loader2,
  Globe,
  EyeOff,
  Plus,
  Trash2,
  UserCircle,
} from "lucide-react";
import { createArticle, updateArticle, uploadImage } from "@/lib/api";

import ImageCropperModal from "@/components/ui/ImageCropperModal";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-400">
      Loading story workspace...
    </div>
  ),
});

const CATEGORIES = [
  "News",
  "Crime",
  "Politics",
  "Sports",
  "Business",
  "Education",
  "Local",
  "Health",
  "Obituary",
];
const AD_ZONES = [
  "Global (Anywhere)",
  "Top Leaderboard",
  "Homepage Hero",
  "Home Feed Inject",
  "Sidebar Banner",
  "Article Inline",
  "Shorts Vertical Feed",
  "Full Coverage Pop-up",
];

interface AdminComposerProps {
  initialData: any;
  editingId: string | null;
  defaultMode: "news" | "shorts" | "ad" | "obituary";
  initialShortUrl: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface MediaItem {
  file: File | null;
  url: string;
  credit: string;
}

export default function AdminComposer({
  initialData,
  editingId,
  defaultMode,
  initialShortUrl,
  onCancel,
  onSuccess,
}: AdminComposerProps) {
  const [formData, setFormData] = useState(initialData);
  const [editorMode, setEditorMode] = useState<
    "news" | "shorts" | "ad" | "obituary"
  >(defaultMode);
  const [shortUrl, setShortUrl] = useState(initialShortUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [mediaList, setMediaList] = useState<MediaItem[]>([
    { file: null, url: "", credit: "" },
  ]);

  const [creditFiles, setCreditFiles] = useState<{
    reporter: File | null;
    photographer: File | null;
  }>({
    reporter: null,
    photographer: null,
  });

  const [croppingImage, setCroppingImage] = useState<{ src: string; index: number } | null>(null);

  // ⚡ LIVE REGION DATA STATE
  const [regionData, setRegionData] = useState<any[]>([]);

  // ⚡ FETCH REGIONS ON LOAD (BULLETPROOF VERSION)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        // 1. Clean the URL exactly like we did in the Navbar
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        baseUrl = baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

        const res = await fetch(`${baseUrl}/api/regions`);
        
        if (!res.ok) throw new Error("Failed to fetch regions");
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
          setRegionData(data);
        }
      } catch (error) {
        console.error("Composer region fetch bypassed safely:", error);
        // Fallback so the dropdown is never completely empty
        setRegionData([{ state: "Kerala", districts: [{ name: "Thrissur", locals: ["Irinjalakuda"] }] }]);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const normalizedCredits = {
      reporter: {
        name:
          initialData?.credits?.reporter?.name || initialData?.reportedBy || "",
        avatarUrl: initialData?.credits?.reporter?.avatarUrl || "",
      },
      photographer: {
        name:
          initialData?.credits?.photographer?.name ||
          initialData?.photographedBy ||
          "",
        avatarUrl: initialData?.credits?.photographer?.avatarUrl || "",
      },
    };

    setFormData({
      ...initialData,
      credits: normalizedCredits,
    });

    setEditorMode(defaultMode);
    setShortUrl(initialShortUrl);

    const existingImages =
      initialData?.media?.filter((m: any) => m.type === "image") || [];
    if (existingImages.length > 0) {
      setMediaList(
        existingImages.map((img: any) => ({
          file: null,
          url: img.url,
          credit: img.credit || "",
        })),
      );
    } else {
      setMediaList([{ file: null, url: "", credit: "" }]);
    }
  }, [initialData, defaultMode, initialShortUrl]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const finalValue = type === "checkbox" ? checked : value;

    if (name.startsWith("location.")) {
      const child = name.split(".")[1];
      setFormData((prev: any) => ({
        ...prev,
        location: { ...prev.location, [child]: finalValue },
      }));
    } else if (name.startsWith("credits.")) {
      const parts = name.split(".");
      const role = parts[1]; 
      const field = parts[2]; 
      setFormData((prev: any) => ({
        ...prev,
        credits: {
          ...prev.credits,
          [role]: { ...prev.credits?.[role], [field]: finalValue },
        },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    }
    setError("");
  };

  const handleMediaChange = (
    index: number,
    field: keyof MediaItem,
    value: any,
  ) => {
    const newList = [...mediaList];
    newList[index] = { ...newList[index], [field]: value };
    setMediaList(newList);
  };

  const handleFileSelectForCrop = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage({ src: reader.result as string, index });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const addMediaSlot = () =>
    setMediaList([...mediaList, { file: null, url: "", credit: "" }]);
  const removeMediaSlot = (index: number) =>
    setMediaList(mediaList.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let articlePayload: any = { ...formData };
      let finalMedia: { type: string; url: string; credit?: string }[] = [];
      let finalCredits = { ...articlePayload.credits };

      if (creditFiles.reporter) {
        const reporterUrl = await uploadImage(
          creditFiles.reporter,
          `${formData.headline}-reporter`,
        );
        finalCredits.reporter.avatarUrl = reporterUrl;
      }
      if (creditFiles.photographer) {
        const photographerUrl = await uploadImage(
          creditFiles.photographer,
          `${formData.headline}-photog`,
        );
        finalCredits.photographer.avatarUrl = photographerUrl;
      }

      if (!finalCredits.reporter?.name) delete finalCredits.reporter;
      if (!finalCredits.photographer?.name) delete finalCredits.photographer;
      articlePayload.credits = finalCredits;

      if (editorMode === "shorts") {
        const youtubeId = shortUrl.split("/").pop()?.split("?")[0];
        if (!youtubeId) throw new Error("Invalid YouTube Shorts URL");

        articlePayload = {
          ...articlePayload,
          body: "YouTube Short",
          category: "Shorts",
          location: { ward: "All Places" },
          media: [{ type: "youtube-short", url: youtubeId }],
        };
      } else if (editorMode === "ad") {
        if (shortUrl) {
          const youtubeId = shortUrl.split("/").pop()?.split("?")[0];
          if (youtubeId)
            finalMedia.push({ type: "youtube-short", url: youtubeId });
        } else if (mediaList[0]?.file) {
          const imageUrl = await uploadImage(
            mediaList[0].file,
            formData.headline,
          );
          finalMedia.push({
            type: "image",
            url: imageUrl,
            credit: mediaList[0].credit,
          });
        } else if (mediaList[0]?.url) {
          finalMedia.push({
            type: "image",
            url: mediaList[0].url,
            credit: mediaList[0].credit,
          });
        }

        articlePayload = {
          ...articlePayload,
          body: "Sponsored Advertisement",
          category: "Advertisement",
          location: {
            ward: "All Places",
            landmark: formData.location.landmark || "Global (Anywhere)",
          },
          media: finalMedia,
        };
      } else {
        for (const item of mediaList) {
          if (item.file) {
            const imageUrl = await uploadImage(item.file, formData.headline);
            finalMedia.push({
              type: "image",
              url: imageUrl,
              credit: item.credit,
            });
          } else if (item.url) {
            finalMedia.push({
              type: "image",
              url: item.url,
              credit: item.credit,
            });
          }
        }
        articlePayload.media = finalMedia;
      }

      if (editingId) {
        await updateArticle(editingId, articlePayload);
      } else {
        await createArticle(articlePayload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save content");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {editingId ? "Edit Content" : "Compose Content"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Draft, format, and publish to your feeds.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingId && defaultMode !== "ad" && defaultMode !== "obituary" && (
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full">
              <button
                type="button"
                onClick={() => setEditorMode("news")}
                className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${editorMode === "news" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"}`}
              >
                Written Article
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("shorts")}
                className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${editorMode === "shorts" ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"}`}
              >
                YouTube Short
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-500/20 text-sm font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-max border border-gray-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "published" })}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${formData.status === "published" ? "bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Globe className="w-4 h-4" /> Published
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "draft" })}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${formData.status === "draft" ? "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <EyeOff className="w-4 h-4" /> Draft
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {editorMode === "shorts"
                ? "Short Title"
                : editorMode === "ad"
                  ? "Ad Title / Campaign Name"
                  : editorMode === "obituary"
                    ? "Name of Deceased"
                    : "Headline"}
            </label>
            <input
              type="text"
              name="headline"
              required
              value={formData.headline}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm"
              placeholder={
                editorMode === "shorts"
                  ? "Catchy video title..."
                  : editorMode === "ad"
                    ? "e.g., Summer Sale Promo..."
                    : editorMode === "obituary"
                      ? "e.g., John Doe (85), beloved father..."
                      : "e.g., Thrissur Pooram preparations begin..."
              }
            />
          </div>

          {editorMode === "shorts" ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                YouTube Shorts Link
              </label>
              <input
                type="url"
                required
                value={shortUrl}
                onChange={(e) => setShortUrl(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                placeholder="https://www.youtube.com/shorts/..."
              />
            </div>
          ) : editorMode === "ad" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">
                    Target Redirect Link (CTA)
                  </label>
                  <input
                    type="url"
                    required
                    name="externalLink"
                    value={formData.externalLink || ""}
                    onChange={handleChange}
                    className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm"
                    placeholder="https://your-sponsor-website.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">
                    Placement Zone
                  </label>
                  <select
                    name="location.landmark"
                    value={formData.location.landmark || ""}
                    onChange={handleChange}
                    className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm cursor-pointer"
                  >
                    <option value="">-- Select Target Zone --</option>
                    {AD_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Video Ad (YouTube Link)
                  </label>
                  <input
                    type="url"
                    value={shortUrl}
                    onChange={(e) => setShortUrl(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm"
                    placeholder="Optional: https://youtube.com/shorts/..."
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex flex-col justify-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    {mediaList[0]?.url || mediaList[0]?.file
                      ? "Update Poster Ad"
                      : "OR Poster Ad (Image Upload)"}
                  </label>

                  {(mediaList[0]?.url || mediaList[0]?.file) && (
                    <div className="mb-4 relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                      <img
                        src={mediaList[0].file ? URL.createObjectURL(mediaList[0].file) : mediaList[0].url}
                        alt="Current Ad"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                          {mediaList[0].file ? "Ready for Upload" : "Current Image"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label htmlFor="ad-media-upload" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shadow-sm">
                      {mediaList[0]?.file ? "Re-Crop New Image" : mediaList[0]?.url ? "Replace Ad Image" : "Choose Image"}
                    </label>
                    <input
                      id="ad-media-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelectForCrop(0, e)}
                      className="hidden"
                    />
                    {mediaList[0]?.file && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl space-y-4">
                <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-red-500" /> Article Credits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {editorMode === "obituary" ? "Submitted By / Family Contact" : "Reporter Name"}
                    </label>
                    <input
                      type="text"
                      name="credits.reporter.name"
                      value={formData.credits?.reporter?.name || ""}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                      placeholder={editorMode === "obituary" ? "e.g., Family Member Name" : "e.g., Desk Reporter"}
                    />
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-1">
                      Avatar / Photo (Optional)
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <label htmlFor="reporter-avatar-upload" className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        {creditFiles.reporter ? "Change Avatar" : "Choose Avatar"}
                      </label>
                      <input
                        id="reporter-avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCreditFiles((prev) => ({ ...prev, reporter: e.target.files?.[0] || null }))}
                        className="hidden"
                      />
                      {creditFiles.reporter && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓ Attached</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Lead Photographer Name
                    </label>
                    <input
                      type="text"
                      name="credits.photographer.name"
                      value={formData.credits?.photographer?.name || ""}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                      placeholder="e.g., Staff Photographer"
                    />
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 pt-1">
                      Avatar / Photo (Optional)
                    </label>
                    
                    <div className="flex items-center gap-3">
                      <label htmlFor="photographer-avatar-upload" className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        {creditFiles.photographer ? "Change Avatar" : "Choose Avatar"}
                      </label>
                      <input
                        id="photographer-avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCreditFiles((prev) => ({ ...prev, photographer: e.target.files?.[0] || null }))}
                        className="hidden"
                      />
                      {creditFiles.photographer && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓ Attached</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 mt-2">
                  Article Body
                </label>
                <RichTextEditor
                  value={formData.body}
                  onChange={(content: string) =>
                    setFormData((prev: any) => ({ ...prev, body: content }))
                  }
                  placeholder="Write the full story here with formatting..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Media Attachments
                </label>

                <div className="space-y-3">
                  {mediaList.map((media, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl relative group transition-all"
                    >
                      {mediaList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMediaSlot(index)}
                          className="absolute top-3 right-3 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 gap-4 items-center">
                        <div className="w-full">
                          
                          {(media.url || media.file) && (
                            <div className="mb-4 relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-900">
                              <img 
                                src={media.file ? URL.createObjectURL(media.file) : media.url} 
                                alt="Media Preview" 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                                  {media.file ? "Ready for Upload" : "Live Image"}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <label
                              htmlFor={`media-upload-${index}`}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shadow-sm"
                            >
                              {media.file ? "Re-Crop New Image" : media.url ? "Replace Existing Image" : "Choose Image"}
                            </label>
                            <input
                              id={`media-upload-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileSelectForCrop(index, e)}
                              className="hidden"
                            />
                            {media.file && (
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                ✓ Cropped & Ready
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMediaSlot}
                  className="flex items-center gap-2 px-4 py-2 mt-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                >
                  <Plus className="w-4 h-4" /> Add Another Photo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={editorMode === "obituary"}
                    className={`w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none ${editorMode === "obituary" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* ⚡ THE DYNAMIC LOCATION OPTGROUP DROPDOWN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Ward / Target Region
                  </label>
                  <select
                    name="location.ward"
                    value={formData.location.ward || ""}
                    onChange={handleChange}
                    className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    <option value="">-- Select Target --</option>
                    {regionData.map((stateObj) => 
                      stateObj.districts.map((district: any) => (
                        <optgroup 
                          key={district.name} 
                          label={`${district.name} District`} 
                          className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
                        >
                          {district.locals.map((local: string) => (
                            <option 
                              key={local} 
                              value={local} 
                              className="font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#111]"
                            >
                              {local}
                            </option>
                          ))}
                        </optgroup>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="location.landmark"
                    value={formData.location.landmark}
                    onChange={handleChange}
                    className="w-full p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none"
                    placeholder="e.g., Vadakkunnathan"
                  />
                </div>
              </div>

              {/* ⚡ PUBLISHING CONTROLS (Breaking & Ticker) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                
                {/* Breaking News Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isBreaking"
                    id="isBreaking"
                    checked={formData.isBreaking || false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                  />
                  <label
                    htmlFor="isBreaking"
                    className="text-sm font-bold text-red-600 dark:text-red-400 cursor-pointer select-none"
                  >
                    🚨 Mark as Breaking News
                  </label>
                </div>

                {/* Vertical Divider (Hidden on mobile) */}
                <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                {/* Pin to Ticker Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isTicker"
                    id="isTicker"
                    checked={formData.isTicker || false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="isTicker"
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer select-none"
                  >
                    📌 Pin to News Ticker
                  </label>
                </div>

              </div>
            </>
          )}

          <div className="pt-8 mt-6 border-t border-gray-100 dark:border-white/10 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-red-400 dark:bg-red-800 cursor-not-allowed"
                  : formData.status === "draft"
                    ? "bg-amber-600 hover:bg-amber-700 active:scale-[0.99]"
                    : editorMode === "ad"
                      ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                      : "bg-red-600 hover:bg-red-700 active:scale-[0.99]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : formData.status === "draft" ? (
                editingId ? (
                  "Update Draft"
                ) : (
                  "Save as Draft"
                )
              ) : editingId ? (
                "Update Live Content"
              ) : (
                "Publish to Live Feed"
              )}
            </button>
          </div>
        </form>
      </div>

      {croppingImage && (
        <ImageCropperModal
          imageSrc={croppingImage.src}
          onCropDone={(croppedFile) => {
            handleMediaChange(croppingImage.index, "file", croppedFile);
            setCroppingImage(null);
          }}
          onCancel={() => setCroppingImage(null)}
        />
      )}
    </div>
  );
}
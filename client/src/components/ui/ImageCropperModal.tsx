"use client";
import React, { useRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
// import "cropperjs/dist/cropper.css";
import { X, Crop } from "lucide-react";

interface ImageCropperModalProps {
  imageSrc: string;
  onCropDone: (file: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropDone, onCancel }: ImageCropperModalProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  
  // ⚡ NEW: Track the aspect ratio. Defaults to 16:9
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // ⚡ FIX: Removed hardcoded 1200x675 width/height.
      // Now it respects whatever aspect ratio you chose, while preventing insanely huge files!
      cropper.getCroppedCanvas({
        maxWidth: 1920,
        maxHeight: 1920,
        imageSmoothingQuality: "high"
      }).toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
          onCropDone(croppedFile);
        }
      }, "image/jpeg", 0.9);
    }
  };

  // Helper to display current ratio
  const getRatioLabel = () => {
    if (aspectRatio === 16 / 9) return "16:9";
    if (aspectRatio === 9 / 16) return "9:16";
    if (aspectRatio === 4 / 3) return "4:3";
    if (aspectRatio === 1) return "1:1";
    if (Number.isNaN(aspectRatio)) return "Freeform";
    return "";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Crop className="w-5 h-5 text-red-600" /> CROP IMAGE
            {/* Dynamic Label */}
            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md ml-2 tracking-normal">
              {getRatioLabel()}
            </span>
          </h3>
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ⚡ NEW: ASPECT RATIO TOOLBAR */}
        <div className="flex items-center justify-start sm:justify-center gap-2 p-3 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10 overflow-x-auto custom-scrollbar">
          {[
            { label: '16:9 (Hero)', value: 16 / 9 },
            { label: '4:3 (Standard)', value: 4 / 3 },
            { label: '1:1 (Square)', value: 1 },
            { label: '9:16 (Shorts)', value: 9 / 16 },
            { label: 'Freeform', value: NaN },
          ].map((ratio) => {
            const isActive = Number.isNaN(ratio.value) ? Number.isNaN(aspectRatio) : aspectRatio === ratio.value;
            
            return (
              <button
                key={ratio.label}
                type="button"
                onClick={() => {
                  setAspectRatio(ratio.value);
                  // ⚡ THE FIX: Explicitly force the cropper instance to resize instantly!
                  if (cropperRef.current?.cropper) {
                    cropperRef.current.cropper.setAspectRatio(ratio.value);
                  }
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-red-600 text-white shadow-sm" 
                    : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5"
                }`}
              >
                {ratio.label}
              </button>
            );
          })}
        </div>

        <div className="w-full bg-gray-900 h-[50vh] sm:h-[60vh] relative">
          <Cropper
            src={imageSrc}
            style={{ height: "100%", width: "100%" }}
            initialAspectRatio={16 / 9}
            aspectRatio={aspectRatio} // ⚡ CHANGED: Now completely dynamic
            guides={true}
            ref={cropperRef}
            viewMode={1}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false} 
          />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-3 border-t border-gray-100 dark:border-white/10">
          <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors border border-gray-200 dark:border-white/10">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
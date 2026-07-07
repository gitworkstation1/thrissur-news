"use client";
import React, { useRef } from "react";
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

  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Extracts the cropped area and forces a high-res 16:9 canvas output
      cropper.getCroppedCanvas({
        width: 1200,
        height: 675,
      }).toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
          onCropDone(croppedFile);
        }
      }, "image/jpeg", 0.9);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Crop className="w-5 h-5 text-red-600" /> Crop Image to 16:9
          </h3>
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-gray-900 h-[50vh] sm:h-[60vh] relative">
          <Cropper
            src={imageSrc}
            style={{ height: "100%", width: "100%" }}
            initialAspectRatio={16 / 9}
            aspectRatio={16 / 9}
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
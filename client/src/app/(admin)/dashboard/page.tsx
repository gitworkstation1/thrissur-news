// client/src/app/(admin)/dashboard/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createArticle, uploadImage } from '@/lib/api';

// Hardcoded wards to match your backend exactly
const THRISSUR_WARDS = [
  "Thrissur Central", "East Fort", "Viyyur", "Ollur", 
  "Cheruthuruthy", "Kodungallur", "Guruvayur", "Puthukkad",
  "Chavakkad", "Kunnamkulam", "Wadakkanchery", "Anthikkad"
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [formData, setFormData] = useState({
    headline: '',
    body: '',
    isBreaking: false,
    category: 'News', // <-- Add this to initial state
    location: { ward: '', landmark: '' }
  });

  // The fixed handleChange function for nested objects!
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: finalValue }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    setError(''); // Clear errors when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let finalMedia = [];

      // 1. If there's an image, upload it to Cloudinary first
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        finalMedia.push({ type: 'image', url: imageUrl });
      }

      // 2. Attach the Cloudinary URL to the article data
      const articlePayload = {
        ...formData,
        media: finalMedia
      };

      // 3. Save the article to MongoDB
      await createArticle(articlePayload);
      router.push('/'); 
      
    } catch (err) {
      setError(err.message || 'Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Publish New Story</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Headline</label>
            <input
              type="text"
              name="headline"
              required
              value={formData.headline}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
              placeholder="e.g., Thrissur Pooram preparations begin..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Article Body</label>
            <textarea
              name="body"
              required
              rows={6}
              value={formData.body}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all"
              placeholder="Write the full story here..."
            />
          </div>


          {/* Image Upload */}
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none"
            >
              {["News", "Crime", "Politics", "Sports", "Business", "Education", "Local", "Health"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ward (Required)</label>
              <select
                name="location.ward"
                required
                value={formData.location.ward}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white outline-none"
              >
                <option value="">-- Select Ward --</option>
                {THRISSUR_WARDS.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
              <input
                type="text"
                name="location.landmark"
                value={formData.location.landmark}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none"
                placeholder="e.g., Vadakkunnathan Temple"
              />
            </div>
          </div>

          {/* Breaking News Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              name="isBreaking"
              id="isBreaking"
              checked={formData.isBreaking}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-600 cursor-pointer"
            />
            <label htmlFor="isBreaking" className="text-sm font-bold text-red-600 cursor-pointer select-none">
              🚨 Mark as Breaking News
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-700 hover:bg-green-800 shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-300 pb-20 transition-colors duration-300">
      
      {/* Floating Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-4 flex items-center gap-4 transition-colors duration-300">
        <Link href="/" className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 text-sm md:text-base leading-relaxed">
        
        <section>
          <p className="text-gray-500 dark:text-gray-400">Effective Date: August 2026</p>
          <p className="mt-4">
            Welcome to FidesNews ("we," "our," or "us"). We are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDPA) of India. This policy explains how we collect, process, and protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">1. Data We Collect & How We Use It</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Saved Preferences (Bookmarks):</strong> We store your saved news shorts and category preferences. This data is processed locally on your device or linked to your account to provide a personalized news feed.</li>
            <li><strong>Device & Usage Data:</strong> We collect non-identifiable analytics (such as device type and generic location like your ward or district) to optimize video delivery and app performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">2. Third-Party Services & YouTube</h2>
          <p>
            FidesNews utilizes the YouTube API Services to deliver high-quality video shorts. By using our platform and viewing embedded YouTube video content, you also agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" className="text-blue-600 dark:text-blue-400 underline">YouTube Terms of Service</a> and the <a href="https://policies.google.com/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 underline">Google Privacy Policy</a>. We do not independently store API data from YouTube beyond the caching required for immediate video playback.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">3. Data Retention</h2>
          <p>
            We retain your account data and saved bookmarks only as long as your account remains active. If you request account deletion, all associated personal data is permanently erased from our active servers within 30 days, in strict accordance with DPDPA guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">4. Your Rights (DPDPA 2023)</h2>
          <p>As a user based in India, you hold the following rights regarding your digital data:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>The right to access a summary of your personal data being processed.</li>
            <li>The right to correct, complete, or update your data.</li>
            <li>The right to request the erasure of your personal data.</li>
            <li>The right to withdraw your consent at any time through your account settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">5. Grievance Officer</h2>
          <p>
            For any data-related concerns, to exercise your rights, or to withdraw consent, please contact our Data Protection Grievance Officer at: <br/>
            <strong>Email:</strong> networkcontactofficial@gmail.com <br/>
            <strong>Response Time:</strong> We aim to resolve all data grievances within 7 working days.
          </p>
        </section>

      </div>
    </div>
  );
}
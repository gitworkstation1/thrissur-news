import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-300 pb-20 transition-colors duration-300">
      
      {/* Floating Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-4 flex items-center gap-4 transition-colors duration-300">
        <Link href="/" className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 text-sm md:text-base leading-relaxed">
        
        <section>
          <p className="text-gray-500 dark:text-gray-400">Last Updated: August 2026</p>
          <p className="mt-4">
            Welcome to FidesNews. By accessing our website, mobile application, or any of our news delivery services, you agree to comply with and be bound by the following terms and conditions.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">1. Service Description</h2>
          <p>
            FidesNews is a digital journalism platform providing hyperlocal news, short-form video content, and curated articles. Our content is designed for informational purposes and community awareness.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">2. User Conduct</h2>
          <p>By utilizing our platform, you agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Republish, scrape, or commercially exploit our original reporting without explicit written permission.</li>
            <li>Use the platform to distribute false information, hate speech, or malicious software.</li>
            <li>Attempt to bypass our security protocols or interfere with the delivery of our video feeds.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">3. Third-Party Content</h2>
          <p>
            Our feed frequently features embedded video players sourced from third parties, primarily YouTube. We do not claim ownership over externally hosted videos, and your interaction with these embeds is governed by the respective platform's terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">4. Disclaimer of Warranties</h2>
          <p>
            While we strive for the utmost journalistic accuracy, FidesNews delivers content "as is." We do not warrant that our servers will operate entirely free from latency or that our external video feeds (via SRT, RTMP, or API) will remain uninterrupted during live broadcasts.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising from the use of FidesNews shall be subject to the exclusive jurisdiction of the courts located in Kerala, India.
          </p>
        </section>

        <section>
          <h2 className="text-gray-900 dark:text-white text-lg font-bold mb-3">6. Contact Us</h2>
          <p>
            If you have any questions regarding these Terms & Conditions, please contact us at <strong>networkcontactofficial@gmail.com</strong>.
          </p>
        </section>

      </div>
    </div>
  );
}
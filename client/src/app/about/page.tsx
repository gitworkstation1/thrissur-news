import Link from "next/link";
import { ArrowLeft, Newspaper, Radio, Users, ShieldCheck } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-300 pb-20 transition-colors duration-300">
      
      {/* Floating Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-4 flex items-center gap-4 transition-colors duration-300">
        <Link href="/" className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">About FidesNews</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 text-sm md:text-base leading-relaxed">
        
        {/* Mission Statement */}
        <section className="space-y-4">
          <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full">
            Hyperlocal Journalism
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Keeping Communities Informed, Connected, and Ahead.
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            FidesNews is a modern digital news network engineered to deliver fast, accurate, and impactful stories directly from the grassroots. From breaking developments to hyper-local ward-level updates, our mission is to empower communities with reliable journalism.
          </p>
        </section>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hyperlocal Focus</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We cover the stories that matter most right in your neighborhood, bringing transparency and local accountability to the forefront.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Real-Time Broadcasting</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Equipped with custom SRT protocol streams and multi-feed mobile field reporting units, we bring live event coverage straight to your screens.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">The Stringer Network</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our decentralized network of field stringers uses secure mobile links to broadcast live footage instantly into our master studio control room.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm space-y-3">
            <div className="w-10 h-10 bg-red-600/10 dark:bg-red-600/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verified Integrity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              In an era of rapid digital noise, we adhere to strict fact-checking protocols and full compliance with regional data privacy standards.
            </p>
          </div>

        </div>

        {/* Contact info section */}
        <section className="pt-6 border-t border-gray-200 dark:border-white/10 space-y-3">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold">Get in Touch</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Have a news tip or want to reach our editorial desk? Contact us at <strong className="text-gray-900 dark:text-white">editor@fidesnews.in</strong> or visit our studio headquarters in Thrissur, Kerala.
          </p>
        </section>

      </div>
    </div>
  );
}
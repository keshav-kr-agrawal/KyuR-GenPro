"use client";
import React, { useState } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const isDark = theme === 'dark';
  const bgMain = isDark ? "bg-black" : "bg-[#F9FAFB]";
  const textMain = isDark ? "text-green-500" : "text-gray-800";
  const cardBg = isDark ? "bg-black border-green-500/30" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen font-mono transition-colors duration-500 flex flex-col ${bgMain} ${textMain}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-500 ${isDark ? "bg-black/80 border-green-900" : "bg-white border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="font-bold text-lg tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={18} /> BACK_TO_LAB
          </Link>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200/20"><Sun size={18} /></button>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <div className={`p-8 rounded-lg border ${cardBg}`}>
            <h1 className="text-4xl font-black tracking-tighter mb-8 border-b border-green-500/30 pb-4">TERMS_OF_SERVICE</h1>
            <div className="space-y-8 text-sm leading-relaxed">
                <p>By accessing KyurGen Lab, you initiate a binding agreement with the following protocol:</p>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">1. Usage Rights</h2>
                    <p className="opacity-80">You are granted a non-exclusive right to use the generated assets for personal or commercial purposes upon successful payment. You confirm you own the rights to any URLs provided as input.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">2. Service Availability</h2>
                    <p className="opacity-80">We strive for 99.9% uptime but acknowledge the experimental nature of AI technologies. Service may be interrupted for maintenance or upgrades.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">3. Liability</h2>
                    <p className="opacity-80">KyurGen Lab is not liable for any direct or indirect damages arising from the use of generated QR codes. Verify all codes before mass printing.</p>
                </section>
            </div>
        </div>
      </main>
      
      <footer className={`border-t py-12 mt-12 transition-colors duration-500 ${isDark ? 'bg-black border-green-900' : 'bg-gray-50 border-gray-200'}`}>
         {/* FIXED: Plain text, no nested block errors */}
         <div className="max-w-7xl mx-auto px-6 text-center text-[10px] font-bold uppercase tracking-widest">Terminating Session...</div>
      </footer>
    </div>
  );
}
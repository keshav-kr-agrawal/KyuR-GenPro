"use client";
import React, { useState } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Refund() {
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
            <h1 className="text-4xl font-black tracking-tighter mb-8 border-b border-green-500/30 pb-4">REFUND_PROTOCOL</h1>
            <div className="space-y-8 text-sm leading-relaxed">
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">1. Digital Nature</h2>
                    <p className="opacity-80">Due to the immediate, irrevocable nature of digital asset generation, we generally do not offer refunds once a QR code has been successfully generated and unlocked.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">2. Exception Handling</h2>
                    <p className="opacity-80">If a technical failure occurs (e.g., payment deducted but asset not unlocked), a full refund will be processed immediately upon verification.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">3. Dispute Resolution</h2>
                    <p className="opacity-80">Initiate a dispute sequence by contacting: <span className="font-bold">keshav@sparsh-mukthi.xyz</span>. Please include your Transaction ID.</p>
                </section>
            </div>
        </div>
      </main>
      <footer className={`border-t py-12 mt-12 transition-colors duration-500 ${isDark ? 'bg-black border-green-900' : 'bg-gray-50 border-gray-200'}`}>
         {/* FIXED */}
         <div className="max-w-7xl mx-auto px-6 text-center text-[10px] font-bold uppercase tracking-widest">End of File</div>
      </footer>
    </div>
  );
}
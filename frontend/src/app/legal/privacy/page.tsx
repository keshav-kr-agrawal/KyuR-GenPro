"use client";
import React, { useState } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); 
  const isDark = theme === 'dark';

  const bgMain = isDark ? "bg-black" : "bg-[#F9FAFB]";
  const textMain = isDark ? "text-green-500" : "text-gray-800";
  const footerText = isDark ? "text-green-800" : "text-gray-500";
  const cardBg = isDark ? "bg-black border-green-500/30" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen font-mono transition-colors duration-500 flex flex-col ${bgMain} ${textMain}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-500 ${isDark ? "bg-black/80 border-green-900" : "bg-white border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="font-bold text-lg tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={18} />
            BACK_TO_LAB
          </Link>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200/20"><Sun size={18} /></button>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <div className={`p-8 rounded-lg border ${cardBg}`}>
            <h1 className="text-4xl font-black tracking-tighter mb-8 border-b border-green-500/30 pb-4">PRIVACY_MANIFESTO</h1>
            <div className="space-y-8 text-sm leading-relaxed">
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">1. Data Minimization</h2>
                    <p className="opacity-80">We collect strictly what is necessary to generate your assets. This includes the URL and Prompt provided during generation. We do not store payment credentials on our servers.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">2. Ephemeral Storage</h2>
                    <p className="opacity-80">Generated assets are stored securely via Supabase. We reserve the right to purge unclaimed assets after 24 hours to maintain system efficiency.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">3. Payment Security</h2>
                    <p className="opacity-80">All financial transactions are handled off-site by Razorpay (PCI-DSS Compliant). We only receive a transaction success/failure signal.</p>
                </section>
                <section>
                    <h2 className="text-lg font-bold mb-2 uppercase tracking-widest">4. Contact Protocol</h2>
                    <p className="opacity-80">For privacy inquiries, establish a connection at: <span className="font-bold">keshav@sparsh-mukthi.xyz</span></p>
                </section>
            </div>
        </div>
      </main>

      <footer className={`border-t py-12 mt-12 transition-colors duration-500 ${isDark ? 'bg-black border-green-900' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-bold text-lg tracking-tighter flex items-center gap-2">
                <div className={`w-3 h-3 ${isDark ? 'bg-green-500' : 'bg-black'}`}></div>
                KyurGen_{isDark ? 'GHOST' : 'LAB'}
            </div>
            {/* FIXED: Changed <p> to <div> */}
            <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${footerText}`}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Secure
            </div>
        </div>
      </footer>
    </div>
  );
}
"use client";
import React, { useState } from 'react';
import { Sun, Moon, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
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
            <h1 className="text-4xl font-black tracking-tighter mb-8 border-b border-green-500/30 pb-4">ESTABLISH_UPLINK</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                <div className={`p-6 border rounded hover:bg-green-500/10 transition-colors ${isDark ? 'border-green-500/30' : 'border-gray-200'}`}>
                    <Mail className="mb-4 opacity-70" />
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Electronic Mail</h3>
                    <p className="opacity-80">keshav@hikat.xyz</p>
                </div>

                <div className={`p-6 border rounded hover:bg-green-500/10 transition-colors ${isDark ? 'border-green-500/30' : 'border-gray-200'}`}>
                    <Phone className="mb-4 opacity-70" />
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Signal Line</h3>
                    <p className="opacity-80">+91 9263225604</p>
                </div>

                {/* <div className={`p-6 border rounded hover:bg-green-500/10 transition-colors ${isDark ? 'border-green-500/30' : 'border-gray-200'} md:col-span-2`}>
                    <MapPin className="mb-4 opacity-70" />
                    <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Base of Operations</h3>
                    <p className="opacity-80">Bangalore Institute of Technology, KR Road, VV Puram, Bangalore, Karnataka - 560004</p>
                </div> */}
            </div>
        </div>
      </main>

      <footer className={`border-t py-12 mt-12 transition-colors duration-500 ${isDark ? 'bg-black border-green-900' : 'bg-gray-50 border-gray-200'}`}>
         {/* FIXED: Changed from flex to just center text or use div */}
         <div className="max-w-7xl mx-auto px-6 text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Channel Open
         </div>
      </footer>
    </div>
  );
}
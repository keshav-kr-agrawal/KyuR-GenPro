import React from 'react';

export default function BrandLogo({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark';
  const borderColor = isDark ? "border-green-500" : "border-black";
  const bgColor = isDark ? "bg-green-500" : "bg-black";
  const textColor = isDark ? "text-green-500" : "text-black";

  return (
    <div className={`flex items-center gap-3 select-none ${textColor}`}>
      {/* THE ICON: Square inside a Square (QR Finder Pattern) */}
      <div className={`w-6 h-6 border-2 ${borderColor} flex items-center justify-center transition-all duration-500`}>
        <div className={`w-2.5 h-2.5 ${bgColor} transition-all duration-500`}></div>
      </div>
      
      {/* THE TEXT */}
      <div className="font-black text-xl tracking-tighter">
        KyurGen_<span className={isDark ? "opacity-100" : "opacity-40"}>{isDark ? 'GHOST' : 'LAB'}</span>
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 1. HIGH-PERFORMANCE SEO CONFIGURATION
export const metadata: Metadata = {
  title: "KyurGen_GHOST | High-Fidelity AI QR Code Generator",
  description: "Generate artistic, high-fidelity AI QR codes instantly. No subscription. Pay once, own forever. Secure, ephemeral, and 100% anonymous.",
  keywords: ["AI QR Code", "Stable Diffusion QR", "Artistic QR Generator", "Hacker QR Code", "Best QR Code Generator", "No Subscription AI"],
  authors: [{ name: "Keshav Agrawal", url: "https://keshav-portfolio-vert.vercel.app" }],
  
  // 👇 GOOGLE VERIFICATION CODE ADDED HERE
  verification: {
    google: "4dkgKoWfBhnqgCSDBXHrcsrwVWQnuGtVurLie9oOhTk",
  },

  openGraph: {
    title: "KyurGen_GHOST | The AI QR Terminal",
    description: "Create undetectable, artistic AI QR codes. 100% Ownership. Zero Subscriptions.",
    url: "https://kyu-r-gen-pro.vercel.app", // Using Vercel link for now
    siteName: "KyurGen Labs",
    images: [
      {
        url: "/og-image.jpg", // (Optional) Add a screenshot in your public folder later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-green-500`}
      >
        {/* 2. GOOGLE ADS SCRIPT (Placeholder) */}
        {/* Make sure to replace ca-pub-XXXX with your actual ID when approved */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        />
        
        {children}
      </body>
    </html>
  );
}
"use client";
import BrandLogo from '../components/BrandLogo';
import React, { useState, useEffect } from 'react';
import { QrCode, Download, Zap, Sparkles, Eye, ExternalLink, Github, Twitter, ShieldCheck, ScanLine, Trash2, Lock } from 'lucide-react';
import HackerTerminal from '../components/HackerTerminal';

// *** IMAGE CONFIG ***
const IDLE_AI_IMAGE = "/water-qr.jpg"; 

// *** HELPER: Load Razorpay Script Dynamically ***
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function KyurGenDual() {
  // 1. FORCED DARK THEME (No more light mode)
  const theme = 'dark'; 
  
  const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard');
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preview' | 'purchased'>('idle');
  const [artId, setArtId] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [isIndian, setIsIndian] = useState(false);

  // *** PRODUCTION CONFIG ***
  const API_BASE = 'https://kyur-genpro.onrender.com'; 

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setIsIndian(tz.includes("India") || tz.includes("Calcutta"));
  }, []);

  const handleGenerate = async () => {
    if (!url) return alert("URL REQUIRED");
    setLoading(true);
    setStatus('idle');
    setArtId(null);
    setDisplayImage(null);

    const endpoint = activeTab === 'standard' ? `${API_BASE}/generate/standard` : `${API_BASE}/generate/ai`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt: prompt || "cyberpunk city, neon lights" })
      });
      const data = await res.json();
      
      if (data.art_id) {
        setArtId(data.art_id);
        setDisplayImage(data.preview_url);
        setStatus('preview');
      } else {
        throw new Error("Generation failed");
      }
    } catch (e) {
      alert("Backend Error: The server is waking up (it may take 50 seconds on the free plan). Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Discard this design?")) return;
    setLoading(true);
    if (artId) await fetch(`${API_BASE}/regenerate`, { method: 'POST', body: JSON.stringify({ art_id: artId }), headers: {'Content-Type': 'application/json'} });
    setStatus('idle');
    setDisplayImage(null);
    setArtId(null);
    setLoading(false);
  };

  // *** PAYMENT HANDLER ***
  const handlePay = async () => {
    if (!artId) return;
    
    const confirmMsg = activeTab === 'standard' 
      ? `Pay ₹9 to remove watermark?` 
      : `Pay ₹13 to unlock Real AI QR?`;
      
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);

    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const amount = activeTab === 'standard' ? 9 : 13; 
      
      const orderRes = await fetch(`${API_BASE}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amount * 100 }) 
      });
      const orderData = await orderRes.json();

      if (orderData.error) {
          alert("Server Error: " + orderData.error);
          setLoading(false);
          return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "KyurGen Lab",
        description: activeTab === 'standard' ? "Standard QR Unlock" : "AI Art QR Unlock",
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  art_id: artId
              })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
              setDisplayImage(verifyData.download_url);
              setStatus('purchased');
              alert("Payment Successful! Asset Unlocked.");
          } else {
              alert("Verification Failed! Contact Support.");
          }
        },
        theme: {
          color: "#22c55e", // Green for hacker theme
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
    } catch (e) {
      console.error(e);
      alert("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  // STYLES (Locked to Dark Mode)
  const bgMain = "bg-black";
  const textMain = "text-green-500";
  const cardBg = "bg-black border-green-500/30";
  const btnPrimary = "bg-green-900/20 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black";
  const footerText = "text-green-800";
  const displayPrice = isIndian ? (activeTab === 'standard'?"₹9":"₹13") : (activeTab==='standard'?"$0.10":"$0.15");

  return (
    <div className={`min-h-screen font-mono transition-colors duration-500 flex flex-col ${bgMain} ${textMain}`}>
      
      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-500 bg-black/80 border-green-900`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <BrandLogo theme={'dark'} />
          <div className="text-[10px] font-bold tracking-widest text-green-700 animate-pulse">
            SYSTEM_SECURE
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: INPUT */}
        <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left-4 duration-500">
           <div className={`border-l-4 pl-6 py-2 border-green-500`}>
            <h1 className={`text-4xl font-black tracking-tighter mb-2 text-white`}>
              INITIATE <br/> GENERATION.
            </h1>
            <p className={`text-xs uppercase tracking-widest text-green-500 font-bold`}>
              Once Pay, Forever Yours. <br/>
              <span className="text-green-800 font-normal">Zero Subscription. 100% Ownership.</span>
            </p>
          </div>

          <div className={`grid grid-cols-2 gap-2 p-1 rounded-lg bg-green-900/10`}>
            {['standard', 'ai'].map((t) => (
              <button 
                key={t}
                onClick={() => { setActiveTab(t as any); setStatus('idle'); setDisplayImage(null); }} 
                className={`py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-md 
                  ${activeTab === t 
                    ? 'bg-green-900/30 text-green-400 shadow border border-green-800' 
                    : 'opacity-50 hover:opacity-100'}`}
              >
                {t === 'standard' ? <Zap size={14}/> : <Sparkles size={14}/>} {t}
              </button>
            ))}
          </div>

          <div className={`p-6 rounded-lg shadow-sm space-y-6 relative border transition-colors duration-500 ${cardBg}`}>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className={`w-full outline-none py-3 text-sm font-bold border-b-2 bg-transparent transition-all border-green-900 focus:border-green-500 text-white placeholder-green-900`} placeholder="https://..." />
            
            {activeTab === 'ai' && (
               <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className={`w-full outline-none py-3 text-sm font-bold border-b-2 bg-transparent transition-all h-24 resize-none border-green-900 focus:border-green-500 text-white placeholder-green-900`} placeholder="> Describe visual style (e.g. 'cyberpunk city, neon')" />
            )}

            <button onClick={handleGenerate} disabled={loading} className={`w-full font-black text-sm py-4 uppercase tracking-widest transition-all ${btnPrimary}`}>
              {loading ? "PROCESSING..." : "EXECUTE"}
            </button>
          </div>
        </div>

        {/* RIGHT: OUTPUT */}
        <div className={`lg:col-span-7 rounded-lg border shadow-sm p-2 flex flex-col relative min-h-[500px] transition-colors duration-500 ${cardBg}`}>
           
           {/* UNIFIED SUPER LOADING SCREEN */}
           {loading && (
             <div className="absolute inset-0 z-20 p-4 bg-black/95 backdrop-blur-md flex flex-col justify-center items-center">
               <div className="w-full max-w-md">
                   <HackerTerminal theme={'dark'} />
               </div>
               
               <div className="mt-8 text-center space-y-2 animate-pulse">
                   <p className="text-green-500 font-bold tracking-widest text-xs uppercase">
                       ESTABLISHING SECURE CONNECTION...
                   </p>
                   <p className="text-green-800 text-[10px] max-w-xs mx-auto">
                       (Server waking up... please hold.)
                   </p>
               </div>
             </div>
           )}

           {/* 3. IDLE STATE */}
           {!loading && !displayImage && (
             <div className="flex-1 flex flex-col items-center justify-center opacity-30 border-2 border-dashed m-4 rounded border-current">
                {activeTab === 'ai' ? (
                     <div className="text-center group cursor-pointer">
                        <img src={IDLE_AI_IMAGE} className="w-32 h-32 object-cover rounded opacity-50 mx-auto mb-2 grayscale group-hover:grayscale-0 transition-all" alt="Example" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <p className="font-bold tracking-widest text-sm text-green-500">NEURAL ENGINE READY</p>
                     </div>
                ) : (
                    <div className="text-center">
                        <QrCode size={48} className="mb-4 mx-auto text-green-500" />
                        <p className="font-bold tracking-widest text-sm text-green-500">AWAITING INPUT</p>
                    </div>
                )}
             </div>
           )}

           {/* 4. RESULT STATE */}
           {!loading && displayImage && (
             <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 p-8 w-full">
               
               {/* IMAGE FRAME */}
               <div className={`relative p-2 border-2 shadow-2xl mb-6 group bg-black border-green-900`}>
                  {status === 'preview' && (
                    <div className={`absolute -top-3 -right-3 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-30 ${activeTab === 'ai' ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {activeTab === 'ai' ? <><Eye size={12}/> SAMPLE VIEW</> : <><Lock size={12}/> PREVIEW MODE</>}
                    </div>
                  )}
                  {status === 'purchased' && (
                    <div className="absolute -top-3 -right-3 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-30">
                        <Zap size={12} /> UNLOCKED
                    </div>
                  )}
                  <img src={displayImage} alt="Result" className="w-full max-w-[280px] object-cover relative z-10" />
               </div>

               {/* STATUS TEXT */}
               {status === 'preview' && (
                 <div className="text-center mb-6">
                    {activeTab === 'standard' ? (
                        <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 justify-center"><ScanLine size={12}/> WATERMARKED. PAY TO REMOVE.</div>
                    ) : (
                        <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1 justify-center"><Eye size={12}/> DUMMY DATA. PAY TO UNLOCK REAL LINK.</div>
                    )}
                 </div>
               )}

               {/* CONTROLS */}
               <div className="w-full max-w-sm space-y-3">
                 {status === 'preview' ? (
                    <>
                        <button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm rounded-lg">
                            <Download size={16} /> Pay {displayPrice} & Unlock
                        </button>
                        <button onClick={handleRegenerate} className={`w-full font-bold py-3 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20`}>
                            <Trash2 size={12} /> Discard
                        </button>
                    </>
                 ) : (
                    <a href={displayImage} download={`KyurGen_${Date.now()}.png`} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm rounded-lg">
                        <Download size={16} /> Download High-Res
                    </a>
                 )}
               </div>
             </div>
           )}
        </div>
      </main>

      {/* --- SEO OPTIMIZED CONTENT SECTION (NEW) --- */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-green-900 mb-12">
        <h2 className="text-2xl font-black text-white mb-8 tracking-tighter">WHY CHOOSE KYURGEN_GHOST?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-green-700 leading-relaxed">
            <div className="space-y-4">
                <h3 className="text-green-500 font-bold uppercase tracking-widest">High-Fidelity AI QR Code Generator</h3>
                <p>Unlike standard generators, KyurGen uses advanced <span className="text-green-400">Stable Diffusion AI</span> to blend your URL into stunning, scannable art. Perfect for marketing, branding, and artistic portfolios.</p>
                
                <h3 className="text-green-500 font-bold uppercase tracking-widest">No Subscriptions. 100% Ownership.</h3>
                <p>Most AI tools trap you in monthly fees. We don't. You pay a small one-time fee to unlock your asset. Once paid, the QR code is <span className="text-green-400">yours forever</span>. No hidden costs.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-green-500 font-bold uppercase tracking-widest">Hacker-Grade Privacy</h3>
                <p>We believe in data minimalism. Your prompts and generated images are ephemeral. We do not track your scans or store your data long-term. This is a true <span className="text-green-400">Ghost Protocol</span> tool.</p>
                
                <h3 className="text-green-500 font-bold uppercase tracking-widest">Instant & Secure Payment</h3>
                <p>Powered by Razorpay, our transactions are encrypted and secure. Unlock your high-resolution, watermark-free QR code in seconds for less than the price of a coffee.</p>
            </div>
        </div>
      </section>

      {/* PROFESSIONAL FOOTER */}
      <footer className={`border-t py-12 transition-colors duration-500 bg-black border-green-900`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* BRAND */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="font-bold text-lg tracking-tighter flex items-center gap-2 text-green-500">
                <div className={`w-3 h-3 bg-green-500`}></div>
                KyurGen_GHOST
            </div>
            <p className={`text-xs max-w-xs leading-relaxed ${footerText}`}>
              The world's first ephemeral, high-fidelity AI asset generator. 
              Zero data retention. Zero tracking. 100% ownership.
            </p>
            <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${footerText}`}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              All Systems Operational
            </div>
          </div>

          {/* PROTOCOL */}
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-white`}>Legal</h4>
            <ul className={`space-y-2 text-xs ${footerText}`}>
              <li><a href="/legal/privacy" className="hover:underline flex items-center gap-1"><ShieldCheck size={10}/> Privacy Policy</a></li>
              <li><a href="/legal/terms" className="hover:underline">Terms & Conditions</a></li>
              <li><a href="/legal/refund" className="hover:underline">Refund Policy</a></li>
              <li><a href="/contact" className="hover:underline">Contact Us</a></li>
            </ul>
          </div>

          {/* ARCHITECT */}
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-white`}>Architect</h4>
            <div className={`text-xs space-y-1 ${footerText}`}>
              <p>Engineered by</p>
              <a href="https://keshav-portfolio-vert.vercel.app" target="_blank" className={`font-bold text-lg hover:underline flex items-center gap-1 text-green-500`}>
                Keshav <ExternalLink size={12}/>
              </a>
              <div className="flex items-center gap-1 mt-2">
                <span>under</span>
                <a href="https://hikat.company" target="_blank" className={`font-bold hover:underline text-white`}>HIKAT</a>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <Github size={16} className={`cursor-pointer ${footerText} hover:text-green-500`}/>
              <Twitter size={16} className={`cursor-pointer ${footerText} hover:text-green-500`}/>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
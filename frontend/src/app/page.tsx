"use client";
import BrandLogo from '../components/BrandLogo';
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Zap, Sparkles, Eye, ExternalLink, Github, Twitter, ShieldCheck, ScanLine, Trash2, Lock, XCircle, MousePointer2, Crosshair } from 'lucide-react';

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

// *** TYPE FOR GAME BUBBLES ***
type Bubble = {
  id: number;
  x: number;
  y: number;
};

export default function KyurGenDual() {
  const theme = 'dark'; 
  
  const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard');
  const [url, setUrl] = useState('https://'); // PRE-FILLED HTTPS
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preview' | 'purchased'>('idle');
  const [artId, setArtId] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [isIndian, setIsIndian] = useState(false);

  // *** GAME STATE ***
  const [gameScore, setGameScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // *** PRICING CONFIG ***
  const BASE_PRICE_STD_INR = 15;
  const BASE_PRICE_AI_INR = 19;
  const BASE_PRICE_STD_USD = 0.50;
  const BASE_PRICE_AI_USD = 0.99;

  // *** PRODUCTION CONFIG ***
  const API_BASE = 'https://kyur-genpro.onrender.com'; 

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setIsIndian(tz.includes("India") || tz.includes("Calcutta"));
  }, []);

  // *** GAME LOGIC ***
  useEffect(() => {
    if (loading) {
      setGameScore(0);
      setBubbles([]);
      gameIntervalRef.current = setInterval(() => {
        const newBubble = {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        };
        setBubbles((prev) => [...prev, newBubble]);
      }, 500);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [loading]);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setGameScore((prev) => prev + 1);
  };

  const getFinalPrice = () => {
    const base = isIndian 
      ? (activeTab === 'standard' ? BASE_PRICE_STD_INR : BASE_PRICE_AI_INR)
      : (activeTab === 'standard' ? BASE_PRICE_STD_USD : BASE_PRICE_AI_USD);
    const discountPercent = Math.min(gameScore, 60); 
    const final = base * (1 - discountPercent / 100);
    return isIndian ? Math.ceil(final) : Number(final.toFixed(2));
  };

  const handleGenerate = async () => {
    if (!url || url.length < 10) return alert("VALID URL REQUIRED");
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
      alert("Backend Error: The server is waking up. Please play the game while you wait!");
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

  const handlePay = async () => {
    if (!artId) return;
    const finalPrice = getFinalPrice();
    const currencySymbol = isIndian ? '₹' : '$';
    const confirmMsg = `Pay discounted price of ${currencySymbol}${finalPrice} to unlock?`;
    if (!window.confirm(confirmMsg)) return;
    setLoading(true);
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed.");
      setLoading(false);
      return;
    }
    try {
      const orderRes = await fetch(`${API_BASE}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Math.ceil(finalPrice * 100) }) 
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
        description: "Asset Unlock",
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
              alert("Verification Failed!");
          }
        },
        theme: { color: "#22c55e" },
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (e) {
      alert("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const bgMain = "bg-black";
  const textMain = "text-green-500";
  const cardBg = "bg-zinc-900/50 border-green-500/50"; 
  const btnPrimary = "bg-green-600 text-black border border-green-500 hover:bg-green-400 font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"; 
  const footerText = "text-green-800";
  const finalDisplayPrice = isIndian ? `₹${getFinalPrice()}` : `$${getFinalPrice()}`;
  const baseDisplayPrice = isIndian 
      ? (activeTab === 'standard' ? `₹${BASE_PRICE_STD_INR}` : `₹${BASE_PRICE_AI_INR}`)
      : (activeTab === 'standard' ? `$${BASE_PRICE_STD_USD}` : `$${BASE_PRICE_AI_USD}`);

  return (
    <div className={`min-h-screen font-mono transition-colors duration-500 flex flex-col ${bgMain} ${textMain}`}>
      
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
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-green-400">Target URL</label>
                <input 
                    type="text" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    className={`w-full outline-none py-3 px-4 rounded bg-green-900/20 border border-green-700 focus:border-green-400 text-white placeholder-green-700 font-bold transition-all`} 
                />
            </div>
            
            {activeTab === 'ai' && (
               <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-green-400">AI Art Prompt</label>
                   <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    className={`w-full outline-none py-3 px-4 rounded bg-green-900/20 border border-green-700 focus:border-green-400 text-white placeholder-green-700 font-bold transition-all h-24 resize-none`} 
                    placeholder="> e.g. 'Cyberpunk city, red neon lights'" 
                   />
               </div>
            )}

            <button onClick={handleGenerate} disabled={loading} className={`w-full text-sm py-4 uppercase tracking-widest transition-all rounded ${btnPrimary}`}>
              {loading ? "CALCULATING..." : "EXECUTE"}
            </button>

            {/* PRODUCT HUNT BADGE EMBED */}
            <div className="flex justify-center pt-4 border-t border-green-900/30">
                <a 
                  href="https://www.producthunt.com/products/kyurgen_ghost?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-kyurgen_ghost" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                >
                    <img 
                      alt="KyurGen_GHOST - AI QR Generator with a bubble game that hacks the price. | Product Hunt" 
                      width="250" 
                      height="54" 
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1055163&theme=light&t=1766870403863" 
                    />
                </a>
            </div>
          </div>
        </div>

        {/* RIGHT: OUTPUT / GAME */}
        <div className={`lg:col-span-7 rounded-lg border shadow-sm p-2 flex flex-col relative min-h-[500px] transition-colors duration-500 overflow-hidden ${cardBg}`}>
           
           {loading && (
             <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center cursor-crosshair">
                <div className="absolute top-4 left-0 w-full text-center z-30">
                    <p className="text-green-500 font-black text-xl tracking-tighter animate-pulse">SYSTEM HACK IN PROGRESS...</p>
                    <p className="text-white text-xs mt-2 uppercase tracking-widest bg-green-900/50 inline-block px-3 py-1 rounded border border-green-500">
                        <MousePointer2 className="inline w-3 h-3 mb-1 mr-1"/> Click Bubbles to Slash Price!
                    </p>
                    <div className="flex justify-center gap-8 mt-4 text-sm font-bold">
                        <div className="text-red-500 line-through opacity-50">{baseDisplayPrice}</div>
                        <div className="text-green-400 text-2xl animate-bounce">{finalDisplayPrice}</div>
                    </div>
                    <div className="text-[10px] text-green-700 mt-1">HACK SCORE: {gameScore}% DISCOUNT</div>
                </div>

                {bubbles.map(b => (
                    <button
                        key={b.id}
                        onClick={() => popBubble(b.id)}
                        style={{ top: `${b.y}%`, left: `${b.x}%` }}
                        className="absolute w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-400 text-green-400 flex items-center justify-center animate-ping hover:bg-green-500 hover:text-black transition-all cursor-pointer"
                    >
                        <Crosshair size={20}/>
                    </button>
                ))}
             </div>
           )}

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

           {!loading && displayImage && (
             <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 p-8 w-full">
               
               <div className={`relative p-2 border-2 shadow-2xl mb-6 group bg-black border-green-900`}>
                  {status === 'preview' && (
                    <div className={`absolute -top-3 -right-3 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-30 ${activeTab === 'ai' ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {activeTab === 'ai' ? <><Eye size={12}/> SAMPLE VIEW</> : <><Lock size={12}/> PREVIEW MODE</>}
                    </div>
                  )}

                  {status === 'preview' && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-60">
                          <XCircle className="text-red-600 w-full h-full p-8" strokeWidth={1} />
                          <div className="absolute text-red-600 font-black text-2xl -rotate-12 bg-black px-2 border border-red-600">PREVIEW ONLY</div>
                      </div>
                  )}

                  <img src={displayImage} alt="Result" className="w-full max-w-[280px] object-cover relative z-10" />
               </div>

               {status === 'preview' && (
                 <div className="text-center mb-6">
                    <div className="text-[10px] text-green-500 font-bold mb-2">
                        YOU HACKED {gameScore}% OFF!
                    </div>
                    {activeTab === 'standard' ? (
                        <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 justify-center"><ScanLine size={12}/> WATERMARKED. PAY TO REMOVE.</div>
                    ) : (
                        <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1 justify-center"><Eye size={12}/> DUMMY DATA. PAY TO UNLOCK REAL LINK.</div>
                    )}
                 </div>
               )}

               <div className="w-full max-w-sm space-y-3">
                 {status === 'preview' ? (
                    <>
                        <button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm rounded-lg animate-pulse">
                            <Download size={16} /> Pay {finalDisplayPrice} & Unlock
                        </button>
                        <button onClick={handleRegenerate} className={`w-full font-bold py-3 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20`}>
                            <Trash2 size={12} /> Discard & Retry
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

      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-green-900 mb-12">
        <h2 className="text-2xl font-black text-white mb-8 tracking-tighter">WHY CHOOSE KYURGEN_GHOST?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-green-700 leading-relaxed">
            <div className="space-y-4">
                <h3 className="text-green-500 font-bold uppercase tracking-widest">High-Fidelity AI QR Code Generator</h3>
                <p>Unlike standard generators, KyurGen uses advanced <span className="text-green-400">Stable Diffusion AI</span> to blend your URL into stunning, scannable art.</p>
                <h3 className="text-green-500 font-bold uppercase tracking-widest">No Subscriptions. 100% Ownership.</h3>
                <p>We don't trap you in monthly fees. You pay a small one-time fee. The QR code is <span className="text-green-400">yours forever</span>.</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-green-500 font-bold uppercase tracking-widest">Hacker-Grade Privacy</h3>
                <p>We believe in data minimalism. Your prompts and generated images are ephemeral. This is a true <span className="text-green-400">Ghost Protocol</span> tool.</p>
                <h3 className="text-green-500 font-bold uppercase tracking-widest">Instant & Secure Payment</h3>
                <p>Powered by Razorpay, our transactions are encrypted and secure.</p>
            </div>
        </div>
      </section>

      <footer className={`border-t py-12 transition-colors duration-500 bg-black border-green-900`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="font-bold text-lg tracking-tighter flex items-center gap-2 text-green-500">
                <div className={`w-3 h-3 bg-green-500`}></div>
                KyurGen_GHOST
            </div>
            <p className={`text-xs max-w-xs leading-relaxed ${footerText}`}>
              The world's first ephemeral, high-fidelity AI asset generator. 
              Zero data retention. Zero tracking. 100% ownership.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-white`}>Legal</h4>
            <ul className={`space-y-2 text-xs ${footerText}`}>
              <li><a href="/legal/privacy" className="hover:underline flex items-center gap-1"><ShieldCheck size={10}/> Privacy Policy</a></li>
              <li><a href="/legal/terms" className="hover:underline">Terms & Conditions</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest text-white`}>Architect</h4>
            <div className={`text-xs space-y-1 ${footerText}`}>
              <p>Engineered by</p>
              <a href="https://keshav-portfolio-vert.vercel.app" target="_blank" className={`font-bold text-lg hover:underline flex items-center gap-1 text-green-500`}>
                Keshav <ExternalLink size={12}/>
              </a>
              <div className="flex items-center gap-1 mt-2">
                <span>under</span>
                <a href="https://hikat.xyz/" target="_blank" className={`font-bold hover:underline text-white`}>HIKAT</a>
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
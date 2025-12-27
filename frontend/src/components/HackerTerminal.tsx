import React, { useState, useEffect, useRef } from 'react';

const BOOT_SEQUENCE = [
  "INITIALIZING_NEURAL_UPLINK...",
  "CONNECTING_TO_HUGGING_FACE_API...",
  "VERIFYING_HF_TOKEN_CREDENTIALS... [OK]",
  "ALLOCATING_GPU_RESOURCES... [A100_DETECTED]",
  "INJECTING_PROMPT_EMBEDDINGS...",
  "OPTIMIZING_CONTROLNET_WEIGHTS (1.50)...",
  "DENOISING_LATENT_SPACE...",
  "APPLYING_CYBERPUNK_AESTHETICS...",
  "GENERATING_HIGH_FIDELITY_ARTIFACT...",
  "FINALIZING_SECURITY_LAYERS...",
  "RENDERING_PREVIEW_STREAM..."
];

export default function HackerTerminal({ theme }: { theme: 'light' | 'dark' }) {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    
    // Add lines one by one
    const interval = setInterval(() => {
      if (currentIndex < BOOT_SEQUENCE.length) {
        setLines(prev => [...prev, BOOT_SEQUENCE[currentIndex]]);
        currentIndex++;
      } else {
        // Loop the last messages to keep it alive if it takes longer
        const loadingChars = ["/", "-", "\\", "|"];
        setLines(prev => {
            const newLines = [...prev];
            // Replace last line with spinning animation
            newLines[newLines.length - 1] = `PROCESSING_DATA_STREAM... ${loadingChars[Math.floor(Date.now() / 100) % 4]}`;
            return newLines;
        });
      }
    }, 800); // New line every 800ms

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const textColor = theme === 'dark' ? 'text-green-500' : 'text-green-600';
  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-900';

  return (
    <div className={`w-full max-w-md h-64 ${bgColor} rounded border-2 border-green-500/50 p-4 font-mono text-xs md:text-sm shadow-[0_0_20px_rgba(0,255,0,0.2)] flex flex-col`}>
      {/* Header */}
      <div className="border-b border-green-500/30 pb-2 mb-2 flex justify-between items-center opacity-70">
        <span>TERMINAL_V2.0</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Logs */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-1 ${textColor}`}>
        {lines.map((line, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="opacity-50 mr-2">{`>`}</span>
            {line}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
}
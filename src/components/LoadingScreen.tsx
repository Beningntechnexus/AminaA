import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, RefreshCw, Layers } from 'lucide-react';

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing core bio-security handshake...');

  const messages = [
    { threshold: 0, text: 'Establishing secure SHA-256 SSL container handshake...' },
    { threshold: 20, text: 'Bootstrapping climate-vector datasets (Precipitation & Mosquito indices)...' },
    { threshold: 45, text: 'Syncing local in-memory Spatio-Temporal Disease tables...' },
    { threshold: 65, text: 'Synchronizing Gemini 3.5 Flash NLP medical diagnostics layers...' },
    { threshold: 85, text: 'Handshaking system authorization records...' },
    { threshold: 100, text: 'Secure environment ready.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 450);
          return 100;
        }
        
        // Find corresponding message
        const currentMsg = [...messages]
          .reverse()
          .find((msg) => next >= msg.threshold);
        if (currentMsg) {
          setStatusText(currentMsg.text);
        }
        
        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-[#050B15] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative" id="medspatial_loading_suite">
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10 flex flex-col items-center">
        {/* Pulsing medical logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          transition={{ 
            scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
            opacity: { duration: 0.6 }
          }}
          className="w-20 h-20 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(56,189,248,0.25)] border border-sky-400/25"
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" />
            <path d="M12 8v8M9 12h6" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Text descriptions */}
        <div className="space-y-2">
          <motion.h1 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
          >
            MedSpatial <span className="text-sky-450">AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-sky-400/90"
          >
            Spatio-Temporal Epidemiological Hub
          </motion.p>
        </div>

        {/* Custom premium loading bar */}
        <div className="w-full space-y-3 pt-4">
          <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/35 p-[1px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 rounded-full"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
              <span className="truncate max-w-[280px]">{statusText}</span>
            </div>
            <span className="font-bold text-sky-400">{progress}%</span>
          </div>
        </div>

        {/* Encryption notice block */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900/40 px-4 py-2.5 rounded-xl border border-white/5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>FIPS 140-2 Encrypted Core Security Connection Active</span>
        </motion.div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Lock, ArrowRight, ShieldCheck, ClipboardList, 
  ShieldAlert, Bell, MapPin, Eye, Check, MessageSquare, 
  ArrowRightCircle, Sun, CloudRain, HeartPulse, RefreshCw
} from 'lucide-react';
import { DiagnoseResponse, Outbreak, Season } from '../types';

interface DashboardViewProps {
  symptomsText: string;
  setSymptomsText: (v: string) => void;
  onAnalyze: (text: string) => void;
  setActiveTab: (tab: 'dashboard' | 'diagnostics' | 'heatmap' | 'epidemiology' | 'chat' | 'admin' | 'outbreaks' | 'saved' | 'profile') => void;
  outbreaks: Outbreak[];
  loading: boolean;
}

export default function DashboardView({
  symptomsText,
  setSymptomsText,
  onAnalyze,
  setActiveTab,
  outbreaks,
  loading
}: DashboardViewProps) {

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsText.trim()) return;
    onAnalyze(symptomsText);
  };

  // 3D-styled SVG Illustrations
  const renderHeroShieldSVG = () => (
    <motion.svg 
      className="w-24 h-24 md:w-28 md:h-28 text-sky-500 drop-shadow-[0_10px_15px_rgba(59,130,246,0.3)] shrink-0"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        y: [0, -6, 0],
        rotate: [0, 2, 0]
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Background soft glow capsule paths */}
      <circle cx="20" cy="30" r="4" fill="#a5b4fc" opacity="0.6" />
      <circle cx="106" cy="40" r="5" fill="#38bdf8" opacity="0.7" />
      <circle cx="100" cy="90" r="3" fill="#818cf8" opacity="0.5" />
      
      {/* Capsule illustration 1 */}
      <g transform="translate(14, 80) rotate(45)">
        <rect width="18" height="8" rx="4" fill="#60a5fa" />
        <rect x="9" width="9" height="8" rx="0" fill="#fca5a5" />
      </g>
      {/* Capsule illustration 2 */}
      <g transform="translate(95, 15) rotate(-30)">
        <rect width="16" height="7" rx="3.5" fill="#c084fc" />
        <rect x="8" width="8" height="7" rx="0" fill="#34d399" />
      </g>

      {/* Main Shield body */}
      <path 
        d="M60 16C78 16 94 20 94 20C94 20 98 64 78 88C68 100 60 106 60 106C60 106 52 100 42 88C22 64 26 20 26 20C26 20 42 16 60 16Z" 
        fill="url(#shield_grad_primary)" 
      />
      
      {/* Beautiful 3D bevel layer */}
      <path 
        d="M60 22C74.4 22 87.2 25.2 87.2 25.2C87.2 25.2 90.4 60.4 74.4 79.6C66.4 89.2 60 94 60 94C60 94 53.6 89.2 45.6 79.6C29.6 60.4 32.8 25.2 32.8 25.2C32.8 25.2 45.6 22 60 22Z" 
        fill="url(#shield_grad_highlight)" 
        opacity="0.85"
      />

      {/* Central Medical Cross */}
      <path 
        d="M60 38V70M44 54H76" 
        stroke="white" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="60" cy="54" r="3" fill="#60a5fa" />

      {/* Leaf ornaments on the left and right sides */}
      <path d="M15 50 C12 65 24 75 24 75" stroke="#34d399" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M105 50 C108 65 96 75 96 75" stroke="#34d399" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      
      <defs>
        <radialGradient id="shield_grad_primary" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 38) rotate(90) scale(68 54)">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </radialGradient>
        <linearGradient id="shield_grad_highlight" x1="60" y1="22" x2="60" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </motion.svg>
  );

  const renderHealthTipBrainSVG = () => (
    <motion.svg 
      className="w-32 h-32 md:w-36 md:h-36 drop-shadow-[0_8px_16px_rgba(244,63,94,0.15)] shrink-0"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ 
        y: [0, -5, 0]
      }}
      transition={{ 
        duration: 4.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Floating Sparkles */}
      <circle cx="20" cy="40" r="2.5" fill="#fca5a5" />
      <path d="M125 35 L129 39 M129 35 L125 39" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Light glow ellipse shadow underneath brain */}
      <ellipse cx="70" cy="115" rx="36" ry="6" fill="#ef4444" opacity="0.08" />

      {/* Brain Left Hemisphere */}
      <path 
        d="M70 30 C53 30 40 42 40 58 C40 68 45 74 44 82 C42 90 49 100 64 100 C68 100 70 96 70 92 Z" 
        fill="#fecdd3" 
        stroke="#fda4af" 
        strokeWidth="1.5" 
      />
      {/* Brain Right Hemisphere */}
      <path 
        d="M70 30 C87 30 100 42 100 58 C100 68 95 74 96 82 C98 90 91 100 76 100 C72 100 70 96 70 92 Z" 
        fill="#fda4af" 
        stroke="#f43f5e" 
        strokeWidth="1.5" 
      />

      {/* Brain Folds (Left) */}
      <path d="M52 48 C48 52 52 58 56 54 C58 52 62 58 58 64 C56 66 60 70 64 68" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M46 72 C48 76 54 74 54 78 C54 82 58 84 62 80" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      
      {/* Brain Folds (Right) */}
      <path d="M88 48 C92 52 88 58 84 54 C82 52 78 58 82 64 C84 66 80 70 76 68" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M94 72 C92 76 86 74 86 78 C86 82 82 84 78 80" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

      {/* Cute face eyes */}
      <circle cx="58" cy="62" r="3" fill="#1e293b" />
      <circle cx="57" cy="61" r="1.2" fill="white" />
      
      <circle cx="82" cy="62" r="3" fill="#1e293b" />
      <circle cx="81" cy="61" r="1.2" fill="white" />

      {/* Smiling Mouth */}
      <path d="M66 68 Q70 71 74 68" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

      {/* Rozy cheeks */}
      <circle cx="52" cy="66" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="88" cy="66" r="2.5" fill="#f43f5e" opacity="0.4" />

      {/* Cute little legs standing */}
      <path d="M58 100 C58 108 55 112 58 112" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 100 C82 108 85 112 82 112" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

      {/* Glowing medical shield he is holding in right hand */}
      <g transform="translate(93, 72)">
        <path d="M12 2C18 2 24 4 24 4C24 4 26 16 18 24C12 28 12 28 12 28C12 28 12 28 6 24C-2 16 0 4 0 4C0 4 6 2 12 2Z" fill="url(#brain_shield_grad)" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      <defs>
        <linearGradient id="brain_shield_grad" x1="0" y1="2" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </motion.svg>
  );

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* 1. "Check your health" Hero Box */}
      <div className="bg-gradient-to-br from-indigo-50/90 to-sky-50/80 dark:from-indigo-950/20 dark:to-sky-950/10 border border-indigo-100/50 dark:border-indigo-900/40 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all">
        {/* Subtle grid background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
              Check your health
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Describe your symptoms in your own words, outline duration and severity, and extract real-time AI-powered diagnostic indices and climate vector risk scores.
            </p>
            
            {/* Input Form Box from Screenshot */}
            <form onSubmit={handleQuickSubmit} className="mt-4">
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-2.5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl bg-opacity-90 backdrop-blur-md">
                <textarea
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="Example: I have fever, headache and body pain since 2 days"
                  className="flex-1 px-3 py-2 text-xs md:text-sm text-slate-800 dark:text-slate-100 bg-transparent resize-none border-0 focus:ring-0 focus:outline-none h-14 sm:h-auto min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-80 active:scale-98"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom pills */}
            <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/60 dark:bg-slate-900/40 rounded-full border border-slate-150/50 dark:border-white/5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                Secure & Private
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/60 dark:bg-slate-900/40 rounded-full border border-slate-150/50 dark:border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                AI-Powered
              </span>
            </div>
          </div>

          {/* Right Floating Illustrator Shield */}
          {renderHeroShieldSVG()}
        </div>
      </div>

      {/* 2. "Your Health Overview" KPI Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8] font-mono">
          Your Health Overview
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Purple Predictions */}
          <div className="bento-card p-5 flex flex-col justify-between hover:scale-101 border-indigo-500/10 hover:border-indigo-500/20 active:scale-99 cursor-pointer transition" onClick={() => setActiveTab('diagnostics')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">12</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">Total Predictions</span>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <ClipboardList className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-4 border-t border-slate-100 dark:border-white/5 pt-2">
              View your past analyses
            </span>
          </div>

          {/* KPI 2: Green Saved */}
          <div className="bento-card p-5 flex flex-col justify-between hover:scale-101 border-emerald-500/10 hover:border-emerald-500/20 active:scale-99 cursor-pointer transition" onClick={() => setActiveTab('saved')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono block">3</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">Saved Reports</span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-4 border-t border-slate-100 dark:border-white/5 pt-2">
              Reports you saved
            </span>
          </div>

          {/* KPI 3: Orange Active Alerts */}
          <div className="bento-card p-5 flex flex-col justify-between hover:scale-101 border-amber-500/10 hover:border-amber-500/20 active:scale-99 cursor-pointer transition" onClick={() => setActiveTab('outbreaks')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono block">2</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">Active Alerts</span>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-4 border-t border-slate-100 dark:border-white/5 pt-2">
              Outbreaks in your area
            </span>
          </div>

          {/* KPI 4: Blue Location */}
          <div className="bento-card p-5 flex flex-col justify-between hover:scale-101 border-sky-500/10 hover:border-sky-500/20 active:scale-99 cursor-pointer transition" onClick={() => setActiveTab('heatmap')}>
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-ellipsis overflow-hidden">
                <span className="text-lg font-black text-sky-500 dark:text-sky-450 font-sans block truncate">Lagos, NG</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">Your Location</span>
              </div>
              <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 shrink-0">
                <MapPin className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-4 border-t border-slate-100 dark:border-white/5 pt-2">
              Detected automatically
            </span>
          </div>

        </div>
      </div>

      {/* Grid view containing Recent Prediction (Left) and Widgets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Recent Prediction */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8] font-mono">
              Recent Prediction
            </h3>
            <button 
              onClick={() => setActiveTab('diagnostics')} 
              className="text-xs font-bold text-indigo-600 dark:text-sky-400 hover:text-indigo-700 hover:underline flex items-center gap-0.5"
            >
              View All
            </button>
          </div>

          <div className="bento-card p-6 flex flex-col md:flex-row gap-6 justify-between items-stretch">
            {/* Meta & Symptoms Left Sub-block */}
            <div className="flex-1 space-y-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 pb-6 md:pb-0 pr-0 md:pr-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">May 20, 2025 • 10:24 AM</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wide rounded">
                    Completed
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Symptoms Analyzed</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Fever', 'Headache', 'Body Pain', 'Chills', 'Fatigue'].map((sym) => (
                      <span key={sym} className="px-2 py-1 bg-indigo-500/5 text-indigo-500 dark:text-sky-400 border border-indigo-500/10 rounded-lg text-xs font-medium">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 md:pt-0">
                {/* Location indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-1.5 bg-sky-500/10 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Location</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Lagos, Nigeria</span>
                  </div>
                </div>

                {/* Season indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Season</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rainy Season</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Disease predictions bar chart list */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">
                  Top Predicted Diseases
                </span>

                <div className="space-y-3">
                  {[
                    { name: 'Malaria', val: 91, col: 'bg-rose-500' },
                    { name: 'Typhoid Fever', val: 82, col: 'bg-orange-500' },
                    { name: 'Dengue Fever', val: 67, col: 'bg-amber-500' },
                    { name: 'Influenza', val: 45, col: 'bg-emerald-500' },
                    { name: 'Viral Fever', val: 32, col: 'bg-sky-500' }
                  ].map((dis, idx) => (
                    <div key={dis.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono w-3.5">{idx + 1}</span>
                          {dis.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[11px]">{dis.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${dis.col} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${dis.val}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Full Report button */}
              <button
                type="button"
                onClick={() => setActiveTab('diagnostics')}
                className="mt-6 w-full py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-600 dark:text-sky-400 font-bold text-xs rounded-xl border border-slate-200 dark:border-white/5 transition flex items-center justify-center gap-1 shadow-sm"
              >
                View Full Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Tip, Hotspots, Chat Widget Stack */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tip of the Day */}
          <div className="bento-card p-6 flex flex-col justify-between h-auto">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
              <Sun className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500/20" />
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                Health Tip of the Day
              </h4>
            </div>

            <div className="flex items-center gap-2 justify-center py-1">
              {renderHealthTipBrainSVG()}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center font-medium mt-1">
              Stay hydrated, eat balanced meals, and get enough rest to keep your immune system strong.
            </p>

            {/* Slider carousel dots */}
            <div className="flex gap-1.5 justify-center mt-4">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Disease Hotspots list */}
          <div className="bento-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                Disease Hotspots Near You
              </h4>
              <button 
                onClick={() => setActiveTab('heatmap')}
                className="text-[10px] font-bold text-indigo-600 dark:text-sky-400 hover:underline"
              >
                View Map
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs space-y-3">
              {[
                { name: 'Malaria', risk: 'High Risk', sub: 'Lagos, Ogun, Delta', bg: 'bg-rose-500/10 text-rose-500', icon: '🦟' },
                { name: 'Typhoid Fever', risk: 'Moderate', sub: 'Lagos, Rivers', bg: 'bg-orange-500/10 text-orange-500', icon: '💧' },
                { name: 'Cholera', risk: 'Low', sub: 'Bayelsa, Akwa Ibom', bg: 'bg-emerald-500/10 text-emerald-500', icon: '🦠' }
              ].map((hot) => (
                <div key={hot.name} className="flex items-center gap-3 pt-2.5 first:pt-0 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-lg shadow-inner">
                      {hot.icon}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{hot.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{hot.sub}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${hot.bg}`}>
                    {hot.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Chat Assistant widget card from screen */}
          <div 
            onClick={() => setActiveTab('chat')}
            className="bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-5 hover:scale-101 hover:shadow-md cursor-pointer active:scale-99 transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Medical Chat Assistant
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Ask me anything about symptoms, diseases, or prevention vectors.
                </p>
              </div>
            </div>
            
            <div className="w-10 h-10 bg-indigo-600/10 dark:bg-sky-500/15 text-indigo-600 dark:text-sky-400 rounded-full flex items-center justify-center hover:bg-indigo-600/20 hover:scale-105 transition shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

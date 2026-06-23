import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, Sparkles, CloudRain, ShieldCheck as LockIcon, BarChart3, Sun, Moon } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function IntroScreen({ onComplete, darkMode, setDarkMode }: IntroScreenProps) {
  const features = [
    {
      title: 'Spatio-Temporal Mapping',
      description: 'Interact with geographic disease hotspots synced dynamically with localized climatic coordinate models.',
      icon: MapPin,
      color: 'text-sky-500 bg-sky-500/10'
    },
    {
      title: 'Climatic Vector Tracking',
      description: 'Incorporate real-time humidity, temperature, and precipitation vector indexes to accurately predict vector breeding periods.',
      icon: CloudRain,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      title: 'Clinical Diagnostic Intelligence',
      description: 'Leverage state-of-the-art server-side Gemini 3.5 Flash NLP engines to extract clinical symptoms and compute probabilistic match coefficients.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Epidemiological Analytics',
      description: 'Explore statistical risk charts, baseline trend indicators, and active outbreaks mapped instantly for healthcare professionals.',
      icon: BarChart3,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 md:p-12 transition-colors duration-300 font-sans ${
      darkMode ? 'bg-[#050B13] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    }`} id="medspatial_intro_portal">
      
      {/* Top bar with logo & light/dark mode switcher */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto">
        <div className="flex items-center space-x-3 select-none">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" />
              <path d="M12 8v8M9 12h6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">MedSpatial <span className="text-sky-550">AI</span></h2>
            <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">Clinical Intelligence</p>
          </div>
        </div>

        {/* Toggle dark mode button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full border transition hover:scale-105 cursor-pointer ${
            darkMode ? 'bg-[#0A1121] border-white/5 text-amber-400' : 'bg-white border-slate-200 text-slate-500'
          }`}
          title="Toggle UI Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main hero segment */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
        {/* Left text column */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-500 dark:text-sky-400 bg-sky-500/10 px-3.5 py-1.5 rounded-full inline-block font-mono">
            🌍 SPATIO-TEMPORAL RISK FORECASTING
          </span>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
            Climatic Disease <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Forecasting</span> & Diagnostic Center.
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            MedSpatial AI delivers real-time clinical dashboards connecting geographic epidemiology with dynamic weather patterns. Detect anomalies, run advanced symptom NLP checks, and map vector-borne risk coefficients instantly.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onComplete}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-sky-550 hover:from-indigo-700 hover:to-sky-600 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-indigo-500/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right feature grid column */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`p-5 rounded-2xl border transition hover:-translate-y-1 ${
                  darkMode ? 'bg-[#0A1121] border-white/5 hover:border-white/10' : 'bg-white border-slate-200/60 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-xl inline-block mb-4 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="max-w-6xl w-full mx-auto border-t border-slate-200/40 dark:border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
        <p>© 2026 MedSpatial AI. For Research & Public Health Monitoring Purposes Only.</p>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-lg border border-slate-200/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-mono">HIPAA & GDPR Compliant Spatial Node Mapping</span>
        </div>
      </footer>

    </div>
  );
}

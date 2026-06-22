import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Map, BarChart3, Database, MessageSquare, 
  ShieldCheck, Moon, Sun, Lock, Info, Activity, AlertCircle 
} from 'lucide-react';
import DiagnosticsSuite from './components/DiagnosticsSuite';
import MapHeatmaps from './components/MapHeatmaps';
import EpidemiologyCharts from './components/EpidemiologyCharts';
import AdminSuite from './components/AdminSuite';
import ChatAssistant from './components/ChatAssistant';
import { Disease, Outbreak, MLModelMetrics, AuditLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'heatmap' | 'epidemiology' | 'chat' | 'admin'>('diagnostics');
  const [darkMode, setDarkMode] = useState(true);
  
  // Real-time Database/State values hydrated from Node Express backend
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [models, setModels] = useState<MLModelMetrics[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize dynamic parameters from server APIs
  const fetchLocalDatabase = () => {
    Promise.all([
      fetch("/api/diseases").then(r => r.json()),
      fetch("/api/outbreaks").then(r => r.json()),
      fetch("/api/ml/models").then(r => r.json()),
      fetch("/api/logs").then(r => r.json())
    ])
    .then(([diseasesData, outbreaksData, modelsData, logsData]) => {
      setDiseases(diseasesData);
      setOutbreaks(outbreaksData);
      setModels(modelsData);
      setLogs(logsData);
    })
    .catch(err => {
      console.error("Critical: Clinical database sync failed:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLocalDatabase();
  }, []);

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-[#050B1A] text-slate-100' : 'bg-slate-50 text-slate-800'
    } font-sans`}>
      {/* Clinician System Alert Banner */}
      <div className="bg-sky-950/80 text-sky-400 py-2.5 px-4 text-[10px] font-bold font-mono tracking-widest flex items-center justify-between text-center select-none border-b border-sky-500/20">
        <div className="flex items-center gap-2 mx-auto">
          <Activity className="w-3.5 h-3.5 animate-pulse text-sky-500" />
          <span>MEDSPATIAL AI DIAGNOSTIC GATEWAY • REGION-SPECIFIC METRIC WEIGHTING MATRIX • STATUS: SECURE</span>
        </div>
      </div>

      {/* Primary Global Navigation Header */}
      <header className={`border-b ${
        darkMode ? 'bg-[#050B1A]/80 border-white/10' : 'bg-white/95 border-slate-150'
      } backdrop-blur sticky top-0 z-50 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3.5 select-none hover:opacity-95 transition">
            <div className="w-11 h-11 bg-sky-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.45)]">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">MedSpatial <span className="text-sky-400">AI</span></h1>
                <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[9px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider">
                  v3.4-Pro
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Spatio-Temporal Intelligence</p>
            </div>
          </div>

          {/* Sub Navigation Tabs (Bento Style) */}
          <nav className="flex flex-wrap items-center justify-center gap-1 bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden text-xs">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-4 h-4 shrink-0" />
              Diagnostics Suite
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Map className="w-4 h-4 shrink-0" />
              Hotspot Map
            </button>

            <button
              onClick={() => setActiveTab('epidemiology')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'epidemiology'
                  ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              Trends & Curves
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              RAG Clinical Chat
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              Admin Commands
            </button>
          </nav>

          {/* Theme Switcher & Security Flags */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition ${
                darkMode ? 'bg-slate-900 border-white/10 text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden lg:flex items-center gap-1.5 border border-emerald-500/20 px-3 py-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 text-[10px] uppercase font-bold font-mono tracking-wide text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>HIPAA SECURED</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-center min-h-[480px]">
            <Activity className="w-10 h-10 text-sky-500 animate-spin" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest mt-4">
              Synchronizing Pathogen Intelligence Modules
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Hydrating active disease vectors, local outbreak coordinates, and historical epidemiological curves from security databases.
            </p>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeTab === 'diagnostics' && (
              <DiagnosticsSuite 
                onAddDiagnosticQuery={fetchLocalDatabase} 
                mockLocations={[]} // supplied inside helper
              />
            )}
            
            {activeTab === 'heatmap' && (
              <MapHeatmaps outbreaks={outbreaks} />
            )}

            {activeTab === 'epidemiology' && (
              <EpidemiologyCharts />
            )}

            {activeTab === 'chat' && (
              <ChatAssistant />
            )}

            {activeTab === 'admin' && (
              <AdminSuite 
                diseases={diseases}
                outbreaks={outbreaks}
                models={models}
                logs={logs}
                onRefreshData={fetchLocalDatabase}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer Credentials */}
      <footer className={`border-t py-6 mt-12 transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <p className="font-mono">
            MedSpatial AI • Powered by Spatio-Temporal Climate Weighting Factor Matrices & Ensembles
          </p>
          <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Legal Safety Notice: The predictive indices compiled inside this clinical diagnostics portal represent statistic projections based on geographic prevalence data, seasonal vector lifecycles, and user-supplied details. <b>This result is not a medical diagnosis. Please consult a healthcare professional.</b>
          </p>
        </div>
      </footer>
    </div>
  );
}

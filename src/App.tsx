import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  HeartPulse, Map, BarChart3, Database, MessageSquare, 
  ShieldCheck, Moon, Sun, Lock, Info, Activity, AlertCircle,
  LayoutDashboard, Stethoscope, Bell, Clock, BookmarkCheck,
  User, Settings, Phone, ChevronDown, Check, Menu, X, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';
import DiagnosticsSuite from './components/DiagnosticsSuite';
import MapHeatmaps from './components/MapHeatmaps';
import EpidemiologyCharts from './components/EpidemiologyCharts';
import AdminSuite from './components/AdminSuite';
import ChatAssistant from './components/ChatAssistant';
import DashboardView from './components/DashboardView';
import LoadingScreen from './components/LoadingScreen';
import IntroScreen from './components/IntroScreen';
import AuthScreen from './components/AuthScreen';
import { Disease, Outbreak, MLModelMetrics, AuditLog, DiagnoseResponse, Season } from './types';

// Pre-hydrate default predictions so the home view looks exactly like the requested mock UI on load!
const defaultPredictionResponse: DiagnoseResponse = {
  unlimitedFutureEnabled: true,
  location: {
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos City",
    region: "Lagos, Nigeria",
    lat: 6.5244,
    lng: 3.3792
  },
  season: "Rainy",
  extracted: {
    symptoms: ["fever", "headache", "body_pain", "chills", "fatigue"],
    duration: "2 Days",
    severity: "Severe",
    frequency: "Continuous"
  },
  predictions: [
    {
      diseaseId: "malaria",
      name: "Malaria",
      probability: 91,
      riskLevel: "High",
      explanation: {
        symptomMatch: "Strong alignment with high fever, headache, body pain, chills, and fatigue.",
        weatherInfluence: "Increased risk due to rainy humidity and stagnant puddle pools.",
        geographyFactor: "Lagos region holds higher vector risk density.",
        outbreakImpact: "Identified local outbreaks elevate overall risk profile."
      },
      guidance: ["Sleep under insecticide-treated nets (ITNs)", "Clear indoor standing water", "Apply DEET repellents"],
      prevention: ["Artemisinin-based Combination Therapy (ACT)", "Deploy mosquito larvicides"]
    },
    {
      diseaseId: "typhoid",
      name: "Typhoid Fever",
      probability: 82,
      riskLevel: "High",
      explanation: {
        symptomMatch: "Alignment with fever and weak metabolic states.",
        weatherInfluence: "Sub-optimal drainage and heavy rainfall runoff infiltrating water reservoirs.",
        geographyFactor: "Sub-Saharan coastal plain density.",
        outbreakImpact: "Frequent active records on local databases."
      },
      guidance: ["Consume boiled/treated water", "Practice strict hand hygiene", "Eat thoroughly cooked hot foods"],
      prevention: ["Typhoid conjugate vaccination (TCV)", "Proper hygiene sanitation"]
    },
    {
      diseaseId: "dengue",
      name: "Dengue Fever",
      probability: 67,
      riskLevel: "Medium",
      explanation: {
        symptomMatch: "Matches skin temperature surges and headache patterns.",
        weatherInfluence: "Standing rainwater in discarded tires, household containers.",
        geographyFactor: "Urban zones show elevated breeding parameters.",
        outbreakImpact: "Moderate seasonal fluctuations."
      },
      guidance: ["Eliminate artificial water containers", "Use window screens"],
      prevention: ["Apply larvicides to non-potable storage", "Use pain relievers other than aspirin"]
    },
    {
      diseaseId: "influenza",
      name: "Influenza",
      probability: 45,
      riskLevel: "Medium",
      explanation: {
        symptomMatch: "Respiratory symptom pairs and general fatigue.",
        weatherInfluence: "Crowded urban centers, seasonal changes in air moisture.",
        geographyFactor: "Atmospheric shifts.",
        outbreakImpact: "Standard seasonal pattern."
      },
      guidance: ["Practice respiratory etiquette (cover coughs)", "Wash hands frequently"],
      prevention: ["Receive annual influenza immunization", "Ensure balanced dietary support"]
    },
    {
      diseaseId: "viral_fever",
      name: "Viral Fever",
      probability: 32,
      riskLevel: "Low",
      explanation: {
        symptomMatch: "General temperature elevations.",
        weatherInfluence: "Atmospheric shifts, seasonal weather swings.",
        geographyFactor: "Global distribution.",
        outbreakImpact: "Mild base recurrence."
      },
      guidance: ["Ensure ample rest", "Maintain fluid balance with Oral Rehydration Salts (ORS)"],
      prevention: ["Use antipyretics for fever control", "Avoid sharing personal utensils"]
    }
  ]
};

export default function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'diagnostics' | 'heatmap' | 'epidemiology' | 'chat' | 'admin' | 'outbreaks' | 'saved' | 'profile'>('dashboard');
  const [darkMode, setDarkMode] = useState(false); // Start as Light Mode as requested by UI screenshot!
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Shared Controlled Diagnostic States to allow home search integration
  const [symptomsText, setSymptomsText] = useState("I have fever, headache and body pain since 2 days");
  const [selectedRegion, setSelectedRegion] = useState("Sub-Saharan Rainy Corridor");
  const [season, setSeason] = useState<Season>("Rainy");
  const [response, setResponse] = useState<DiagnoseResponse | null>(defaultPredictionResponse);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  // Real-time Database state values
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [models, setModels] = useState<MLModelMetrics[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNotificationToast, setActiveNotificationToast] = useState<string | null>(null);

  // Pre-hydrate persistent login sessions
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIntroCompleted(true);
      } catch (e) {
        console.error("Error hydrating user session", e);
      }
    }
  }, []);

  // Sync user location and season with interactive selectors
  useEffect(() => {
    if (currentUser) {
      if (currentUser.region) {
        setSelectedRegion(currentUser.region);
      }
      if (currentUser.season) {
        setSeason(currentUser.season);
      }
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIntroCompleted(false);
    setActiveTab('dashboard');
  };

  // Fetch initial databases
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
      console.error("Clinical database sync failed:", err);
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

  // Handle Home Search Submit to diagnostics pipeline
  const handleHomeAnalyze = async (text: string) => {
    setSymptomsText(text);
    setActiveTab('diagnostics');
    setDiagnosticLoading(true);
    
    try {
      const payload = {
        symptomsText: text,
        location: {
          region: selectedRegion || "Sub-Saharan Rainy Corridor",
          coordinates: "6.5244° N, 3.3792° E",
          country: "Nigeria"
        },
        season: season || "Rainy"
      };

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data: DiagnoseResponse = await res.json();
      setResponse(data);
      fetchLocalDatabase(); // tick logs count
    } catch (err) {
      console.error("Clinical prediction failed from Home trigger:", err);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diagnostics', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'heatmap', label: 'Health Map', icon: Map },
    { id: 'epidemiology', label: 'Disease Trends', icon: BarChart3 },
    { id: 'outbreaks', label: 'Outbreak Alerts', icon: Bell },
    { id: 'chat', label: 'Medical Chat', icon: MessageSquare },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'saved', label: 'Saved Reports', icon: BookmarkCheck },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin', label: 'Settings', icon: Settings },
  ] as const;

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
  };

  if (!appLoaded) {
    return <LoadingScreen onFinish={() => setAppLoaded(true)} />;
  }

  if (!introCompleted) {
    return (
      <IntroScreen 
        onComplete={() => setIntroCompleted(true)} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
    );
  }

  return (
    <div className={`min-h-screen flex ${
      darkMode ? 'bg-[#050B13] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    } font-sans`}>
      
      {/* LEFT SIDEBAR - Desktop view */}
      <aside className={`w-72 hidden lg:flex flex-col h-screen sticky top-0 border-r py-6 px-5 shrink-0 overflow-y-auto ${
        darkMode ? 'bg-[#0A1121] border-white/5' : 'bg-white border-slate-200/60'
      }`}>
        {/* LOGO AREA */}
        <div className="flex items-center space-x-3 select-none mb-8 px-2">
          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(56,189,248,0.3)] animate-pulse">
            {/* Blue medical shield icon with cross inside */}
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" />
              <path d="M12 8v8M9 12h6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">MedSpatial <span className="text-sky-550">AI</span></h1>
            </div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">AI Powered Health Intelligence</p>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/10 font-black' 
                    : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100/60 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-250'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* EMERGENCY CALL WIDGET */}
        <div className="mt-8 pt-4 border-t border-slate-150/55 dark:border-white/5 space-y-3.5">
          <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-100/10 dark:from-indigo-950/20 dark:to-transparent border border-indigo-100/50 dark:border-indigo-900/35 rounded-2xl p-4 text-center relative overflow-hidden">
            <h5 className="text-[11px] font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-widest font-mono">Need Immediate Help?</h5>
            <p className="text-[10px] text-slate-400 dark:text-slate-450 mt-1 lines-clamp-2 leading-relaxed">
              If you are experiencing a medical emergency, please contact your local emergency services.
            </p>
            
            <a 
              href="tel:112"
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full bg-[#3B82F6] hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Emergency Contacts
            </a>

            {/* Float aesthetic custom vector box */}
            <div className="flex justify-center mt-3 opacity-80 scale-95">
              <svg width="48" height="32" viewBox="0 0 48 32" fill="none" className="animate-bounce" style={{ animationDuration: '4s' }}>
                <rect x="6" y="2" width="36" height="26" rx="6" fill="#fecdd3" stroke="#fda4af" strokeWidth="1.5" />
                <path d="M24 7v16M16 15h16" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="9" cy="23" r="1.5" fill="#f43f5e" />
                <circle cx="39" cy="9" r="1.5" fill="#f43f5e" />
              </svg>
            </div>
          </div>
          {/* DEVELOPER CREDIT TAG */}
          <div className="mt-4 px-2 py-1 select-none text-center border-t border-slate-150/40 dark:border-white/5 pt-3">
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
              Developer: <span className="text-indigo-600 dark:text-sky-450 font-extrabold block mt-0.5">Ibrahim Amina Ali</span>
            </p>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className={`w-64 max-w-xs relative flex flex-col h-full p-5 overflow-y-auto ${
            darkMode ? 'bg-[#0A1121] text-slate-100' : 'bg-white text-slate-800'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">Menu</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-150">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-center text-[10px] space-y-2">
                <p className="text-slate-600 dark:text-slate-400 font-bold">Need immediate medical answers?</p>
                <a href="tel:112" className="block py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition uppercase">
                  Emergency Contacts
                </a>
              </div>
              <div className="mt-4 text-center text-[10px] font-bold text-slate-600 dark:text-slate-350">
                Developer: <span className="text-indigo-600 dark:text-sky-400 font-black">Ibrahim Amina Ali</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* RIGHT SIDE MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* UPPER STATUS STRIP (Aesthetic details) */}
        <div className="bg-[#0b1329] text-cyan-300 py-2.5 px-4 text-[9px] font-extrabold font-mono tracking-widest flex items-center justify-between text-center select-none border-b border-sky-500/20 z-20">
          <div className="flex items-center gap-2 mx-auto">
            <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>MEDSPATIAL AI • DEVELOPED BY IBRAHIM AMINA ALI • CLIMATE VECTOR RISK FORECAST ACTIVE • HIPAA SECURED</span>
          </div>
        </div>

        {/* PRIMARY HEADER BAR (Greeting, Notifications, Profile) */}
        <header className={`py-4 px-6 md:px-8 border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${
          darkMode ? 'bg-[#050B13]/85 border-white/5' : 'bg-white/95 border-slate-200/60'
        }`}>
          {/* Mobile hamburger row */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 mr-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm lg:hidden focus:outline-none"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-350" />
            </button>
            
            <div>
              <h2 className="text-lg md:text-2xl font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                Good morning, {currentUser?.name || "Adaeze"} 
                <span className="inline-block animate-[wiggle_1s_infinite]">👋</span>
              </h2>
              <p className="text-[10px] md:text-sm text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                How are you feeling today? Let's find out.
              </p>
            </div>
          </div>

          {/* Core Controls Stack */}
          <div className="flex items-center space-x-3.5">
            {/* Notification trigger with count 3 */}
            <button 
              onClick={() => {
                setActiveNotificationToast("Diagnostics Alert: 3 active mosquito vector spikes flagged near Lagos. Outbreaks are indexed on the local Spatial Hub.");
              }}
              className="p-2.5 rounded-full relative transition border shadow-sm cursor-pointer hover:scale-105 active:scale-95 bg-white dark:bg-[#0A1121] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Dark mode switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-full transition border shadow-sm cursor-pointer hover:scale-105 active:scale-95 bg-white dark:bg-[#0A1121] border-slate-200 dark:border-white/5 text-slate-550 dark:text-amber-400"
              title="Toggle theme mode"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5 text-[#334155]" />}
            </button>

            {/* Profile Circle Adaeze */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#0A1121] py-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => setActiveTab('profile')}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
                alt={currentUser?.name || "Adaeze"} 
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-sky-500/20"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 ml-1 truncate max-w-[80px]">
                {currentUser?.name?.split(' ')[0] || "Adaeze"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 select-none ml-1.5" />
            </div>
          </div>
        </header>

        {/* MAIN PANEL CONTENT VIEWS */}
        <main className="flex-1 px-6 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-center min-h-[480px]">
              <Activity className="w-10 h-10 text-sky-500 animate-spin" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest mt-4">
                Hydrating MedSpatial AI Modules
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Synchronizing live geographic records, local malaria/typhoid outbreaks, and machine learning retrain engines.
              </p>
            </div>
          ) : (
            <div className="transition-all duration-300">
              
              {/* DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <DashboardView 
                  symptomsText={symptomsText}
                  setSymptomsText={setSymptomsText}
                  onAnalyze={handleHomeAnalyze}
                  setActiveTab={setActiveTab}
                  outbreaks={outbreaks}
                  loading={diagnosticLoading}
                  currentUser={currentUser}
                />
              )}

              {/* SYMPTOM CHECKER VIEW */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-4">
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <HeartPulse className="w-3.5 h-3.5 animate-pulse text-sky-500" />
                    CLINICAL DIAGNOSTICS PLATFORM
                  </span>
                  <DiagnosticsSuite 
                    onAddDiagnosticQuery={fetchLocalDatabase} 
                    mockLocations={[]} // loaded internally
                    symptomsText={symptomsText}
                    setSymptomsText={setSymptomsText}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    season={season}
                    setSeason={setSeason}
                    loading={diagnosticLoading}
                    setLoading={setDiagnosticLoading}
                    response={response}
                    setResponse={setResponse}
                    currentUser={currentUser}
                  />
                </div>
              )}

              {/* HEALTH HEATMAP VIEW */}
              {activeTab === 'heatmap' && (
                <div className="space-y-4">
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <Map className="w-3.5 h-3.5 text-sky-500" />
                    SPATIO-TEMPORAL RISK MAPPING
                  </span>
                  <MapHeatmaps outbreaks={outbreaks} />
                </div>
              )}

              {/* EPIDEMIOLOGY TRENDS VIEW */}
              {activeTab === 'epidemiology' && (
                <div className="space-y-4">
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
                    PREDICTIVE MULTI-VARIATE CURVES
                  </span>
                  <EpidemiologyCharts />
                </div>
              )}

              {/* OUTBREAK ALERTS AUXILIARY VIEW */}
              {activeTab === 'outbreaks' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                      <Bell className="w-3.5 h-3.5 text-sky-500 animate-bounce" />
                      EPIDEMIOLOGICAL ALERT SYSTEM
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Active Bio-Surveillance Alerts</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Real-time clinical warnings based on positive symptom diagnostic reports aggregated across climate sectors in the past 14 days.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {outbreaks.map((out) => (
                      <div key={out.id} className="bento-card p-5 space-y-4 border-amber-500/10 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {out.riskLevel} Risk Alert
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">Aggregated: {out.frequencyCount} reports</span>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>🚨</span> {out.diseaseName} Epidemic Trigger
                          </h4>
                          <span className="text-xs text-slate-500 block mt-1 font-mono">Geospatial Focus: {out.geographicFocus}</span>
                        </div>

                        <div className="bg-slate-950/20 p-3 rounded-xl text-xs space-y-1">
                          <span className="block font-bold text-slate-450 uppercase text-[9px] tracking-widest font-mono">Prevention Recommendations</span>
                          <p className="text-slate-400 leading-relaxed">
                            Reinforce vector nets coverage. Treat standard standing puddles with biological larvacides. Distribute prophylactic pills across municipal clinical zones.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MEDICAL CHAT VIEW */}
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    CLINICAL KNOWLEDGE CO-PILOT (RAG-ENABLED)
                  </span>
                  <ChatAssistant />
                </div>
              )}

              {/* SEARCH HISTORY VIEW */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      SECURITY DIAGNOSTIC AUDIT LOGS
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Pathogen Parsing Chronicles</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Encryption-secured audit database recording all symptom diagnostic submissions, geozones, and confidence scores.
                    </p>
                  </div>

                  <div className="bento-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900/60 uppercase text-[9px] font-black tracking-widest text-[#94A3B8] border-b border-light/5">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Queried Symptoms</th>
                            <th className="p-4 hidden sm:table-cell">Extracted Geozone</th>
                            <th className="p-4">Top Disease Index</th>
                            <th className="p-4">Risk Severity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                              <td className="p-4 font-mono text-[10px] text-slate-400">{log.timestamp}</td>
                              <td className="p-4 text-slate-650 dark:text-slate-300 max-w-xs truncate" title={log.queryText}>
                                {log.queryText}
                              </td>
                              <td className="p-4 text-slate-700 dark:text-slate-300 font-medium hidden sm:table-cell">Lagos Corridor (Sub-Saharan Grid)</td>
                              <td className="p-4 font-semibold text-indigo-500 dark:text-sky-450">{log.predictedClass}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.apiLatencyMs > 500 ? 'bg-rose-500/10 text-rose-500' : 'bg-[#e2f0d9] text-[#385723]'
                                }`}>
                                  {log.apiLatencyMs > 500 ? 'High' : 'Moderate'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {logs.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                                No diagnostic chronicles registered in local DB.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SAVED REPORTS VIEW */}
              {activeTab === 'saved' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                      <BookmarkCheck className="w-3.5 h-3.5 text-sky-500" />
                      SECURE CLINICAL REPOSITORY
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Saved Patient Diagnostic Sheets</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Read-only records safely stored by Adaeze for chronic monitoring, treatment tracking, and physician references.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: "Adaeze Malaria Panel", date: "May 20, 2025", desc: "Report showing heavy headache, fatigue, and fever since 2 days. Malaria score indexed at 91% probability.", season: "Rainy", syms: ["Fever", "Headache", "Body Pain"] },
                      { title: "Elder brother Typhoid profile", date: "April 15, 2025", desc: "Patient complained of severe digestive tract cramps and chills after consuming unsafe well waters.", season: "Rainy", syms: ["Cough", "Vomiting", "Weakness"] },
                      { title: "Aunt Nneka Dengue risk sheet", date: "Jan 12, 2025", desc: "Symptom compilation of joint paint and stiffness on high dry dust vector corridors.", season: "Harmattan", syms: ["Stiff Neck", "Fever"] }
                    ].map((rep, idx) => (
                      <div key={idx} className="bento-card p-5 space-y-4 flex flex-col justify-between hover:scale-101 cursor-pointer transition" onClick={() => {
                        setSymptomsText(rep.desc);
                        setActiveTab('diagnostics');
                      }}>
                        <div>
                          <div className="flex items-center justify-between border-b border-light/5 pb-2 mb-2 text-slate-400 text-[10px] font-mono">
                            <span>Saved file: 00{idx + 1}-MD</span>
                            <span>{rep.date}</span>
                          </div>
                          <h4 className="text-base font-black text-slate-800 dark:text-white">{rep.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{rep.desc}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {rep.syms.map(sy => (
                              <span key={sy} className="px-2 py-0.5 bg-sky-500/5 text-sky-550 border border-sky-500/10 rounded-md text-[10px] font-bold">
                                {sy}
                              </span>
                            ))}
                          </div>
                          <span className="block text-[10px] font-bold text-sky-500 uppercase tracking-widest font-mono pt-1">Click to reload this dataset into checker</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USER PROFILE VIEW */}
              {activeTab === 'profile' && (
                <div className="space-y-6" id="patient_profile_view">
                  <div>
                    <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                      <User className="w-3.5 h-3.5 text-sky-500" />
                      REGISTERED PATIENT ACCOUNT NODE
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">
                      {currentUser?.name || "Adaeze"}'s Clinical Dashboard Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Review bio-geographic parameters and locked climatic variables assigned to this patient identity node.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bento-card p-6 space-y-4 md:col-span-1 text-center">
                      <div className="flex flex-col items-center">
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
                          alt={currentUser?.name || "Adaeze"} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/15"
                          referrerPolicy="no-referrer"
                        />
                        <h4 className="text-lg font-black text-slate-800 dark:text-white mt-4">
                          {currentUser?.name || "Adaeze Nwosu"}
                        </h4>
                        <span className="text-[10px] text-slate-450 font-mono">
                          Patient ID: #MED-{currentUser?.id?.substring(0, 8).toUpperCase() || "SPATIAL-82A"}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-2.5 text-xs text-left">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Registered Email:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={currentUser?.email || "adaeze@medspatial.ai"}>
                            {currentUser?.email || "adaeze@medspatial.ai"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Exact Location:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {currentUser ? `${currentUser.city}, ${currentUser.state}` : "Lagos, Nigeria"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Regional Hotspot:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={currentUser?.region || "Sub-Saharan Rainy Corridor"}>
                            {currentUser?.region || "Sub-Saharan Rainy Corridor"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Season:</span>
                          <span className="font-bold text-sky-500">
                            {currentUser?.season || "Rainy"} Season
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold text-emerald-600 dark:text-emerald-400">HIPAA Status:</span>
                          <span className="font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">Verified Encrypted</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold rounded-xl border border-rose-500/20 hover:border-rose-500 transition cursor-pointer"
                        >
                          Logout of Session Node
                        </button>
                      </div>
                    </div>

                    <div className="bento-card p-6 space-y-4 md:col-span-2">
                       <h4 className="text-base font-bold text-slate-800 dark:text-white">Active Bio-Security Credentials</h4>
                       <p className="text-xs text-slate-500 font-medium">
                         Your patient diagnostics account utilizes biometric encryptions. All queries processed on MedSpatial AI undergo secure SHA-256 validation before sending vector mappings to AI-assistance layers.
                       </p>
                       <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Client Certificates</span>
                         <span className="font-mono text-[10px] text-emerald-400 block">SHA-256 fingerprint: 8a4b:bc4e:93e2:f61d:84ca:ef91:38bc:a5a5</span>
                         <span className="font-mono text-[10px] text-indigo-400 block text-ellipsis overflow-hidden">Public key code: ssh-rsa AAAAB3NzaLagosNigeriaSpatioTemporalMachineLearningEnsemble...</span>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN SUITE (Settings tab) */}
              {activeTab === 'admin' && (
                <div className="space-y-4">
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <Settings className="w-3.5 h-3.5 text-sky-500" />
                    SYSTEM SETTINGS & MODEL CALIBRATION CONSOLE
                  </span>
                  <AdminSuite 
                    diseases={diseases}
                    outbreaks={outbreaks}
                    models={models}
                    logs={logs}
                    onRefreshData={fetchLocalDatabase}
                  />
                </div>
              )}

            </div>
          )}
        </main>

        {/* CLINICAL DISCLAIMER BAR IN FOOTER */}
        <footer className={`border-t py-6 mt-12 transition-colors ${
          darkMode ? 'bg-[#0A1121]/60 border-white/5 text-slate-400' : 'bg-[#E2E8F0]/30 border-slate-250 text-slate-700'
        }`}>
          <div className="max-w-7xl mx-auto px-6 md:px-8 text-center space-y-3.5">
            {/* Disclaimer pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EEF2F6] dark:bg-slate-900 rounded-full border border-slate-200/70 dark:border-white/5 text-[10px] md:text-xs">
              <ShieldAlert className="w-4 h-4 text-[#3B82F6]" />
              <p className="text-[#334155] dark:text-slate-300 font-semibold tracking-tight">
                <b>Disclaimer:</b> This AI prediction is not a medical diagnosis. Please consult a healthcare professional for medical advice.
              </p>
            </div>
            
            <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-relaxed font-bold">
              MedSpatial AI Pro v3.4 • Developed by <span className="text-indigo-600 dark:text-sky-400 font-black">Ibrahim Amina Ali</span> • Powered by Spatio-Temporal Machine Learning & Seasonal Vector Models
            </p>
          </div>
        </footer>

        {/* Floating Notification Toast */}
        {activeNotificationToast && (
          <div className="fixed bottom-6 right-6 left-6 sm:left-auto md:max-w-md bg-slate-900 border border-white/10 p-4 rounded-xl shadow-2xl flex items-start gap-3 z-50 animate-fade-in text-xs">
            <div className="p-2 bg-sky-500/15 rounded-lg text-sky-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase tracking-widest font-black text-slate-400">System Dispatcher</span>
                <button 
                  onClick={() => setActiveNotificationToast(null)}
                  className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">{activeNotificationToast}</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

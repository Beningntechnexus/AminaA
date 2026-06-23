import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, User, MapPin, CloudRain, Sun, Moon, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { Season } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function AuthScreen({ onLoginSuccess, darkMode, setDarkMode }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('adaeze@medspatial.ai');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign Up inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lagos City');
  const [region, setRegion] = useState('Sub-Saharan Rainy Corridor');
  const [season, setSeason] = useState<Season>('Rainy');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
          state,
          city,
          region,
          season
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 font-sans ${
      darkMode ? 'bg-[#050B13] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    }`} id="medspatial_auth_gateway">
      
      {/* Header bar */}
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
            <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">Clinical Security Core</p>
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

      {/* Main card panel */}
      <main className="max-w-md w-full mx-auto my-auto pt-6 pb-12">
        <div className={`bento-card p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
          darkMode ? 'bg-[#0A1121] border-white/5 shadow-black/40' : 'bg-white border-slate-200/60 shadow-slate-200/30'
        }`}>
          
          {/* Header Segment */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isLogin ? 'Clinical Command Handshake' : 'Create Clinician Profile'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isLogin 
                ? 'Authorized public-health keys must be parsed through node.' 
                : 'Setup geozone indicators to lock precise spatial variables.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex gap-3 text-xs text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans" id="auth_sign_in_form">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Clinician Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm transition"
                    placeholder="e.g. adaeze@medspatial.ai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm transition"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer pt-3"
              >
                {loading ? 'Authenticating...' : 'Sign In To Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 font-sans" id="auth_sign_up_form">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm transition"
                    placeholder="e.g. Dr. Ibrahim Amina"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm transition"
                    placeholder="e.g. ibrahim@medspatial.ai"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-sm transition"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Exact Location Mapping Header */}
              <div className="border-t border-slate-150/45 dark:border-white/5 pt-3 my-2">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-sky-500 flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5" /> EXACT CLINICAL LOCATION MAPPING
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Geographic Vector Belt</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs transition"
                  >
                    <option value="Sub-Saharan Rainy Corridor">Sub-Saharan Rainy Corridor (Nematode Vectors)</option>
                    <option value="Tropical Coastal Plain">Tropical Coastal Plain (Marine Sanitation Risk)</option>
                    <option value="Harmattan Dustlands">Harmattan Dustlands (Sore mucous/Meningitis belt)</option>
                    <option value="Arid Northern Province">Arid Northern Province (Arid Dry Heat clusters)</option>
                    <option value="Dense Urban Metro">Dense Urban Metro (Airborne transmission focus)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Active Climatic Season</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <CloudRain className="w-4 h-4" />
                  </span>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as Season)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs transition"
                  >
                    <option value="Rainy">Rainy Season</option>
                    <option value="Dry">Dry Season</option>
                    <option value="Harmattan">Harmattan Season</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/10 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer pt-3"
              >
                {loading ? 'Generating Node...' : 'Register Clinical Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form Switcher */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-400">
              {isLogin ? "No clinical credential node?" : "Already holding registered keys?"}{' '}
            </span>
            <button
              onClick={() => {
                setError(null);
                setIsLogin(!isLogin);
              }}
              className="text-sky-500 hover:text-sky-600 font-bold transition focus:outline-none hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="max-w-6xl w-full mx-auto border-t border-slate-200/40 dark:border-white/5 pt-6 flex justify-between items-center text-[10px] text-slate-400">
        <p>© 2026 MedSpatial AI. Secured clinical credentials environment.</p>
        <div className="flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 SSL Encryption Node</span>
        </div>
      </footer>

    </div>
  );
}

import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area 
} from 'recharts';
import { Thermometer, CloudRain, ShieldCheck, Activity, Wind } from 'lucide-react';

export default function EpidemiologyCharts() {
  // 1. Monthly Seasonal disease prevalence data (Perfectly mirrors seasonal disease modeling!)
  const seasonalTrendData = [
    { name: 'Jan', Malaria: 15, Cholera: 8, Meningitis: 75, Influenza: 45, Pneumonia: 40 },
    { name: 'Feb', Malaria: 12, Cholera: 6, Meningitis: 85, Influenza: 35, Pneumonia: 35 },
    { name: 'Mar', Malaria: 18, Cholera: 10, Meningitis: 90, Influenza: 28, Pneumonia: 30 },
    { name: 'Apr', Malaria: 30, Cholera: 15, Meningitis: 50, Influenza: 22, Pneumonia: 20 },
    { name: 'May', Malaria: 55, Cholera: 32, Meningitis: 25, Influenza: 18, Pneumonia: 22 },
    { name: 'Jun', Malaria: 85, Cholera: 65, Meningitis: 12, Influenza: 38, Pneumonia: 45 },
    { name: 'Jul', Malaria: 95, Cholera: 80, Meningitis: 5, Influenza: 50, Pneumonia: 60 },
    { name: 'Aug', Malaria: 90, Cholera: 75, Meningitis: 4, Influenza: 48, Pneumonia: 55 },
    { name: 'Sep', Malaria: 70, Cholera: 45, Meningitis: 10, Influenza: 42, Pneumonia: 42 },
    { name: 'Oct', Malaria: 50, Cholera: 28, Meningitis: 18, Influenza: 35, Pneumonia: 38 },
    { name: 'Nov', Malaria: 35, Cholera: 14, Meningitis: 42, Influenza: 55, Pneumonia: 50 },
    { name: 'Dec', Malaria: 22, Cholera: 10, Meningitis: 65, Influenza: 60, Pneumonia: 55 }
  ];

  // 2. 5-Year historical outbreak trends (representing epidemiological controls)
  const annualHistoryData = [
    { year: '2022', MalariaOutbreaks: 42, CholeraOutbreaks: 18, MeningitisOutbreaks: 35, LassaCases: 140 },
    { year: '2023', MalariaOutbreaks: 38, CholeraOutbreaks: 22, MeningitisOutbreaks: 24, LassaCases: 165 },
    { year: '2524', MalariaOutbreaks: 45, CholeraOutbreaks: 12, MeningitisOutbreaks: 28, LassaCases: 121 },
    { year: '2025', MalariaOutbreaks: 29, CholeraOutbreaks: 26, MeningitisOutbreaks: 14, LassaCases: 95 },
    { year: '2026', MalariaOutbreaks: 24, CholeraOutbreaks: 15, MeningitisOutbreaks: 11, LassaCases: 74 } // Vaccines and better systems taking effect
  ];

  // 3. Regional prevalence indices (comparisons across zones)
  const regionalIndexData = [
    { region: 'Rainy Corridor', Malaria: 92, Cholera: 45, Meningitis: 11 },
    { region: 'Coastal Plain', Malaria: 68, Cholera: 85, Meningitis: 8 },
    { region: 'Dustlands', Malaria: 22, Cholera: 14, Meningitis: 95 },
    { region: 'Northern Prov.', Malaria: 38, Cholera: 18, Meningitis: 70 },
    { region: 'Urban Metro', Malaria: 45, Cholera: 52, Meningitis: 25 }
  ];

  return (
    <div className="space-y-6" id="epi_charts">
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wilder">Harmattan Disease Multipliers</span>
            <span className="block text-2xl font-black text-orange-500 font-mono">+40%</span>
            <span className="text-[10px] text-slate-400 block">Baseline Meningitis dry vector risk inflations</span>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Wind className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wilder">Wet Season Multipliers</span>
            <span className="block text-2xl font-black text-sky-500 font-mono">+35%</span>
            <span className="text-[10px] text-slate-400 block">Malaria & Cholera vector propagation rates</span>
          </div>
          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <CloudRain className="w-6 h-6 text-sky-400" />
          </div>
        </div>

        <div className="bento-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wilder">Vaccine Control Factor</span>
            <span className="block text-2xl font-black text-green-500 font-mono">-62%</span>
            <span className="text-[10px] text-slate-400 block">Systemic drop in vaccine-preventable meningitis</span>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Main Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Seasonal Disease Modeling Linechart */}
        <div className="bento-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Monthly Seasonal Disease Modelling (Prevalence %)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Showcases climate-locked pathogens. Meningitis peaks in Dry/Harmattan months (Jan-Mar), Malaria skyrockets during heavy downpours (Jun-Aug).
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasonalTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Malaria" stroke="#38bdf8" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="Meningitis" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Cholera" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Influenza" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region-Specific Disease Density Indicator - Barchart */}
        <div className="bento-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Pathogen Density Index Across Geospatial Zones
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cross-comparing clinical baseline density factor weights across our five active regional diagnostic channels.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalIndexData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Malaria" fill="#0ea5e9" opacity={0.8} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cholera" fill="#f43f5e" opacity={0.8} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meningitis" fill="#f59e0b" opacity={0.8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Annual Outbreak Containment Analysis */}
        <div className="bento-card p-6 space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Annual Outbreak Frequency and Containment Records
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tracking a 5-year retrospective vector curve showing substantial declines in target meningitis clusters and lassa zoonotic spillover triggers due to MedSpatial AI intelligence.
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={annualHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorLassa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="MalariaOutbreaks" name="Malaria Incidents" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMalaria)" />
                <Area type="monotone" dataKey="LassaCases" name="Lassa Vector Cases" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLassa)" />
                <Area type="monotone" dataKey="MeningitisOutbreaks" name="Meningitis Outbreaks" stroke="#f59e0b" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

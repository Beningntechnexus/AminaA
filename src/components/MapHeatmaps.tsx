import React, { useState } from 'react';
import { MapPin, Navigation, Thermometer, CloudRain, Wind, AlertCircle, Info } from 'lucide-react';
import { Outbreak, Season } from '../types';

interface MapHeatmapsProps {
  outbreaks: Outbreak[];
}

interface MapRegion {
  name: string;
  x: number; // SVG coordinates percent
  y: number;
  width: number;
  height: number;
  color: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  climate: string;
  seasonFactors: Record<Season, string>;
  hotspots: string[];
}

export default function MapHeatmaps({ outbreaks }: MapHeatmapsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("Sub-Saharan Rainy Corridor");
  const [activeSeason, setActiveSeason] = useState<Season>("Rainy");

  // Regional data configurations
  const regions: MapRegion[] = [
    {
      name: "Sub-Saharan Rainy Corridor",
      x: 35,
      y: 40,
      width: 140,
      height: 120,
      color: "rgba(14, 165, 233, 0.45)", // Sky Blue
      risk: "High",
      climate: "Humid Equatorial Forest. Tall canopies, perennial stagnant rivers.",
      seasonFactors: {
        Rainy: "Malaria spikes (+35%), Dengue breeding surges, Typhoid risk peaks.",
        Dry: "Mosquito vectors drop, steady fungal spore prevalence.",
        Harmattan: "Dusty winds decrease mosquito breeding, respiratory spikes.",
        Spring: "Moderate vector activity, early rainfall puddling.",
        Summer: "Peak humidity, rapid mosquito breeding rates.",
        Autumn: "Post-rain runoffs, high stagnant risk.",
        Winter: "Cooler climate slowing viral replication."
      },
      hotspots: ["Benin Basin", "Delta Marshlands", "Ogoja Forest Crossing"]
    },
    {
      name: "Tropical Coastal Plain",
      x: 10,
      y: 65,
      width: 180,
      height: 80,
      color: "rgba(244, 63, 94, 0.5)", // Rose/Red (Cholera, Typhoid)
      risk: "Critical",
      climate: "Low-lying tidal marsh, dense estuaries, poor urban drainage.",
      seasonFactors: {
        Rainy: "Water pipelines flooded, critical Cholera outbreaks, Dengue alert.",
        Dry: "Saltwater intrusion, high bacterial proliferation in stagnant wells.",
        Harmattan: "Minor dry winds, lower viral spreads.",
        Spring: "High humidity, Typhoid vector spikes.",
        Summer: "Elevated tide elevations, water logging clusters.",
        Autumn: "Estuarine stagnation, algae blooms.",
        Winter: "Lower temperature, dry breeze sanitation alerts."
      },
      hotspots: ["Lagos Lagoon Estuary", "Port Marine Suburbs", "Warri Creek Delta"]
    },
    {
      name: "Harmattan Dustlands",
      x: 45,
      y: 10,
      width: 160,
      height: 90,
      color: "rgba(245, 158, 11, 0.45)", // Amber (Meningitis)
      risk: "Critical",
      climate: "Sub-Saharan transition zone. Arid, sandy soils, intense dry dust winds.",
      seasonFactors: {
        Rainy: "Mucosal linings heal, Meningitis cases plunge. Malaria rises.",
        Dry: "Dust and dry winds start, rising throat sores.",
        Harmattan: "Extreme Meningitis alert (+40%), intense dust, fine particulate throat sores, Lassa vector migration.",
        Spring: "Sand storms, sore throat clusters.",
        Summer: "Extreme dry heat, low vector life.",
        Autumn: "Slow rain drying pattern, early grass burn.",
        Winter: "Cold dryness, respiratory viral spread."
      },
      hotspots: ["Kano Northern Gate", "Sokoto Arid Fringe", "Maiduguri Frontier"]
    },
    {
      name: "Arid Northern Province",
      x: 15,
      y: 12,
      width: 130,
      height: 100,
      color: "rgba(234, 179, 8, 0.4)", // Yellow
      risk: "Medium",
      climate: "Dry savannah, low seasonal rain, high midday heat index.",
      seasonFactors: {
        Rainy: "Slight Malaria increase, soil moisture peak.",
        Dry: "Meningitis risk rises (+20%), low water sanitation.",
        Harmattan: "Pulmonary irritation, Lassa infection clusters.",
        Spring: "Dry heat index rises, dust vectors active.",
        Summer: "Extreme drought, clean water scarcity risks.",
        Autumn: "Brief rainfall evaporation.",
        Winter: "Arid chilly winds."
      },
      hotspots: ["Katsina Dry Fields", "Gusau Wells", "Zaria Outpost"]
    },
    {
      name: "Dense Urban Metro",
      x: 30,
      y: 28,
      width: 120,
      height: 90,
      color: "rgba(168, 85, 247, 0.45)", // Purple (COVID, Flu, respiratory)
      risk: "High",
      climate: "Ultra-dense metropolis, closed concrete towers, high human interaction.",
      seasonFactors: {
        Rainy: "Indoor crowding spurs COVID-19 and Flu transmissions.",
        Dry: "Particulate smog traps respiratory viruses.",
        Harmattan: "Heavy airborne smog, high cough and flu spikes.",
        Spring: "Pollen and viral spread coordination.",
        Summer: "Rapid food spoilage (Gastroenteritis).",
        Autumn: "Early respiratory season startup.",
        Winter: "Crowded indoor environments, Flu peak (+30%)."
      },
      hotspots: ["Ikeja Slum Grid", "Mainland Skyways", "Alaba Trade Conglomerate"]
    }
  ];

  const currentRegion = regions.find(r => r.name === selectedRegion) || regions[0];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-amber-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-slate-900';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getHeatColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="heatmap_views">
      {/* Interactive Geo-Heatmap Board */}
      <div className="lg:col-span-8 bento-card p-6 flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Epidemiological Hotspot Heatmap</h2>
              <p className="text-xs text-slate-500">Spatio-Temporal vector projection of regional outbreaks & climate risk rings</p>
            </div>
            
            {/* Season slider for visual dynamic changes */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Season:</span>
              {(['Rainy', 'Dry', 'Harmattan'] as Season[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSeason(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    activeSeason === s
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Vector GIS Map Canvas */}
          <div className="relative bg-slate-950/50 rounded-xl border border-white/5 p-4 flex items-center justify-center overflow-hidden aspect-[16/10]">
          {/* Base SVG Map Grid Layer */}
          <svg className="w-full h-full max-h-[380px]" viewBox="0 0 500 350">
            {/* Soft grid coordinates */}
            <defs>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(56, 189, 248, 0.15)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />

            {/* Simulated Regional Heat Circles / Boundaries */}
            {regions.map((reg) => {
              const isSelected = reg.name === selectedRegion;
              // Outbreak alerts overlay glow weight
              const regionOutbreaks = outbreaks.filter(o => o.region === reg.name && o.status === "Active");
              const hasCriticalOutbreak = regionOutbreaks.some(o => o.severity === "Critical");
              
              // Map vector colors dynamically based on active season
              let finalIntensity = 1.0;
              if (activeSeason === "Rainy" && ["Sub-Saharan Rainy Corridor", "Tropical Coastal Plain"].includes(reg.name)) {
                finalIntensity = 1.4;
              } else if (activeSeason === "Harmattan" && ["Harmattan Dustlands", "Arid Northern Province"].includes(reg.name)) {
                finalIntensity = 1.5;
              } else if (activeSeason === "Dry" && ["Harmattan Dustlands", "Dense Urban Metro"].includes(reg.name)) {
                finalIntensity = 1.2;
              }

              return (
                <g 
                  key={reg.name} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedRegion(reg.name)}
                >
                  {/* Outer Pulsating Ring for Hotspot alerting */}
                  <rect
                    x={`${reg.x}%`}
                    y={`${reg.y}%`}
                    width={reg.width}
                    height={reg.height}
                    rx="18"
                    fill={reg.color}
                    stroke={isSelected ? "#0ea5e9" : "transparent"}
                    strokeWidth={isSelected ? "2.5" : "0"}
                    className="transition-all duration-300 group-hover:opacity-80"
                    opacity={isSelected ? 0.95 * finalIntensity : 0.65 * finalIntensity}
                  />

                  {/* Outbreak Radar Ring */}
                  {regionOutbreaks.length > 0 && (
                    <circle
                      cx={`${reg.x + 10}%`}
                      cy={`${reg.y + 12}%`}
                      r={hasCriticalOutbreak ? "20" : "14"}
                      fill="none"
                      stroke={hasCriticalOutbreak ? "#ef4444" : "#f59e0b"}
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-ping"
                      style={{ transformOrigin: `${reg.x + 10}% ${reg.y + 12}%` }}
                    />
                  )}

                  {/* Marker Pin Icon */}
                  <g transform={`translate(${reg.x * 5 - 4}, ${reg.y * 3.5 - 12})`}>
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill={regionOutbreaks.length > 0 ? (hasCriticalOutbreak ? "#ef4444" : "#f59e0b") : "#0ea5e9"}
                    />
                  </g>

                  {/* Text labels */}
                  <text
                    x={`${reg.x + 8}%`}
                    y={`${reg.y + 18}%`}
                    className="text-[10px] font-bold fill-slate-800 dark:fill-white font-sans pointer-events-none"
                  >
                    {reg.name.split(' ')[0]}..
                  </text>
                </g>
              );
            })}

            {/* Heat legends */}
            <g transform="translate(20, 310)" className="text-[10px] font-semibold">
              <rect x="0" y="0" width="12" height="12" rx="3" fill="#ef4444" />
              <text x="18" y="10" className="fill-slate-500 dark:fill-slate-400">Critical Threat</text>
              
              <rect x="110" y="0" width="12" height="12" rx="3" fill="#f59e0b" />
              <text x="128" y="10" className="fill-slate-500 dark:fill-slate-400">High Threat</text>

              <rect x="210" y="0" width="12" height="12" rx="3" fill="#eab308" />
              <text x="228" y="10" className="fill-slate-500 dark:fill-slate-400">Moderate Threat</text>
            </g>
          </svg>

          {/* Floater outbreak status banner */}
          <div className="absolute top-3 left-3 bg-[#0a1120]/90 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm text-[10px]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-350 uppercase">
              {outbreaks.filter(o => o.status === "Active").length} Current Hotspot Outbreaks
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Click any physical zone above to synchronize demographic climate vectors and inspect localized pathogen intelligence metrics.</span>
        </div>
      </div>

      {/* Right Column: Local Patch Profile */}
      <div className="lg:col-span-4 bento-card p-6 space-y-5">
        <div className="border-b border-slate-150 dark:border-slate-800 pb-3">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-sky-500">Spatial Profile</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{selectedRegion}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1.5 ${getRiskBadge(currentRegion.risk)}`}>
            Threat Assessment: {currentRegion.risk}
          </span>
        </div>

        {/* Climate Details */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 font-mono block">Geographic Climate Type</span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{currentRegion.climate}</p>
        </div>

        {/* Season Factor Shift */}
        <div className="space-y-1 bg-slate-950/40 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-sky-500 mb-1">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Seasonal Sensitivity ({activeSeason})</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentRegion.seasonFactors[activeSeason]}
          </p>
        </div>

        {/* Specific hotspots within the selected region */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 font-mono block">High-Frequency Hotspot Centers</span>
          <div className="space-y-1.5">
            {currentRegion.hotspots.map((hot, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{hot}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active outbreaks in this specific region */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 font-mono block">Active Local Epidemics</span>
          
          {outbreaks.filter(o => o.region === selectedRegion && o.status === "Active").length === 0 ? (
            <div className="p-3 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 rounded-xl text-center">
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold block">✓ Pathogen Clearance</span>
              <span className="text-[10px] text-green-500">No active epidemic outbreaks currently flagged for this sector.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {outbreaks
                .filter(o => o.region === selectedRegion && o.status === "Active")
                .map((o) => (
                    <div key={o.id} className="p-3 bg-red-500/5 border border-red-500/25 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-red-600 dark:text-red-400 font-sans">{o.diseaseName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-red-600 font-bold text-white uppercase rounded leading-none">
                        {o.severity} Alert
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      Cases Registered: {o.casesCount} · Active Transmission
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {o.description}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

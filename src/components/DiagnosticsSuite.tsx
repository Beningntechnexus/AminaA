import React, { useState, useEffect } from 'react';
import { 
  Activity, MapPin, Thermometer, CloudRain, Wind, AlertTriangle, 
  HeartPulse, Navigation, Clock, Phone, ShieldCheck, Sparkles, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';
import { DiagnoseResponse, PredictionDetail, LocationInfo, Season, NearbyFacility } from '../types';

interface DiagnosticsSuiteProps {
  onAddDiagnosticQuery: () => void;
  mockLocations: LocationInfo[];
  symptomsText?: string;
  setSymptomsText?: (v: string) => void;
  selectedRegion?: string;
  setSelectedRegion?: (v: string) => void;
  season?: Season;
  setSeason?: (v: Season) => void;
  loading?: boolean;
  setLoading?: (v: boolean) => void;
  response?: DiagnoseResponse | null;
  setResponse?: (v: DiagnoseResponse | null) => void;
}

export default function DiagnosticsSuite({ 
  onAddDiagnosticQuery, 
  mockLocations,
  symptomsText: propsSymptomsText,
  setSymptomsText: propsSetSymptomsText,
  selectedRegion: propsSelectedRegion,
  setSelectedRegion: propsSetSelectedRegion,
  season: propsSeason,
  setSeason: propsSetSeason,
  loading: propsLoading,
  setLoading: propsSetLoading,
  response: propsResponse,
  setResponse: propsSetResponse
}: DiagnosticsSuiteProps) {
  const [internalSymptomsText, setInternalSymptomsText] = useState("I have headache, sudden high fever, chills, and muscle weakness with some joint stiffness.");
  const symptomsText = propsSymptomsText !== undefined ? propsSymptomsText : internalSymptomsText;
  const setSymptomsText = propsSetSymptomsText !== undefined ? propsSetSymptomsText : setInternalSymptomsText;

  const [internalSelectedRegion, setInternalSelectedRegion] = useState("Sub-Saharan Rainy Corridor");
  const selectedRegion = propsSelectedRegion !== undefined ? propsSelectedRegion : internalSelectedRegion;
  const setSelectedRegion = propsSetSelectedRegion !== undefined ? propsSetSelectedRegion : setInternalSelectedRegion;

  const [internalSeason, setInternalSeason] = useState<Season>("Rainy");
  const season = propsSeason !== undefined ? propsSeason : internalSeason;
  const setSeason = propsSetSeason !== undefined ? propsSetSeason : setInternalSeason;

  const [internalLoading, setInternalLoading] = useState(false);
  const loading = propsLoading !== undefined ? propsLoading : internalLoading;
  const setLoading = propsSetLoading !== undefined ? propsSetLoading : setInternalLoading;

  const [internalResponse, setInternalResponse] = useState<DiagnoseResponse | null>(null);
  const response = propsResponse !== undefined ? propsResponse : internalResponse;
  const setResponse = propsSetResponse !== undefined ? propsSetResponse : setInternalResponse;

  const [activeDisease, setActiveDisease] = useState<PredictionDetail | null>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);

  // State values for the dynamic Symptom Progression Timeline & Intervention simulator
  const [timelineDays, setTimelineDays] = useState(7);
  const [simulateTreatment, setSimulateTreatment] = useState(false);
  const [treatmentDay, setTreatmentDay] = useState(3);
  const [activePlotSymptoms, setActivePlotSymptoms] = useState<string[]>([]);

  // Synchronize active symptoms for timeline plot when response updates
  useEffect(() => {
    if (response?.extracted?.symptoms) {
      setActivePlotSymptoms(response.extracted.symptoms.slice(0, 4));
    } else {
      setActivePlotSymptoms(["fever", "headache", "body_weakness"]);
    }
  }, [response]);

  const getBaseSeverity = (symptomName: string, day: number) => {
    let peakDay = 3;
    let maxSev = 7;
    let shift = 1;
    
    switch(symptomName.toLowerCase()) {
      case 'fever':
        peakDay = Math.round(timelineDays * 0.4);
        maxSev = 8.5;
        shift = 1;
        break;
      case 'headache':
        peakDay = Math.round(timelineDays * 0.35);
        maxSev = 7.0;
        shift = 1;
        break;
      case 'vomiting':
        peakDay = Math.round(timelineDays * 0.3);
        maxSev = 7.5;
        shift = 2;
        break;
      case 'diarrhea':
        peakDay = Math.round(timelineDays * 0.35);
        maxSev = 9.0;
        shift = 2;
        break;
      case 'stiff_neck':
        peakDay = Math.round(timelineDays * 0.5);
        maxSev = 8.0;
        shift = 2;
        break;
      case 'confusion':
        peakDay = Math.round(timelineDays * 0.6);
        maxSev = 8.5;
        shift = 3;
        break;
      case 'short_breath':
        peakDay = Math.round(timelineDays * 0.5);
        maxSev = 7.8;
        shift = 2;
        break;
      case 'loss_taste_smell':
        peakDay = Math.round(timelineDays * 0.5);
        maxSev = 8.0;
        shift = 3;
        break;
      case 'body_weakness':
      case 'fatigue':
        peakDay = Math.round(timelineDays * 0.6);
        maxSev = 8.0;
        shift = 1;
        break;
      case 'cough':
        peakDay = Math.round(timelineDays * 0.55);
        maxSev = 6.5;
        shift = 2;
        break;
      default:
        peakDay = Math.round(timelineDays * 0.45);
        maxSev = 6.0;
        shift = 1;
        break;
    }
    
    if (day < shift) return 0;
    
    const sigma = timelineDays * 0.25;
    const exponent = -Math.pow(day - peakDay, 2) / (2 * Math.pow(sigma, 2));
    let val = maxSev * Math.exp(exponent);
    val += Math.sin(day * 0.8) * 0.3;
    
    return parseFloat(Math.min(Math.max(val, 0), 10).toFixed(1));
  };

  const getTimelinePhase = (totalDays: number, isTreated: boolean, intDay: number) => {
    if (isTreated) {
      return "Recovery / Resolution Phase";
    }
    return "Acute Sepsis Escalation Area";
  };

  const getPeakSeverityMetric = () => {
    if (activePlotSymptoms.length === 0) return "N/A";
    let maxVal = 0;
    let maxSym = "";
    let peakDay = 1;
    
    for (let d = 1; d <= timelineDays; d++) {
      activePlotSymptoms.forEach(sym => {
        let val = getBaseSeverity(sym, d);
        if (simulateTreatment && d >= treatmentDay) {
          val = parseFloat((val * Math.pow(0.55, d - treatmentDay)).toFixed(1));
        }
        if (val > maxVal) {
          maxVal = val;
          maxSym = sym;
          peakDay = d;
        }
      });
    }
    
    if (maxVal === 0) return "No active plot";
    return `${maxSym}: ${maxVal}/10 on Day ${peakDay}`;
  };

  const getTrendArrow = () => {
    if (simulateTreatment) {
      return { text: "↘ Resolving (Treatment Active)", color: "text-emerald-400" };
    }
    return { text: "↗ Escalating (No Therapy)", color: "text-red-500" };
  };

  const handleToggleSymptomPlot = (sym: string) => {
    if (activePlotSymptoms.includes(sym)) {
      setActivePlotSymptoms(activePlotSymptoms.filter(s => s !== sym));
    } else {
      setActivePlotSymptoms([...activePlotSymptoms, sym]);
    }
  };

  const timelineData = Array.from({ length: timelineDays }, (_, i) => {
    const day = i + 1;
    const item: any = {
      day,
      dayLabel: `Day ${day}`
    };
    
    activePlotSymptoms.forEach(sym => {
      let severity = getBaseSeverity(sym, day);
      if (simulateTreatment && day >= treatmentDay) {
        const decayPeriod = day - treatmentDay;
        const decayVal = Math.pow(0.55, decayPeriod);
        severity = parseFloat((severity * decayVal).toFixed(1));
      }
      item[sym] = severity;
    });
    
    return item;
  });

  const allAvailableSymptoms = response?.extracted?.symptoms || ["fever", "headache", "body_weakness"];

  // Auto-fill coordinates based on selected simulated epidemiological zone
  const getZoneCoordinates = (regionName: string) => {
    switch (regionName) {
      case "Tropical Coastal Plain":
        return { country: "Nigeria", state: "Lagos Belt", city: "Lagos Marine", lat: 6.452, lng: 3.391 };
      case "Harmattan Dustlands":
        return { country: "Nigeria", state: "Kano", city: "Kano North", lat: 11.991, lng: 8.516 };
      case "Arid Northern Province":
        return { country: "Nigeria", state: "Sokoto", city: "Sokoto Arid", lat: 13.062, lng: 5.233 };
      case "Dense Urban Metro":
        return { country: "Nigeria", state: "FCT Abuja", city: "Abuja City", lat: 9.076, lng: 7.398 };
      case "Sub-Saharan Rainy Corridor":
      default:
        return { country: "Nigeria", state: "Edo Forest Belt", city: "Benin Outskirts", lat: 6.335, lng: 5.626 };
    }
  };

  const currentZoneInfo = getZoneCoordinates(selectedRegion);

  // Load appropriate nearby facilities based on selected region
  useEffect(() => {
    fetchFacilities();
  }, [selectedRegion]);

  const fetchFacilities = () => {
    // Generate nearby clinics with calculated distances based on chosen region
    const baseClinics: NearbyFacility[] = [
      {
        id: "cf-1",
        name: `${selectedRegion.split(' ')[0]} Specialist Infectious Clinic`,
        type: "Specialist Clinic",
        distance: parseFloat((Math.random() * 4 + 1.2).toFixed(1)),
        travelTime: Math.round(Math.random() * 15 + 8),
        address: `Suite 12, Medical Commons, ${selectedRegion}`,
        phone: "+234-803-555-1020",
        latitude: currentZoneInfo.lat + 0.015,
        longitude: currentZoneInfo.lng - 0.012,
        services: ["Vector Diagnostics", "Hemostat Hydration", "Intense Fever Control"]
      },
      {
        id: "cf-2",
        name: `Regional Primary Healthcare Facility`,
        type: "Primary Health Clinic",
        distance: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
        travelTime: Math.round(Math.random() * 8 + 4),
        address: "7 Community Avenue",
        phone: "+234-811-300-4400",
        latitude: currentZoneInfo.lat - 0.008,
        longitude: currentZoneInfo.lng + 0.01,
        services: ["Standard Consultations", "Fever Panels", "Oral Rehydration (ORS)"]
      },
      {
        id: "cf-3",
        name: "State Emergency Quarantine & Isolation Base",
        type: "General Hospital",
        distance: parseFloat((Math.random() * 8 + 3.5).toFixed(1)),
        travelTime: Math.round(Math.random() * 25 + 12),
        address: "Highway 4 Interchange",
        phone: "+234-809-123-9999",
        latitude: currentZoneInfo.lat + 0.035,
        longitude: currentZoneInfo.lng + 0.02,
        services: ["Clinical Sepsis ICU", "Full Pathogen Isolation", "Critical Fluid Recalibration"]
      }
    ];
    setFacilities(baseClinics);
  };

  const simulateGPS = () => {
    setGpsSimulating(true);
    setTimeout(() => {
      // Pick a random region to simulate live physical tracking
      const regionsList = [
        "Tropical Coastal Plain",
        "Sub-Saharan Rainy Corridor",
        "Harmattan Dustlands",
        "Arid Northern Province",
        "Dense Urban Metro"
      ];
      const randomReg = regionsList[Math.floor(Math.random() * regionsList.length)];
      setSelectedRegion(randomReg);
      
      const seasonsList: Season[] = ["Rainy", "Dry", "Harmattan"];
      const rSeason = seasonsList[Math.floor(Math.random() * seasonsList.length)];
      setSeason(rSeason);

      setGpsSimulating(false);
    }, 1200);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsText.trim()) return;

    setLoading(true);
    try {
      const payload = {
        symptomsText,
        location: {
          ...currentZoneInfo,
          region: selectedRegion
        },
        season
      };

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data: DiagnoseResponse = await res.json();
      setResponse(data);
      if (data.predictions && data.predictions.length > 0) {
        setActiveDisease(data.predictions[0]);
      }
      onAddDiagnosticQuery(); // tick the audit/query updates in root
    } catch (err) {
      console.error("Clinical prediction pipeline failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-400';
      case 'High':
        return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-400';
      case 'Medium':
        return 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-400';
      default:
        return 'text-green-500 bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900/60 dark:text-green-400';
    }
  };

  const getSeasonIcon = (s: Season) => {
    switch (s) {
      case 'Rainy':
        return <CloudRain className="w-4 h-4 text-sky-500 inline mr-1" />;
      case 'Harmattan':
        return <Wind className="w-4 h-4 text-orange-400 inline mr-1" />;
      case 'Dry':
      case 'Summer':
        return <Thermometer className="w-4 h-4 text-amber-500 inline mr-1" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400 inline mr-1" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="diagnostics_suite">
      {/* Left Column: Natural Language Input & Geospatial Constraints */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bento-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950 rounded-xl">
              <Sparkles className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Symptom Input Channel</h2>
              <p className="text-xs text-slate-500">Extract vector symptom tokens using NLP</p>
            </div>
          </div>

          <form onSubmit={handleDiagnose} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Explain Symptoms in Natural Language
              </label>
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-sky-400 focus:outline-none text-sm transition"
                placeholder="Detail symptoms, estimated severity, frequency (e.g. 'I feel severe vomiting and high fever for 3 days...')"
              />
            </div>

            {/* Geographical Parameters */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 mr-1" /> Regional Hotspot Zone
                </label>
                <button
                  type="button"
                  onClick={simulateGPS}
                  disabled={gpsSimulating}
                  className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 font-medium bg-sky-50/60 dark:bg-sky-950/50 px-2 py-1 rounded-md transition"
                >
                  <RefreshCw className={`w-3 h-3 ${gpsSimulating ? 'animate-spin' : ''}`} />
                  {gpsSimulating ? "GPS Tracking..." : "Simulate Location"}
                </button>
              </div>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-xl text-sm focus:outline-none transition"
              >
                <option value="Sub-Saharan Rainy Corridor">Sub-Saharan Rainy Corridor (Nematode Vectors)</option>
                <option value="Tropical Coastal Plain">Tropical Coastal Plain (Marine Sanitation Risk)</option>
                <option value="Harmattan Dustlands">Harmattan Dustlands (Sore mucous/Meningitis belt)</option>
                <option value="Arid Northern Province">Arid Northern Province (Arid Dry Heat clusters)</option>
                <option value="Dense Urban Metro">Dense Urban Metro (Airborne transmission focus)</option>
              </select>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-900/60 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="block text-slate-400">Simulated City</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">{currentZoneInfo.city}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Coordinates</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300 font-mono">
                    {currentZoneInfo.lat.toFixed(3)}°N, {currentZoneInfo.lng.toFixed(3)}°E
                  </span>
                </div>
              </div>
            </div>

            {/* Seasonal Controls */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                Seasonal Vector Control
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Rainy', 'Dry', 'Harmattan'] as Season[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeason(s)}
                    className={`py-2 text-xs font-medium rounded-xl border transition flex items-center justify-center ${
                      season === s 
                        ? 'bg-sky-50 border-sky-300 text-sky-600 dark:bg-sky-950/60 dark:border-sky-800' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {getSeasonIcon(s)}
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-center opacity-70">
                {(['Spring', 'Summer', 'Autumn', 'Winter'] as Season[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeason(s)}
                    className={`px-2 py-0.5 text-[10px] rounded border transition ${
                      season === s 
                        ? 'bg-sky-50 border-sky-300 text-sky-600 dark:bg-sky-950/60 dark:border-sky-800' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Diagnosis Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl font-medium shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-98 transition flex items-center justify-center gap-2 text-sm disabled:opacity-75"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Spatio-Temporal Features...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Synthesize Diagnostic Diagnosis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Global Medical Disclaimer Box */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
              Required Medical Disclaimer
            </span>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-1 leading-relaxed">
              This result is not a medical diagnosis. Please consult a healthcare professional. All predictions represent statistical spatio-temporal risk indices.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Prediction Dashboard with Explainability and Facilities */}
      <div className="lg:col-span-7">
        {!response ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-950/20 rounded-2xl border border-dashed border-white/10 min-h-[480px]">
            <div className="p-4 bg-sky-50 dark:bg-sky-950/50 rounded-full text-sky-500 mb-4 animate-bounce">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Awaiting Symptom Parsing</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Enter clinical complaints in the input channel, configure the geographical parameters, and launch diagnostic synthesis.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Symptom Extraction Results Card */}
            <div className="bento-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Spatio-Temporal Constraints Match</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {response.location.region} · {response.season} season
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-slate-600 rounded">
                    Freq: {response.extracted.frequency}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-slate-600 rounded">
                    Span: {response.extracted.duration}
                  </span>
                  <span className={`px-2 py-1 font-semibold rounded ${
                    response.extracted.severity === 'Severe' ? 'bg-red-50 text-red-500 dark:bg-red-950/40' : 'bg-blue-50 text-blue-500 dark:bg-blue-950/40'
                  }`}>
                    Severity: {response.extracted.severity}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  NLP Extracted Vector-Tokens
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {response.extracted.symptoms.map((sym, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 text-xs font-mono rounded-lg border border-sky-100 dark:border-sky-900/60">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Disease Likelihood Ranking */}
            <div className="bento-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Calculated Disease Probability Rankings
                </h3>
                <p className="text-xs text-slate-500">Cross-analyzed with regional outbreak indices and current climate weather vectors</p>
              </div>

              <div className="space-y-3">
                {response.predictions.map((pred) => (
                  <div
                    key={pred.diseaseId}
                    onClick={() => setActiveDisease(pred)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      activeDisease?.diseaseId === pred.diseaseId
                        ? 'border-sky-450 bg-sky-500/10 shadow-[0_0_15px_rgba(56,189,248,0.15)] dark:border-sky-500'
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-1 pr-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">{pred.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border leading-none ${getRiskColor(pred.riskLevel)}`}>
                          {pred.riskLevel}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            pred.riskLevel === 'Critical' 
                              ? 'bg-red-500' 
                              : pred.riskLevel === 'High' 
                              ? 'bg-amber-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-lg font-bold text-slate-800 dark:text-white font-mono">
                        {pred.probability}%
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currently Selected Disease - Explainability Engine */}
            {activeDisease && (
              <div className="bento-card-highlight p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold">Explainability Engine Details</span>
                    <h4 className="text-base font-bold text-slate-800 dark:text-white">Why calculated {activeDisease.name}?</h4>
                  </div>
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Risk Assessment: {activeDisease.riskLevel}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl space-y-1 border border-slate-100 dark:border-slate-900">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block font-mono">1. Symptom Correlation Check</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activeDisease.explanation.symptomMatch}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl space-y-1 border border-slate-100 dark:border-slate-900">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block font-mono">2. Seasonal Weather Indicators</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activeDisease.explanation.weatherInfluence}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl space-y-1 border border-slate-100 dark:border-slate-900">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block font-mono">3. Geographic Multipliers</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activeDisease.explanation.geographyFactor}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl space-y-1 border border-slate-100 dark:border-slate-900">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 block font-mono">4. Epidemic/Hotspot Co-occurrence</span>
                    <p className="text-slate-700 dark:text-slate-305 leading-relaxed font-semibold text-red-600 dark:text-red-400">{activeDisease.explanation.outbreakImpact}</p>
                  </div>
                </div>

                {/* Medical Guidance & Preventative Action tabs */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-widest">Recommended Actions</span>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                      {activeDisease.guidance.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-widest">Preventative Care</span>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                      {activeDisease.prevention.map((prev, idx) => (
                        <li key={idx}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Symptom Progression Timeline (Recharts) */}
            <div className="bento-card p-6 space-y-4" id="symptom_progression_timeline">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-3 gap-3">
                <div>
                  <span className="text-[10px] text-sky-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 animate-pulse text-sky-500" />
                    TEMPORAL PROGNOSIS SYSTEM
                  </span>
                  <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    Symptom Progression & Timeline Modeling
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Simulate Therapy button/toggle */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-pointer select-none hover:bg-emerald-500/20 transition">
                    <input 
                      type="checkbox" 
                      checked={simulateTreatment} 
                      onChange={(e) => setSimulateTreatment(e.target.checked)}
                      className="rounded border-white/10 text-emerald-600 focus:ring-emerald-500 bg-slate-950/40"
                    />
                    <span className="font-semibold text-[9px] uppercase tracking-wider font-mono">Simulate Therapy</span>
                  </label>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Visualizing how symptoms wax and wane over a simulated <span className="text-sky-400 font-semibold">{timelineDays}-day pathogenetic duration</span>. Interact with selectors below to hide or reveal individual symptom timeline tracks.
              </p>

              {/* Active Symptoms Multi-Select Badges */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Symptom Overlays:</span>
                <div className="flex flex-wrap gap-2">
                  {allAvailableSymptoms.map((sym) => {
                    const isSelected = activePlotSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleToggleSymptomPlot(sym)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-bold' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-450 animate-pulse' : 'bg-slate-600'}`} />
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controls row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs">
                {/* Duration slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    <span>Infection Duration</span>
                    <span className="text-sky-400 font-mono">{timelineDays} Days</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="14" 
                    value={timelineDays} 
                    onChange={(e) => {
                      const newTimelineDays = parseInt(e.target.value);
                      setTimelineDays(newTimelineDays);
                      if (treatmentDay >= newTimelineDays) {
                        setTreatmentDay(newTimelineDays - 1);
                      }
                    }}
                    className="w-full accent-sky-500 cursor-pointer" 
                  />
                </div>

                {/* Treatment simulation slider */}
                <div className={`space-y-1.5 transition-opacity ${simulateTreatment ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    <span>Clinical Intervention Day</span>
                    <span className={`${simulateTreatment ? 'text-emerald-400 font-mono font-bold' : 'text-slate-500 font-mono'}`}>
                      {simulateTreatment ? `Day ${treatmentDay}` : 'N/A (Off)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={timelineDays - 1}
                    value={treatmentDay}
                    disabled={!simulateTreatment}
                    onChange={(e) => setTreatmentDay(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 disabled:cursor-not-allowed cursor-pointer"
                  />
                </div>
              </div>

              {/* Recharts Timeline Plots */}
              <div className="h-64 bg-[#050B1A]/40 rounded-xl border border-white/5 p-4 relative">
                {activePlotSymptoms.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xs text-slate-500">No active symptom tracks selected.</span>
                    <span className="text-[10px] text-slate-600 mt-1">Select one or more templates in the badge section above.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                      <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0a1120', 
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#cbd5e1',
                          fontSize: '11px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        }} 
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                      />
                      
                      {simulateTreatment && (
                        <ReferenceLine 
                          x={`Day ${treatmentDay}`} 
                          stroke="#10b981" 
                          strokeDasharray="3 3"
                          label={{ 
                            value: 'Intervention Onset', 
                            position: 'insideTopRight', 
                            fill: '#059669', 
                            fontSize: 9,
                            fontWeight: 'bold'
                          }} 
                        />
                      )}

                      {activePlotSymptoms.map((sym, index) => {
                        const colors = [
                          '#38bdf8', // sky-400
                          '#f43f5e', // rose-500
                          '#fbbf24', // amber-400
                          '#a78bfa', // violet-400
                          '#34d399', // emerald-400
                          '#f97316', // orange-500
                          '#60a5fa'  // blue-405
                        ];
                        const strokeColor = colors[index % colors.length];
                        return (
                          <Line 
                            key={sym}
                            type="monotone" 
                            dataKey={sym} 
                            stroke={strokeColor} 
                            strokeWidth={2.5}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 6 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chronological Phase Metrics Cards */}
              <div className="bg-[#0a1120]/45 border border-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Chronological Phase Assessment</span>
                  <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-mono font-bold rounded border border-sky-500/20 uppercase tracking-widest">
                    {getTimelinePhase(timelineDays, simulateTreatment, treatmentDay)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">Peak Severity</span>
                    <span className="font-extrabold text-slate-200 mt-0.5 block truncate">{getPeakSeverityMetric()}</span>
                  </div>
                  <div className="bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">Current Trend</span>
                    <span className={`font-extrabold mt-0.5 block ${getTrendArrow().color}`}>{getTrendArrow().text}</span>
                  </div>
                  <div className="bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">Therapy Decay</span>
                    <span className="font-extrabold text-slate-300 mt-0.5 block">
                      {simulateTreatment ? 'Active (55%/day)' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">Model Match</span>
                    <span className="font-extrabold text-sky-400 mt-0.5 block truncate">
                      {activeDisease ? activeDisease.name : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearest Clinical Facilities */}
            <div className="bento-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Nearest Certified Epidemiological Care Centers
                </h3>
                <p className="text-xs text-slate-500">Geospatially routed based on selected location coordinate boundaries</p>
              </div>

              <div className="slate-y-3 space-y-3">
                {facilities.map((fac) => (
                  <div key={fac.id} className="p-4 bg-[#0a1120]/45 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-white">{fac.name}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-medium rounded text-slate-600 dark:text-slate-300">
                          {fac.type}
                        </span>
                      </div>
                      <span className="text-slate-400 block">{fac.address}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {fac.services.map((srv, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-sky-50/60 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 rounded text-[10px]">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:text-right shrink-0 flex md:flex-col items-center md:items-end gap-2 md:gap-0 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{fac.distance} km away</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400">~{fac.travelTime} mins travel</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-slate-550 mr-4 md:mr-0">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-500">{fac.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

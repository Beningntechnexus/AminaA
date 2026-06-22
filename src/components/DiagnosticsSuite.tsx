import React, { useState, useEffect } from 'react';
import { 
  Activity, MapPin, Thermometer, CloudRain, Wind, AlertTriangle, 
  HeartPulse, Navigation, Clock, Phone, ShieldCheck, Sparkles, RefreshCw 
} from 'lucide-react';
import { DiagnoseResponse, PredictionDetail, LocationInfo, Season, NearbyFacility } from '../types';

interface DiagnosticsSuiteProps {
  onAddDiagnosticQuery: () => void;
  mockLocations: LocationInfo[];
}

export default function DiagnosticsSuite({ onAddDiagnosticQuery, mockLocations }: DiagnosticsSuiteProps) {
  const [symptomsText, setSymptomsText] = useState("I have headache, sudden high fever, chills, and muscle weakness with some joint stiffness.");
  const [selectedRegion, setSelectedRegion] = useState("Sub-Saharan Rainy Corridor");
  const [season, setSeason] = useState<Season>("Rainy");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DiagnoseResponse | null>(null);
  const [activeDisease, setActiveDisease] = useState<PredictionDetail | null>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);

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

import React, { useState } from 'react';
import { 
  Database, UserCheck, ShieldAlert, Cpu, Plus, Trash2, 
  RefreshCw, FileSpreadsheet, Lock, AlertTriangle, Layers, CheckCircle 
} from 'lucide-react';
import { Disease, Outbreak, MLModelMetrics, AuditLog } from '../types';

interface AdminSuiteProps {
  diseases: Disease[];
  outbreaks: Outbreak[];
  models: MLModelMetrics[];
  logs: AuditLog[];
  onRefreshData: () => void;
}

export default function AdminSuite({ diseases, outbreaks, models, logs, onRefreshData }: AdminSuiteProps) {
  // Retraining Simulation
  const [trainingModel, setTrainingModel] = useState<string | null>(null);
  const [datasetRows, setDatasetRows] = useState(1500);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Disease Addition CRUD state
  const [diseaseName, setDiseaseName] = useState("");
  const [diseaseDesc, setDiseaseDesc] = useState("");
  const [diseaseRisk, setDiseaseRisk] = useState<'Low' | 'Medium' | 'High' | 'Critical'>("Medium");
  const [tempSymptom, setTempSymptom] = useState("fever");
  const [tempWeight, setTempWeight] = useState(1.5);
  const [customSymptomWeights, setCustomSymptomWeights] = useState<Record<string, number>>({ fever: 1.5, headache: 1.2 });
  const [customGuidance, setCustomGuidance] = useState("Consult diagnostic clinical protocols.");

  // Outbreak Addition state
  const [outbreakDiseaseId, setOutbreakDiseaseId] = useState("cholera");
  const [outbreakRegion, setOutbreakRegion] = useState("Sub-Saharan Rainy Corridor");
  const [outbreakCases, setOutbreakCases] = useState(150);
  const [outbreakSeverity, setOutbreakSeverity] = useState<'Moderate' | 'Severe' | 'Critical'>("Severe");
  const [outbreakDesc, setOutbreakDesc] = useState("");

  const handleAddModel = (modelId: string) => {
    fetch("/api/ml/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelId })
    })
    .then(() => onRefreshData())
    .catch(err => console.error("Could not switch model pipeline", err));
  };

  const handleRetrain = (modelId: string) => {
    setTrainingModel(modelId);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Send API call to upgrade statistics on the backend
          fetch("/api/ml/retrain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ modelId, datasetRowsCount: datasetRows })
          })
          .then(() => {
            setTrainingModel(null);
            onRefreshData();
          });
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName || !diseaseDesc) return;

    const payload = {
      name: diseaseName,
      description: diseaseDesc,
      baselinePrevalence: 10,
      symptomWeights: customSymptomWeights,
      seasonalWeights: { Rainy: 1.3, Harmattan: 1.0, Dry: 0.8 },
      geographicWeights: { "Sub-Saharan Rainy Corridor": 1.2, "Dense Urban Metro": 1.1 },
      guidance: [customGuidance],
      prevention: ["Standard sanitary control", "Practice routine vaccine schedules"],
      riskLevel: diseaseRisk
    };

    fetch("/api/diseases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(() => {
      setDiseaseName("");
      setDiseaseDesc("");
      setCustomSymptomWeights({ fever: 1.5, headache: 1.2 });
      onRefreshData();
    })
    .catch(err => console.error(err));
  };

  const handleDeleteDisease = (id: string) => {
    fetch(`/api/diseases/${id}`, {
      method: "DELETE"
    })
    .then(() => onRefreshData())
    .catch(err => console.error(err));
  };

  const handleAddOutbreak = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      diseaseId: outbreakDiseaseId,
      region: outbreakRegion,
      casesCount: outbreakCases,
      severity: outbreakSeverity,
      description: outbreakDesc || "Abnormal clinical hospital cluster flagged."
    };

    fetch("/api/outbreaks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(() => {
      setOutbreakDesc("");
      onRefreshData();
    })
    .catch(err => console.error(err));
  };

  const handleContainOutbreak = (id: string) => {
    fetch(`/api/outbreaks/${id}`, {
      method: "PATCH"
    })
    .then(() => onRefreshData())
    .catch(err => console.error(err));
  };

  const handleAddSymptomWeight = () => {
    if (!tempSymptom) return;
    setCustomSymptomWeights(prev => ({
      ...prev,
      [tempSymptom.toLowerCase().replace(/\s+/g, '_')]: Number(tempWeight)
    }));
  };

  return (
    <div className="space-y-6" id="admin_command_deck">
      {/* Systems Status Summary Header Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-4 shadow-sm text-xs">
          <span className="text-slate-400 block font-bold uppercase tracking-widest text-[9px]">Spatio Diseases</span>
          <span className="text-2xl font-black text-slate-800 dark:text-white font-mono mt-1 block">{diseases.length}</span>
          <span className="text-[10px] text-green-500 mt-1 block">✓ Unlimited Extension Active</span>
        </div>

        <div className="bento-card p-4 shadow-sm text-xs">
          <span className="text-slate-400 block font-bold uppercase tracking-widest text-[9px]">Active Epidemics</span>
          <span className="text-2xl font-black text-red-500 font-mono mt-1 block">
            {outbreaks.filter(o => o.status === "Active").length}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Altering diagnostic likelihood</span>
        </div>

        <div className="bento-card p-4 shadow-sm text-xs">
          <span className="text-slate-400 block font-bold uppercase tracking-widest text-[9px]">Ensemble ML Accuracy</span>
          <span className="text-2xl font-black text-sky-500 font-mono mt-1 block">
            {(models.find(m => m.status === "Selected")?.accuracy || 0.942 * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">XGBoost core primary diagnostics</span>
        </div>

        <div className="bento-card p-4 shadow-sm text-xs">
          <span className="text-slate-400 block font-bold uppercase tracking-widest text-[9px]">HIPAA Secure Audits</span>
          <span className="text-2xl font-black text-emerald-500 font-mono mt-1 block">{logs.length} Log entries</span>
          <span className="text-[10px] text-emerald-500 mt-1 block font-semibold flex items-center gap-0.5">
            <Lock className="w-3 h-3 inline" /> 100% encrypted logs
          </span>
        </div>
      </div>

      {/* Grid: Retraining Machine learning pipeline & Declare Outbreaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Learning Model Center */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950 rounded-xl">
              <Cpu className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Machine Learning Diagnostic Pipelines</h3>
              <p className="text-xs text-slate-500">Enable, compare, or trigger retraining cycles on custom dataset CSV files</p>
            </div>
          </div>

          <div className="space-y-3">
            {models.map((mod) => (
              <div 
                key={mod.id} 
                className={`p-3.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs ${
                  mod.status === 'Selected' 
                    ? 'border-sky-500 bg-sky-500/5 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                    : 'border-white/5 bg-slate-950/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{mod.name}</span>
                    <span className={`px-2 py-0.5 leading-none rounded text-[9px] font-bold ${
                      mod.status === 'Selected' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {mod.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Acc: <b>{mod.accuracy.toFixed(3)}</b></span>
                    <span>•</span>
                    <span>F1: <b>{mod.f1Score.toFixed(3)}</b></span>
                    <span>•</span>
                    <span>ROC: <b>{mod.rocAuc.toFixed(3)}</b></span>
                    <span>•</span>
                    <span>Epochs: <b>{mod.epochs}</b></span>
                  </div>
                </div>

                <div className="flex gap-2 self-stretch md:self-auto">
                  {mod.status !== 'Selected' && (
                    <button
                      onClick={() => handleAddModel(mod.id)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded text-[10px] text-slate-700 dark:text-slate-350 transition flex-1 md:flex-none text-center"
                    >
                      Use Pipeline
                    </button>
                  )}
                  <button
                    onClick={() => handleRetrain(mod.id)}
                    disabled={trainingModel !== null}
                    className="px-2.5 py-1.5 bg-sky-50 text-sky-500 hover:bg-sky-100 font-semibold rounded text-[10px] select-none transition flex items-center justify-center gap-1 flex-1 md:flex-none text-center"
                  >
                    <RefreshCw className="w-3 h-3" /> Retrain
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Model Retraining Custom CSV configuration */}
          {trainingModel && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-900 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-500 animate-bounce" />
                  Retraining pipeline on custom clinical CSV file...
                </span>
                <span className="font-mono text-sky-500">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all duration-150" style={{ width: `${trainingProgress}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Model Target: {models.find(m => m.id === trainingModel)?.name}</span>
                <span>Dataset: <b>{datasetRows} CSV Rows</b> uploaded</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <span className="text-slate-400 font-mono">Simulate Clinical Dataset Volume:</span>
            <input
              type="number"
              value={datasetRows}
              onChange={(e) => setDatasetRows(Math.max(10, parseInt(e.target.value) || 1200))}
              className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold focus:outline-none"
            />
          </div>
        </div>

        {/* Global Outbreak Center */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Epidemiological Outbreak Declarations</h3>
              <p className="text-xs text-slate-500">Inject active pathogen alarms to automatically shift diagnostic coordinates</p>
            </div>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {outbreaks.map((out) => (
              <div key={out.id} className="p-3 bg-slate-950/45 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{out.diseaseName}</span>
                    <span className="text-[9px] px-1 bg-slate-200/50 rounded uppercase font-medium">{out.region.split(' ')[0]}</span>
                    <span className={`text-[9px] px-1 font-bold rounded uppercase ${
                      out.status === 'Active' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                    }`}>
                      {out.status}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-500">
                    Cases: <b>{out.casesCount}</b> · Outbreak Severity: <b>{out.severity}</b>
                  </span>
                </div>

                {out.status === "Active" && (
                  <button
                    onClick={() => handleContainOutbreak(out.id)}
                    className="px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 font-semibold rounded text-[10px] transition"
                  >
                    Contain Outbreak
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddOutbreak} className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5 font-bold uppercase text-[9px]">Select Disease</label>
                <select
                  value={outbreakDiseaseId}
                  onChange={(e) => setOutbreakDiseaseId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 rounded border focus:outline-none"
                >
                  {diseases.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-bold uppercase text-[9px]">Geospatial Hotspot Region</label>
                <select
                  value={outbreakRegion}
                  onChange={(e) => setOutbreakRegion(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 rounded border focus:outline-none"
                >
                  <option value="Sub-Saharan Rainy Corridor">Sub-Saharan Rainy Corridor</option>
                  <option value="Tropical Coastal Plain">Tropical Coastal Plain</option>
                  <option value="Harmattan Dustlands">Harmattan Dustlands</option>
                  <option value="Arid Northern Province">Arid Northern Province</option>
                  <option value="Dense Urban Metro">Dense Urban Metro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5 font-bold uppercase text-[9px]">Confirmed Cases Volume</label>
                <input
                  type="number"
                  value={outbreakCases}
                  onChange={(e) => setOutbreakCases(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full px-2 py-1 bg-slate-50 rounded border focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-bold uppercase text-[9px]">Severity Alarm</label>
                <select
                  value={outbreakSeverity}
                  onChange={(e) => setOutbreakSeverity(e.target.value as any)}
                  className="w-full px-2 py-1 bg-slate-50 rounded border focus:outline-none"
                >
                  <option value="Moderate">Moderate Cluster</option>
                  <option value="Severe">Severe Epidemic</option>
                  <option value="Critical">Critical Emergency</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Outbreak narrative description / source tracing..."
              value={outbreakDesc}
              onChange={(e) => setOutbreakDesc(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 rounded border text-xs focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-1.5 bg-red-500 hover:bg-red-600 font-bold text-white uppercase tracking-wider rounded text-[10px] transition"
            >
              🚀 Declare Hotspot Alarm Trigger
            </button>
          </form>
        </div>
      </div>

      {/* Disease Management CRUD Panel (Unlimited Future Extension!) */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
            <Layers className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Configured Clinical Disease Archetypes</h3>
            <p className="text-xs text-slate-500">Unrestricted clinical schema updates support the inclusion of new pathogen indices at any time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
          {/* Custom Creation Card Form */}
          <div className="p-4 bg-emerald-50/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center justify-between">
              Create New Vector Archetype
              <Plus className="w-4 h-4 text-emerald-600" />
            </h4>
            
            <form onSubmit={handleAddDisease} className="space-y-2 text-xs">
              <input
                type="text"
                placeholder="Disease Name (e.g. Zika Virus)"
                value={diseaseName}
                required
                onChange={(e) => setDiseaseName(e.target.value)}
                className="w-full px-2 py-1 bg-white border rounded focus:outline-none"
              />

              <input
                type="text"
                placeholder="Diagnostic Narrative description..."
                value={diseaseDesc}
                required
                onChange={(e) => setDiseaseDesc(e.target.value)}
                className="w-full px-2 py-1 bg-white border rounded focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[9px] uppercase font-semibold text-slate-400 block">Threat Rating</label>
                  <select
                    value={diseaseRisk}
                    onChange={(e) => setDiseaseRisk(e.target.value as any)}
                    className="w-full px-1.5 py-0.5 bg-white border rounded focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-semibold text-slate-400 block">Baseline Prev %</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-1.5 py-0.5 bg-white border rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Symptom Weight Matrix Builder */}
              <div className="p-2 border rounded bg-white space-y-1">
                <span className="text-[9px] font-bold text-slate-450 block uppercase">Pathology Symptoms Vector</span>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Symptom Key (e.g., rash)"
                    value={tempSymptom}
                    onChange={(e) => setTempSymptom(e.target.value)}
                    className="w-full px-1.5 py-0.5 bg-slate-50 border rounded text-[10px]"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(Number(e.target.value) || 1.0)}
                    className="w-12 px-1 py-0.5 bg-slate-50 border rounded text-[10px] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddSymptomWeight}
                    className="px-1.5 bg-sky-500 text-white rounded font-bold hover:bg-sky-600"
                  >
                    +
                  </button>
                </div>
                {Object.keys(customSymptomWeights).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(customSymptomWeights).map(([k, v]) => (
                      <span key={k} className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-[8px] font-mono">
                        {k}:<b>{v}</b>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Clinical Treatment guidance..."
                value={customGuidance}
                onChange={(e) => setCustomGuidance(e.target.value)}
                className="w-full px-2 py-1 bg-white border rounded focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 text-white font-bold uppercase tracking-wider rounded text-[10px] transition hover:bg-emerald-700"
              >
                Synthesize Disease Archetype
              </button>
            </form>
          </div>

          {/* Active Disease Inventory cards */}
          {diseases.map((dis) => (
            <div key={dis.id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-xl flex flex-col justify-between shadow-sm text-xs space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{dis.name}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase ${
                    dis.riskLevel === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-105 text-blue-600'
                  }`}>
                    {dis.riskLevel} Risk
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px] line-clamp-2">{dis.description}</p>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-850 pt-2 text-[10px] space-y-1">
                  <div>
                    <span className="text-slate-400 font-mono">Symptom Multipliers:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5 max-h-12 overflow-y-auto">
                      {Object.entries(dis.symptomWeights).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="bg-slate-150/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 py-0.5 rounded text-[8px] font-mono">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prevent deleting default system hard-coded entries to protect metrics sandbox */}
              {!["malaria", "dengue", "typhoid", "cholera", "meningitis"].includes(dis.id) ? (
                <button
                  onClick={() => handleDeleteDisease(dis.id)}
                  className="w-full py-1 border border-red-200 text-red-500 hover:bg-red-50 rounded text-[10px] font-bold uppercase transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Decommission Vector
                </button>
              ) : (
                <span className="text-[9px] text-slate-400 block text-center uppercase tracking-widest bg-slate-100 dark:bg-slate-800 py-1 rounded">
                  ✓ Core Core Framework Vector
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* HIPAA Compliant Secure Audit Log Deck */}
      <div className="bento-card p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-250 dark:text-white">HIPAA-Inspired Security Audit Console</h3>
              <p className="text-xs text-slate-400">Continuous cryptographic tracking of server operations, model weights, and diagnostics queries</p>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-black uppercase tracking-widest font-mono">
            Encrypted Block: Active
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="p-3 bg-[#0a1120]/45 rounded-xl border border-white/5 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2 font-mono"
            >
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    log.status === 'SUCCESS' ? 'bg-green-150/60 text-green-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold uppercase">{log.action}</span>
                  <span className="text-[10px] text-slate-400">• Operator: {log.user} ({log.role})</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">{log.details}</p>
              </div>

              <div className="text-right shrink-0 font-mono text-[9px] text-slate-400 space-y-0.5">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="block">IP: {log.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

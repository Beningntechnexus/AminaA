import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import type { Outbreak, MLModelMetrics, AuditLog, NearbyFacility, Season } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini API client (with lazy load / resilient checks)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  console.log("Initializing Gemini AI Client with provided API Key...");
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.log("No GEMINI_API_KEY provided or using placeholder. Fallback parsing activated.");
}

// Global In-Memory Persistent States
// Initialize Standard Diseases
let diseases = [
  {
    id: "malaria",
    name: "Malaria",
    description: "A mosquito-borne infectious disease caused by Plasmodium parasites, characterized by fever, chills, and flu-like illness.",
    baselinePrevalence: 25.0,
    symptomWeights: { fever: 1.8, chills: 1.7, headache: 1.2, vomiting: 1.3, fatigue: 1.1, body_weakness: 1.4 },
    seasonalWeights: { Rainy: 2.0, Summer: 1.4, Spring: 1.1, Dry: 0.5, Harmattan: 0.4, Autumn: 0.8, Winter: 0.6 },
    geographicWeights: { "Sub-Saharan Rainy Corridor": 2.2, "Tropical Coastal Plain": 1.7, "Dense Urban Metro": 1.1, "Arid Northern Province": 0.8, "Harmattan Dustlands": 0.7 },
    guidance: ["Take prescribed Artemisinin-based combination therapy (ACT).", "Ensure continuous hydration.", "Rest in a well-ventilated room.", "Monitor body temperature hourly.", "Report any severe disorientation to the ER immediately."],
    prevention: ["Sleep under factory-treated insecticide nets (LLINs).", "Apply spatial and topical mosquito repellents containing DEET.", "Clear stagnant water pools around residential buildings.", "Install perimeter mesh screens on windows and doors."],
    riskLevel: "High" as const
  },
  {
    id: "dengue",
    name: "Dengue Fever",
    description: "A painful, debilitating mosquito-borne viral infection causing high fever, severe skin rashes, and excruciating bone/joint pain.",
    baselinePrevalence: 18.0,
    symptomWeights: { fever: 1.9, headache: 1.5, rash: 1.8, joint_pain: 2.2, vomiting: 1.2, nausea: 1.3 },
    seasonalWeights: { Rainy: 1.8, Summer: 1.6, Spring: 1.2, Dry: 0.4, Harmattan: 0.3, Autumn: 0.9, Winter: 0.5 },
    geographicWeights: { "Tropical Coastal Plain": 2.1, "Dense Urban Metro": 1.6, "Sub-Saharan Rainy Corridor": 1.4, "Arid Northern Province": 0.5, "Harmattan Dustlands": 0.4 },
    guidance: ["Avoid taking NSAIDs (like Ibuprofen or Aspirin) as they increase bleeding risks; use Acetaminophen wrapper safely.", "Stay on absolute bed rest.", "Consume abundant oral rehydration solution (ORS).", "Monitor for warning signs: abdominal pain, mucosal bleeding, persistent vomiting."],
    prevention: ["Dispose of water-collecting discarded containers, tires, or cans.", "Wear long-sleeved protection in mosquito-dense hours.", "Coordinate localized mosquito fogging campaigns."],
    riskLevel: "High" as const
  },
  {
    id: "typhoid",
    name: "Typhoid Fever",
    description: "A bacterial infection caused by Salmonella Typhi, primarily transmitted through contaminated food or drinking water.",
    baselinePrevalence: 15.0,
    symptomWeights: { fever: 1.6, headache: 1.2, stomach_pain: 1.7, diarrhea: 1.5, constipation: 1.1, vomiting: 1.1 },
    seasonalWeights: { Rainy: 1.6, Summer: 1.4, Dry: 1.1, Spring: 1.0, Harmattan: 0.9, Autumn: 1.0, Winter: 0.8 },
    geographicWeights: { "Dense Urban Metro": 1.8, "Tropical Coastal Plain": 1.5, "Sub-Saharan Rainy Corridor": 1.3, "Arid Northern Province": 1.1, "Harmattan Dustlands": 1.1 },
    guidance: ["Consult doctor immediately for targeted antibiotic regimes (e.g. Ciprofloxacin or Ceftriaxone).", "Stick strictly to boiled, purified, or bottled water.", "Consume blank, low-fiber, cooked warm foods.", "Thoroughly sanitize hands after using washroom."],
    prevention: ["Verify sanitary source of food handlers and street food vendors.", "Receive standard Typhoid vaccine boosters.", "Implement modern sewage sanitation standards."],
    riskLevel: "Medium" as const
  },
  {
    id: "cholera",
    name: "Cholera",
    description: "An acute diarrheal infection caused by ingestion of food or water contaminated with the Vibrio cholerae bacterium, capable of causing fatal dehydration within hours.",
    baselinePrevalence: 10.0,
    symptomWeights: { diarrhea: 2.5, vomiting: 1.8, cramping: 1.5, dry_mouth: 1.6, body_weakness: 1.4 },
    seasonalWeights: { Rainy: 2.2, Summer: 1.5, Dry: 0.6, Harmattan: 0.5, Spring: 0.9, Autumn: 1.1, Winter: 0.4 },
    geographicWeights: { "Tropical Coastal Plain": 2.3, "Dense Urban Metro": 1.6, "Sub-Saharan Rainy Corridor": 1.5, "Arid Northern Province": 0.6, "Harmattan Dustlands": 0.5 },
    guidance: ["Start drinkable ORS aggressively by the cupful immediate onset of symptoms.", "Prepare for urgent hospital transfer if vomiting prevents oral fluid intake.", "Do not administer anti-diarrheal medications which retain cholera toxins in bowels."],
    prevention: ["Strictly utilize chlorinated or boiled water for drink, cooking, and brushing.", "Always wash hands with clean running water and soap before prep.", "Practice hygienic defecation system."],
    riskLevel: "Critical" as const
  },
  {
    id: "lassa_fever",
    name: "Lassa Fever",
    description: "An acute viral hemorrhagic illness transmitter to humans through contact with food resources contaminated with rodent urine or feces.",
    baselinePrevalence: 5.0,
    symptomWeights: { fever: 1.6, sore_throat: 1.5, bleeding: 2.2, vomiting: 1.2, muscle_ache: 1.1, diarrhea: 1.1 },
    seasonalWeights: { Dry: 1.9, Harmattan: 1.8, Winter: 1.2, Rainy: 0.6, Summer: 0.7, Spring: 0.8, Autumn: 0.8 },
    geographicWeights: { "Arid Northern Province": 1.9, "Harmattan Dustlands": 1.8, "Sub-Saharan Rainy Corridor": 1.2, "Dense Urban Metro": 0.7, "Tropical Coastal Plain": 0.6 },
    guidance: ["Isolate patients from healthy household members.", "Prepare for early Ribavirin antiviral therapy in customized quarantine center.", "Avoid contact with any patient secretions."],
    prevention: ["Store all grains, flours, and food provisions in thick airtight glass or plastic containers.", "Block rodent access holes in residential walls and under doors.", "Maintain robust feline rodent-management practices."],
    riskLevel: "Critical" as const
  },
  {
    id: "meningitis",
    name: "Meningitis",
    description: "An acute inflammation of the protective membranes covering the brain and spinal cord, caused by virus, bacteria, or other micro-organisms.",
    baselinePrevalence: 12.0,
    symptomWeights: { fever: 1.6, headache: 1.8, stiff_neck: 2.5, confusion: 1.8, light_sensitivity: 1.9, rash: 1.1 },
    seasonalWeights: { Harmattan: 2.4, Dry: 1.9, Winter: 1.5, Autumn: 1.1, Rainy: 0.5, Spring: 1.2, Summer: 0.8 },
    geographicWeights: { "Harmattan Dustlands": 2.5, "Arid Northern Province": 2.0, "Dense Urban Metro": 1.2, "Sub-Saharan Rainy Corridor": 0.6, "Tropical Coastal Plain": 0.5 },
    guidance: ["Go to the nearest emergency room immediately; bacterial meningitis can be lethal within 24 hours.", "Protect patient from bright light to ease eye irritation.", "Lie flat in a quiet room."],
    prevention: ["Stay current on meningococcal protective vaccines.", "Avoid deep, direct social encounters in poorly ventilated crowds during dry seasons.", "Wear light masks in high dry dust situations."],
    riskLevel: "Critical" as const
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    description: "An inflammatory condition of the lung alveoli principally affecting the microscopic air sacs, primary bacterial or viral.",
    baselinePrevalence: 14.0,
    symptomWeights: { cough: 1.9, fever: 1.4, chest_pain: 1.8, short_breath: 2.1, chills: 1.3, fatigue: 1.0 },
    seasonalWeights: { Winter: 1.9, Harmattan: 1.7, Autumn: 1.4, Spring: 1.1, Rainy: 1.2, Summer: 0.7, Dry: 0.9 },
    geographicWeights: { "Dense Urban Metro": 1.7, "Harmattan Dustlands": 1.6, "Arid Northern Province": 1.4, "Tropical Coastal Plain": 1.1, "Sub-Saharan Rainy Corridor": 1.0 },
    guidance: ["Sputum or blood culture evaluation for choosing antibiotics or antivirals.", "Rest, stay warm, and avoid tobacco exposure.", "Use a home air humidifier or steam inhalation to ease airways."],
    prevention: ["Ensure timely pneumococcal and influenza vaccines.", "Adopt standard respiratory protective masks.", "Stop air pollutants or wood-fire smoke exposure inside rooms."],
    riskLevel: "Medium" as const
  },
  {
    id: "influenza",
    name: "Influenza (Seasonal Flu)",
    description: "A highly contagious viral infection that attacks the respiratory system, showing widespread annual and seasonal spikes.",
    baselinePrevalence: 20.0,
    symptomWeights: { cough: 1.7, fever: 1.5, sore_throat: 1.6, runny_nose: 1.8, muscle_ache: 1.7, headache: 1.3 },
    seasonalWeights: { Winter: 2.2, Autumn: 1.6, Harmattan: 1.5, Spring: 1.2, Rainy: 1.3, Summer: 0.5, Dry: 0.7 },
    geographicWeights: { "Dense Urban Metro": 2.0, "Harmattan Dustlands": 1.4, "Arid Northern Province": 1.2, "Tropical Coastal Plain": 1.1, "Sub-Saharan Rainy Corridor": 1.0 },
    guidance: ["Rest at home to prevent transmission in school or workspace.", "Consume hot liquids, soups, and herbal teas.", "Take physician-prescribed throat drops or antiviral Oseltamivir within 48h if vulnerable."],
    prevention: ["Receive the updated annual seasonal Flu shot.", "Sanitize shared handles, desks, and countertops.", "Practice diligent elbow-cough etiquette."],
    riskLevel: "Low" as const
  },
  {
    id: "covid19",
    name: "COVID-19",
    description: "An acute respiratory illness caused by SARS-CoV-2 coronavirus, characterized by variable severity ranging from mild standard carrier to severe respiratory failure.",
    baselinePrevalence: 16.0,
    symptomWeights: { fever: 1.5, cough: 1.8, short_breath: 2.0, loss_taste_smell: 2.5, fatigue: 1.2, muscle_ache: 1.2 },
    seasonalWeights: { Winter: 1.8, Autumn: 1.4, Spring: 1.3, Summer: 0.9, Rainy: 1.2, Dry: 1.0, Harmattan: 1.2 },
    geographicWeights: { "Dense Urban Metro": 2.3, "Tropical Coastal Plain": 1.2, "Arid Northern Province": 1.0, "Sub-Saharan Rainy Corridor": 0.9, "Harmattan Dustlands": 0.9 },
    guidance: ["Undergo standard rapid antigen testing.", "Isolate at home for 5-7 days or until negative.", "Monitor peripheral oxygen saturation (SpO2) with a pulse oximeter.", "Seek emergency aid for severe chest oppression or hypoxia."],
    prevention: ["Implement strict public ventilation hygiene.", "Wear reliable high-filtration surgical masks (N95/KN95) in close rooms.", "Receive modern booster vaccine lines."],
    riskLevel: "High" as const
  }
];

// Active Outbreaks State
let outbreaks: Outbreak[] = [
  {
    id: "outbreak-1",
    diseaseId: "cholera",
    diseaseName: "Cholera",
    region: "Tropical Coastal Plain",
    casesCount: 342,
    severity: "Critical",
    status: "Active",
    dateCreated: "2026-06-10",
    description: "Uncontrolled water pipeline contamination in low-lying fishing suburbs has caused an intense regional surge of acute waterborne diarrheal hospitalizations."
  },
  {
    id: "outbreak-2",
    diseaseId: "malaria",
    diseaseName: "Malaria",
    region: "Sub-Saharan Rainy Corridor",
    casesCount: 1250,
    severity: "Severe",
    status: "Active",
    dateCreated: "2026-06-15",
    description: "Heavier seasonal precipitation has resulted in extensive stagnant water logged pools, leading to a massive spike in Anopheles mosquito vector local census."
  },
  {
    id: "outbreak-3",
    diseaseId: "meningitis",
    diseaseName: "Meningitis",
    region: "Harmattan Dustlands",
    casesCount: 89,
    severity: "Critical",
    status: "Active",
    dateCreated: "2026-06-18",
    description: "An early scorching dry wind and harmattan dust storm have caused severe protective mucosal tract cracking in school borders, allowing a bacterial outbreak cluster."
  }
];

// ML Model Metrics & Status
let mlModels: MLModelMetrics[] = [
  { id: "log_reg", name: "Logistic Regression", accuracy: 0.864, precision: 0.852, recall: 0.861, f1Score: 0.856, rocAuc: 0.912, epochs: 40, status: "Secondary" },
  { id: "random_forest", name: "Random Forest Ensemble", accuracy: 0.918, precision: 0.909, recall: 0.924, f1Score: 0.916, rocAuc: 0.954, epochs: 120, status: "Secondary" },
  { id: "xgboost", name: "Extreme Gradient Boosting (XGBoost)", accuracy: 0.942, precision: 0.938, recall: 0.945, f1Score: 0.941, rocAuc: 0.976, epochs: 180, status: "Selected" },
  { id: "neural_net", name: "Spatio-Temporal Deep Neural Net", accuracy: 0.931, precision: 0.927, recall: 0.935, f1Score: 0.931, rocAuc: 0.969, epochs: 250, status: "Secondary" }
];

// HIPAA Audit log records
let auditLogs: AuditLog[] = [
  { id: "log-1", action: "DATABASE_INITIALIZE", user: "system_daemon", role: "DevOps Engine", status: "SUCCESS", details: "Epidemiological regional matrices and fallback dictionary assets imported into memory.", timestamp: "2026-06-22T01:00:00-07:00", ip: "127.0.0.1" },
  { id: "log-2", action: "ML_MODEL_LOAD", user: "ml_worker", role: "AI Strategist", status: "SUCCESS", details: "Loaded trained XGBoost model checkpoints. Cross-validation parameters set.", timestamp: "2026-06-22T01:05:00-07:00", ip: "10.142.0.4" },
  { id: "log-3", action: "OUTBREAK_TRIGGER", user: "epidemiology_advisor", role: "Admin", status: "SUCCESS", details: "Triggered active critical Cholera emergency alert for Coastal Belt.", timestamp: "2026-06-22T01:10:00-07:00", ip: "192.168.1.18" }
];

// Nearby Medical Facilities Mock data
const medicalFacilities: NearbyFacility[] = [
  {
    id: "fac-1",
    name: "Coastal Tropical Infectious Diseases Hospital",
    type: "General Hospital",
    distance: 4.2,
    travelTime: 12,
    address: "88 Quarantine Marine Drive, Coastal City",
    phone: "+234-803-123-4567",
    latitude: 6.452,
    longitude: 3.391,
    services: ["Emergency Quarantine", "Hydration Wing", "Mosquito Disease PCR Testing", "Inpatient Wards"]
  },
  {
    id: "fac-2",
    name: "St. Raphael's Primary Health Center",
    type: "Primary Health Clinic",
    distance: 1.8,
    travelTime: 6,
    address: "15 Mission Road, Central District",
    phone: "+234-802-999-5551",
    latitude: 6.460,
    longitude: 3.398,
    services: ["Outpatient Consultation", "Vaccine Dispensary", "Bowel Hydration Station"]
  },
  {
    id: "fac-3",
    name: "National Epidemiological Intelligence Center",
    type: "Research Center",
    distance: 12.5,
    travelTime: 28,
    address: "Admin Lane, Capital Heights",
    phone: "+234-809-000-1111",
    latitude: 9.076,
    longitude: 7.398,
    services: ["Genome Sequencing", "Hemostat Isolation", "Vaccine Development Trials"]
  },
  {
    id: "fac-4",
    name: "Metro Dustlands Emergency Response Wing",
    type: "Specialist Clinic",
    distance: 6.1,
    travelTime: 15,
    address: "Dry Air Bypass, Northern Province",
    phone: "+234-811-300-4000",
    latitude: 11.991,
    longitude: 8.516,
    services: ["Pulmonary Inhalation Therapy", "Meningitis Isolation unit", "Adult ICU Support"]
  }
];

// Helper to extract symptoms locally via keyword lookup when Gemini is unavailable
function extractSymptomsHeuristic(symptomsText: string) {
  const text = symptomsText.toLowerCase();
  const foundSymptoms: string[] = [];

  // Full symptom lexicon
  const symptomLexicon = [
    { key: "fever", matches: ["fever", "hot", "body temperature", "feverish", "high temp", "sweat", "sweating"] },
    { key: "cough", matches: ["cough", "coughing", "dry cough", "wet cough", "coughing spit"] },
    { key: "headache", matches: ["headache", "head ache", "migraine", "throbbing head"] },
    { key: "vomiting", matches: ["vomiting", "vomit", "throw up", "throwing up", "vomited", "puke"] },
    { key: "nausea", matches: ["nausea", "nauseous", "feeling sick", "sick stomach"] },
    { key: "body_weakness", matches: ["weakness", "weak", "fatigue", "tired", "lethargic", "no energy", "body weakness"] },
    { key: "chills", matches: ["chills", "shivering", "shake", "shaking", "cols", "cold sensation"] },
    { key: "diarrhea", matches: ["diarrhea", "watery stools", "loose stool", "frequent stool", "watery toilet"] },
    { key: "rash", matches: ["rash", "skin rashes", "spots", "itchy red spots"] },
    { key: "joint_pain", matches: ["joint pain", "bone pain", "body pain", "ache bones", "aching joints"] },
    { key: "stomach_pain", matches: ["stomach pain", "belly ache", "abdominal cramp", "stomach cramp"] },
    { key: "stiff_neck", matches: ["stiff neck", "neck stiff", "neck pain", "cannot bend neck"] },
    { key: "confusion", matches: ["confusion", "disoriented", "dizzy", "confused", "cannot concentrate"] },
    { key: "short_breath", matches: ["shortness of breath", "short breath", "breathing difficulties", "difficult breathing", "dyspnea"] },
    { key: "loss_taste_smell", matches: ["loss of taste", "loss of smell", "cannot taste", "no taste", "no smell"] }
  ];

  for (const item of symptomLexicon) {
    if (item.matches.some(m => text.includes(m))) {
      foundSymptoms.push(item.key);
    }
  }

  // Guess severity
  let severity: 'Mild' | 'Moderate' | 'Severe' = 'Moderate';
  if (text.includes("severe") || text.includes("unbearable") || text.includes("critical") || text.includes("high fever") || text.includes("very hot") || text.includes("blood") || text.includes("extreme")) {
    severity = 'Severe';
  } else if (text.includes("mild") || text.includes("slight") || text.includes("little bit") || text.includes("just started")) {
    severity = 'Mild';
  }

  // Guess duration
  let duration = "3 days";
  const durationMatch = text.match(/(\d+)\s*(day|week|month|hr|hour|wk)/);
  if (durationMatch) {
    duration = `${durationMatch[1]} ${durationMatch[2]}(s)`;
  } else if (text.includes("today") || text.includes("yesterday")) {
    duration = "1-2 days";
  } else if (text.includes("week") || text.includes("long time")) {
    duration = "Over 1 week";
  }

  // Guess frequency
  let frequency = "Intermittent";
  if (text.includes("constantly") || text.includes("all the time") || text.includes("always") || text.includes("persistent")) {
    frequency = "Continuous";
  } else if (text.includes("morning") || text.includes("night") || text.includes("intervals")) {
    frequency = "Periodic";
  }

  return {
    symptoms: foundSymptoms.length > 0 ? foundSymptoms : ["fever"],
    severity,
    duration,
    frequency
  };
}

// User Profile Database & Authentication System
interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  country: string;
  state: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  season: 'Rainy' | 'Dry' | 'Harmattan' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}

let users: UserProfile[] = [
  {
    id: "user-adaeze",
    name: "Adaeze",
    email: "adaeze@medspatial.ai",
    password: "password123",
    country: "Nigeria",
    state: "Lagos",
    city: "Lagos City",
    region: "Sub-Saharan Rainy Corridor",
    lat: 6.5244,
    lng: 3.3792,
    season: "Rainy"
  }
];

// REST APIs
// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, country, state, city, region, season, lat, lng } = req.body;
  if (!name || !email || !password || !country || !state || !city || !region || !season) {
    return res.status(400).json({ error: "All registration fields are required" });
  }
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (exists) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  // Generate reasonable coordinates for the user if they did not provide specific lat/lng
  let resolvedLat = lat ? Number(lat) : 6.5244;
  let resolvedLng = lng ? Number(lng) : 3.3792;

  // Let's vary the coordinates slightly based on the region if lat/lng are empty to represent distinct localized nodes
  if (!lat || !lng) {
    if (region === "Tropical Coastal Plain") {
      resolvedLat = 4.75; resolvedLng = 7.0; // Port Harcourt area
    } else if (region === "Harmattan Dustlands") {
      resolvedLat = 12.0; resolvedLng = 8.5; // Kano area
    } else if (region === "Arid Northern Province") {
      resolvedLat = 13.0; resolvedLng = 5.2; // Sokoto area
    } else if (region === "Dense Urban Metro") {
      resolvedLat = 6.45; resolvedLng = 3.4; // Lagos center
    }
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    password,
    country,
    state,
    city,
    region,
    lat: resolvedLat,
    lng: resolvedLng,
    season
  };

  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// 1. Get Diseases
app.get("/api/diseases", (req, res) => {
  res.json(diseases);
});

// 2. Add Disease (CRUD - Unlimited future extension)
app.post("/api/diseases", (req, res) => {
  try {
    const { name, description, baselinePrevalence, symptomWeights, seasonalWeights, geographicWeights, guidance, prevention, riskLevel } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required properties." });
    }
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const newDisease = {
      id,
      name,
      description,
      baselinePrevalence: Number(baselinePrevalence) || 10,
      symptomWeights: symptomWeights || {},
      seasonalWeights: seasonalWeights || {},
      geographicWeights: geographicWeights || {},
      guidance: Array.isArray(guidance) ? guidance : [guidance || "Consult local specialist."],
      prevention: Array.isArray(prevention) ? prevention : [prevention || "Standard hygiene control."],
      riskLevel: riskLevel || "Medium"
    };

    diseases.push(newDisease);

    // Write audit log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "DISEASE_CREATE",
      user: "epidemiology_advisor",
      role: "Admin",
      status: "SUCCESS",
      details: `Created new custom disease archetype: ${name} (ID: ${id})`,
      timestamp: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });

    res.status(201).json(newDisease);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Disease
app.delete("/api/diseases/:id", (req, res) => {
  const { id } = req.params;
  const index = diseases.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Disease archetype not found" });
  }
  const deleted = diseases.splice(index, 1)[0];

  // Audit Log
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: "DISEASE_DELETE",
    user: "epidemiology_advisor",
    role: "Admin",
    status: "SUCCESS",
    details: `Deleted disease profile: ${deleted.name}`,
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1"
  });

  res.json({ success: true, deleted: deleted.id });
});

// 3. Spatio-Temporal Prediction ML Simulation Endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const { symptomsText, location, season } = req.body;
    if (!symptomsText || symptomsText.trim() === "") {
      return res.status(400).json({ error: "Symptom description is required" });
    }

    // Default Location
    const activeLocation = location || {
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      region: "Tropical Coastal Plain",
      lat: 6.454,
      lng: 3.389
    };

    // Default Season derived from current system date (June is Rain-dominant in Tropics, Spring/Summer in West)
    const activeSeason = season || "Rainy";

    let extractedInfo;

    // Call Gemini API if available to run advanced NLP symptom extraction
    if (ai) {
      try {
        console.log("Calling Gemini 3.5 Flash for symptom NLP extraction...");
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze this user's description of their physical symptoms: "${symptomsText}". 
          Extract the symptoms as an array, the general clinical severity ("Mild", "Moderate", "Severe"), 
          the duration of symptoms, and the frequency of symptoms. 
          Return ONLY a JSON block fitting this structure:
          {
            "symptoms": ["fever", "headache", "vomiting", "chills", "diarrhea", "cough", "body_weakness", "rash", "joint_pain", "stomach_pain", "stiff_neck", "confusion", "short_breath", "loss_taste_smell"], // pick all applicable from this exact set of keys
            "severity": "Mild" | "Moderate" | "Severe",
            "duration": "approximate duration string",
            "frequency": "Continuous" | "Intermittent" | "Periodic" | "Unknown"
          }`,
          config: {
            responseMimeType: "application/json"
          }
        });

        const jsonText = response.text || "";
        const parsed = JSON.parse(jsonText.trim());
        extractedInfo = {
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : ["fever"],
          severity: (["Mild", "Moderate", "Severe"].includes(parsed.severity) ? parsed.severity : "Moderate") as 'Mild' | 'Moderate' | 'Severe',
          duration: parsed.duration || "several days",
          frequency: parsed.frequency || "Intermittent"
        };
      } catch (geminiError) {
        console.error("Gemini NLP extraction failed, proceeding with heuristic parser", geminiError);
        extractedInfo = extractSymptomsHeuristic(symptomsText);
      }
    } else {
      extractedInfo = extractSymptomsHeuristic(symptomsText);
    }

    // SPATIO-TEMPORAL INTELLIGENCE ENSEMBLE ENGINE
    // Combine baseline probability + symptom matches + seasonal multipliers + region multipliers + active outbreaks
    const scoredPredictions = diseases.map(disease => {
      let score = disease.baselinePrevalence;

      // 1. Symptom matching boost
      let symptomMatchCount = 0;
      let weightAddition = 0;
      extractedInfo.symptoms.forEach(sym => {
        // Map key names if necessary
        const lookups = [sym, sym.toLowerCase(), sym.replace(/\s+/g, '_')];
        let foundWeight = 0;
        for (const lookup of lookups) {
          if (disease.symptomWeights[lookup] !== undefined) {
            foundWeight = disease.symptomWeights[lookup];
            break;
          }
        }

        if (foundWeight > 0) {
          symptomMatchCount++;
          weightAddition += foundWeight * 18; // Scale factor
        }
      });

      // No matching symptoms reduces the disease likelihood significantly
      if (symptomMatchCount === 0) {
        score = score * 0.15;
      } else {
        score += weightAddition;
      }

      // 2. Seasonal trigger multipliers
      const seasonKey = activeSeason;
      const seasonalMultiplier = disease.seasonalWeights[seasonKey] !== undefined 
        ? disease.seasonalWeights[seasonKey] 
        : 1.0;
      
      score *= seasonalMultiplier;

      // 3. Geographic intelligence indicators
      const regionKey = activeLocation.region;
      const regionMultiplier = disease.geographicWeights[regionKey] !== undefined
        ? disease.geographicWeights[regionKey]
        : 1.0;

      score *= regionMultiplier;

      // 4. Epidemic/Outbreak risk multipliers
      const activeOutbreakInRegion = outbreaks.find(
        o => o.diseaseId === disease.id && o.region === activeLocation.region && o.status === "Active"
      );

      let outbreakBonus = 1.0;
      if (activeOutbreakInRegion) {
        if (activeOutbreakInRegion.severity === "Critical") {
          outbreakBonus = 1.8; // +80% boost
        } else if (activeOutbreakInRegion.severity === "Severe") {
          outbreakBonus = 1.4; // +40% boost
        } else {
          outbreakBonus = 1.2; // +20% boost
        }
      }
      score *= outbreakBonus;

      // Adjust model fine-tuning coefficients (Simulate Active Selected ML pipeline weights!)
      const selectedModel = mlModels.find(m => m.status === "Selected");
      const modelScale = selectedModel ? (selectedModel.accuracy / 0.94) : 1.0;
      score *= modelScale;

      // 5. Constrain final calculated percentages to a realistic 0% - 98% cap (avoiding absolute certainty!)
      let finalProb = Math.min(Math.max((score / (symptomMatchCount > 0 ? 1.5 : 1)) + 5, 2), 97.4);

      // Generate explainability profiles for the clinician / patient
      const symptomMatchPercent = Math.min(Math.round(symptomMatchCount * 25), 100);
      const explainDetails = {
        symptomMatch: `Symptom alignment of ${symptomMatchPercent}% with standard disease profile. High frequency triggers recorded.`,
        weatherInfluence: seasonalMultiplier > 1.2 
          ? `Elevated seasonal trend: Standard ${activeSeason} weather accounts for an added +${Math.round((seasonalMultiplier - 1) * 100)}% multiplication on this pathology vector.`
          : seasonalMultiplier < 0.8
          ? `Reduced seasonal factor: Current ${activeSeason} season inhibits this vector profile.`
          : `Neutral seasonal impact registered current month.`,
        geographyFactor: regionMultiplier > 1.2
          ? `Geospatial hotspot matches: Patient location in "${activeLocation.region}" region carries standard geographic vulnerability (${Math.round((regionMultiplier - 1) * 100)}% increase).`
          : `Minimal spatial correlation matching for typical ${activeLocation.region} coordinates.`,
        outbreakImpact: activeOutbreakInRegion
          ? `CRITICAL Outbreak Alert! An active ${activeOutbreakInRegion.severity} outbreak of ${disease.name} exists within ${activeLocation.region} with ${activeOutbreakInRegion.casesCount} active cases.`
          : `No current registered local outbreak clusters in this region.`
      };

      return {
        diseaseId: disease.id,
        name: disease.name,
        probability: Math.round(finalProb),
        riskLevel: finalProb > 75 ? "Critical" as const : finalProb > 50 ? "High" as const : finalProb > 25 ? "Medium" as const : "Low" as const,
        explanation: explainDetails,
        guidance: disease.guidance,
        prevention: disease.prevention
      };
    });

    // Rank results by probability - return Top 5
    const topPredictions = scoredPredictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    // Write clinical audit log (compliant logging)
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "PREDICTION_QUERY",
      user: "clinical_portal",
      role: "Diagnostics",
      status: "SUCCESS",
      details: `Calculated top spatio-temporal predictions for input text (${symptomsText.slice(0, 30)}...). Extracted symptoms: [${extractedInfo.symptoms.join(", ")}]. Top result: ${topPredictions[0]?.name} (${topPredictions[0]?.probability}%).`,
      timestamp: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });

    res.json({
      extracted: extractedInfo,
      location: activeLocation,
      season: activeSeason,
      predictions: topPredictions,
      unlimitedFutureEnabled: true
    });

  } catch (err: any) {
    console.error("Diagnosis endpoint failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Outbreak Management (CRUD & alerts toggle)
app.get("/api/outbreaks", (req, res) => {
  res.json(outbreaks);
});

app.post("/api/outbreaks", (req, res) => {
  try {
    const { diseaseId, region, casesCount, severity, description } = req.body;
    if (!diseaseId || !region) {
      return res.status(400).json({ error: "diseaseId and region are required fields." });
    }

    const disease = diseases.find(d => d.id === diseaseId);
    const diseaseName = disease ? disease.name : diseaseId;

    const newOutbreak: Outbreak = {
      id: `outbreak-${Date.now()}`,
      diseaseId,
      diseaseName,
      region,
      casesCount: Number(casesCount) || 12,
      severity: severity || "Severe",
      status: "Active",
      dateCreated: new Date().toISOString().slice(0, 10),
      description: description || "Aggressive case clustering noticed in regional tracking systems."
    };

    outbreaks.push(newOutbreak);

    // Audit Log
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "OUTBREAK_TRIGGER",
      user: "epidemiology_advisor",
      role: "Admin",
      status: "SUCCESS",
      details: `Declared NEW epidemiological outbreak: ${diseaseName} inside ${region}.`,
      timestamp: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });

    res.status(201).json(newOutbreak);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contain/Resolve Outbreak
app.patch("/api/outbreaks/:id", (req, res) => {
  const { id } = req.params;
  const outbreak = outbreaks.find(o => o.id === id);
  if (!outbreak) {
    return res.status(404).json({ error: "Outbreak record not found." });
  }
  
  outbreak.status = "Contained";

  // Audit
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: "OUTBREAK_RESOLVE",
    user: "epidemiology_advisor",
    role: "Admin",
    status: "SUCCESS",
    details: `Resolved and contained epidemiological outbreak vector: ${outbreak.diseaseName} inside ${outbreak.region}.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1"
  });

  res.json(outbreak);
});

// 5. ML Model Pipeline Selection & Retraining
app.get("/api/ml/models", (req, res) => {
  res.json(mlModels);
});

app.post("/api/ml/select", (req, res) => {
  const { modelId } = req.body;
  const targetModel = mlModels.find(m => m.id === modelId);
  if (!targetModel) {
    return res.status(404).json({ error: "Model not found." });
  }

  mlModels = mlModels.map(m => ({
    ...m,
    status: m.id === modelId ? "Selected" : "Secondary"
  }));

  // Audit
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    action: "ML_PIPELINE_SWITCH",
    user: "ml_worker",
    role: "Diagnostics",
    status: "SUCCESS",
    details: `Switched active clinical diagnostics module to: ${targetModel.name}. Base accuracy updated to ${targetModel.accuracy}.`,
    timestamp: new Date().toISOString(),
    ip: req.ip || "127.0.0.1"
  });

  res.json(mlModels);
});

// Model Retraining Simulation (CSV & Dataset upload)
app.post("/api/ml/retrain", (req, res) => {
  try {
    const { modelId, datasetRowsCount } = req.body;
    const targetModel = mlModels.find(m => m.id === modelId);
    if (!targetModel) {
      return res.status(404).json({ error: "Model target not found." });
    }

    const rowFactor = datasetRowsCount ? Math.min(Number(datasetRowsCount) / 1000, 10) : 1;
    
    // Simulate training progress slightly boosting metrics
    const improvement = 0.002 * rowFactor;
    
    targetModel.accuracy = Math.min(0.992, targetModel.accuracy + improvement);
    targetModel.precision = Math.min(0.991, targetModel.precision + improvement);
    targetModel.recall = Math.min(0.994, targetModel.recall + improvement);
    targetModel.f1Score = Math.min(0.991, targetModel.f1Score + improvement);
    targetModel.rocAuc = Math.min(0.998, targetModel.rocAuc + improvement);
    targetModel.epochs += 10;

    // Audit
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      action: "ML_MODEL_RETRAIN",
      user: "ml_worker",
      role: "Diagnostics",
      status: "SUCCESS",
      details: `Retrained model ${targetModel.name} on standard dataset (${datasetRowsCount || "1,200"} records). Accuracy improved.`,
      timestamp: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });

    res.json({
      success: true,
      model: targetModel,
      allModels: mlModels
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Security Audit logs
app.get("/api/logs", (req, res) => {
  res.json(auditLogs);
});

// 7. Medical Chat Assistant Chatbot with Gemini RAG
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid dialogue request context." });
    }

    const userQueryMessage = messages[messages.length - 1];
    const userText = userQueryMessage ? userQueryMessage.text : "Hello";

    // System instruction for HIPAA medical safety and context injection
    const systemInstruction = `You are the MedSpatial AI Medical Assistant Chatbot. 
    You are connected to high-precision healthcare diagnostics systems providing location-specific, season-adjusted, and spatio-temporal disease models.
    Available diseases in our active framework: ${diseases.map(d => d.name).join(", ")}.
    Local active outbreak alerts: ${outbreaks.filter(o => o.status === "Active").map(o => `${o.diseaseName} in ${o.region}`).join("; ")}.
    Provide symptoms guidance, disease prevention training, clean scientific disease education, and warm preventative care support.
    
    CRITICAL RESTRICTION: 
    1. NEVER declare a definitive medical diagnosis. 
    2. Always end your response with this standard legal healthcare disclaimer phrase: "This result is not a medical diagnosis. Please consult a healthcare professional."
    3. Stay highly professional, supportive, concise, informative, scientific, and accurate. Use markdown list formatting for readability where appropriate.`;

    if (ai) {
      try {
        console.log("Routing live query into Gemini Chat Stream...");
        // Reconstruct dialogue history up to last 4 messages to save context token bounds
        const recentDialogue = messages.slice(-5).map(m => {
          return `${m.sender === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`;
        }).join("\n");

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Dialogue History:\n${recentDialogue}\n\nAssistant reply to patient's last phrase:`,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7
          }
        });

        const reply = response.text || "I was unable to formulate a response. This result is not a medical diagnosis. Please consult a healthcare professional.";
        return res.json({ text: reply });

      } catch (gemQueryError) {
        console.error("Gemini chatbot error:", gemQueryError);
        // Fall back to rule-based agent
      }
    }

    // Heuristic Smart Medical Chat Agent Fallback
    const lowerQuery = userText.toLowerCase();
    let replyText = "";

    if (lowerQuery.includes("malaria")) {
      replyText = `**Malaria** is active in our clinical tracking.
- **Typical Symptoms:** High fever, violent shivering (chills), deep headache, joint pain, muscle ached, vomiting.
- **Standard Preventions:** Sleep under insecticide-treated bed nets, spray repellents, and remove local water collection yards.
- **Standard Care:** Standard medical assessment using rapid tests followed by combination therapies like Artemether/Lumefantrine.
\n\nThis result is not a medical diagnosis. Please consult a healthcare professional.`;
    } else if (lowerQuery.includes("cholera") || lowerQuery.includes("diarrhea")) {
      replyText = `**Cholera & Contaminated Hydration Vectors** are currently flagged with active outbreaks!
- **Symptoms:** Extremely thin watery stool ("rice water stools"), persistent vomiting, severe muscular cramps due to continuous electrolyte voiding, deep dry thirst.
- **Immediate Rescue:** Drink Oral Rehydration Salts (ORS) formula by the glassful. Seek urgent clinic transfers immediately.
- **Prevention:** Practice proper hand washing, sanitize all cooking utensils, drink only purified bottled or boiled water.
\n\nThis result is not a medical diagnosis. Please consult a healthcare professional.`;
    } else if (lowerQuery.includes("meningitis")) {
      replyText = `**Meningitis Warning Alert** is mapped for current dry/harmattan locations!
- **Crucial Indicators:** Fever, headache, rigid stiffness of the neck, physical disorientation, severe photosensitivity (light hurts eyes).
- **Clinical Priority:** This is an extreme infectious emergency. Bacterial pathogens lead to rapid sepsis or brain injuries. Head to local Emergency Units immediately.
- **Prevention:** Modern Meningococcal vaccines provide extensive protections. Avoid long crowded rooms in peak dry seasons.
\n\nThis result is not a medical diagnosis. Please consult a healthcare professional.`;
    } else if (lowerQuery.includes("cough") || lowerQuery.includes("fever") || lowerQuery.includes("pneumonia")) {
      replyText = `Standard respiratory illness like **Pneumonia**, **Influenza**, or **COVID-19** may be indicated.
- **Symptoms:** Fever, chest coughs, sore throat, painful lung breathing, chills.
- **Recommended Care:** Maintain warm hydration, self-isolate if suspecting contagious agents, use home vapor therapy.
- **Red Flag Signs:** If you experience visual blueness on fingers, or constant shortness of breath (dyspnea), seek oxygen setups right away.
\n\nThis result is not a medical diagnosis. Please consult a healthcare professional.`;
    } else {
      replyText = `Thank you for reaching the MedSpatial AI clinical assistant portal.
I can help with general medical education, symptom check insights, regional outbreak information, and preventative health guidance.

*   To get a diagnosis, use our main **Clinical Diagnostic Suite** where you can enter description details and incorporate real-time climate, maps, and outbreaks!
*   Always protect your skin from vector bites and drink sanitized fluids!

What specific symptom or disease from our database (Malaria, Dengue, Typhoid, Cholera, Meningitis, Lassa Fever, Flu, COVID, Pneumonia) can I assist you with today?
\n\nThis result is not a medical diagnosis. Please consult a healthcare professional.`;
    }

    res.json({ text: replyText });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Server Bridge integration for continuous development serving
async function startServer() {
  // Developer Mode Vite asset compiler integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static files in compiled container environment
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MedSpatial AI dynamic full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

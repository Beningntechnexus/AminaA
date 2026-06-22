export interface Disease {
  id: string;
  name: string;
  description: string;
  baselinePrevalence: number; // base reference probability (0-1)
  symptomWeights: Record<string, number>; // weight factor per symptoms (e.g. fever: 1.8)
  seasonalWeights: Record<string, number>; // weight multiplier per season (e.g. Rainy: 1.3)
  geographicWeights: Record<string, number>; // weight multiplier per region (e.g. Coastal: 1.4)
  guidance: string[]; // medical advice / steps
  prevention: string[]; // preventative care
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export type Season = 'Rainy' | 'Dry' | 'Harmattan' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface LocationInfo {
  country: string;
  state: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
}

export interface Outbreak {
  id: string;
  diseaseId: string;
  diseaseName: string;
  region: string;
  casesCount: number;
  severity: 'Moderate' | 'Severe' | 'Critical';
  status: 'Active' | 'Contained';
  dateCreated: string;
  description: string;
}

export interface PredictionDetail {
  diseaseId: string;
  name: string;
  probability: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: {
    symptomMatch: string;
    weatherInfluence: string;
    geographyFactor: string;
    outbreakImpact: string;
  };
  guidance: string[];
  prevention: string[];
}

export interface DiagnoseRequest {
  symptomsText: string;
  location?: LocationInfo;
  season?: Season;
}

export interface DiagnoseResponse {
  extracted: {
    symptoms: string[];
    severity: 'Mild' | 'Moderate' | 'Severe';
    duration: string;
    frequency: string;
  };
  location: LocationInfo;
  season: Season;
  predictions: PredictionDetail[];
  unlimitedFutureEnabled: boolean;
}

export interface MLModelMetrics {
  id: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  epochs: number;
  status: 'Selected' | 'Secondary' | 'In Training';
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'General Hospital' | 'Specialist Clinic' | 'Primary Health Clinic' | 'Research Center';
  distance: number; // in km
  travelTime: number; // in mins
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  services: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
  timestamp: string;
  ip: string;
}

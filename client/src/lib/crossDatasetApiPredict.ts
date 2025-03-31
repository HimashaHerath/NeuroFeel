// D:\NeuroFeel\client\src\lib\crossDatasetApi.ts

// Types for API responses
export interface PredictionResult {
  class: string;
  probability: number;
  confidence: number;
}

export interface ModelInfo {
  threshold: number;
  model_type: string;
  estimators?: Array<{
    name?: string;
    type: string;
  }>;
}

export interface FeatureLists {
  wesad_arousal: string[];
  wesad_valence: string[];
  kemocon_arousal: string[];
  kemocon_valence: string[];
}

export interface AvailableSamples {
  wesad_samples: number;
  kemocon_samples: number;
  wesad_subjects: number[];
  kemocon_participants: number[];
  feature_lists: FeatureLists;
}

export interface SampleDetails {
  direction: string;
  sample_index: number;
  subject_id: number;
  features: Record<string, number>;
  arousal_binary: boolean;
  valence_binary: boolean;
  arousal?: number;
  valence?: number;
  emotion_label?: string;
}

export interface PredictionResponse {
  arousal?: PredictionResult;
  valence?: PredictionResult;
  features_used: Record<string, number>;
  direction: string;
  sample_index: number;
  subject_id: number;
  ground_truth: {
    arousal: string;
    valence: string;
  };
  confidence: {
    arousal: number;
    valence: number;
  };
}

export interface PredictionRequest {
  direction: string;
  sample_index: number;
  target_dimension: string;
}

export interface HealthCheckResponse {
  status: string;
  models: {
    arousal: string[];
    valence: string[];
  };
  samples: {
    wesad: number;
    kemocon: number;
  };
}

// API base URL - Update to match your deployment
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/cross_dataset/model` || 'http://localhost:8000/cross_dataset/model';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// API functions
export const crossDatasetApi = {
  // Get health status
  getHealth: () => apiRequest<HealthCheckResponse>('/health'),

  // Get available samples
  getAvailableSamples: () => apiRequest<AvailableSamples>('/available-samples'),

  // Get models info
  getModels: () => apiRequest<Record<string, Record<string, ModelInfo>>>('/models'),

  // Get sample details
  getSampleDetails: (direction: string, index: number) => 
    apiRequest<SampleDetails>(`/samples/${direction}/${index}`),

  // Make prediction
  predict: (request: PredictionRequest) => 
    apiRequest<PredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

export default crossDatasetApi;
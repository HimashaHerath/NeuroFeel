// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/wesad/dataserving';

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// API type definitions
export interface ModelPerformance {
  model_type: string;
  accuracy: number;
  f1_score: number;
  subject_id?: number;
}

export interface OverviewData {
  models: {
    name: string;
    accuracy: number;
    f1_score: number;
    std_deviation: number;
  }[];
  emotions: Record<string, any>;
  subjects: {
    subject_id: number;
    accuracies: Record<string, number>;
  }[];
}

export interface SubjectData {
  subject_id: number;
  models: Record<string, {
    accuracy: number;
    f1_score: number;
    num_samples: number;
    confusion_matrix: number[][];
    class_metrics?: Record<string, any>;
    ensemble_weight?: number;
    base_model_pct?: number;
    personal_model_pct?: number;
    model_selection?: Record<string, any>;
  }>;
}

export interface SignalData {
  subject_id: number;
  emotion: string;
  signals: {
    ecg: { data: number[], sampling_rate: number, features: Record<string, number> };
    emg: { data: number[], sampling_rate: number, features: Record<string, number> };
    resp: { data: number[], sampling_rate: number, features: Record<string, number> };
  };
  time_axis: number[];
}

// API functions
export async function getOverview(): Promise<OverviewData> {
  return fetchFromApi<OverviewData>('/overview');
}
export async function simulateEnsembleWeight(baseWeight: number, subjectId?: number): Promise<any> {
  return fetchFromApi('/simulate/ensemble', {
    method: 'POST',
    body: JSON.stringify({ base_weight: baseWeight, subject_id: subjectId }),
  });
}
export async function getModelPerformance(modelType: string): Promise<ModelPerformance[]> {
  return fetchFromApi<ModelPerformance[]>(`/models/${modelType}`);
}

export async function getSubjectData(subjectId: number): Promise<SubjectData> {
  return fetchFromApi<SubjectData>(`/subjects/${subjectId}`);
}

export async function getSignalVisualizationData(subjectId: number, emotion?: string): Promise<SignalData> {
  const emotionParam = emotion ? `?emotion=${emotion}` : '';
  return fetchFromApi<SignalData>(`/visualize/subject/${subjectId}/signals${emotionParam}`);
}

export async function simulateAdaptiveThreshold(threshold: number, subjectId?: number): Promise<any> {
  return fetchFromApi('/simulate/adaptive', {
    method: 'POST',
    body: JSON.stringify({ threshold, subject_id: subjectId }),
  });
}

export async function getFeatureImportance(subjectId?: number, topN?: number): Promise<any> {
  let params = '';
  if (subjectId) params += `?subject_id=${subjectId}`;
  if (topN) params += `${params ? '&' : '?'}top_n=${topN}`;
  return fetchFromApi(`/detailed/feature_importance${params}`);
}
export const CROSS_DATASET_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cross_dataset/dataserving` || 'http://localhost:8000/cross_dataset/dataserving';

export async function fetchFromCrossDatasetApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${CROSS_DATASET_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cross-dataset API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// API type definitions for Cross-Dataset API
export interface CrossDatasetPerformance {
  direction: string; // "wesad_to_kemocon" or "kemocon_to_wesad"
  target: string; // "arousal" or "valence"
  accuracy: number;
  f1_score: number;
  balanced_accuracy: number;
  roc_auc: number;
  pr_auc: number;
  threshold: number;
  adaptation_method?: string;
}

export interface AdaptationPerformance {
  direction: string;
  target: string;
  adaptation_method: string;
  gap_before: number;
  gap_after: number;
  gap_reduction_pct: number;
}

export interface FeatureMapping {
  wesad_feature: string;
  kemocon_feature: string;
  importance_score: number;
  target: string;
}

export interface ClassDistribution {
  dataset: string;
  target: string;
  low_count: number;
  high_count: number;
  distribution_ratio: number;
}

export interface DatasetStatistics {
  datasets: {
    WESAD: {
      subjects: number;
      total_segments: number;
      segment_size_seconds: number;
      sampling_rate_hz: number;
      description: string;
    };
    "K-EmoCon": {
      participants: number;
      total_segments: number;
      segment_size_seconds: number;
      sampling_rate_hz: number;
      description: string;
    };
  };
  features: {
    common_count: number;
    physio_signals: string[];
  };
  domain_gap: {
    arousal: {
      gap_measure: number;
      reduction_percent: number;
    };
    valence: {
      gap_measure: number;
      reduction_percent: number;
    };
  };
}

export interface DetailedEvaluation {
  direction: string;
  target: string;
  accuracy: number;
  f1_score: number;
  balanced_accuracy: number;
  roc_auc: number;
  pr_auc: number;
  threshold: number;
  classification_report: {
    [key: string]: {
      precision: number;
      recall: number;
      'f1-score': number;
      support: number;
    };
  };
  confusion_matrix: number[][];
}

export interface DomainGapVisualization {
  target: string;
  data_points: {
    wesad: number[][];
    kemocon: number[][];
    adapted: number[][];
  };
  gap_measures: {
    before: number;
    after: number;
    reduction_pct: number;
  };
  pca_explained_variance: number[];
}

export interface ConfusionMatrixVisualization {
  target: string;
  wesad_to_kemocon: {
    confusion_matrix: number[][];
    normalized_matrix: number[][];
    class_names: string[];
  };
  kemocon_to_wesad: {
    confusion_matrix: number[][];
    normalized_matrix: number[][];
    class_names: string[];
  };
}

export interface FeatureImportanceVisualization {
  target: string;
  features: FeatureMapping[];
  common_important_features: {
    feature: string;
    importance: number;
  }[];
}

export interface ClassDistributionVisualization {
  targets: string[];
  datasets: string[];
  data: ClassDistribution[];
}

export interface CrossDatasetOverview {
  average_metrics: {
    accuracy: number;
    f1_score: number;
    roc_auc: number;
  };
  arousal: {
    wesad_to_kemocon: CrossDatasetPerformance;
    kemocon_to_wesad: CrossDatasetPerformance;
  };
  valence: {
    wesad_to_kemocon: CrossDatasetPerformance;
    kemocon_to_wesad: CrossDatasetPerformance;
  };
  datasets: {
    WESAD: {
      subjects: number;
      total_segments: number;
      segment_size_seconds: number;
      sampling_rate_hz: number;
      description: string;
    };
    "K-EmoCon": {
      participants: number;
      total_segments: number;
      segment_size_seconds: number;
      sampling_rate_hz: number;
      description: string;
    };
  };
  adaptation: {
    arousal: {
      success_rate: number;
      best_direction: string;
    };
    valence: {
      success_rate: number;
      best_direction: string;
    };
  };
}

// API functions
export async function getCrossDatasetOverview(): Promise<CrossDatasetOverview> {
  return fetchFromCrossDatasetApi<CrossDatasetOverview>('/overview');
}

export async function getCrossDatasetPerformance(
  target?: string,
  direction?: string
): Promise<CrossDatasetPerformance[]> {
  let endpoint = '/performance';
  const params = [];
  
  if (target) params.push(`target=${target}`);
  if (direction) params.push(`direction=${direction}`);
  
  if (params.length > 0) {
    endpoint += `?${params.join('&')}`;
  }
  
  return fetchFromCrossDatasetApi<CrossDatasetPerformance[]>(endpoint);
}

export async function getAdaptationPerformance(
  target?: string,
  direction?: string
): Promise<AdaptationPerformance[]> {
  let endpoint = '/adaptation';
  const params = [];
  
  if (target) params.push(`target=${target}`);
  if (direction) params.push(`direction=${direction}`);
  
  if (params.length > 0) {
    endpoint += `?${params.join('&')}`;
  }
  
  return fetchFromCrossDatasetApi<AdaptationPerformance[]>(endpoint);
}

export async function getFeatureMappings(target: string = 'arousal'): Promise<FeatureMapping[]> {
  return fetchFromCrossDatasetApi<FeatureMapping[]>(`/features/mapping?target=${target}`);
}

export async function getClassDistribution(): Promise<ClassDistribution[]> {
  return fetchFromCrossDatasetApi<ClassDistribution[]>('/dataset/distribution');
}

export async function getDatasetStatistics(): Promise<DatasetStatistics> {
  return fetchFromCrossDatasetApi<DatasetStatistics>('/dataset/statistics');
}

export async function getDetailedEvaluation(
  target: string,
  direction: string
): Promise<DetailedEvaluation> {
  return fetchFromCrossDatasetApi<DetailedEvaluation>(`/evaluation/${target}/${direction}`);
}

export async function getDomainGapVisualization(target: string = 'arousal'): Promise<DomainGapVisualization> {
  return fetchFromCrossDatasetApi<DomainGapVisualization>(`/visualize/domain_gap?target=${target}`);
}

export async function getConfusionMatrices(target: string = 'arousal'): Promise<ConfusionMatrixVisualization> {
  return fetchFromCrossDatasetApi<ConfusionMatrixVisualization>(`/visualize/confusion_matrices?target=${target}`);
}

export async function getFeatureImportanceVisualization(target: string = 'arousal'): Promise<FeatureImportanceVisualization> {
  return fetchFromCrossDatasetApi<FeatureImportanceVisualization>(`/visualize/feature_importance?target=${target}`);
}

export async function getClassDistributionVisualization(): Promise<ClassDistributionVisualization> {
  return fetchFromCrossDatasetApi<ClassDistributionVisualization>('/visualize/class_distribution');
}

export function generateReportUrl(
  reportType: string,
  target?: string,
  format: 'pdf' | 'excel' = 'pdf'
): string {
  let url = `${CROSS_DATASET_API_URL}/report/${reportType}?format=${format}`;
  if (target) {
    url += `&target=${target}`;
  }
  return url;
}
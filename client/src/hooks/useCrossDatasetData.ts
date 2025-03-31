import { useQuery } from '@tanstack/react-query';
import { 
  getCrossDatasetOverview,
  getCrossDatasetPerformance,
  getAdaptationPerformance,
  getFeatureMappings,
  getClassDistribution,
  getDatasetStatistics,
  getDetailedEvaluation,
  getDomainGapVisualization,
  getConfusionMatrices,
  getFeatureImportanceVisualization,
  getClassDistributionVisualization
} from '@/lib/cross-dataset-api';

export function useCrossDatasetOverview() {
  return useQuery({
    queryKey: ['cross-dataset', 'overview'],
    queryFn: () => getCrossDatasetOverview(),
  });
}

export function useCrossDatasetPerformance(target?: string, direction?: string) {
  return useQuery({
    queryKey: ['cross-dataset', 'performance', target, direction],
    queryFn: () => getCrossDatasetPerformance(target, direction),
  });
}

export function useAdaptationPerformance(target?: string, direction?: string) {
  return useQuery({
    queryKey: ['cross-dataset', 'adaptation', target, direction],
    queryFn: () => getAdaptationPerformance(target, direction),
  });
}

export function useFeatureMappings(target: string = 'arousal') {
  return useQuery({
    queryKey: ['cross-dataset', 'feature-mappings', target],
    queryFn: () => getFeatureMappings(target),
  });
}

export function useClassDistribution() {
  return useQuery({
    queryKey: ['cross-dataset', 'class-distribution'],
    queryFn: () => getClassDistribution(),
  });
}

export function useDatasetStatistics() {
  return useQuery({
    queryKey: ['cross-dataset', 'dataset-statistics'],
    queryFn: () => getDatasetStatistics(),
  });
}

export function useDetailedEvaluation(target: string, direction: string) {
  return useQuery({
    queryKey: ['cross-dataset', 'detailed-evaluation', target, direction],
    queryFn: () => getDetailedEvaluation(target, direction),
    enabled: !!target && !!direction,
  });
}

export function useDomainGapVisualization(target: string = 'arousal') {
  return useQuery({
    queryKey: ['cross-dataset', 'domain-gap', target],
    queryFn: () => getDomainGapVisualization(target),
  });
}

export function useConfusionMatrices(target: string = 'arousal') {
  return useQuery({
    queryKey: ['cross-dataset', 'confusion-matrices', target],
    queryFn: () => getConfusionMatrices(target),
  });
}

export function useFeatureImportanceVisualization(target: string = 'arousal') {
  return useQuery({
    queryKey: ['cross-dataset', 'feature-importance', target],
    queryFn: () => getFeatureImportanceVisualization(target),
  });
}

export function useClassDistributionVisualization() {
  return useQuery({
    queryKey: ['cross-dataset', 'class-distribution-visualization'],
    queryFn: () => getClassDistributionVisualization(),
  });
}
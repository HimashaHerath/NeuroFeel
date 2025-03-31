// hooks/useWesadData.ts
import { useQuery } from '@tanstack/react-query';
import { getOverview, getModelPerformance, getSubjectData, getSignalVisualizationData, getFeatureImportance } from '@/lib/api';

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => getOverview(),
  });
}

export function useModelPerformance(modelType: string) {
  return useQuery({
    queryKey: ['model-performance', modelType],
    queryFn: () => getModelPerformance(modelType),
  });
}

export function useSubjectData(subjectId: number) {
  return useQuery({
    queryKey: ['subject-data', subjectId],
    queryFn: () => getSubjectData(subjectId),
    enabled: !!subjectId,
  });
}

export function useSignalVisualization(subjectId: number, emotion?: string) {
  return useQuery({
    queryKey: ['signal-visualization', subjectId, emotion],
    queryFn: () => getSignalVisualizationData(subjectId, emotion),
    enabled: !!subjectId,
  });
}

export function useFeatureImportance(subjectId?: number, topN: number = 10) {
  return useQuery({
    queryKey: ['feature-importance', subjectId, topN],
    queryFn: () => getFeatureImportance(subjectId, topN),
  });
}
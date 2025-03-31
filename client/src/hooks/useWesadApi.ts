// src/hooks/useWesadApi.ts
// React hook for using the WESAD API

import { useState, useCallback } from 'react';
import wesadAPI, {
  SubjectInfo,
  ModelPredictions,
  EvaluationResult,
  SampleFeatures,
  OverallPerformance
} from '../lib/wesadAPI';

// Define the return type of the hook
interface UseWesadApiReturn {
  // Data states
  subjects: SubjectInfo[];
  currentSubject: number | null;
  prediction: ModelPredictions | null;
  evaluation: EvaluationResult | null;
  sampleFeatures: SampleFeatures | null;
  performance: OverallPerformance | null;

  // Loading states
  isLoadingSubjects: boolean;
  isPredicting: boolean;
  isEvaluating: boolean;
  isLoadingFeatures: boolean;
  isLoadingPerformance: boolean;

  // Error state
  error: string | null;

  // Action methods
  fetchSubjects: () => Promise<void>;
  makePrediction: (subjectId: number, sampleIndex?: number) => Promise<void>;
  evaluateSubject: (subjectId: number) => Promise<void>;
  fetchSampleFeatures: (subjectId: number, sampleIndex: number) => Promise<void>;
  fetchOverallPerformance: () => Promise<void>;
  selectSubject: (subjectId: number) => void;
  clearError: () => void;
  resetAll: () => void;
}

/**
 * Hook for interacting with the WESAD API
 */
export function useWesadApi(): UseWesadApiReturn {
  // Data states
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [currentSubject, setCurrentSubject] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<ModelPredictions | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sampleFeatures, setSampleFeatures] = useState<SampleFeatures | null>(null);
  const [performance, setPerformance] = useState<OverallPerformance | null>(null);

  // Loading states
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all available subjects
   */
  const fetchSubjects = useCallback(async () => {
    setIsLoadingSubjects(true);
    setError(null);

    try {
      const data = await wesadAPI.getSubjects();
      setSubjects(data);
      
      // Optionally select the first subject if none is selected
      if (data.length > 0 && currentSubject === null) {
        setCurrentSubject(data[0].subject_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setIsLoadingSubjects(false);
    }
  }, [currentSubject]);

  /**
   * Make a prediction for a specific subject and sample
   */
  const makePrediction = useCallback(async (subjectId: number, sampleIndex: number = 0) => {
    setIsPredicting(true);
    setError(null);

    try {
      const data = await wesadAPI.predict(subjectId, sampleIndex);
      setPrediction(data);
      setCurrentSubject(subjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to make prediction for subject ${subjectId}`);
    } finally {
      setIsPredicting(false);
    }
  }, []);

  /**
   * Evaluate all models on a subject's test data
   */
  const evaluateSubject = useCallback(async (subjectId: number) => {
    setIsEvaluating(true);
    setError(null);

    try {
      const data = await wesadAPI.evaluateSubject(subjectId);
      setEvaluation(data);
      setCurrentSubject(subjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to evaluate subject ${subjectId}`);
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  /**
   * Fetch sample features for a specific sample
   */
  const fetchSampleFeatures = useCallback(async (subjectId: number, sampleIndex: number) => {
    setIsLoadingFeatures(true);
    setError(null);

    try {
      const data = await wesadAPI.getSampleFeatures(subjectId, sampleIndex);
      setSampleFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch features for subject ${subjectId}, sample ${sampleIndex}`);
    } finally {
      setIsLoadingFeatures(false);
    }
  }, []);

  /**
   * Fetch overall performance across all subjects
   */
  const fetchOverallPerformance = useCallback(async () => {
    setIsLoadingPerformance(true);
    setError(null);

    try {
      const data = await wesadAPI.getOverallPerformance();
      setPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overall performance');
    } finally {
      setIsLoadingPerformance(false);
    }
  }, []);

  /**
   * Select a subject
   */
  const selectSubject = useCallback((subjectId: number) => {
    setCurrentSubject(subjectId);
  }, []);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const resetAll = useCallback(() => {
    setSubjects([]);
    setCurrentSubject(null);
    setPrediction(null);
    setEvaluation(null);
    setSampleFeatures(null);
    setPerformance(null);
    setError(null);
  }, []);

  return {
    // Data states
    subjects,
    currentSubject,
    prediction,
    evaluation,
    sampleFeatures,
    performance,

    // Loading states
    isLoadingSubjects,
    isPredicting,
    isEvaluating,
    isLoadingFeatures,
    isLoadingPerformance,

    // Error state
    error,

    // Action methods
    fetchSubjects,
    makePrediction,
    evaluateSubject,
    fetchSampleFeatures,
    fetchOverallPerformance,
    selectSubject,
    clearError,
    resetAll,
  };
}

export default useWesadApi;
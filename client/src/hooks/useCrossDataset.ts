// D:\NeuroFeel\client\src\hooks\useCrossDataset.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  crossDatasetApi, 
  AvailableSamples, 
  SampleDetails, 
  PredictionResponse,
  PredictionRequest,
  HealthCheckResponse
} from '@/lib/crossDatasetApiPredict';

// Hook for health check
export function useHealthCheck() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const result = await crossDatasetApi.getHealth();
        setHealth(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { health, loading, error };
}

// Hook for available samples
export function useAvailableSamples() {
  const [samples, setSamples] = useState<AvailableSamples | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const result = await crossDatasetApi.getAvailableSamples();
        setSamples(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  return { samples, loading, error };
}

// Hook for sample details
export function useSampleDetails(direction: string, index: number) {
  const [sampleDetails, setSampleDetails] = useState<SampleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSampleDetails = async () => {
      if (!direction) return;
      
      try {
        setLoading(true);
        const result = await crossDatasetApi.getSampleDetails(direction, index);
        setSampleDetails(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleDetails();
  }, [direction, index]);

  return { sampleDetails, loading, error };
}

// Hook for prediction
export function usePrediction() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const makePrediction = useCallback(async (request: PredictionRequest) => {
    try {
      setLoading(true);
      const result = await crossDatasetApi.predict(request);
      setPrediction(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { prediction, loading, error, makePrediction };
}

// Hook for model info
export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState<Record<string, Record<string, ModelInfo>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setLoading(true);
        const result = await crossDatasetApi.getModels();
        setModelInfo(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  return { modelInfo, loading, error };
}
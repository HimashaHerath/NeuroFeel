// src/lib/wesadAPI.ts
// WESAD API client for interacting with the WESAD Emotion Recognition Demo API

// Define API base URL
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/wesad/model` || 'http://localhost:8000/wesad/model';
// Types for API responses based on actual API schema
export interface SubjectInfo {
  subject_id: number;
  num_samples: number;
  class_distribution: Record<string, number>;
}

export interface PredictionResult {
  emotion_id: number;
  emotion_name: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface ModelPredictions {
  base_model: PredictionResult;
  personal_model: PredictionResult;
  ensemble_model: PredictionResult;
  adaptive_model: PredictionResult;
  accuracy: {
    true_emotion: string;
    true_emotion_id?: number;
    base_correct: number;
    personal_correct: number;
    ensemble_correct: number;
    adaptive_correct: number;
  };
}

export interface EvaluationResult {
  subject_id: number;
  accuracy: Record<string, number>;
  f1_score: Record<string, number>;
  confusion_matrix: Record<string, number[][]>;
}

export interface SampleFeatures {
  subject_id: number;
  sample_index: number;
  features: Record<string, number>;
}

export interface OverallPerformance {
  mean_metrics: {
    base_accuracy: number;
    personal_accuracy: number;
    ensemble_accuracy: number;
    adaptive_accuracy: number;
    base_f1: number;
    personal_f1: number;
    ensemble_f1: number;
    adaptive_f1: number;
  };
  improvements: {
    personal_vs_base: number;
    ensemble_vs_base: number;
    adaptive_vs_base: number;
  };
  per_subject: {
    subject_ids: number[];
    metrics: {
      base_accuracy: number[];
      personal_accuracy: number[];
      ensemble_accuracy: number[];
      adaptive_accuracy: number[];
      base_f1: number[];
      personal_f1: number[];
      ensemble_f1: number[];
      adaptive_f1: number[];
    };
  };
}

// WESAD API class
export class WesadAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Handle API errors in a consistent way
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.text();
      const errorMessage = `API Error (${response.status}): ${errorBody}`;
      throw new Error(errorMessage);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Check if the API is running
   */
  async checkStatus(): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    return this.handleResponse<{ message: string }>(response);
  }

  /**
   * Get list of available subjects with their information
   */
  async getSubjects(): Promise<SubjectInfo[]> {
    const response = await fetch(`${this.baseUrl}/subjects`);
    return this.handleResponse<SubjectInfo[]>(response);
  }

  /**
   * Make a prediction for a specific subject and sample
   */
  async predict(subjectId: number, sampleIndex: number = 0): Promise<ModelPredictions> {
    const response = await fetch(`${this.baseUrl}/predict/${subjectId}?sample_index=${sampleIndex}`);
    return this.handleResponse<ModelPredictions>(response);
  }

  /**
   * Evaluate all models on a subject's test data
   */
  async evaluateSubject(subjectId: number): Promise<EvaluationResult> {
    const response = await fetch(`${this.baseUrl}/evaluate/${subjectId}`);
    return this.handleResponse<EvaluationResult>(response);
  }

  /**
   * Get sample features for a specific sample
   */
  async getSampleFeatures(subjectId: number, sampleIndex: number): Promise<SampleFeatures> {
    const response = await fetch(`${this.baseUrl}/sample/${subjectId}/${sampleIndex}`);
    return this.handleResponse<SampleFeatures>(response);
  }

  /**
   * Get overall performance across all subjects
   */
  async getOverallPerformance(): Promise<OverallPerformance> {
    const response = await fetch(`${this.baseUrl}/overall_performance`);
    return this.handleResponse<OverallPerformance>(response);
  }
}

// Create and export a default instance
const wesadAPI = new WesadAPI();
export default wesadAPI;
from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Body, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html
import pandas as pd
import numpy as np
import os
import json
import io
import zipfile
import tempfile
import pickle
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Models for data validation
class ModelPerformance(BaseModel):
    model_type: str
    accuracy: float
    f1_score: float
    subject_id: Optional[int] = None
    
class EmotionRecognition(BaseModel):
    emotion: str
    correct: int
    total: int
    accuracy: float
    
class SubjectPerformance(BaseModel):
    subject_id: int
    base_accuracy: float
    personal_accuracy: float
    ensemble_accuracy: float
    adaptive_accuracy: float
    
class ConfusionMatrix(BaseModel):
    model_type: str
    subject_id: int
    matrix: List[List[int]]
    class_names: List[str]

class DetailedConfusionMatrix(BaseModel):
    model_type: str
    subject_id: int
    matrix: List[List[int]]
    class_names: List[str]
    normalized_matrix: List[List[float]]
    misclassification_counts: Dict[str, Dict[str, int]]

class EmotionDetailedPerformance(BaseModel):
    emotion: str
    per_subject: Dict[int, Dict[str, float]]
    overall: Dict[str, float]
    common_misclassifications: Dict[str, int]

class SubjectDetailedAnalysis(BaseModel):
    subject_id: int
    model_performances: Dict[str, Dict[str, Any]]
    emotion_performance: Dict[str, Dict[str, float]]
    model_selection_patterns: Optional[Dict[str, Dict[str, float]]] = None

class FeatureImportance(BaseModel):
    feature_name: str
    importance_score: float
    emotion_specific_scores: Dict[str, float]

class SignalPredictionInput(BaseModel):
    ecg_data: List[float]
    emg_data: List[float]
    resp_data: List[float]
    window_size: Optional[int] = 8400

class AdaptiveThresholdSimulation(BaseModel):
    threshold: float = 0.65
    subject_id: Optional[int] = None

class ReportType(BaseModel):
    report_type: str = "performance_summary"
    subject_id: Optional[int] = None
    format: str = "pdf"

# Create FastAPI app
app = FastAPI(
    title="WESAD Emotion Recognition API",
    description="API for serving WESAD emotion recognition research data",
    version="1.0.0"
)

# Add CORS middleware to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-production-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths to data files
BASE_DIR = os.path.join(os.path.dirname(__file__), "wesad_api_data")
ALL_MODELS_JSON = os.path.join(BASE_DIR, "all_models.json")
ALL_MODELS_CSV = os.path.join(BASE_DIR, "all_models.csv")
OVERVIEW_JSON = os.path.join(BASE_DIR, "overview", "overview.json")
ALL_EMOTIONS_JSON = os.path.join(BASE_DIR, "emotions", "all_emotions.json")

# Define paths to feature importance data
FEATURE_DIR = os.path.join(BASE_DIR, "features")
FEATURE_IMPORTANCE_JSON = os.path.join(FEATURE_DIR, "feature_importance.json")
SUBJECT_FEATURE_IMPORTANCE_DIR = os.path.join(FEATURE_DIR, "subjects")

# Define paths for raw data and models
RAW_DATA_DIR = os.path.join(BASE_DIR, "raw_data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
BENCHMARKS_FILE = os.path.join(BASE_DIR, "benchmarks", "benchmarks.json")
DATASET_STATS_FILE = os.path.join(BASE_DIR, "dataset", "statistics.json")
VISUALIZATION_DIR = os.path.join(BASE_DIR, "visualizations")
TEST_DATA_DIR = os.path.join(BASE_DIR, "test_data")

# Define emotion class names
CLASS_NAMES = ['Baseline', 'Stress', 'Amusement', 'Meditation']

# Helper function to load data
def load_model_data():
    """Load all model data from JSON or CSV files"""
    try:
        # First try to load from the JSON file (preferred for preserving nested data)
        if os.path.exists(ALL_MODELS_JSON):
            with open(ALL_MODELS_JSON, 'r') as f:
                all_data = json.load(f)
            return pd.DataFrame(all_data)
        # Fall back to CSV if JSON not available
        elif os.path.exists(ALL_MODELS_CSV):
            all_data = pd.read_csv(ALL_MODELS_CSV)
            # Parse JSON strings in the DataFrame
            for col in all_data.columns:
                if all_data[col].dtype == 'object':
                    try:
                        # Try to parse as JSON if it looks like a JSON string
                        first_val = all_data[col].iloc[0]
                        if isinstance(first_val, str) and (first_val.startswith('{') or first_val.startswith('[')):
                            all_data[col] = all_data[col].apply(json.loads)
                    except (ValueError, TypeError, AttributeError):
                        pass
            return all_data
        else:
            # If no consolidated files exist, try to load individual JSON files for each model type
            model_types = ["base", "personal", "ensemble", "adaptive"]
            all_data = []
            
            for model_type in model_types:
                model_json = os.path.join(BASE_DIR, "models", f"{model_type}_models.json")
                if os.path.exists(model_json):
                    with open(model_json, 'r') as f:
                        model_data = json.load(f)
                    all_data.extend(model_data)
            
            if all_data:
                return pd.DataFrame(all_data)
            else:
                print("No model data files found")
                return pd.DataFrame()
    except Exception as e:
        print(f"Error loading data: {e}")
        return pd.DataFrame()

# Helper function to parse confusion matrices
def parse_confusion_matrices(data_df):
    """Parse confusion matrices from dataframe"""
    matrices = {}
    
    for _, row in data_df.iterrows():
        subject_id = row['subject_id']
        model_type = row['model_type']
        
        # Get confusion matrix - handle both DataFrame and dict formats
        if isinstance(row, pd.Series):
            # If row is a pandas Series
            if 'confusion_matrix' in row and isinstance(row['confusion_matrix'], list):
                confusion_matrix = row['confusion_matrix']
            elif 'confusion_matrix' in row and isinstance(row['confusion_matrix'], str):
                # Try to parse from JSON string
                try:
                    confusion_matrix = json.loads(row['confusion_matrix'])
                except:
                    confusion_matrix = []
            else:
                confusion_matrix = []
        else:
            # If row is a dict
            confusion_matrix = row.get('confusion_matrix', [])
        
        if subject_id not in matrices:
            matrices[subject_id] = {}
        
        matrices[subject_id][model_type] = confusion_matrix
    
    return matrices

# Helper function to load overview data
def load_overview_data():
    """Load overview data from JSON file"""
    try:
        if os.path.exists(OVERVIEW_JSON):
            with open(OVERVIEW_JSON, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading overview data: {e}")
        return None

# Helper function to load emotion data
def load_emotion_data():
    """Load emotion data from JSON file"""
    try:
        if os.path.exists(ALL_EMOTIONS_JSON):
            with open(ALL_EMOTIONS_JSON, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading emotion data: {e}")
        return None

# Helper function to load subject data
def load_subject_data(subject_id):
    """Load data for a specific subject from JSON file"""
    subject_json = os.path.join(BASE_DIR, "subjects", f"subject_{subject_id}.json")
    try:
        if os.path.exists(subject_json):
            with open(subject_json, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading subject data: {e}")
        return None

# Helper function to load feature importance data
def load_feature_importance():
    """Load global feature importance data"""
    try:
        if os.path.exists(FEATURE_IMPORTANCE_JSON):
            with open(FEATURE_IMPORTANCE_JSON, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading feature importance data: {e}")
        return None

# Helper function to load subject-specific feature importance
def load_subject_feature_importance(subject_id):
    """Load feature importance data for a specific subject"""
    subject_feature_json = os.path.join(SUBJECT_FEATURE_IMPORTANCE_DIR, f"feature_importance_S{subject_id}.json")
    try:
        if os.path.exists(subject_feature_json):
            with open(subject_feature_json, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading subject feature importance data: {e}")
        return None

# Helper function to load benchmark data
def load_benchmark_data():
    """Load benchmark comparison data"""
    try:
        if os.path.exists(BENCHMARKS_FILE):
            with open(BENCHMARKS_FILE, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading benchmark data: {e}")
        return None

# Helper function to load dataset statistics
def load_dataset_statistics():
    """Load WESAD dataset statistics"""
    try:
        if os.path.exists(DATASET_STATS_FILE):
            with open(DATASET_STATS_FILE, 'r') as f:
                return json.load(f)
        else:
            return None
    except Exception as e:
        print(f"Error loading dataset statistics: {e}")
        return None

# Helper function to load test data for a subject
def load_test_data(subject_id):
    test_data_path = os.path.join(TEST_DATA_DIR, f"SS{subject_id}_test.pkl")
    print(f"Looking for test data at: {test_data_path}")
    print(f"File exists: {os.path.exists(test_data_path)}")
    
    try:
        if os.path.exists(test_data_path):
            print(f"Attempting to open file...")
            with open(test_data_path, 'rb') as f:
                print(f"File opened, attempting to load pickle...")
                data = pickle.load(f)
                print(f"Pickle loaded. Keys: {data.keys() if isinstance(data, dict) else 'Not a dict'}")
                return data
        else:
            return None
    except Exception as e:
        print(f"Error loading test data: {str(e)}")
        return None

# Helper function to load model
def load_model(model_type, subject_id=None):
    """Load model from model directory"""
    if model_type == 'base':
        model_path = os.path.join(MODELS_DIR, "base_model.pkl")
    elif model_type == 'personal' and subject_id is not None:
        model_path = os.path.join(MODELS_DIR, f"personal_SS{subject_id}.pkl")
        print(f"Looking for model file: {model_path}")
        print(f"File exists: {os.path.exists(model_path)}")
    elif model_type == 'ensemble' and subject_id is not None:
        model_path = os.path.join(MODELS_DIR, f"ensemble_SS{subject_id}.pkl")
    elif model_type == 'adaptive' and subject_id is not None:
        model_path = os.path.join(MODELS_DIR, f"adaptive_SS{subject_id}.pkl")
    else:
        return None
    
    try:
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                
            # Extract model if it's wrapped in a dictionary
            if isinstance(model_data, dict) and 'model' in model_data:
                return model_data['model'], model_data.get('scaler')
            else:
                return model_data, None
        else:
            return None, None
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None

# Helper function to extract features from signal data
def extract_features_from_signals(ecg_data, emg_data, resp_data):
    """Extract features from raw physiological signals"""
    features = {}
    
    # ECG features
    features["chest_ecg_mean"] = np.mean(ecg_data)
    features["chest_ecg_std"] = np.std(ecg_data)
    features["chest_ecg_min"] = np.min(ecg_data)
    features["chest_ecg_max"] = np.max(ecg_data)
    features["chest_ecg_range"] = np.max(ecg_data) - np.min(ecg_data)
    features["chest_ecg_median"] = np.median(ecg_data)
    features["chest_ecg_iqr"] = np.percentile(ecg_data, 75) - np.percentile(ecg_data, 25)
    features["chest_ecg_mean_diff"] = np.mean(np.abs(np.diff(ecg_data)))
    features["chest_ecg_energy"] = np.sum(ecg_data**2) / len(ecg_data)
    
    # EMG features
    features["chest_emg_mean"] = np.mean(emg_data)
    features["chest_emg_std"] = np.std(emg_data)
    features["chest_emg_min"] = np.min(emg_data)
    features["chest_emg_max"] = np.max(emg_data)
    features["chest_emg_range"] = np.max(emg_data) - np.min(emg_data)
    features["chest_emg_median"] = np.median(emg_data)
    features["chest_emg_iqr"] = np.percentile(emg_data, 75) - np.percentile(emg_data, 25)
    features["chest_emg_mean_diff"] = np.mean(np.abs(np.diff(emg_data)))
    features["chest_emg_energy"] = np.sum(emg_data**2) / len(emg_data)
    
    # Respiration features
    features["chest_resp_mean"] = np.mean(resp_data)
    features["chest_resp_std"] = np.std(resp_data)
    features["chest_resp_min"] = np.min(resp_data)
    features["chest_resp_max"] = np.max(resp_data)
    features["chest_resp_range"] = np.max(resp_data) - np.min(resp_data)
    features["chest_resp_median"] = np.median(resp_data)
    features["chest_resp_iqr"] = np.percentile(resp_data, 75) - np.percentile(resp_data, 25)
    features["chest_resp_mean_diff"] = np.mean(np.abs(np.diff(resp_data)))
    features["chest_resp_energy"] = np.sum(resp_data**2) / len(resp_data)
    
    return features

# Helper function to make predictions using actual models
def predict_with_model(model, scaler, features):
    """Make a prediction using the specified model and scaler"""
    # Create feature vector
    feature_array = np.array([[features[k] for k in sorted(features.keys())]])
    
    # Apply scaling if scaler is provided
    if scaler is not None:
        feature_array = scaler.transform(feature_array)
    
    # Make prediction
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(feature_array)[0]
        predicted_class = int(np.argmax(probabilities))
        
        # Convert to dictionary
        emotion_probs = {
            CLASS_NAMES[i]: float(probabilities[i]) for i in range(len(CLASS_NAMES))
        }
        
        return {
            'predicted_emotion': CLASS_NAMES[predicted_class],
            'probabilities': emotion_probs
        }
    else:
        # If the model doesn't have predict_proba, use predict
        predicted_class = int(model.predict(feature_array)[0])
        return {
            'predicted_emotion': CLASS_NAMES[predicted_class],
            'probabilities': {CLASS_NAMES[predicted_class]: 1.0}
        }

# API Endpoints
@app.get("/")
async def root():
    return {"message": "WESAD Emotion Recognition API is running"}

@app.get("/overview", response_model=Dict[str, Any])
async def get_overview():
    """Get overview statistics for all models"""
    # Try to load from pre-computed overview file first
    overview_data = load_overview_data()
    if overview_data:
        return overview_data
    
    # Fall back to computing from raw data
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Calculate overall metrics for each model type
    overview = {
        "models": [],
        "emotions": {},
        "subjects": []
    }
    
    # Process model performance
    for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_data = data_df[data_df['model_type'] == model_type]
        if not model_data.empty:
            avg_accuracy = model_data['accuracy'].mean()
            avg_f1 = model_data['f1_score'].mean()
            std_accuracy = model_data['accuracy'].std()
            
            overview["models"].append({
                "name": model_type,
                "accuracy": float(avg_accuracy),
                "f1_score": float(avg_f1),
                "std_deviation": float(std_accuracy)
            })
    
    # Process emotion recognition data
    emotion_data = load_emotion_data()
    if emotion_data:
        overview["emotions"] = emotion_data
    
    # Process subject performance
    subjects = data_df['subject_id'].unique()
    for subject_id in subjects:
        subject_data = {
            "subject_id": int(subject_id),
            "accuracies": {}
        }
        
        for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
            model_subject_data = data_df[(data_df['model_type'] == model_type) & 
                                         (data_df['subject_id'] == subject_id)]
            if not model_subject_data.empty:
                subject_data["accuracies"][model_type] = float(model_subject_data['accuracy'].iloc[0])
        
        overview["subjects"].append(subject_data)
    
    return overview

@app.get("/models/{model_type}", response_model=List[ModelPerformance])
async def get_model_performance(model_type: str):
    """Get performance metrics for a specific model type"""
    if model_type not in ['base', 'personal', 'ensemble', 'adaptive', 'all']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    if model_type == 'all':
        # Return data for all models
        result = []
        for _, row in data_df.iterrows():
            result.append({
                "model_type": row['model_type'],
                "accuracy": float(row['accuracy']),
                "f1_score": float(row['f1_score']),
                "subject_id": int(row['subject_id'])
            })
        return result
    else:
        # Return data for specific model type
        model_data = data_df[data_df['model_type'] == model_type]
        if model_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for model type: {model_type}")
        
        result = []
        for _, row in model_data.iterrows():
            result.append({
                "model_type": model_type,
                "accuracy": float(row['accuracy']),
                "f1_score": float(row['f1_score']),
                "subject_id": int(row['subject_id'])
            })
        return result

@app.get("/subjects/{subject_id}", response_model=Dict[str, Any])
async def get_subject_data(subject_id: int):
    """Get all data for a specific subject"""
    # Try to load from pre-computed subject file first
    subject_json = load_subject_data(subject_id)
    if subject_json:
        return subject_json
    
    # Fall back to computing from raw data
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    subject_data = data_df[data_df['subject_id'] == subject_id]
    
    if subject_data.empty:
        raise HTTPException(status_code=404, detail=f"No data found for subject: {subject_id}")
    
    # Organize data by model type
    result = {
        "subject_id": subject_id,
        "models": {}
    }
    
    # Parse confusion matrices
    matrices = parse_confusion_matrices(subject_data)
    
    for _, row in subject_data.iterrows():
        model_type = row['model_type']
        
        # Extract model-specific metrics
        model_data = {
            "accuracy": float(row['accuracy']),
            "f1_score": float(row['f1_score']),
            "num_samples": int(row.get('num_samples', 0)),
            "confusion_matrix": matrices.get(subject_id, {}).get(model_type, [])
        }
        
        # Extract class metrics if available
        if 'class_metrics' in row:
            model_data["class_metrics"] = row['class_metrics']
        
        # Add model-specific data that might be available
        if model_type == 'ensemble' and 'ensemble_weight' in row:
            model_data["ensemble_weight"] = float(row['ensemble_weight'])
        
        if model_type == 'adaptive':
            if 'base_model_pct' in row:
                model_data["base_model_pct"] = float(row['base_model_pct'])
            if 'personal_model_pct' in row:
                model_data["personal_model_pct"] = float(row['personal_model_pct'])
            if 'model_selection' in row:
                model_data["model_selection"] = row['model_selection']
        
        result["models"][model_type] = model_data
    
    return result

@app.get("/emotions", response_model=Dict[str, Any])
async def get_emotion_recognition():
    """Get emotion recognition rates for all models"""
    # Try to load from pre-computed emotions file first
    emotion_data = load_emotion_data()
    if emotion_data:
        return {"emotions": emotion_data}
    
    # Fall back to computing from raw data
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Process emotion data for each model
    result = {"emotions": {}}
    
    for class_name in CLASS_NAMES:
        emotion_metrics = {"models": {}}
        
        for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
            model_data = data_df[data_df['model_type'] == model_type]
            
            if not model_data.empty:
                # Collect metrics across all subjects
                correct_total = 0
                samples_total = 0
                
                for _, row in model_data.iterrows():
                    if 'class_metrics' in row and class_name in row['class_metrics']:
                        metrics = row['class_metrics'][class_name]
                        correct_total += metrics.get('correct', 0)
                        samples_total += metrics.get('total', 0)
                
                if samples_total > 0:
                    emotion_metrics["models"][model_type] = {
                        "correct": int(correct_total),
                        "total": int(samples_total),
                        "accuracy": float(correct_total / samples_total)
                    }
        
        result["emotions"][class_name] = emotion_metrics
    
    return result

@app.get("/confusion_matrices", response_model=Dict[str, List[ConfusionMatrix]])
async def get_confusion_matrices():
    """Get confusion matrices for all models and subjects"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Parse confusion matrices
    matrices = parse_confusion_matrices(data_df)
    
    # Organize by model type
    result = {
        "base": [],
        "personal": [],
        "ensemble": [],
        "adaptive": []
    }
    
    for subject_id, model_matrices in matrices.items():
        for model_type, matrix in model_matrices.items():
            if model_type in result:
                result[model_type].append({
                    "subject_id": int(subject_id),
                    "model_type": model_type,
                    "matrix": matrix,
                    "class_names": CLASS_NAMES
                })
    
    return result

@app.get("/model_comparison", response_model=Dict[str, Any])
async def get_model_comparison():
    """Get comparison data for all models"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Calculate average performance for each model
    result = {
        "accuracy": {},
        "f1_score": {},
        "best_for_subject": {},
        "best_for_emotion": {},
    }
    
    for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_data = data_df[data_df['model_type'] == model_type]
        
        if not model_data.empty:
            result["accuracy"][model_type] = float(model_data['accuracy'].mean())
            result["f1_score"][model_type] = float(model_data['f1_score'].mean())
    
    # Determine which model performs best for each subject
    subjects = data_df['subject_id'].unique()
    for subject_id in subjects:
        subject_data = data_df[data_df['subject_id'] == subject_id]
        
        if not subject_data.empty:
            accuracies = []
            for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
                model_rows = subject_data[subject_data['model_type'] == model_type]
                if not model_rows.empty:
                    accuracies.append((model_type, model_rows['accuracy'].iloc[0]))
            
            if accuracies:
                best_model = max(accuracies, key=lambda x: x[1])[0]
                result["best_for_subject"][str(subject_id)] = best_model
    
    # Determine which model performs best for each emotion
    emotion_data = load_emotion_data()
    if emotion_data:
        for emotion, data in emotion_data.items():
            best_accuracy = 0
            best_model = None
            if "models" in data:
                for model, metrics in data["models"].items():
                    if metrics.get("accuracy", 0) > best_accuracy:
                        best_accuracy = metrics["accuracy"]
                        best_model = model
                if best_model:
                    result["best_for_emotion"][emotion] = best_model
    
    return result

@app.get("/model_selection_stats", response_model=Dict[str, Any])
async def get_model_selection_stats():
    """Get statistics on adaptive model selection patterns"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Focus on adaptive model data only
    adaptive_data = data_df[data_df['model_type'] == 'adaptive']
    
    if adaptive_data.empty:
        raise HTTPException(status_code=404, detail="No adaptive model data found")
    
    # Calculate statistics on model selection
    result = {
        "overall": {
            "base_model_pct": 0,
            "personal_model_pct": 0
        },
        "by_subject": {},
        "by_emotion": {}
    }
    
    # Overall statistics
    base_total = 0
    personal_total = 0
    sample_count = 0
    
    for _, row in adaptive_data.iterrows():
        if 'base_model_count' in row and 'personal_model_count' in row:
            base_total += row['base_model_count']
            personal_total += row['personal_model_count']
            sample_count += row['base_model_count'] + row['personal_model_count']
    
    if sample_count > 0:
        result["overall"]["base_model_pct"] = float(base_total / sample_count * 100)
        result["overall"]["personal_model_pct"] = float(personal_total / sample_count * 100)
    
    # By subject statistics
    for subject_id in adaptive_data['subject_id'].unique():
        subject_rows = adaptive_data[adaptive_data['subject_id'] == subject_id]
        if not subject_rows.empty:
            row = subject_rows.iloc[0]
            if 'base_model_pct' in row and 'personal_model_pct' in row:
                result["by_subject"][str(subject_id)] = {
                    "base_model_pct": float(row['base_model_pct']),
                    "personal_model_pct": float(row['personal_model_pct'])
                }
    
    # By emotion statistics
    emotion_base_total = {emotion: 0 for emotion in CLASS_NAMES}
    emotion_personal_total = {emotion: 0 for emotion in CLASS_NAMES}
    emotion_sample_count = {emotion: 0 for emotion in CLASS_NAMES}
    
    for _, row in adaptive_data.iterrows():
        if 'model_selection' in row:
            for emotion, data in row['model_selection'].items():
                emotion_base_total[emotion] += data.get('base_model_used', 0)
                emotion_personal_total[emotion] += data.get('personal_model_used', 0)
                emotion_sample_count[emotion] += data.get('base_model_used', 0) + data.get('personal_model_used', 0)
    
    for emotion in CLASS_NAMES:
        if emotion_sample_count[emotion] > 0:
            result["by_emotion"][emotion] = {
                "base_model_pct": float(emotion_base_total[emotion] / emotion_sample_count[emotion] * 100),
                "personal_model_pct": float(emotion_personal_total[emotion] / emotion_sample_count[emotion] * 100)
            }
    
    return result

@app.get("/detailed/confusion_matrices/{model_type}/{subject_id}", response_model=DetailedConfusionMatrix)
async def get_detailed_confusion_matrix(model_type: str, subject_id: int):
    """Get detailed confusion matrix data with normalized values and misclassification analysis"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Filter data for the specific model type and subject
    filtered_data = data_df[(data_df['model_type'] == model_type) & (data_df['subject_id'] == subject_id)]
    
    if filtered_data.empty:
        raise HTTPException(status_code=404, detail=f"No data found for model {model_type} and subject {subject_id}")
    
    # Extract the confusion matrix
    row = filtered_data.iloc[0]
    
    # Get confusion matrix - handle both DataFrame and dict formats
    if isinstance(row, pd.Series):
        if 'confusion_matrix' in row and isinstance(row['confusion_matrix'], list):
            matrix = row['confusion_matrix']
        elif 'confusion_matrix' in row and isinstance(row['confusion_matrix'], str):
            try:
                matrix = json.loads(row['confusion_matrix'])
            except:
                matrix = []
        else:
            matrix = []
    else:
        matrix = row.get('confusion_matrix', [])
    
    if not matrix:
        raise HTTPException(status_code=404, detail="Confusion matrix data not available")
    
    # Convert to numpy array for calculations
    matrix_np = np.array(matrix)
    
    # Calculate normalized matrix (by row)
    normalized_matrix = []
    for row in matrix_np:
        row_sum = np.sum(row)
        if row_sum > 0:
            normalized_row = row / row_sum
        else:
            normalized_row = np.zeros_like(row)
        normalized_matrix.append(normalized_row.tolist())
    
    # Generate misclassification counts
    misclassification_counts = {}
    for i, true_class in enumerate(CLASS_NAMES):
        misclassification_counts[true_class] = {}
        for j, pred_class in enumerate(CLASS_NAMES):
            if i != j and matrix_np[i, j] > 0:
                misclassification_counts[true_class][pred_class] = int(matrix_np[i, j])
    
    return {
        "model_type": model_type,
        "subject_id": subject_id,
        "matrix": matrix,
        "class_names": CLASS_NAMES,
        "normalized_matrix": normalized_matrix,
        "misclassification_counts": misclassification_counts
    }

@app.get("/detailed/emotion/{emotion}", response_model=EmotionDetailedPerformance)
async def get_detailed_emotion_performance(emotion: str):
    """Get detailed performance analysis for a specific emotion"""
    if emotion not in CLASS_NAMES:
        raise HTTPException(status_code=400, detail=f"Invalid emotion: {emotion}")
    
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Initialize result structure
    result = {
        "emotion": emotion,
        "per_subject": {},
        "overall": {
            "base_accuracy": 0,
            "personal_accuracy": 0,
            "ensemble_accuracy": 0,
            "adaptive_accuracy": 0
        },
        "common_misclassifications": {}
    }
    
    # Calculate per-subject emotion recognition performance
    subjects = data_df['subject_id'].unique()
    
    for subject_id in subjects:
        result["per_subject"][int(subject_id)] = {
            "base_accuracy": 0,
            "personal_accuracy": 0,
            "ensemble_accuracy": 0,
            "adaptive_accuracy": 0
        }
        
        for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
            model_data = data_df[(data_df['model_type'] == model_type) & (data_df['subject_id'] == subject_id)]
            
            if not model_data.empty:
                row = model_data.iloc[0]
                
                # Extract emotion-specific metrics
                if 'prediction_counts' in row and isinstance(row['prediction_counts'], dict):
                    if emotion in row['prediction_counts']:
                        emotion_data = row['prediction_counts'][emotion]
                        accuracy = emotion_data.get('accuracy_pct', 0) / 100
                        result["per_subject"][int(subject_id)][f"{model_type}_accuracy"] = float(accuracy)
    
    # Calculate overall emotion recognition performance for each model type
    for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_correct = 0
        model_total = 0
        
        for subject_id in subjects:
            model_data = data_df[(data_df['model_type'] == model_type) & (data_df['subject_id'] == subject_id)]
            
            if not model_data.empty:
                row = model_data.iloc[0]
                
                # Extract emotion-specific metrics
                if 'prediction_counts' in row and isinstance(row['prediction_counts'], dict):
                    if emotion in row['prediction_counts']:
                        emotion_data = row['prediction_counts'][emotion]
                        model_correct += emotion_data.get('correct', 0)
                        model_total += emotion_data.get('total', 0)
        
        if model_total > 0:
            result["overall"][f"{model_type}_accuracy"] = float(model_correct / model_total)
    
    # Calculate common misclassifications
    for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_data = data_df[data_df['model_type'] == model_type]
        
        for _, row in model_data.iterrows():
            # Extract confusion matrix
            if 'confusion_matrix' in row and isinstance(row['confusion_matrix'], list):
                matrix = row['confusion_matrix']
                emotion_idx = CLASS_NAMES.index(emotion)
                
                # Count misclassifications
                if len(matrix) > emotion_idx:
                    for i, count in enumerate(matrix[emotion_idx]):
                        if i != emotion_idx and count > 0:
                            misclass_emotion = CLASS_NAMES[i]
                            if misclass_emotion not in result["common_misclassifications"]:
                                result["common_misclassifications"][misclass_emotion] = 0
                            result["common_misclassifications"][misclass_emotion] += count
    
    return result

@app.get("/detailed/subject/{subject_id}", response_model=SubjectDetailedAnalysis)
async def get_detailed_subject_analysis(subject_id: int):
    """Get detailed analysis for a specific subject across all models and emotions"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    subject_data = data_df[data_df['subject_id'] == subject_id]
    
    if subject_data.empty:
        raise HTTPException(status_code=404, detail=f"No data found for subject: {subject_id}")
    
    # Initialize result structure
    result = {
        "subject_id": subject_id,
        "model_performances": {},
        "emotion_performance": {},
        "model_selection_patterns": {}
    }
    
    # Extract model performances
    for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_data = subject_data[subject_data['model_type'] == model_type]
        
        if not model_data.empty:
            row = model_data.iloc[0]
            
            result["model_performances"][model_type] = {
                "accuracy": float(row['accuracy']),
                "f1_score": float(row['f1_score'])
            }
            
            # Add model-specific data
            if model_type == 'ensemble' and 'ensemble_weight' in row:
                result["model_performances"][model_type]["ensemble_weight"] = float(row['ensemble_weight'])
            
            if model_type == 'adaptive':
                if 'base_model_pct' in row:
                    result["model_performances"][model_type]["base_model_pct"] = float(row['base_model_pct'])
                if 'personal_model_pct' in row:
                    result["model_performances"][model_type]["personal_model_pct"] = float(row['personal_model_pct'])
    
    # Extract emotion performances
    for emotion in CLASS_NAMES:
        result["emotion_performance"][emotion] = {}
        
        for model_type in ['base', 'personal', 'ensemble', 'adaptive']:
            model_data = subject_data[subject_data['model_type'] == model_type]
            
            if not model_data.empty:
                row = model_data.iloc[0]
                
                # Extract emotion-specific metrics
                if 'prediction_counts' in row and isinstance(row['prediction_counts'], dict):
                    if emotion in row['prediction_counts']:
                        emotion_data = row['prediction_counts'][emotion]
                        result["emotion_performance"][emotion][model_type] = {
                            "correct": int(emotion_data.get('correct', 0)),
                            "total": int(emotion_data.get('total', 0)),
                            "accuracy": float(emotion_data.get('accuracy_pct', 0) / 100)
                        }
    
    # Extract model selection patterns for adaptive model
    adaptive_data = subject_data[subject_data['model_type'] == 'adaptive']
    
    if not adaptive_data.empty:
        row = adaptive_data.iloc[0]
        
        if 'model_selection' in row and isinstance(row['model_selection'], dict):
            for emotion, selection_data in row['model_selection'].items():
                if emotion not in result["model_selection_patterns"]:
                    result["model_selection_patterns"][emotion] = {}
                
                base_pct = selection_data.get('base_model_pct', 0)
                personal_pct = selection_data.get('personal_model_pct', 0)
                
                result["model_selection_patterns"][emotion] = {
                    "base_model_pct": float(base_pct),
                    "personal_model_pct": float(personal_pct)
                }
    
    return result

@app.get("/detailed/feature_importance", response_model=List[FeatureImportance])
async def get_feature_importance(subject_id: Optional[int] = None, top_n: Optional[int] = Query(None, ge=1, le=50)):
    """Get feature importance data globally or for a specific subject"""
    
    # If subject ID is provided, get subject-specific feature importance
    if subject_id is not None:
        feature_data = load_subject_feature_importance(subject_id)
        if not feature_data:
            raise HTTPException(status_code=404, detail=f"No feature importance data found for subject: {subject_id}")
    else:
        # Otherwise get global feature importance
        feature_data = load_feature_importance()
        if not feature_data:
            raise HTTPException(status_code=404, detail="No feature importance data found")
    
    # Process feature data into the required format
    result = []
    
    for feature in feature_data.get('features', []):
        # Validate feature data
        if 'name' not in feature or 'score' not in feature:
            continue
            
        try:
            # Convert score to float and validate
            score = float(feature['score'])
            if not np.isfinite(score):  # Check for NaN, inf
                continue
                
            feature_item = {
                "feature_name": feature['name'],
                "importance_score": score,
                "emotion_specific_scores": {}
            }
            
            # Include emotion-specific scores if available
            if 'emotion_scores' in feature:
                for emotion, score in feature['emotion_scores'].items():
                    try:
                        emotion_score = float(score)
                        if np.isfinite(emotion_score):  # Only add valid scores
                            feature_item["emotion_specific_scores"][emotion] = emotion_score
                    except (ValueError, TypeError):
                        continue
            
            result.append(feature_item)
        except (ValueError, TypeError):
            continue
    
    # Check if we have any valid features
    if not result:
        raise HTTPException(status_code=404, detail="No valid feature importance data found")
    
    # Sort by importance score (descending)
    result.sort(key=lambda x: x['importance_score'], reverse=True)
    
    # Check if all importance scores are too similar (might indicate data issues)
    if len(result) > 1:
        max_score = max(item["importance_score"] for item in result)
        min_score = min(item["importance_score"] for item in result)
        if max_score > 0 and (max_score - min_score) / max_score < 0.01:
            # Add a warning field - scores have < 1% variation
            for item in result:
                item["warning"] = "All features have very similar importance scores"
    
    # Limit to top_n features if specified
    if top_n and len(result) > top_n:
        result = result[:top_n]
    
    return result

@app.get("/detailed/misclassifications", response_model=Dict[str, Any])
async def get_misclassification_analysis(model_type: Optional[str] = None):
    """Get analysis of common misclassification patterns"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Filter by model type if specified
    if model_type and model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        filtered_data = data_df[data_df['model_type'] == model_type]
    else:
        filtered_data = data_df
    
    # Initialize misclassification counts
    misclassifications = {}
    for true_emotion in CLASS_NAMES:
        misclassifications[true_emotion] = {}
        for pred_emotion in CLASS_NAMES:
            if true_emotion != pred_emotion:
                misclassifications[true_emotion][pred_emotion] = 0
    
    # Count misclassifications from confusion matrices
    total_confusion = np.zeros((len(CLASS_NAMES), len(CLASS_NAMES)))
    
    for _, row in filtered_data.iterrows():
        if 'confusion_matrix' in row and isinstance(row['confusion_matrix'], list):
            matrix = np.array(row['confusion_matrix'])
            if matrix.shape == (len(CLASS_NAMES), len(CLASS_NAMES)):
                total_confusion += matrix
    
    # Extract misclassification counts
    for i, true_emotion in enumerate(CLASS_NAMES):
        for j, pred_emotion in enumerate(CLASS_NAMES):
            if i != j:
                misclassifications[true_emotion][pred_emotion] = int(total_confusion[i, j])
    
    # Calculate most common misclassifications
    most_common = []
    for true_emotion in CLASS_NAMES:
        for pred_emotion, count in misclassifications[true_emotion].items():
            if count > 0:
                most_common.append((true_emotion, pred_emotion, count))
    
    # Sort by count (descending)
    most_common.sort(key=lambda x: x[2], reverse=True)
    
    result = {
        "misclassification_counts": misclassifications,
        "most_common": [
            {
                "true_emotion": true_emotion,
                "predicted_emotion": pred_emotion,
                "count": count
            } for true_emotion, pred_emotion, count in most_common[:10]  # Top 10
        ],
        "total_misclassifications": {
            emotion: sum(counts.values()) for emotion, counts in misclassifications.items()
        }
    }
    
    return result

@app.get("/detailed/subject/{subject_id}/misclassifications", response_model=Dict[str, Any])
async def get_subject_misclassifications(subject_id: int, model_type: Optional[str] = None):
    """Get misclassification patterns for a specific subject"""
    data_df = load_model_data()
    
    if data_df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    # Filter data for the subject
    subject_data = data_df[data_df['subject_id'] == subject_id]
    
    if subject_data.empty:
        raise HTTPException(status_code=404, detail=f"No data found for subject: {subject_id}")
    
    # Further filter by model type if specified
    if model_type and model_type in ['base', 'personal', 'ensemble', 'adaptive']:
        filtered_data = subject_data[subject_data['model_type'] == model_type]
    else:
        filtered_data = subject_data
    
    # Initialize misclassification counts by model type
    misclassifications_by_model = {}
    
    for m_type in ['base', 'personal', 'ensemble', 'adaptive']:
        model_data = filtered_data[filtered_data['model_type'] == m_type]
        
        if not model_data.empty:
            row = model_data.iloc[0]
            
            if 'confusion_matrix' in row and isinstance(row['confusion_matrix'], list):
                matrix = np.array(row['confusion_matrix'])
                
                # Initialize misclassification counts for this model
                model_misclass = {}
                for true_emotion in CLASS_NAMES:
                    model_misclass[true_emotion] = {}
                
                # Calculate misclassifications
                for i, true_emotion in enumerate(CLASS_NAMES):
                    for j, pred_emotion in enumerate(CLASS_NAMES):
                        if i != j and i < matrix.shape[0] and j < matrix.shape[1]:
                            count = int(matrix[i, j])
                            if count > 0:
                                model_misclass[true_emotion][pred_emotion] = count
                
                misclassifications_by_model[m_type] = model_misclass
    
    # Calculate most problematic emotions (highest misclassification rates)
    problematic_emotions = {}
    
    for m_type, misclass_data in misclassifications_by_model.items():
        problematic_emotions[m_type] = []
        
        for true_emotion, pred_counts in misclass_data.items():
            if pred_counts:  # If there are any misclassifications
                total_misclass = sum(pred_counts.values())
                
                # Get total samples for this emotion from the confusion matrix
                row = filtered_data[filtered_data['model_type'] == m_type].iloc[0]
                matrix = np.array(row['confusion_matrix'])
                true_idx = CLASS_NAMES.index(true_emotion)
                
                if true_idx < matrix.shape[0]:
                    total_samples = sum(matrix[true_idx])
                    
                    if total_samples > 0:
                        error_rate = total_misclass / total_samples
                        problematic_emotions[m_type].append((true_emotion, error_rate, total_misclass, total_samples))
        
        # Sort by error rate (descending)
        problematic_emotions[m_type].sort(key=lambda x: x[1], reverse=True)
    
    result = {
        "subject_id": subject_id,
        "misclassifications_by_model": misclassifications_by_model,
        "problematic_emotions": {
            m_type: [
                {
                    "emotion": emotion,
                    "error_rate": float(rate),
                    "misclassified": int(misclass),
                    "total": int(total)
                } for emotion, rate, misclass, total in data
            ] for m_type, data in problematic_emotions.items()
        }
    }
    
    return result

# Real-time Prediction Endpoint
@app.post("/predict", response_model=Dict[str, Any])
async def predict_emotion_from_signals(data: SignalPredictionInput):
    """Make a real-time emotion prediction from physiological signal data"""
    
    # Extract signals from input
    ecg_data = np.array(data.ecg_data)
    emg_data = np.array(data.emg_data)
    resp_data = np.array(data.resp_data)
    
    # Validate input data length
    if len(ecg_data) < data.window_size or len(emg_data) < data.window_size or len(resp_data) < data.window_size:
        raise HTTPException(
            status_code=400, 
            detail=f"Signal data is shorter than the specified window size of {data.window_size}"
        )
    
    # Trim signals to specified window size
    ecg_data = ecg_data[:data.window_size]
    emg_data = emg_data[:data.window_size]
    resp_data = resp_data[:data.window_size]
    
    # Extract features from signals
    features = extract_features_from_signals(ecg_data, emg_data, resp_data)
    
    # Load models for prediction
    predictions = {}
    model_types = ['base', 'personal', 'ensemble', 'adaptive']
    
    # Use first available subject for personal, ensemble, and adaptive models
    available_subjects = []
    subject_dir = os.path.join(BASE_DIR, "subjects")
    if os.path.exists(subject_dir):
        for filename in os.listdir(subject_dir):
            if filename.startswith('subject_') and filename.endswith('.json'):
                try:
                    subject_id = int(filename.split('_')[1].split('.')[0])
                    available_subjects.append(subject_id)
                except:
                    pass
    
    subject_id = min(available_subjects) if available_subjects else None
    
    for model_type in model_types:
        # Load appropriate model
        if model_type == 'base':
            model, scaler = load_model(model_type)
        else:
            if subject_id is None:
                # Skip non-base models if no subject is available
                continue
            model, scaler = load_model(model_type, subject_id)
        
        # Make prediction if model is available
        if model is not None:
            try:
                predictions[model_type] = predict_with_model(model, scaler, features)
            except Exception as e:
                print(f"Error making prediction with {model_type} model: {e}")
                predictions[model_type] = {
                    "error": str(e),
                    "predicted_emotion": None,
                    "probabilities": {}
                }
    
    if not predictions:
        raise HTTPException(status_code=404, detail="No models available for prediction")
    
    # Return predictions from all models
    return {
        "predictions": predictions,
        "features": features
    }

# Data Visualization Endpoints
@app.get("/visualize/subject/{subject_id}/signals", response_model=Dict[str, Any])
async def get_signal_visualization_data(subject_id: int, emotion: Optional[str] = None):
    """Get sample signal data for visualization purposes"""
    
    # Try to load test data for the subject
    test_data = load_test_data(subject_id)
    if test_data is None:
        raise HTTPException(status_code=404, detail=f"No test data found for subject {subject_id}")
    
    # Get features and labels
    X_test = test_data.get('X_test')
    y_test = test_data.get('y_test')
    feature_names = test_data.get('feature_names', [])
    
    if X_test is None or y_test is None:
        raise HTTPException(status_code=404, detail="Test data doesn't contain required fields")
    
    # Filter by emotion if specified
    if emotion:
        if emotion not in CLASS_NAMES:
            raise HTTPException(status_code=400, detail=f"Invalid emotion: {emotion}")
        emotion_idx = CLASS_NAMES.index(emotion)
        indices = np.where(y_test == emotion_idx)[0]
        if len(indices) == 0:
            raise HTTPException(status_code=404, detail=f"No samples found for emotion: {emotion}")
        
        # Select a random sample with the specified emotion
        sample_idx = indices[np.random.randint(len(indices))]
    else:
        # Select a random sample
        sample_idx = np.random.randint(len(X_test))
    
    # Get the sample features
    sample_features = X_test[sample_idx]
    sample_emotion = CLASS_NAMES[y_test[sample_idx]]
    
    # Convert feature vector to dictionary
    features_dict = {}
    for i, feature_name in enumerate(feature_names):
        if i < len(sample_features):
            features_dict[feature_name] = float(sample_features[i])
    
    # Group features by signal type
    ecg_features = {k: v for k, v in features_dict.items() if k.startswith('chest_ecg')}
    emg_features = {k: v for k, v in features_dict.items() if k.startswith('chest_emg')}
    resp_features = {k: v for k, v in features_dict.items() if k.startswith('chest_resp')}
    
    # Look for raw signal data directory
    raw_signals_dir = os.path.join(RAW_DATA_DIR, f"S{subject_id}")
    raw_signals_found = os.path.exists(raw_signals_dir)
    
    return {
        "subject_id": subject_id,
        "emotion": sample_emotion,
        "sample_index": int(sample_idx),
        "features": {
            "ecg": ecg_features,
            "emg": emg_features,
            "resp": resp_features
        },
        "raw_signals_available": raw_signals_found
    }

# Benchmark and Comparison Endpoints
@app.get("/benchmarks", response_model=Dict[str, Any])
async def get_benchmark_comparison():
    """Get comparison with other published methods and benchmarks"""
    # Load benchmark data
    benchmark_data = load_benchmark_data()
    
    if not benchmark_data:
        raise HTTPException(status_code=404, detail="Benchmark data not found")
    
    return benchmark_data

# Dataset Insights
@app.get("/dataset/statistics", response_model=Dict[str, Any])
async def get_dataset_statistics():
    """Get statistics about the WESAD dataset"""
    # Load dataset statistics
    dataset_stats = load_dataset_statistics()
    
    if not dataset_stats:
        raise HTTPException(status_code=404, detail="Dataset statistics not found")
    
    return dataset_stats

# Feature Analysis Endpoints
@app.get("/features/correlations", response_model=Dict[str, Any])
async def get_feature_correlations():
    """Get correlation matrix between features"""
    # Load feature importance data to get top features
    feature_data = load_feature_importance()
    if not feature_data or 'features' not in feature_data:
        raise HTTPException(status_code=404, detail="Feature importance data not found")
    
    # Get the top features
    top_features = [feature['name'] for feature in feature_data['features'][:15]]
    
    # Try to load correlation data from a file
    correlation_file = os.path.join(FEATURE_DIR, "feature_correlations.json")
    if os.path.exists(correlation_file):
        try:
            with open(correlation_file, 'r') as f:
                correlation_data = json.load(f)
                return correlation_data
        except:
            pass
    
    # If we can't find the file, we need to compute correlations from raw data
    # This requires access to the dataset, so we'll raise an error
    raise HTTPException(status_code=404, detail="Feature correlation data not found. Run the correlation analysis script to generate this data.")

# Interactive Parameter Testing
@app.post("/simulate/adaptive", response_model=Dict[str, Any])
async def simulate_adaptive_threshold(params: AdaptiveThresholdSimulation):
    """Simulate different adaptive threshold values"""
    # Load data for the subject
    if params.subject_id is not None:
        test_data = load_test_data(params.subject_id)
        if test_data is None:
            raise HTTPException(status_code=404, detail=f"No test data found for subject {params.subject_id}")
        
        # Load models for the subject
        base_model, base_scaler = load_model('base')
        personal_model, personal_scaler = load_model('personal', params.subject_id)
        
        if base_model is None or personal_model is None:
            raise HTTPException(status_code=404, detail=f"Models not found for subject {params.subject_id}")
        
        # Get test data
        X_test = test_data.get('X_test')
        y_test = test_data.get('y_test')
        
        if X_test is None or y_test is None:
            raise HTTPException(status_code=404, detail="Test data doesn't contain required fields")
        
        # Make predictions with both models
        if base_scaler is not None:
            X_test_base = base_scaler.transform(X_test)
        else:
            X_test_base = X_test
            
        if personal_scaler is not None:
            X_test_personal = personal_scaler.transform(X_test)
        else:
            X_test_personal = X_test
        
        # Generate probabilities
        base_proba = base_model.predict_proba(X_test_base)
        personal_proba = personal_model.predict_proba(X_test_personal)
        
        # Simulate adaptive model with different thresholds
        threshold_values = np.arange(0.5, 1.0, 0.05)
        accuracy_values = []
        base_usage_pct = []
        personal_usage_pct = []
        
        for t in threshold_values:
            # For each sample, use base model if its max probability > threshold * personal max probability
            base_used = 0
            personal_used = 0
            correct = 0
            
            for i in range(len(X_test)):
                base_max = np.max(base_proba[i])
                personal_max = np.max(personal_proba[i])
                
                if base_max >= t * personal_max:
                    # Use base model
                    pred = np.argmax(base_proba[i])
                    base_used += 1
                else:
                    # Use personal model
                    pred = np.argmax(personal_proba[i])
                    personal_used += 1
                
                if pred == y_test[i]:
                    correct += 1
            
            # Calculate metrics
            accuracy = correct / len(X_test)
            base_pct = base_used / len(X_test) * 100
            personal_pct = personal_used / len(X_test) * 100
            
            accuracy_values.append(float(accuracy))
            base_usage_pct.append(float(base_pct))
            personal_usage_pct.append(float(personal_pct))
        
        # Find where in the sweep our requested threshold falls
        idx = np.abs(threshold_values - params.threshold).argmin()
        # Add after loading test data:
        print(f"Test data loaded for subject {params.subject_id}")

        # Add after trying to load models:
        print(f"Base model path: {os.path.join(MODELS_DIR, 'base_model.pkl')}")
        print(f"Base model exists: {os.path.exists(os.path.join(MODELS_DIR, 'base_model.pkl'))}")
        print(f"Personal model path: {os.path.join(MODELS_DIR, f'personal_SS{params.subject_id}.pkl')}")
        print(f"Personal model exists: {os.path.exists(os.path.join(MODELS_DIR, f'personal_SS{params.subject_id}.pkl'))}")
        
        return {
            "threshold": float(params.threshold),
            "subject_id": params.subject_id,
            "estimated_accuracy": accuracy_values[idx],
            "base_model_usage_pct": base_usage_pct[idx],
            "personal_model_usage_pct": personal_usage_pct[idx],
            "sweep_results": {
                "thresholds": threshold_values.tolist(),
                "accuracy_values": accuracy_values,
                "base_usage_pct": base_usage_pct,
                "personal_usage_pct": personal_usage_pct
            }
        }
    else:
        # For global simulation without a specific subject, we need data for all subjects
        # This requires a specialized script, so we'll raise an error
        raise HTTPException(status_code=400, detail="Subject ID is required for adaptive threshold simulation")

# Downloadable Reports
@app.get("/reports/generate/{report_type}")
async def generate_report(report_type: str, subject_id: Optional[int] = None, format: str = "pdf"):
    """Generate downloadable reports of various types"""
    # Validate report type
    valid_types = ["performance_summary", "subject_analysis", "feature_importance", "model_comparison"]
    if report_type not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid report type. Valid types are: {', '.join(valid_types)}"
        )
    
    # Validate format
    valid_formats = ["pdf", "excel"]
    if format not in valid_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid format. Valid formats are: {', '.join(valid_formats)}"
        )
    
    # Check if report already exists
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    subject_str = f"_S{subject_id}" if subject_id else ""
    filename = f"{report_type}{subject_str}_{timestamp}.{format}"
    report_path = os.path.join(REPORTS_DIR, filename)
    
    # Check if we have the data needed for the report
    if report_type == "subject_analysis" and subject_id is None:
        raise HTTPException(status_code=400, detail="Subject ID is required for subject analysis report")
    
    if report_type == "subject_analysis":
        subject_data = load_subject_data(subject_id)
        if subject_data is None:
            raise HTTPException(status_code=404, detail=f"No data found for subject: {subject_id}")
    
    if report_type == "feature_importance":
        feature_data = load_feature_importance()
        if feature_data is None:
            raise HTTPException(status_code=404, detail="Feature importance data not found")
    
    # For now, we'll return a message asking the user to run the report generation script
    raise HTTPException(
        status_code=501,
        detail="Report generation needs to be implemented by running the appropriate report script"
    )

# API Documentation
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Serve custom API documentation"""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

# Model Explanation Endpoints
@app.get("/explain/{model_type}/{subject_id}", response_model=Dict[str, Any])
async def get_model_explanation(model_type: str, subject_id: int):
    """Get explanation data for model predictions"""
    # Validate model type
    if model_type not in ['base', 'personal', 'ensemble', 'adaptive']:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    # Load subject and feature importance data
    subject_data = load_subject_data(subject_id)
    feature_data = load_subject_feature_importance(subject_id)
    
    if not subject_data:
        raise HTTPException(status_code=404, detail=f"No data found for subject: {subject_id}")
    
    if not feature_data or 'features' not in feature_data:
        # Fall back to global feature importance
        feature_data = load_feature_importance()
        if not feature_data:
            raise HTTPException(status_code=404, detail="Feature importance data not found")
    
    # Look for model explanation file
    explanation_file = os.path.join(BASE_DIR, "explanations", f"{model_type}_S{subject_id}_explanation.json")
    if os.path.exists(explanation_file):
        try:
            with open(explanation_file, 'r') as f:
                explanation_data = json.load(f)
                return explanation_data
        except:
            pass
    
    # For now, we'll return a message asking the user to run the explanation generation script
    raise HTTPException(
        status_code=501,
        detail="Model explanation needs to be generated by running the model explanation script"
    )
    
# Add this to your Pydantic models at the top of the file
class EnsembleWeightSimulation(BaseModel):
    base_weight: float = 0.5
    subject_id: Optional[int] = None

# Add this endpoint to your FastAPI app
@app.post("/simulate/ensemble", response_model=Dict[str, Any])
async def simulate_ensemble_weight(params: EnsembleWeightSimulation):
    """Simulate different ensemble weights for combining base and personal models"""
    # Load data for the subject
    if params.subject_id is not None:
        test_data = load_test_data(params.subject_id)
        if test_data is None:
            raise HTTPException(status_code=404, detail=f"No test data found for subject {params.subject_id}")
        
        # Load models for the subject
        base_model, base_scaler = load_model('base')
        personal_model, personal_scaler = load_model('personal', params.subject_id)
        
        if base_model is None or personal_model is None:
            raise HTTPException(status_code=404, detail=f"Models not found for subject {params.subject_id}")
        
        # Get test data
        X_test = test_data.get('X_test')
        y_test = test_data.get('y_test')
        
        if X_test is None or y_test is None:
            raise HTTPException(status_code=404, detail="Test data doesn't contain required fields")
        
        # Make predictions with both models
        if base_scaler is not None:
            X_test_base = base_scaler.transform(X_test)
        else:
            X_test_base = X_test
            
        if personal_scaler is not None:
            X_test_personal = personal_scaler.transform(X_test)
        else:
            X_test_personal = X_test
        
        # Generate probabilities from both models
        base_proba = base_model.predict_proba(X_test_base)
        personal_proba = personal_model.predict_proba(X_test_personal)
        
        # Simulate ensemble model with different weights
        weight_values = np.arange(0, 1.1, 0.1)
        accuracy_values = []
        
        for w in weight_values:
            # Combine probabilities using the weighted average
            ensemble_proba = w * base_proba + (1 - w) * personal_proba
            ensemble_pred = np.argmax(ensemble_proba, axis=1)
            
            # Calculate accuracy
            accuracy = np.mean(ensemble_pred == y_test)
            accuracy_values.append(float(accuracy))
        
        # Find where in the sweep our requested weight falls
        idx = np.abs(weight_values - params.base_weight).argmin()
        
        return {
            "base_weight": float(params.base_weight),
            "subject_id": params.subject_id,
            "estimated_accuracy": accuracy_values[idx],
            "base_contribution": float(params.base_weight * 100),
            "personal_contribution": float((1 - params.base_weight) * 100),
            "sweep_results": {
                "weights": weight_values.tolist(),
                "accuracy_values": [float(acc * 100) for acc in accuracy_values],
            }
        }
    else:
        # For global simulation without a specific subject, we need data for all subjects
        raise HTTPException(status_code=400, detail="Subject ID is required for ensemble weight simulation")

if __name__ == "__main__":
    import uvicorn
    
    # Create data directories if they don't exist
    for directory in [
        BASE_DIR,
        os.path.join(BASE_DIR, "models"),
        os.path.join(BASE_DIR, "overview"),
        os.path.join(BASE_DIR, "emotions"),
        os.path.join(BASE_DIR, "subjects"),
        FEATURE_DIR,
        SUBJECT_FEATURE_IMPORTANCE_DIR,
        RAW_DATA_DIR,
        os.path.join(BASE_DIR, "benchmarks"),
        os.path.join(BASE_DIR, "dataset"),
        REPORTS_DIR,
        VISUALIZATION_DIR,
        TEST_DATA_DIR,
        os.path.join(BASE_DIR, "explanations")
    ]:
        os.makedirs(directory, exist_ok=True)
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8086)
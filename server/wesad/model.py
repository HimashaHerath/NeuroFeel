from fastapi import FastAPI, HTTPException, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pickle
import numpy as np
import os
import json
from typing import List, Dict, Optional, Union
import pandas as pd

# Create FastAPI app
app = FastAPI(
    title="WESAD Emotion Recognition Demo API",
    description="API for demonstrating WESAD emotion recognition models",
    version="1.0.0"
)
origins = [
    "https://neurofeel.vercel.app",  # Vercel frontend
    "http://localhost:3000",         # Local dev
    "https://neurofeel.space",       # Neurofeel space
    "https://www.neurofeel.space"    
]
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "wesad_api_data")

TEST_DATA_DIR = os.path.join(DATA_DIR, "test_data")
MODELS_DIR = os.path.join(DATA_DIR, "models")
SCALERS_DIR = os.path.join(DATA_DIR, "scalers")
# Define emotion classes
EMOTION_CLASSES = ['Baseline', 'Stress', 'Amusement', 'Meditation']

# Pydantic models
class PredictionResult(BaseModel):
    emotion_id: int
    emotion_name: str
    probabilities: Dict[str, float]
    confidence: float

class ModelPredictions(BaseModel):
    base_model: PredictionResult
    personal_model: PredictionResult
    ensemble_model: PredictionResult
    adaptive_model: PredictionResult
    accuracy: Dict[str, Union[int, str]]  # Updated to accept both int and string values

class SubjectInfo(BaseModel):
    subject_id: int
    num_samples: int
    class_distribution: Dict[str, int]

class EvaluationResult(BaseModel):
    subject_id: int
    accuracy: Dict[str, float]
    f1_score: Dict[str, float]
    confusion_matrix: Dict[str, List[List[int]]]

# Helper functions
def load_test_data(subject_id):
    """Load test data for a specific subject"""
    try:
        file_path = os.path.join(TEST_DATA_DIR, f'SS{subject_id}_test.pkl')
        with open(file_path, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Test data for subject SS{subject_id} not found: {str(e)}")

def load_feature_scaler():
    """Load the feature scaler"""
    try:
        file_path = os.path.join(SCALERS_DIR, 'feature_scaler.pkl')
        with open(file_path, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load feature scaler: {str(e)}")

def load_base_model():
    """Load the base model"""
    try:
        file_path = os.path.join(MODELS_DIR, 'base_model.pkl')
        with open(file_path, 'rb') as f:
            model_dict = pickle.load(f)
            if isinstance(model_dict, dict) and 'model' in model_dict:
                return model_dict['model']
            return model_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load base model: {str(e)}")

def load_personal_model(subject_id):
    """Load personal model for a specific subject"""
    try:
        file_path = os.path.join(MODELS_DIR, f'personal_SS{subject_id}.pkl')
        with open(file_path, 'rb') as f:
            model_dict = pickle.load(f)
            if isinstance(model_dict, dict) and 'model' in model_dict:
                return model_dict['model'], model_dict.get('ensemble_weight', 0.5)
            return model_dict, 0.5
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Personal model for subject SS{subject_id} not found: {str(e)}")

def predict_with_ensemble(X, base_model, personal_model, ensemble_weight=0.5):
    """Make predictions using the ensemble model"""
    base_proba = base_model.predict_proba(X)
    personal_proba = personal_model.predict_proba(X)
    
    # Combine predictions with ensemble weight
    ensemble_proba = base_proba * ensemble_weight + personal_proba * (1 - ensemble_weight)
    return ensemble_proba

def predict_with_adaptive(X, base_model, personal_model, threshold=0.65):
    """Make predictions using adaptive model selection based on confidence thresholds"""
    try:
        # Get probability predictions from both models
        base_proba = base_model.predict_proba(X)
        personal_proba = personal_model.predict_proba(X)
        
        # Get confidence scores (max probability for each sample)
        base_conf = np.max(base_proba, axis=1)
        personal_conf = np.max(personal_proba, axis=1)
        
        # Initialize result array with same shape as probabilities
        result_proba = np.zeros_like(base_proba)
        
        # Track which model was used for each sample
        base_selected = 0
        personal_selected = 0
        
        # Select model based on confidence threshold
        for i in range(len(X)):
            # If base model has high confidence AND is more confident than personal
            if base_conf[i] >= threshold and base_conf[i] > personal_conf[i]:
                result_proba[i] = base_proba[i]
                base_selected += 1
            # If personal model has high confidence
            elif personal_conf[i] >= threshold:
                result_proba[i] = personal_proba[i]
                personal_selected += 1
            # If neither model is confident enough, use the more confident one
            else:
                if base_conf[i] > personal_conf[i]:
                    result_proba[i] = base_proba[i]
                    base_selected += 1
                else:
                    result_proba[i] = personal_proba[i]
                    personal_selected += 1
        
        # For debugging
        print(f"Adaptive selection used: base model {base_selected} times, personal model {personal_selected} times")
        
        return result_proba
        
    except Exception as e:
        print(f"Error in adaptive prediction: {str(e)}")
        # Fall back to personal model if there's an error
        return personal_model.predict_proba(X)

def format_prediction_result(probabilities):
    """Format prediction result"""
    pred_class = np.argmax(probabilities)
    return {
        "emotion_id": int(pred_class),
        "emotion_name": EMOTION_CLASSES[pred_class],
        "probabilities": {EMOTION_CLASSES[i]: float(prob) for i, prob in enumerate(probabilities)},
        "confidence": float(probabilities[pred_class])
    }

# API Endpoints
@app.get("/")
async def root():
    return {"message": "WESAD Emotion Recognition Demo API is running"}

@app.get("/subjects", response_model=List[SubjectInfo])
async def get_available_subjects():
    """Get list of available subjects with test data"""
    try:
        test_files = [f for f in os.listdir(TEST_DATA_DIR) if f.endswith('_test.pkl')]
        subjects = []
        
        for test_file in test_files:
            # Extract subject ID
            subject_id = int(test_file.split('SS')[1].split('_')[0])
            
            # Load test data to get sample count and class distribution
            with open(os.path.join(TEST_DATA_DIR, test_file), 'rb') as f:
                test_data = pickle.load(f)
            
            y_test = test_data['y_test']
            class_counts = {EMOTION_CLASSES[i]: int(np.sum(y_test == i)) for i in range(len(EMOTION_CLASSES))}
            
            subjects.append({
                "subject_id": subject_id,
                "num_samples": len(y_test),
                "class_distribution": class_counts
            })
        
        return sorted(subjects, key=lambda x: x["subject_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading subjects: {str(e)}")

@app.get("/predict/{subject_id}")
async def predict_for_subject(
    subject_id: int,
    sample_index: Optional[int] = Query(0, description="Index of the sample to predict (0-based)")
):
    """Make predictions for a specific subject and sample"""
    # Load test data
    test_data = load_test_data(subject_id)
    X_test = test_data['X_test']
    y_test = test_data['y_test']
    
    # Check if sample index is valid
    if sample_index < 0 or sample_index >= len(X_test):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid sample index. Must be between 0 and {len(X_test)-1}"
        )
    
    # Load feature scaler
    scaler = load_feature_scaler()
    
    # Apply feature scaling
    X_test_scaled = scaler.transform(X_test)
    
    # Get single sample
    X_sample = X_test_scaled[sample_index:sample_index+1]
    y_true = int(y_test[sample_index])
    
    try:
        # Load models
        base_model = load_base_model()
        personal_model, ensemble_weight = load_personal_model(subject_id)
        
        # Make predictions
        base_proba = base_model.predict_proba(X_sample)[0]
        personal_proba = personal_model.predict_proba(X_sample)[0]
        ensemble_proba = predict_with_ensemble(X_sample, base_model, personal_model, ensemble_weight)[0]
        adaptive_proba = predict_with_adaptive(X_sample, base_model, personal_model)[0]
        
        # Format results
        result = {
            "base_model": format_prediction_result(base_proba),
            "personal_model": format_prediction_result(personal_proba),
            "ensemble_model": format_prediction_result(ensemble_proba),
            "adaptive_model": format_prediction_result(adaptive_proba),
            "accuracy": {
                "true_emotion_id": int(y_true),
                "true_emotion": EMOTION_CLASSES[y_true],
                "base_correct": int(np.argmax(base_proba) == y_true),
                "personal_correct": int(np.argmax(personal_proba) == y_true),
                "ensemble_correct": int(np.argmax(ensemble_proba) == y_true),
                "adaptive_correct": int(np.argmax(adaptive_proba) == y_true)
            }
        }
        return result
        
    except Exception as e:
        # Log the detailed error for debugging
        import traceback
        print(f"Error in prediction: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/evaluate/{subject_id}", response_model=EvaluationResult)
async def evaluate_subject(subject_id: int):
    """Evaluate all models on a subject's test data"""
    # Load test data
    test_data = load_test_data(subject_id)
    X_test = test_data['X_test']
    y_test = test_data['y_test']
    
    # Load feature scaler
    scaler = load_feature_scaler()
    
    # Apply feature scaling
    X_test_scaled = scaler.transform(X_test)
    
    # Load models
    base_model = load_base_model()
    personal_model, ensemble_weight = load_personal_model(subject_id)
    
    # Make predictions
    base_pred = base_model.predict(X_test_scaled)
    personal_pred = personal_model.predict(X_test_scaled)
    
    # Ensemble predictions
    ensemble_proba = predict_with_ensemble(X_test_scaled, base_model, personal_model, ensemble_weight)
    ensemble_pred = np.argmax(ensemble_proba, axis=1)
    
    # Adaptive predictions
    adaptive_proba = predict_with_adaptive(X_test_scaled, base_model, personal_model)
    adaptive_pred = np.argmax(adaptive_proba, axis=1)
    
    # Calculate accuracy
    base_acc = np.mean(base_pred == y_test)
    personal_acc = np.mean(personal_pred == y_test)
    ensemble_acc = np.mean(ensemble_pred == y_test)
    adaptive_acc = np.mean(adaptive_pred == y_test)
    
    # Calculate F1 score (simplified macro F1)
    from sklearn.metrics import f1_score
    base_f1 = f1_score(y_test, base_pred, average='macro')
    personal_f1 = f1_score(y_test, personal_pred, average='macro')
    ensemble_f1 = f1_score(y_test, ensemble_pred, average='macro')
    adaptive_f1 = f1_score(y_test, adaptive_pred, average='macro')
    
    # Calculate confusion matrices
    from sklearn.metrics import confusion_matrix
    base_cm = confusion_matrix(y_test, base_pred, labels=range(len(EMOTION_CLASSES)))
    personal_cm = confusion_matrix(y_test, personal_pred, labels=range(len(EMOTION_CLASSES)))
    ensemble_cm = confusion_matrix(y_test, ensemble_pred, labels=range(len(EMOTION_CLASSES)))
    adaptive_cm = confusion_matrix(y_test, adaptive_pred, labels=range(len(EMOTION_CLASSES)))
    
    return {
        "subject_id": subject_id,
        "accuracy": {
            "base": float(base_acc),
            "personal": float(personal_acc),
            "ensemble": float(ensemble_acc),
            "adaptive": float(adaptive_acc)
        },
        "f1_score": {
            "base": float(base_f1),
            "personal": float(personal_f1),
            "ensemble": float(ensemble_f1),
            "adaptive": float(adaptive_f1)
        },
        "confusion_matrix": {
            "base": base_cm.tolist(),
            "personal": personal_cm.tolist(),
            "ensemble": ensemble_cm.tolist(),
            "adaptive": adaptive_cm.tolist()
        }
    }

@app.get("/sample/{subject_id}/{sample_index}")
async def get_sample_features(subject_id: int, sample_index: int):
    """Get raw features for a specific sample"""
    # Load test data
    test_data = load_test_data(subject_id)
    X_test = test_data['X_test']
    feature_names = test_data['feature_names']
    
    # Check if sample index is valid
    if sample_index < 0 or sample_index >= len(X_test):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid sample index. Must be between 0 and {len(X_test)-1}"
        )
    
    # Get sample
    sample = X_test[sample_index]
    
    # Format as dictionary
    features = {name: float(value) for name, value in zip(feature_names, sample)}
    
    return {
        "subject_id": subject_id,
        "sample_index": sample_index,
        "features": features
    }

@app.get("/overall_performance")
async def get_overall_performance():
    """Get overall performance across all subjects"""
    # Get all subjects
    test_files = [f for f in os.listdir(TEST_DATA_DIR) if f.endswith('_test.pkl')]
    subjects = [int(f.split('SS')[1].split('_')[0]) for f in test_files]
    
    all_results = {
        "base_accuracy": [],
        "personal_accuracy": [],
        "ensemble_accuracy": [],
        "adaptive_accuracy": [],
        "base_f1": [],
        "personal_f1": [],
        "ensemble_f1": [],
        "adaptive_f1": []
    }
    
    # Evaluate each subject
    for subject_id in subjects:
        try:
            # Load test data
            test_data = load_test_data(subject_id)
            X_test = test_data['X_test']
            y_test = test_data['y_test']
            
            # Load feature scaler
            scaler = load_feature_scaler()
            
            # Apply feature scaling
            X_test_scaled = scaler.transform(X_test)
            
            # Load models
            base_model = load_base_model()
            personal_model, ensemble_weight = load_personal_model(subject_id)
            
            # Make predictions
            base_pred = base_model.predict(X_test_scaled)
            personal_pred = personal_model.predict(X_test_scaled)
            
            # Ensemble predictions
            ensemble_proba = predict_with_ensemble(X_test_scaled, base_model, personal_model, ensemble_weight)
            ensemble_pred = np.argmax(ensemble_proba, axis=1)
            
            # Adaptive predictions
            adaptive_proba = predict_with_adaptive(X_test_scaled, base_model, personal_model)
            adaptive_pred = np.argmax(adaptive_proba, axis=1)
            
            # Calculate accuracy
            base_acc = np.mean(base_pred == y_test)
            personal_acc = np.mean(personal_pred == y_test)
            ensemble_acc = np.mean(ensemble_pred == y_test)
            adaptive_acc = np.mean(adaptive_pred == y_test)
            
            # Calculate F1 score
            from sklearn.metrics import f1_score
            base_f1 = f1_score(y_test, base_pred, average='macro')
            personal_f1 = f1_score(y_test, personal_pred, average='macro')
            ensemble_f1 = f1_score(y_test, ensemble_pred, average='macro')
            adaptive_f1 = f1_score(y_test, adaptive_pred, average='macro')
            
            # Add to results
            all_results["base_accuracy"].append(float(base_acc))
            all_results["personal_accuracy"].append(float(personal_acc))
            all_results["ensemble_accuracy"].append(float(ensemble_acc))
            all_results["adaptive_accuracy"].append(float(adaptive_acc))
            all_results["base_f1"].append(float(base_f1))
            all_results["personal_f1"].append(float(personal_f1))
            all_results["ensemble_f1"].append(float(ensemble_f1))
            all_results["adaptive_f1"].append(float(adaptive_f1))
            
        except Exception as e:
            print(f"Error evaluating subject {subject_id}: {e}")
    
    # Calculate averages
    mean_results = {
        "base_accuracy": float(np.mean(all_results["base_accuracy"])),
        "personal_accuracy": float(np.mean(all_results["personal_accuracy"])),
        "ensemble_accuracy": float(np.mean(all_results["ensemble_accuracy"])),
        "adaptive_accuracy": float(np.mean(all_results["adaptive_accuracy"])),
        "base_f1": float(np.mean(all_results["base_f1"])),
        "personal_f1": float(np.mean(all_results["personal_f1"])),
        "ensemble_f1": float(np.mean(all_results["ensemble_f1"])),
        "adaptive_f1": float(np.mean(all_results["adaptive_f1"]))
    }
    
    # Calculate improvements
    improvements = {
        "personal_vs_base": float(mean_results["personal_accuracy"] - mean_results["base_accuracy"]),
        "ensemble_vs_base": float(mean_results["ensemble_accuracy"] - mean_results["base_accuracy"]),
        "adaptive_vs_base": float(mean_results["adaptive_accuracy"] - mean_results["base_accuracy"])
    }
    
    return {
        "mean_metrics": mean_results,
        "improvements": improvements,
        "per_subject": {
            "subject_ids": subjects,
            "metrics": all_results
        }
    }

# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    print("Starting WESAD Emotion Recognition Demo API...")
    uvicorn.run(app, host="0.0.0.0", port=8096)
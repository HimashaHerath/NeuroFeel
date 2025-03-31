import os
import numpy as np
import pandas as pd
import pickle
import json
from scipy import stats
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "cross_dataset_api_data", "demo")

DEMO_MODELS_PATH = os.path.join(DATA_DIR, "demo_models.pkl")
WESAD_SAMPLES_PATH = os.path.join(DATA_DIR, "wesad_demo_samples.pkl")
KEMOCON_SAMPLES_PATH = os.path.join(DATA_DIR, "kemocon_demo_samples.pkl")

# Define valid subjects/participants (keep these for validation)
VALID_WESAD_SUBJECTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17]
VALID_KEMOCON_PARTICIPANTS = [1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15]

# Create FastAPI app
app = FastAPI(
    title="Cross-Dataset Emotion Recognition Demo API",
    description="API for making predictions using cross-dataset models with demo samples",
    version="1.0.0"
)
origins = [
    "https://neurofeel.vercel.app",  # Vercel frontend
    "http://localhost:3000",         # Local dev
    "https://neurofeel-api-7e3f5723d59c.herokuapp.com"  # Heroku backend
]
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for input/output
class PredictionRequest(BaseModel):
    """Request for prediction using a sample from demo data"""
    direction: str = Field(..., description="Model direction ('wesad_to_kemocon' or 'kemocon_to_wesad')")
    sample_index: int = Field(..., description="Index of the sample in demo data")
    target_dimension: str = Field("both", description="Target dimension to predict ('arousal', 'valence', or 'both')")

class PredictionResponse(BaseModel):
    """Response with prediction results"""
    arousal: Optional[Dict[str, Any]] = None
    valence: Optional[Dict[str, Any]] = None
    features_used: Dict[str, float] = {}
    direction: str
    sample_index: int
    subject_id: int
    ground_truth: Dict[str, Any] = {}
    confidence: Dict[str, float] = {}

class AvailableSamplesResponse(BaseModel):
    """Response with available samples from the demo data"""
    wesad_samples: int
    kemocon_samples: int
    wesad_subjects: List[int]
    kemocon_participants: List[int]
    feature_lists: Dict[str, List[str]]

# Global variables to store loaded demo data
demo_models = None
wesad_samples = None
kemocon_samples = None

def load_demo_data():
    """Load demo models and samples"""
    global demo_models, wesad_samples, kemocon_samples
    
    # Only load if not already loaded
    if demo_models is None:
        try:
            with open(DEMO_MODELS_PATH, 'rb') as f:
                demo_models = pickle.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to load demo models: {e}")
    
    if wesad_samples is None:
        try:
            with open(WESAD_SAMPLES_PATH, 'rb') as f:
                wesad_samples = pickle.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to load WESAD samples: {e}")
    
    if kemocon_samples is None:
        try:
            with open(KEMOCON_SAMPLES_PATH, 'rb') as f:
                kemocon_samples = pickle.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to load K-EmoCon samples: {e}")
    
    return demo_models, wesad_samples, kemocon_samples

def get_sample(direction, sample_index):
    """Get a specific sample from the demo data"""
    # Load data if not already loaded
    demo_models, wesad_samples, kemocon_samples = load_demo_data()
    
    # Get the appropriate sample based on direction
    if direction == 'wesad_to_kemocon':
        # For WESAD→K-EmoCon, we need K-EmoCon samples
        if sample_index >= len(kemocon_samples['samples']):
            raise IndexError(f"Sample index {sample_index} out of range for K-EmoCon samples")
        
        sample = kemocon_samples['samples'].iloc[sample_index]
        features = {}
        
        # Get features for the sample
        for feature in kemocon_samples['arousal_features']:
            if feature in sample:
                features[feature] = sample[feature]
        
        return {
            'sample': sample,
            'features': features,
            'arousal_features': kemocon_samples['arousal_features'],
            'valence_features': kemocon_samples['valence_features'],
            'arousal_binary': kemocon_samples['arousal_binary'][sample_index],
            'valence_binary': kemocon_samples['valence_binary'][sample_index],
            'subject_id': sample['participant_id'] if 'participant_id' in sample else None
        }
        
    elif direction == 'kemocon_to_wesad':
        # For K-EmoCon→WESAD, we need WESAD samples
        if sample_index >= len(wesad_samples['samples']):
            raise IndexError(f"Sample index {sample_index} out of range for WESAD samples")
        
        sample = wesad_samples['samples'].iloc[sample_index]
        features = {}
        
        # Get features for the sample
        for feature in wesad_samples['arousal_features']:
            if feature in sample:
                features[feature] = sample[feature]
        
        return {
            'sample': sample,
            'features': features,
            'arousal_features': wesad_samples['arousal_features'],
            'valence_features': wesad_samples['valence_features'],
            'arousal_binary': wesad_samples['arousal_binary'][sample_index],
            'valence_binary': wesad_samples['valence_binary'][sample_index],
            'subject_id': sample['subject_id'] if 'subject_id' in sample else None
        }
    
    else:
        raise ValueError(f"Invalid direction: {direction}")

def predict_with_model(features, direction, target):
    """Make prediction using the demo models"""
    # Load models if not already loaded
    demo_models, _, _ = load_demo_data()
    
    # Get the appropriate model components
    model_data = demo_models[target][direction]
    model = model_data['model']
    scaler = model_data['scaler']
    threshold = model_data['threshold']
    
    # Prepare features array
    if target == 'arousal':
        if direction == 'wesad_to_kemocon':
            # Load demo data to get feature names
            _, _, kemocon_samples = load_demo_data()
            feature_names = kemocon_samples['arousal_features']
        else:  # kemocon_to_wesad
            _, wesad_samples, _ = load_demo_data()
            feature_names = wesad_samples['arousal_features']
    else:  # valence
        if direction == 'wesad_to_kemocon':
            _, _, kemocon_samples = load_demo_data()
            feature_names = kemocon_samples['valence_features']
        else:  # kemocon_to_wesad
            _, wesad_samples, _ = load_demo_data()
            feature_names = wesad_samples['valence_features']
    
    # Create feature vector
    feature_vector = []
    for feature in feature_names:
        if feature in features:
            feature_vector.append(features[feature])
        else:
            # Default to 0 if feature is missing
            feature_vector.append(0.0)
    
    # Convert to numpy array
    X = np.array(feature_vector).reshape(1, -1)
    
    # Apply scaling if available
    if scaler is not None:
        X = scaler.transform(X)
    
    # Get prediction
    y_prob = model.predict_proba(X)[0, 1]  # Probability of class 1 (high)
    y_pred = 1 if y_prob >= threshold else 0
    
    # Format result
    result = {
        "class": "high" if y_pred == 1 else "low",
        "probability": float(y_prob),
        "confidence": float(max(y_prob, 1 - y_prob)),
    }
    
    return result, feature_names

@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {"message": "Cross-Dataset Emotion Recognition Demo API is running"}

@app.get("/available-samples", response_model=AvailableSamplesResponse)
async def get_available_samples():
    """Get info about available demo samples"""
    # Load demo data
    demo_models, wesad_samples, kemocon_samples = load_demo_data()
    
    # Get unique subjects/participants
    wesad_subjects = sorted(wesad_samples['samples']['subject_id'].unique().tolist() if 'subject_id' in wesad_samples['samples'].columns else [])
    kemocon_participants = sorted(kemocon_samples['samples']['participant_id'].unique().tolist() if 'participant_id' in kemocon_samples['samples'].columns else [])
    
    return {
        "wesad_samples": len(wesad_samples['samples']),
        "kemocon_samples": len(kemocon_samples['samples']),
        "wesad_subjects": wesad_subjects,
        "kemocon_participants": kemocon_participants,
        "feature_lists": {
            "wesad_arousal": wesad_samples['arousal_features'],
            "wesad_valence": wesad_samples['valence_features'],
            "kemocon_arousal": kemocon_samples['arousal_features'],
            "kemocon_valence": kemocon_samples['valence_features']
        }
    }

@app.get("/samples/{direction}/{index}")
async def get_sample_details(
    direction: str = Path(..., description="Model direction ('wesad_to_kemocon' or 'kemocon_to_wesad')"),
    index: int = Path(..., description="Index of the sample")
):
    """Get details of a specific sample from the demo data"""
    try:
        sample_data = get_sample(direction, index)
        
        # Format the response
        sample = sample_data['sample']
        
        # Handle different column names based on whether it's WESAD or K-EmoCon
        subject_id = None
        if 'subject_id' in sample:
            subject_id = int(sample['subject_id'])
        elif 'participant_id' in sample:
            subject_id = int(sample['participant_id'])
        
        # Extract basic info
        result = {
            "direction": direction,
            "sample_index": index,
            "subject_id": subject_id,
            "features": {f: float(sample[f]) for f in sample_data['features'] if f in sample},
            "arousal_binary": bool(sample_data['arousal_binary']),
            "valence_binary": bool(sample_data['valence_binary'])
        }
        
        # Add raw arousal/valence values if available
        if 'arousal' in sample:
            result["arousal"] = float(sample['arousal'])
        
        if 'valence' in sample:
            result["valence"] = float(sample['valence'])
        
        # Add emotion label for WESAD
        if 'label' in sample:
            emotion_names = {1: "Baseline", 2: "Stress", 3: "Amusement", 4: "Meditation"}
            result["emotion_label"] = emotion_names.get(int(sample['label']), f"Unknown ({sample['label']})")
        
        return result
        
    except IndexError:
        raise HTTPException(status_code=404, detail="Sample index out of range")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sample: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_using_demo_sample(request: PredictionRequest):
    """Make prediction using a demo sample"""
    try:
        # Validate direction
        if request.direction not in ['wesad_to_kemocon', 'kemocon_to_wesad']:
            raise HTTPException(
                status_code=400, 
                detail="Invalid direction. Must be 'wesad_to_kemocon' or 'kemocon_to_wesad'"
            )
        
        # Get the sample
        sample_data = get_sample(request.direction, request.sample_index)
        
        # Initialize result
        result = {
            "arousal": None,
            "valence": None,
            "features_used": {},
            "direction": request.direction,
            "sample_index": request.sample_index,
            "subject_id": sample_data['subject_id'],
            "ground_truth": {
                "arousal": "high" if sample_data['arousal_binary'] == 1 else "low",
                "valence": "high" if sample_data['valence_binary'] == 1 else "low"
            },
            "confidence": {}
        }
        
        # Determine which targets to predict
        targets = []
        if request.target_dimension.lower() == 'both':
            targets = ['arousal', 'valence']
        elif request.target_dimension.lower() in ['arousal', 'valence']:
            targets = [request.target_dimension.lower()]
        else:
            raise HTTPException(status_code=400, detail=f"Invalid target dimension: {request.target_dimension}")
        
        # Make predictions for each target
        for target in targets:
            # Make prediction
            prediction, feature_names = predict_with_model(sample_data['features'], request.direction, target)
            
            # Add to result
            result[target] = prediction
            result["confidence"][target] = prediction["confidence"]
            
            # Add features used
            for feature in feature_names:
                if feature in sample_data['features']:
                    result["features_used"][feature] = float(sample_data['features'][feature])
        
        return result
        
    except IndexError:
        raise HTTPException(status_code=404, detail="Sample index out of range")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/models")
async def get_model_info():
    """Get information about demo models"""
    try:
        # Load demo models
        demo_models, _, _ = load_demo_data()
        
        # Extract model info
        model_info = {}
        
        for target in ['arousal', 'valence']:
            model_info[target] = {}
            
            for direction in ['wesad_to_kemocon', 'kemocon_to_wesad']:
                model_data = demo_models[target][direction]
                
                # Extract basic model info
                info = {
                    "threshold": float(model_data['threshold']),
                    "model_type": type(model_data['model']).__name__,
                }
                
                # Add estimator info if it's a VotingClassifier
                if hasattr(model_data['model'], 'estimators_'):
                    # Handle different estimator formats safely
                    estimators = []
                    try:
                        # VotingClassifier in scikit-learn typically stores estimators as a list of (name, estimator) tuples
                        for item in model_data['model'].estimators_:
                            if isinstance(item, tuple) and len(item) == 2:
                                name, est = item
                                estimators.append({"name": str(name), "type": type(est).__name__})
                            else:
                                # Handle case where it's not a tuple
                                estimators.append({"type": type(item).__name__})
                    except Exception as e:
                        # Fallback if any error occurs
                        estimators.append({"error": str(e)})
                    
                    info["estimators"] = estimators
                elif hasattr(model_data['model'], 'named_estimators_'):
                    # Some ensemble models use named_estimators_ dictionary instead
                    estimators = []
                    for name, est in model_data['model'].named_estimators_.items():
                        estimators.append({"name": str(name), "type": type(est).__name__})
                    info["estimators"] = estimators
                
                model_info[target][direction] = info
        
        return model_info
    except Exception as e:
        # Return error details for debugging
        return {"error": f"Error getting model info: {str(e)}"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if demo files exist
        if not os.path.exists(DEMO_MODELS_PATH):
            return {"status": "error", "message": "Demo models file not found"}
        
        if not os.path.exists(WESAD_SAMPLES_PATH):
            return {"status": "error", "message": "WESAD samples file not found"}
        
        if not os.path.exists(KEMOCON_SAMPLES_PATH):
            return {"status": "error", "message": "K-EmoCon samples file not found"}
        
        # Try to load the data
        demo_models, wesad_samples, kemocon_samples = load_demo_data()
        
        # If all checks pass
        return {
            "status": "ok", 
            "models": {
                "arousal": list(demo_models["arousal"].keys()),
                "valence": list(demo_models["valence"].keys())
            },
            "samples": {
                "wesad": len(wesad_samples["samples"]),
                "kemocon": len(kemocon_samples["samples"])
            }
        }
    except Exception as e:
        return {"status": "error", "message": f"Health check failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8092)
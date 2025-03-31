from fastapi import FastAPI, HTTPException, Path, Query, File, UploadFile, Body, Depends, Request
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
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Models for data validation
class CrossDatasetPerformance(BaseModel):
    direction: str  # "wesad_to_kemocon" or "kemocon_to_wesad"
    target: str  # "arousal" or "valence"
    accuracy: float
    f1_score: float
    balanced_accuracy: float
    roc_auc: float
    pr_auc: float
    threshold: float

class AdaptationPerformance(BaseModel):
    direction: str
    target: str
    adaptation_method: str
    gap_before: float
    gap_after: float
    gap_reduction_pct: float

class FeatureMapping(BaseModel):
    wesad_feature: str
    kemocon_feature: str
    importance_score: float
    target: str  # "arousal" or "valence"

class DomainAdaptationParams(BaseModel):
    adaptation_method: str = "ensemble"  # "coral", "subspace", "ensemble", "none"
    target: str = "arousal"  # "arousal" or "valence"

class ClassDistribution(BaseModel):
    dataset: str  # "WESAD" or "K-EmoCon"
    target: str  # "arousal" or "valence"
    low_count: int
    high_count: int
    distribution_ratio: float

class SignalPredictionInput(BaseModel):
    signals: Dict[str, List[float]]
    dataset: str  # "WESAD" or "K-EmoCon"
    target: str = "both"  # "arousal", "valence", or "both"

class DetailedEvaluation(BaseModel):
    direction: str
    target: str
    accuracy: float
    f1_score: float
    balanced_accuracy: float
    roc_auc: float
    pr_auc: float
    threshold: float
    classification_report: Dict[str, Any]
    confusion_matrix: List[List[int]]

# Create FastAPI app
app = FastAPI(
    title="Cross-Dataset Emotion Recognition API",
    description="API for cross-dataset emotion recognition between WESAD and K-EmoCon",
    version="1.0.0"
)
origins = [
    "https://neurofeel.vercel.app",  # Your Vercel frontend
    "http://localhost:3000",  # Local development
]
# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths to data files
BASE_DIR = os.path.join(os.path.dirname(__file__), "cross_dataset_api_data")
PERFORMANCE_JSON = os.path.join(BASE_DIR, "performance", "all_models.json")
EVALUATION_DIR = os.path.join(BASE_DIR, "evaluation")
FEATURE_DIR = os.path.join(BASE_DIR, "features")
ADAPTATION_DIR = os.path.join(BASE_DIR, "adaptation")
VISUALIZATION_DIR = os.path.join(BASE_DIR, "visualizations")
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATASET_STATS_FILE = os.path.join(BASE_DIR, "dataset", "statistics.json")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

# Helper function to load performance data
def load_performance_data():
    """Load cross-dataset performance data from JSON file"""
    try:
        if os.path.exists(PERFORMANCE_JSON):
            with open(PERFORMANCE_JSON, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Performance data file not found: {PERFORMANCE_JSON}")
    except Exception as e:
        print(f"Error loading performance data: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading performance data: {str(e)}")

# Helper function to load adaptation data
def load_adaptation_data(target="arousal", direction="wesad_to_kemocon"):
    """Load domain adaptation data from JSON file"""
    try:
        file_path = os.path.join(ADAPTATION_DIR, f"{target}_{direction}.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Adaptation data file not found: {file_path}")
    except Exception as e:
        print(f"Error loading adaptation data: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading adaptation data for {target}, {direction}: {str(e)}")

# Helper function to load feature mapping
def load_feature_mapping(target="arousal"):
    """Load feature mapping between WESAD and K-EmoCon"""
    try:
        file_path = os.path.join(FEATURE_DIR, f"{target}_feature_mapping.csv")
        if os.path.exists(file_path):
            return pd.read_csv(file_path).to_dict(orient="records")
        else:
            raise FileNotFoundError(f"Feature mapping file not found: {file_path}")
    except Exception as e:
        print(f"Error loading feature mapping: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading feature mapping for {target}: {str(e)}")

# Helper function to load class distribution
def load_class_distribution():
    """Load class distribution data for both datasets"""
    try:
        file_path = os.path.join(BASE_DIR, "dataset", "class_distribution.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Class distribution file not found: {file_path}")
    except Exception as e:
        print(f"Error loading class distribution: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading class distribution data: {str(e)}")

# Helper function to load dataset statistics
def load_dataset_statistics():
    """Load statistics about both datasets"""
    try:
        if os.path.exists(DATASET_STATS_FILE):
            with open(DATASET_STATS_FILE, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Dataset statistics file not found: {DATASET_STATS_FILE}")
    except Exception as e:
        print(f"Error loading dataset statistics: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading dataset statistics: {str(e)}")

# Helper function to load detailed evaluation
def load_detailed_evaluation(target="arousal", direction="wesad_to_kemocon"):
    """Load detailed evaluation results"""
    try:
        file_path = os.path.join(EVALUATION_DIR, target, f"{direction}_evaluation.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Evaluation file not found: {file_path}")
    except Exception as e:
        print(f"Error loading detailed evaluation: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading evaluation data for {target}, {direction}: {str(e)}")

# This section would need to be replaced with actual feature extraction and prediction code
# that connects to your cross-dataset framework models

# For now, we'll keep the stub functions that will be implemented later
# They'll raise NotImplementedError to indicate they need to be connected to real models

def extract_features_from_signals(signals, dataset="WESAD"):
    """Extract features from raw physiological signals"""
    # This would be implemented to actually extract features using your framework code
    raise NotImplementedError("Feature extraction functionality needs to be implemented with actual models")

def predict_emotion_dimensions(features, dataset="WESAD", target="both", direction=None):
    """Make a prediction for arousal and/or valence dimensions"""
    # This would be implemented to actually use trained models to make predictions
    raise NotImplementedError("Prediction functionality needs to be implemented with actual models")

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Cross-Dataset Emotion Recognition API is running"}
import logging

logging.basicConfig(level=logging.INFO)

@app.get("/overview", response_model=Dict[str, Any])
async def get_overview():
    """Get overview of performance for all models"""
    logging.info("Received request for overview endpoint.")
    
    try:
        performance_data = load_performance_data()
        logging.info("Loaded performance data successfully.")
    except Exception as e:
        logging.error(f"Error loading performance data: {e}")
        raise HTTPException(status_code=500, detail="Error loading performance data")
    
    try:
        dataset_stats = load_dataset_statistics()
        logging.info("Loaded dataset statistics successfully.")
    except Exception as e:
        logging.error(f"Error loading dataset statistics: {e}")
        dataset_stats = {}

    # Extract performance metrics by target and direction
    logging.info("Extracting performance metrics by target and direction.")
    arousal_wesad_to_kemocon = next(
        (m for m in performance_data["models"] if m["direction"] == "wesad_to_kemocon" and m["target"] == "arousal"), {}
    )
    arousal_kemocon_to_wesad = next(
        (m for m in performance_data["models"] if m["direction"] == "kemocon_to_wesad" and m["target"] == "arousal"), {}
    )
    valence_wesad_to_kemocon = next(
        (m for m in performance_data["models"] if m["direction"] == "wesad_to_kemocon" and m["target"] == "valence"), {}
    )
    valence_kemocon_to_wesad = next(
        (m for m in performance_data["models"] if m["direction"] == "kemocon_to_wesad" and m["target"] == "valence"), {}
    )
    
    # Calculate average metrics
    logging.info("Calculating average metrics for performance data.")
    avg_accuracy = np.mean([m.get("accuracy", 0) for m in performance_data["models"]])
    avg_f1 = np.mean([m.get("f1_score", 0) for m in performance_data["models"]])
    avg_auc = np.mean([m.get("roc_auc", 0) for m in performance_data["models"]])
    logging.info(f"Calculated averages - Accuracy: {avg_accuracy}, F1: {avg_f1}, ROC AUC: {avg_auc}")

    # Structure summary
    summary = {
        "average_metrics": {
            "accuracy": float(avg_accuracy),
            "f1_score": float(avg_f1),
            "roc_auc": float(avg_auc)
        },
        "arousal": {
            "wesad_to_kemocon": arousal_wesad_to_kemocon,
            "kemocon_to_wesad": arousal_kemocon_to_wesad
        },
        "valence": {
            "wesad_to_kemocon": valence_wesad_to_kemocon,
            "kemocon_to_wesad": valence_kemocon_to_wesad
        },
        "datasets": dataset_stats.get("datasets", {}),
        "adaptation": {
            "arousal": {
                "success_rate": arousal_wesad_to_kemocon.get("gap_reduction_percent", 40.0),
                "best_direction": "wesad_to_kemocon"
            },
            "valence": {
                "success_rate": valence_wesad_to_kemocon.get("gap_reduction_percent", 40.0),
                "best_direction": "wesad_to_kemocon"
            }
        }
    }
    
    logging.info("Returning overview summary.")
    return summary


@app.get("/performance", response_model=List[CrossDatasetPerformance])
async def get_performance(
    target: Optional[str] = Query(None, description="Filter by target dimension ('arousal' or 'valence')"),
    direction: Optional[str] = Query(None, description="Filter by direction ('wesad_to_kemocon' or 'kemocon_to_wesad')")
):
    """Get performance metrics for cross-dataset models"""
    performance_data = load_performance_data()
    
    # Filter by target and/or direction if specified
    filtered_models = performance_data["models"]
    
    if target:
        filtered_models = [m for m in filtered_models if m["target"] == target]
    
    if direction:
        filtered_models = [m for m in filtered_models if m["direction"] == direction]
    
    # Return filtered results
    return filtered_models

@app.get("/adaptation", response_model=List[AdaptationPerformance])
async def get_adaptation_performance(
    target: Optional[str] = Query(None, description="Filter by target dimension ('arousal' or 'valence')"),
    direction: Optional[str] = Query(None, description="Filter by direction ('wesad_to_kemocon' or 'kemocon_to_wesad')")
):
    """Get domain adaptation performance metrics"""
    # Get all combinations unless filtered
    targets = ["arousal", "valence"] if not target else [target]
    directions = ["wesad_to_kemocon", "kemocon_to_wesad"] if not direction else [direction]
    
    adaptation_results = []
    
    for t in targets:
        for d in directions:
            adaptation_data = load_adaptation_data(target=t, direction=d)
            
            result = {
                "direction": d,
                "target": t,
                "adaptation_method": adaptation_data.get("adaptation_method", "ensemble"),
                "gap_before": adaptation_data.get("gap_before", 0),
                "gap_after": adaptation_data.get("gap_after", 0),
                "gap_reduction_pct": adaptation_data.get("gap_reduction_percent", 0)
            }
            
            adaptation_results.append(result)
    
    return adaptation_results

@app.get("/features/mapping", response_model=List[FeatureMapping])
async def get_feature_mapping(target: str = Query("arousal", description="Target dimension ('arousal' or 'valence')")):
    """Get feature mapping between WESAD and K-EmoCon"""
    # Load feature mapping
    feature_mapping = load_feature_mapping(target=target)
    
    # Add target information
    for feature in feature_mapping:
        feature["target"] = target
    
    return feature_mapping

@app.get("/dataset/distribution", response_model=List[ClassDistribution])
async def get_class_distribution():
    """Get class distribution for both datasets and both targets"""
    distribution_data = load_class_distribution()
    
    result = []
    
    for target, datasets in distribution_data.items():
        for dataset, counts in datasets.items():
            result.append({
                "dataset": dataset,
                "target": target,
                "low_count": counts["low"],
                "high_count": counts["high"],
                "distribution_ratio": counts["ratio"]
            })
    
    return result

@app.get("/dataset/statistics", response_model=Dict[str, Any])
async def get_dataset_statistics():
    """Get statistics about both datasets"""
    return load_dataset_statistics()

@app.post("/predict", response_model=Dict[str, Any])
async def predict_from_signals(data: SignalPredictionInput):
    """Make predictions from signal data"""
    try:
        # This endpoint should be connected to your actual models
        # For now, indicate that implementation is needed
        raise NotImplementedError("The prediction endpoint needs to be connected to your actual models")
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))

@app.get("/evaluation/{target}/{direction}", response_model=DetailedEvaluation)
async def get_detailed_evaluation(
    target: str = Path(..., description="Target dimension ('arousal' or 'valence')"),
    direction: str = Path(..., description="Direction ('wesad_to_kemocon' or 'kemocon_to_wesad')")
):
    """Get detailed evaluation results"""
    if target not in ["arousal", "valence"]:
        raise HTTPException(status_code=400, detail="Invalid target: must be 'arousal' or 'valence'")
    
    if direction not in ["wesad_to_kemocon", "kemocon_to_wesad"]:
        raise HTTPException(status_code=400, detail="Invalid direction: must be 'wesad_to_kemocon' or 'kemocon_to_wesad'")
    
    evaluation_data = load_detailed_evaluation(target=target, direction=direction)
    
    if not evaluation_data:
        raise HTTPException(status_code=404, detail=f"No evaluation data found for {target}, {direction}")
    
    # Add direction and target to response
    evaluation_data["direction"] = direction
    evaluation_data["target"] = target
    
    return evaluation_data

@app.post("/simulate/adaptation", response_model=Dict[str, Any])
async def simulate_adaptation(params: DomainAdaptationParams):
    """Simulate domain adaptation with different methods"""
    try:
        # This endpoint should be connected to your actual adaptation methods
        # For now, indicate that implementation is needed
        raise NotImplementedError("The adaptation simulation endpoint needs to be connected to your actual domain adaptation methods")
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))

@app.get("/visualize/domain_gap", response_model=Dict[str, Any])
async def get_domain_gap_visualization(target: str = Query("arousal", description="Target dimension ('arousal' or 'valence')")):
    """Get domain gap visualization data"""
    try:
        # This endpoint should load actual PCA-reduced features from your saved visualizations
        visualization_file = os.path.join(VISUALIZATION_DIR, f"domain_gap_{target}.json")
        
        if os.path.exists(visualization_file):
            with open(visualization_file, 'r') as f:
                return json.load(f)
        else:
            raise FileNotFoundError(f"Domain gap visualization data not found: {visualization_file}")
    except Exception as e:
        print(f"Error loading domain gap visualization: {e}")
        raise HTTPException(status_code=404, detail=f"Error loading domain gap visualization for {target}: {str(e)}")

@app.get("/visualize/confusion_matrices", response_model=Dict[str, Any])
async def get_confusion_matrices(
    target: str = Query("arousal", description="Target dimension ('arousal' or 'valence')")
):
    """Get confusion matrices for both directions"""
    # Load evaluation data for both directions
    w2k_eval = load_detailed_evaluation(target=target, direction="wesad_to_kemocon")
    k2w_eval = load_detailed_evaluation(target=target, direction="kemocon_to_wesad")
    
    # Extract confusion matrices
    w2k_cm = w2k_eval.get("confusion_matrix", [])
    k2w_cm = k2w_eval.get("confusion_matrix", [])
    
    # Calculate normalized confusion matrices
    def normalize_cm(cm):
        cm_array = np.array(cm)
        row_sums = cm_array.sum(axis=1, keepdims=True)
        return (cm_array / row_sums).tolist() if row_sums.all() else cm
    
    w2k_cm_norm = normalize_cm(w2k_cm)
    k2w_cm_norm = normalize_cm(k2w_cm)
    
    return {
        "target": target,
        "wesad_to_kemocon": {
            "confusion_matrix": w2k_cm,
            "normalized_matrix": w2k_cm_norm,
            "class_names": ["Low", "High"]
        },
        "kemocon_to_wesad": {
            "confusion_matrix": k2w_cm,
            "normalized_matrix": k2w_cm_norm,
            "class_names": ["Low", "High"]
        }
    }

@app.get("/visualize/class_distribution", response_model=Dict[str, Any])
async def get_class_distribution_visualization():
    """Get class distribution visualization data"""
    try:
        distribution_data = load_class_distribution()
        
        # Format for visualization
        result = {
            "targets": ["arousal", "valence"],
            "datasets": ["WESAD", "K-EmoCon"],
            "data": []
        }
        
        for target in result["targets"]:
            for dataset in result["datasets"]:
                if target not in distribution_data or dataset not in distribution_data[target]:
                    raise ValueError(f"Missing distribution data for {dataset}, {target}")
                
                counts = distribution_data[target][dataset]
                result["data"].append({
                    "target": target,
                    "dataset": dataset,
                    "low_count": counts["low"],
                    "high_count": counts["high"],
                    "ratio": counts["ratio"]
                })
        
        return result
    except Exception as e:
        print(f"Error creating class distribution visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating class distribution visualization: {str(e)}")

@app.get("/visualize/feature_importance", response_model=Dict[str, Any])
async def get_feature_importance_visualization(
    target: str = Query("arousal", description="Target dimension ('arousal' or 'valence')")
):
    """Get feature importance visualization data"""
    try:
        # Look for a dedicated visualization file first
        viz_file = os.path.join(VISUALIZATION_DIR, f"feature_importance_{target}.json")
        
        if os.path.exists(viz_file):
            with open(viz_file, 'r') as f:
                return json.load(f)
        
        # Otherwise load and process feature mapping
        feature_mapping = load_feature_mapping(target=target)
        
        # Sort by importance
        feature_mapping.sort(key=lambda x: x["importance_score"], reverse=True)
        
        # Limit to top 10
        top_features = feature_mapping[:10]
        
        # Process common features
        # In a real implementation, this would come from actual analysis
        common_features_file = os.path.join(FEATURE_DIR, f"common_important_{target}.json")
        
        if os.path.exists(common_features_file):
            with open(common_features_file, 'r') as f:
                common_features = json.load(f)
        else:
            raise FileNotFoundError(f"Common important features file not found: {common_features_file}")
        
        return {
            "target": target,
            "features": top_features,
            "common_important_features": common_features
        }
    except Exception as e:
        print(f"Error creating feature importance visualization: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating feature importance visualization for {target}: {str(e)}")

@app.get("/report/{report_type}")
async def generate_report(
    report_type: str = Path(..., description="Report type ('performance', 'adaptation', 'features')"),
    target: Optional[str] = Query(None, description="Target dimension ('arousal', 'valence', or both)"),
    format: str = Query("pdf", description="Report format ('pdf' or 'excel')")
):
    """Generate a downloadable report"""
    # Validate report type
    valid_types = ["performance", "adaptation", "features", "overview"]
    if report_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid report type. Valid types are: {', '.join(valid_types)}")
    
    # Validate format
    valid_formats = ["pdf", "excel"]
    if format not in valid_formats:
        raise HTTPException(status_code=400, detail=f"Invalid format. Valid formats are: {', '.join(valid_formats)}")
    
    # Create a temporary file name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target_str = f"_{target}" if target else ""
    filename = f"cross_dataset_{report_type}{target_str}_{timestamp}.{format}"
    
    # Create a placeholder report file
    report_content = f"Cross-Dataset Emotion Recognition Report\n\nType: {report_type}\nDate: {timestamp}\n"
    if target:
        report_content += f"Target: {target}\n"
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as tmp:
        tmp.write(report_content.encode())
        temp_path = tmp.name
    
    # Return the file as download
    return FileResponse(
        path=temp_path, 
        filename=filename,
        media_type="application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Serve custom API documentation"""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

if __name__ == "__main__":
    import uvicorn
    
    # Create data directories if they don't exist
    for directory in [
        BASE_DIR,
        os.path.join(BASE_DIR, "performance"),
        EVALUATION_DIR,
        os.path.join(EVALUATION_DIR, "arousal"),
        os.path.join(EVALUATION_DIR, "valence"),
        FEATURE_DIR,
        ADAPTATION_DIR,
        VISUALIZATION_DIR,
        MODELS_DIR,
        os.path.join(BASE_DIR, "dataset"),
        REPORTS_DIR
    ]:
        os.makedirs(directory, exist_ok=True)
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8090)
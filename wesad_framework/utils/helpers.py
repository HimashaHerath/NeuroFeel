"""
Helper functions for the WESAD framework.
"""

import os
import pickle
import json
import datetime
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator


def save_model(model, model_name, subject_id=None, output_dir='.', metadata=None):
    """
    Save a trained model with metadata.
    
    Args:
        model: Trained model to save
        model_name (str): Name of the model ('base', 'personal', etc.)
        subject_id (int, optional): Subject ID for personal models
        output_dir (str): Directory to save the model
        metadata (dict, optional): Additional metadata to save with the model
    
    Returns:
        str: Path to saved model
    """
    # Create models directory if it doesn't exist
    models_dir = os.path.join(output_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Prepare metadata
    if metadata is None:
        metadata = {}
    
    # Add timestamp and model type
    metadata['timestamp'] = datetime.datetime.now().isoformat()
    metadata['model_type'] = model_name
    if subject_id is not None:
        metadata['subject_id'] = subject_id
    
    # Add model parameters if available
    if hasattr(model, 'get_params'):
        try:
            metadata['parameters'] = model.get_params()
        except:
            metadata['parameters'] = str(model)
    
    # Create a model package with model and metadata
    model_package = {
        'model': model,
        'metadata': metadata
    }
    
    # Create filename
    if subject_id is not None:
        filename = f"{model_name}_S{subject_id}.pkl"
    else:
        filename = f"{model_name}_model.pkl"
    
    filepath = os.path.join(models_dir, filename)
    
    # Save model package
    with open(filepath, 'wb') as f:
        pickle.dump(model_package, f)
    
    # Save metadata separately as JSON for easy access
    meta_filepath = os.path.join(models_dir, os.path.splitext(filename)[0] + '_meta.json')
    
    # Convert numpy and other non-serializable types to strings in metadata
    clean_metadata = {}
    for key, value in metadata.items():
        if isinstance(value, dict):
            clean_metadata[key] = {k: str(v) for k, v in value.items()}
        elif isinstance(value, (np.ndarray, np.number)):
            clean_metadata[key] = str(value)
        else:
            clean_metadata[key] = value
    
    with open(meta_filepath, 'w') as f:
        json.dump(clean_metadata, f, indent=2)
    
    return filepath


def load_model(filepath):
    """
    Load a saved model with metadata.
    
    Args:
        filepath (str): Path to saved model
    
    Returns:
        tuple: (model, metadata)
    """
    with open(filepath, 'rb') as f:
        model_package = pickle.load(f)
    
    return model_package['model'], model_package['metadata']


def save_scaler(scaler, scaler_name, output_dir='.'):
    """
    Save a fitted scaler.
    
    Args:
        scaler: Fitted scaler to save
        scaler_name (str): Name of the scaler
        output_dir (str): Directory to save the scaler
    
    Returns:
        str: Path to saved scaler
    """
    # Create scalers directory if it doesn't exist
    scalers_dir = os.path.join(output_dir, 'scalers')
    os.makedirs(scalers_dir, exist_ok=True)
    
    # Create filename
    filename = f"{scaler_name}.pkl"
    filepath = os.path.join(scalers_dir, filename)
    
    # Save scaler
    with open(filepath, 'wb') as f:
        pickle.dump(scaler, f)
    
    return filepath


def load_scaler(filepath):
    """
    Load a saved scaler.
    
    Args:
        filepath (str): Path to saved scaler
    
    Returns:
        object: Loaded scaler
    """
    with open(filepath, 'rb') as f:
        scaler = pickle.load(f)
    
    return scaler


def save_features(feature_ranking, subject_id=None, output_dir='.'):
    """
    Save feature rankings.
    
    Args:
        feature_ranking (list): List of (feature, score) tuples
        subject_id (int, optional): Subject ID
        output_dir (str): Directory to save the feature rankings
    
    Returns:
        str: Path to saved features
    """
    # Create features directory if it doesn't exist
    features_dir = os.path.join(output_dir, 'features')
    os.makedirs(features_dir, exist_ok=True)
    
    # Convert to DataFrame for easier handling
    df = pd.DataFrame(feature_ranking, columns=['feature', 'importance'])
    
    # Create filename
    if subject_id is not None:
        filename = f"features_S{subject_id}.csv"
    else:
        filename = "features_global.csv"
    
    filepath = os.path.join(features_dir, filename)
    
    # Save features
    df.to_csv(filepath, index=False)
    
    return filepath


def save_results_table(results_df, output_dir='.'):
    """
    Save results table in multiple formats.
    
    Args:
        results_df (pd.DataFrame): DataFrame with results
        output_dir (str): Directory to save the results
    
    Returns:
        tuple: Paths to saved files (csv, excel)
    """
    # Create results directory if it doesn't exist
    results_dir = os.path.join(output_dir, 'results')
    os.makedirs(results_dir, exist_ok=True)
    
    # Save as CSV
    csv_path = os.path.join(results_dir, 'results_table.csv')
    results_df.to_csv(csv_path, index=False)
    
    # Save as Excel
    excel_path = os.path.join(results_dir, 'results_table.xlsx')
    results_df.to_excel(excel_path, index=False)
    
    return csv_path, excel_path
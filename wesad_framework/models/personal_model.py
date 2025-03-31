"""
Personal model implementation for emotion recognition.
"""

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.cluster import KMeans

from wesad_framework.models.base_model import get_model_types, get_transfer_model_types
from wesad_framework.features.selection import identify_subject_important_features


def select_calibration_diverse(subject_data, feature_names, scaler, examples_per_class=5):
    """
    Select diverse calibration examples using clustering.
    
    Args:
        subject_data (pd.DataFrame): DataFrame with subject features
        feature_names (list): List of feature names to use
        scaler (sklearn.preprocessing.StandardScaler): Fitted scaler
        examples_per_class (int): Number of examples to select per class
    
    Returns:
        pd.DataFrame: DataFrame with selected calibration examples
    """
    print("  Using diversity-aware calibration selection...")
    calibration_data_list = []  # Empty list to collect selected data
    
    # Ensure we have at least 2 examples per class (minimum needed)
    min_examples = max(2, examples_per_class)
    
    # Increase examples for less represented classes
    class_distribution = subject_data['label'].value_counts()
    total_examples = 0
    
    for label in subject_data['label'].unique():
        # Get data for this label
        label_data = subject_data[subject_data['label'] == label]
        
        # Calculate how many examples to select for this class
        # Allocate more examples to minority classes
        if len(class_distribution) >= 3:  # If we have at least 3 classes
            class_rank = class_distribution[label] / class_distribution.sum()
            # Inverse weighting: smaller classes get more examples
            examples_needed = int(min_examples * (1.5 - class_rank * 1.0))
            examples_needed = max(min_examples, min(examples_needed, len(label_data)))
        else:
            examples_needed = min(min_examples, len(label_data))
        
        total_examples += examples_needed
        
        if len(label_data) <= examples_needed:
            # Use all examples if fewer than requested
            selected = label_data
        else:
            # Use k-means clustering to find diverse examples
            X = label_data[feature_names].values
            X_scaled = scaler.transform(X)  # Using already fitted scaler
            
            # Apply clustering
            n_clusters = min(examples_needed, len(label_data))
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(X_scaled)
            
            # Select the example closest to each cluster center
            selected_indices = []
            for cluster_id in range(n_clusters):
                cluster_samples = np.where(clusters == cluster_id)[0]
                if len(cluster_samples) > 0:
                    # Find closest to cluster center
                    distances = np.sum((X_scaled[cluster_samples] - 
                                    kmeans.cluster_centers_[cluster_id])**2, axis=1)
                    closest_idx = cluster_samples[np.argmin(distances)]
                    selected_indices.append(closest_idx)
            
            selected = label_data.iloc[selected_indices]
        
        # Add to calibration data list
        calibration_data_list.append(selected)
    
    # Combine all selected data
    if calibration_data_list:
        calibration_data = pd.concat(calibration_data_list, ignore_index=True)
    else:
        calibration_data = pd.DataFrame()
    
    print(f"  Selected {len(calibration_data)} diverse calibration examples ({total_examples} planned)")
    return calibration_data


def create_personal_model(subject_train_data, base_model, feature_names, scaler, 
                          model_type='neural_network', num_calibration=5, use_transfer_learning=True):
    """
    Create a personalized model for a subject using transfer learning.
    
    Args:
        subject_train_data (pd.DataFrame): Training data for the subject
        base_model (object): Trained base model
        feature_names (list): List of feature names to use
        scaler (sklearn.preprocessing.StandardScaler): Fitted scaler
        model_type (str): Type of model to use
        num_calibration (int): Number of calibration examples per class
        use_transfer_learning (bool): Whether to use transfer learning
    
    Returns:
        tuple: (personal_model, calibration_data, feature_ranking)
    """
    if len(subject_train_data) == 0:
        print("  No training data available for this subject.")
        return None, None, None
    
    subject_id = subject_train_data['subject_id'].iloc[0]
    print(f"Creating personal model for subject S{subject_id} with transfer learning...")
    
    # Identify important features (but keep using all features)
    feature_ranking = identify_subject_important_features(
        subject_train_data, feature_names)
    
    # Select calibration examples with diversity
    calibration_data = select_calibration_diverse(
        subject_train_data, feature_names, scaler, num_calibration)
    
    # Extract features and labels (using all original features)
    X_cal = calibration_data[feature_names].values
    y_cal = calibration_data['label'].values - 1  # Convert to 0-indexed
    
    # Standardize features
    X_cal_scaled = scaler.transform(X_cal)
    
    # Get model types
    model_types = get_model_types()
    transfer_model_types = get_transfer_model_types()
    
    if use_transfer_learning:
        # Use transfer learning-specific model (no early stopping)
        if model_type in transfer_model_types:
            # Create a fresh model
            personal_model = clone(transfer_model_types[model_type])
            
            # Initialize with weights from base model
            if model_type == 'neural_network':
                # For neural networks, we need to fit first with a sample
                # to initialize the model architecture
                personal_model.fit(X_cal_scaled[:2], y_cal[:2])
                
                # Now copy weights from base model
                if hasattr(base_model, 'coefs_') and hasattr(personal_model, 'coefs_'):
                    for i in range(len(base_model.coefs_)):
                        personal_model.coefs_[i] = base_model.coefs_[i].copy()
                
                if hasattr(base_model, 'intercepts_') and hasattr(personal_model, 'intercepts_'):
                    for i in range(len(base_model.intercepts_)):
                        personal_model.intercepts_[i] = base_model.intercepts_[i].copy()
            
            # Now fine-tune
            personal_model.fit(X_cal_scaled, y_cal)
        else:
            # Use a new model (fallback if transfer model not available)
            personal_model = clone(model_types[model_type])
            personal_model.fit(X_cal_scaled, y_cal)
    else:
        # Use a new model (without transfer)
        personal_model = clone(model_types[model_type])
        personal_model.fit(X_cal_scaled, y_cal)
    
    return personal_model, calibration_data, feature_ranking
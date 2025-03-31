"""
Ensemble model implementation for emotion recognition.
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


def learn_ensemble_weights(subject_id, subject_train_data, base_model, personal_model, 
                           feature_names, scaler, val_ratio=0.2):
    """
    Learn optimal weights for ensemble combination.
    
    Args:
        subject_id (int): Subject ID
        subject_train_data (pd.DataFrame): Training data for the subject
        base_model (object): Trained base model
        personal_model (object): Trained personal model
        feature_names (list): List of feature names to use
        scaler (sklearn.preprocessing.StandardScaler): Fitted scaler
        val_ratio (float): Validation ratio
    
    Returns:
        float: Optimal ensemble weight for base model
    """
    # Split some validation data
    train_idx, val_idx = train_test_split(
        np.arange(len(subject_train_data)), 
        test_size=val_ratio,
        stratify=subject_train_data['label'],
        random_state=42
    )
    
    val_data = subject_train_data.iloc[val_idx]
    
    # Skip if not enough validation data
    if len(val_data) < 10:
        # Use default weight of 0.5
        return 0.5
    
    # Prepare validation data (using all features)
    X_val = val_data[feature_names].values
    y_val = val_data['label'].values - 1
    X_val_scaled = scaler.transform(X_val)
    
    # Get predictions from both models
    base_pred_proba = base_model.predict_proba(X_val_scaled)
    personal_pred_proba = personal_model.predict_proba(X_val_scaled)
    
    # Try different weights to find optimal
    best_weight = 0.5
    best_acc = 0
    
    for weight in np.linspace(0, 1, 11):  # 0, 0.1, 0.2, ..., 1.0
        # Combine predictions
        ensemble_proba = weight * base_pred_proba + (1 - weight) * personal_pred_proba
        ensemble_pred = np.argmax(ensemble_proba, axis=1)
        
        # Calculate accuracy
        acc = accuracy_score(y_val, ensemble_pred)
        
        # Update if better
        if acc > best_acc:
            best_acc = acc
            best_weight = weight
    
    print(f"  Optimal ensemble weight: {best_weight:.2f} (base: {best_weight:.2f}, personal: {1-best_weight:.2f})")
    return best_weight


def predict_with_ensemble(subject_id, X_test_scaled, base_model, personal_model, ensemble_weight):
    """
    Make predictions using weighted ensemble of base and personal models.
    
    Args:
        subject_id (int): Subject ID
        X_test_scaled (np.array): Scaled test features
        base_model (object): Trained base model
        personal_model (object): Trained personal model
        ensemble_weight (float): Weight for base model (1-weight for personal model)
    
    Returns:
        np.array: Ensemble predictions
    """
    # Get predictions from base model
    base_pred_proba = base_model.predict_proba(X_test_scaled)
    
    # Get predictions from personal model
    personal_pred_proba = personal_model.predict_proba(X_test_scaled)
    
    # Combine predictions
    ensemble_proba = ensemble_weight * base_pred_proba + (1 - ensemble_weight) * personal_pred_proba
    ensemble_pred = np.argmax(ensemble_proba, axis=1)
    
    return ensemble_pred
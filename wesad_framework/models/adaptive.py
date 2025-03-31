"""
Adaptive model implementation for emotion recognition.
"""

import numpy as np


def predict_with_adaptive_selection(X_test_scaled, base_model, personal_model, threshold=0.65):
    """
    Make predictions using adaptive selection based on confidence.
    
    Args:
        X_test_scaled (np.array): Scaled test features
        base_model (object): Trained base model
        personal_model (object): Trained personal model
        threshold (float): Confidence threshold for personal model
    
    Returns:
        np.array: Adaptive model predictions
    """
    # Get predictions from both models
    base_pred_proba = base_model.predict_proba(X_test_scaled)
    base_pred = np.argmax(base_pred_proba, axis=1)
    base_conf = np.max(base_pred_proba, axis=1)
    
    personal_pred_proba = personal_model.predict_proba(X_test_scaled)
    personal_pred = np.argmax(personal_pred_proba, axis=1)
    personal_conf = np.max(personal_pred_proba, axis=1)
    
    # Select prediction with higher confidence if above threshold
    final_pred = np.zeros_like(base_pred)
    for i in range(len(X_test_scaled)):
        if personal_conf[i] > threshold and personal_conf[i] >= base_conf[i]:
            final_pred[i] = personal_pred[i]
        else:
            final_pred[i] = base_pred[i]
    
    # Count how many times each model was used
    base_count = np.sum(final_pred == base_pred)
    personal_count = len(final_pred) - base_count
    print(f"  Adaptive selection used: base model {base_count} times, personal model {personal_count} times")
    
    return final_pred
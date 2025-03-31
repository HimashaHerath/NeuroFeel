"""
Model evaluation functions for cross-dataset emotion recognition.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score, 
    f1_score, 
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    balanced_accuracy_score, 
    precision_recall_curve, 
    auc
)

from cross_dataset.config import DECISION_THRESHOLDS


def find_optimal_threshold(y_true, y_prob, metric='f1'):
    """
    Find optimal decision threshold for classification.
    
    Args:
        y_true (np.ndarray): True labels
        y_prob (np.ndarray): Predicted probabilities
        metric (str): Metric to optimize ('f1', 'balanced_acc', or 'accuracy')
    
    Returns:
        tuple: (optimal_threshold, optimal_score)
    """
    best_score = 0
    best_threshold = 0.5
    
    for threshold in DECISION_THRESHOLDS:
        y_pred = (y_prob >= threshold).astype(int)
        
        if metric == 'f1':
            score = f1_score(y_true, y_pred, average='macro')
        elif metric == 'balanced_acc':
            score = balanced_accuracy_score(y_true, y_pred)
        else:  # Default to accuracy
            score = accuracy_score(y_true, y_pred)
        
        if score > best_score:
            best_score = score
            best_threshold = threshold
    
    return best_threshold, best_score


def evaluate_model(model, X_test, y_test, scaler=None, threshold=None, metric='f1'):
    """
    Evaluate model performance.
    
    Args:
        model: Trained model
        X_test (np.ndarray): Test features
        y_test (np.ndarray): True labels
        scaler: Feature scaler (optional)
        threshold (float): Decision threshold (if None, find optimal)
        metric (str): Metric to optimize for threshold finding
    
    Returns:
        dict: Evaluation metrics
    """
    # Scale features if scaler is provided
    if scaler is not None:
        X_test_scaled = scaler.transform(X_test)
    else:
        X_test_scaled = X_test
    
    # Get predicted probabilities
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    # Find optimal threshold if not provided
    if threshold is None:
        threshold, _ = find_optimal_threshold(y_test, y_prob, metric)
    
    # Make predictions with threshold
    y_pred = (y_prob >= threshold).astype(int)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    balanced_acc = balanced_accuracy_score(y_test, y_pred)
    
    # Calculate precision-recall AUC
    precision, recall, _ = precision_recall_curve(y_test, y_prob)
    pr_auc = auc(recall, precision)
    
    # Calculate ROC AUC
    roc_auc = roc_auc_score(y_test, y_prob)
    
    # Generate classification report
    class_report = classification_report(y_test, y_pred, output_dict=True)
    
    # Generate confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Return all metrics
    return {
        'accuracy': accuracy,
        'f1_score': f1,
        'balanced_accuracy': balanced_acc,
        'roc_auc': roc_auc,
        'pr_auc': pr_auc,
        'threshold': threshold,
        'classification_report': class_report,
        'confusion_matrix': cm,
        'y_true': y_test,
        'y_pred': y_pred,
        'y_prob': y_prob
    }


def evaluate_feature_importance(model, feature_names):
    """
    Evaluate feature importance from the model.
    
    Args:
        model: Trained model
        feature_names (list): List of feature names
    
    Returns:
        pd.DataFrame: Feature importance data
    """
    import pandas as pd
    
    # Extract feature importance from Random Forest component
    if hasattr(model, 'named_estimators_') and 'rf' in model.named_estimators_:
        rf_model = model.named_estimators_['rf']
        importances = rf_model.feature_importances_
    elif hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        return pd.DataFrame({'Feature': feature_names, 'Importance': np.ones(len(feature_names))})
    
    # Create DataFrame with feature names and importance scores
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=False)
    
    return importance_df


def evaluate_bidirectional_models(models_dict, wesad_X, wesad_y, kemocon_X, kemocon_y):
    """
    Evaluate models for bidirectional cross-dataset prediction.
    
    Args:
        models_dict (dict): Dictionary with trained models
        wesad_X (np.ndarray): WESAD features
        wesad_y (np.ndarray): WESAD target labels
        kemocon_X (np.ndarray): K-EmoCon features
        kemocon_y (np.ndarray): K-EmoCon target labels
    
    Returns:
        dict: Evaluation results
    """
    # Extract models and scalers
    w2k_model = models_dict['wesad_to_kemocon']['model']
    w2k_scaler = models_dict['wesad_to_kemocon']['scaler']
    
    k2w_model = models_dict['kemocon_to_wesad']['model']
    k2w_scaler = models_dict['kemocon_to_wesad']['scaler']
    
    # Evaluate WESAD → K-EmoCon
    w2k_results = evaluate_model(w2k_model, kemocon_X, kemocon_y, w2k_scaler)
    
    # Evaluate K-EmoCon → WESAD
    k2w_results = evaluate_model(k2w_model, wesad_X, wesad_y, k2w_scaler)
    
    # Print results summary
    print("\nWESAD → K-EmoCon Results:")
    print(f"Accuracy: {w2k_results['accuracy']:.4f}, F1: {w2k_results['f1_score']:.4f}")
    print(f"Balanced Accuracy: {w2k_results['balanced_accuracy']:.4f}, ROC-AUC: {w2k_results['roc_auc']:.4f}")
    print(f"PR-AUC: {w2k_results['pr_auc']:.4f}, Threshold: {w2k_results['threshold']:.2f}")
    
    print("\nK-EmoCon → WESAD Results:")
    print(f"Accuracy: {k2w_results['accuracy']:.4f}, F1: {k2w_results['f1_score']:.4f}")
    print(f"Balanced Accuracy: {k2w_results['balanced_accuracy']:.4f}, ROC-AUC: {k2w_results['roc_auc']:.4f}")
    print(f"PR-AUC: {k2w_results['pr_auc']:.4f}, Threshold: {k2w_results['threshold']:.2f}")
    
    # Return combined results
    return {
        'wesad_to_kemocon': w2k_results,
        'kemocon_to_wesad': k2w_results
    }


def print_classification_reports(evaluation_results):
    """
    Print classification reports for both directions.
    
    Args:
        evaluation_results (dict): Evaluation results
    """
    # WESAD → K-EmoCon
    w2k_report = evaluation_results['wesad_to_kemocon']['classification_report']
    print("\nWESAD → K-EmoCon Classification Report:")
    print(classification_report(
        evaluation_results['wesad_to_kemocon']['y_true'],
        evaluation_results['wesad_to_kemocon']['y_pred']
    ))
    
    # K-EmoCon → WESAD
    k2w_report = evaluation_results['kemocon_to_wesad']['classification_report']
    print("\nK-EmoCon → WESAD Classification Report:")
    print(classification_report(
        evaluation_results['kemocon_to_wesad']['y_true'],
        evaluation_results['kemocon_to_wesad']['y_pred']
    ))
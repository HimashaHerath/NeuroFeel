"""
Evaluation metrics for emotion recognition models.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    confusion_matrix, classification_report, 
    accuracy_score, f1_score, precision_score, recall_score
)

def calculate_metrics(y_true, y_pred, prefix=''):
    """
    Calculate various classification metrics.
    
    Args:
        y_true (np.array): True labels
        y_pred (np.array): Predicted labels
        prefix (str): Prefix for metric names in the returned dictionary
    
    Returns:
        dict: Dictionary of metric values
    """
    # Calculate basic metrics
    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, average='weighted')
    precision = precision_score(y_true, y_pred, average='weighted')
    recall = recall_score(y_true, y_pred, average='weighted')
    
    # Create classification report
    report = classification_report(
        y_true, y_pred, 
        target_names=['Baseline', 'Stress', 'Amusement', 'Meditation'],
        output_dict=True
    )
    
    # Create metrics dictionary
    metrics = {
        f'{prefix}accuracy': acc,
        f'{prefix}f1_score': f1,
        f'{prefix}precision': precision,
        f'{prefix}recall': recall,
        f'{prefix}class_report': report
    }
    
    return metrics


def evaluate_all_models(subject_id, X_test_scaled, y_test, 
                        base_model, personal_model, 
                        ensemble_pred, adaptive_pred):
    """
    Evaluate all models for a specific subject.
    
    Args:
        subject_id (int): Subject ID
        X_test_scaled (np.array): Scaled test features
        y_test (np.array): True test labels
        base_model (object): Trained base model
        personal_model (object): Trained personal model
        ensemble_pred (np.array): Ensemble model predictions
        adaptive_pred (np.array): Adaptive model predictions
    
    Returns:
        dict: Dictionary of evaluation results
    """
    # Get predictions from base and personal models
    y_base_pred = base_model.predict(X_test_scaled)
    y_personal_pred = personal_model.predict(X_test_scaled)
    
    # Calculate metrics
    base_metrics = calculate_metrics(y_test, y_base_pred, prefix='base_')
    personal_metrics = calculate_metrics(y_test, y_personal_pred, prefix='personal_')
    ensemble_metrics = calculate_metrics(y_test, ensemble_pred, prefix='ensemble_')
    adaptive_metrics = calculate_metrics(y_test, adaptive_pred, prefix='adaptive_')
    
    # Create results dictionary
    results = {
        'subject_id': subject_id,
        'base_model_accuracy': base_metrics['base_accuracy'],
        'personal_model_accuracy': personal_metrics['personal_accuracy'],
        'ensemble_model_accuracy': ensemble_metrics['ensemble_accuracy'],
        'adaptive_model_accuracy': adaptive_metrics['adaptive_accuracy'],
        'base_model_f1': base_metrics['base_f1_score'],
        'personal_model_f1': personal_metrics['personal_f1_score'],
        'ensemble_model_f1': ensemble_metrics['ensemble_f1_score'],
        'adaptive_model_f1': adaptive_metrics['adaptive_f1_score'],
        'base_metrics': base_metrics,
        'personal_metrics': personal_metrics,
        'ensemble_metrics': ensemble_metrics,
        'adaptive_metrics': adaptive_metrics,
        'confusions': {
            'base': confusion_matrix(y_test, y_base_pred),
            'personal': confusion_matrix(y_test, y_personal_pred),
            'ensemble': confusion_matrix(y_test, ensemble_pred),
            'adaptive': confusion_matrix(y_test, adaptive_pred)
        }
    }
    
    # Print summary
    print(f"  Base model accuracy: {base_metrics['base_accuracy']:.4f}, F1: {base_metrics['base_f1_score']:.4f}")
    print(f"  Personal model accuracy: {personal_metrics['personal_accuracy']:.4f}, F1: {personal_metrics['personal_f1_score']:.4f}")
    print(f"  Ensemble model accuracy: {ensemble_metrics['ensemble_accuracy']:.4f}, F1: {ensemble_metrics['ensemble_f1_score']:.4f}")
    print(f"  Adaptive model accuracy: {adaptive_metrics['adaptive_accuracy']:.4f}, F1: {adaptive_metrics['adaptive_f1_score']:.4f}")
    
    return results


def calculate_overall_results(results_list):
    """
    Calculate overall results from a list of subject results.
    
    Args:
        results_list (list): List of result dictionaries from evaluate_all_models
    
    Returns:
        dict: Dictionary of overall results
    """
    if not results_list:
        return {}
    
    # Convert to DataFrame for easier processing
    results_df = pd.DataFrame(results_list)
    
    # Calculate mean metrics
    mean_base_acc = results_df['base_model_accuracy'].mean()
    mean_personal_acc = results_df['personal_model_accuracy'].mean()
    mean_ensemble_acc = results_df['ensemble_model_accuracy'].mean()
    mean_adaptive_acc = results_df['adaptive_model_accuracy'].mean()
    
    mean_base_f1 = results_df['base_model_f1'].mean()
    mean_personal_f1 = results_df['personal_model_f1'].mean()
    mean_ensemble_f1 = results_df['ensemble_model_f1'].mean()
    mean_adaptive_f1 = results_df['adaptive_model_f1'].mean()
    
    # Calculate improvements
    personal_improvement = mean_personal_acc - mean_base_acc
    ensemble_improvement = mean_ensemble_acc - mean_base_acc
    adaptive_improvement = mean_adaptive_acc - mean_base_acc
    
    # Create overall results dictionary
    overall_results = {
        'mean_base_acc': mean_base_acc,
        'mean_personal_acc': mean_personal_acc,
        'mean_ensemble_acc': mean_ensemble_acc,
        'mean_adaptive_acc': mean_adaptive_acc,
        'mean_base_f1': mean_base_f1,
        'mean_personal_f1': mean_personal_f1,
        'mean_ensemble_f1': mean_ensemble_f1,
        'mean_adaptive_f1': mean_adaptive_f1,
        'personal_improvement': personal_improvement,
        'ensemble_improvement': ensemble_improvement,
        'adaptive_improvement': adaptive_improvement,
        'results_df': results_df
    }
    
    # Print summary
    print("\nOverall Results:")
    print(f"Mean base model accuracy: {mean_base_acc:.4f}, F1: {mean_base_f1:.4f}")
    print(f"Mean personal model accuracy: {mean_personal_acc:.4f}, F1: {mean_personal_f1:.4f}")
    print(f"Mean ensemble model accuracy: {mean_ensemble_acc:.4f}, F1: {mean_ensemble_f1:.4f}")
    print(f"Mean adaptive model accuracy: {mean_adaptive_acc:.4f}, F1: {mean_adaptive_f1:.4f}")
    print(f"Personal model improvement: {personal_improvement:.4f}")
    print(f"Ensemble model improvement: {ensemble_improvement:.4f}")
    print(f"Adaptive model improvement: {adaptive_improvement:.4f}")
    
    return overall_results
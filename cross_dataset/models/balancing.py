"""
Class balancing techniques for handling imbalanced datasets.
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score
from imblearn.over_sampling import SMOTE, ADASYN
from imblearn.combine import SMOTEENN

from cross_dataset.config import (
    CLASS_BALANCE_THRESHOLD, 
    CLASS_BALANCE_METHOD,
    SAMPLING_STRATEGY,
    CV_TEST_SIZE
)


def check_class_imbalance(y):
    """
    Check if class balancing is needed.
    
    Args:
        y (np.ndarray): Target labels
    
    Returns:
        tuple: (needs_balancing, minority_ratio)
    """
    # Count instances per class
    class_counts = np.bincount(y)
    
    # Calculate ratio of minority to majority class
    if len(class_counts) < 2:
        return False, 1.0
    
    minority_ratio = np.min(class_counts) / np.max(class_counts)
    
    # Need balancing if ratio is below threshold
    needs_balancing = minority_ratio < CLASS_BALANCE_THRESHOLD
    
    return needs_balancing, minority_ratio


def select_best_resampling_method(X, y, methods=None):
    """
    Select the best resampling method using cross-validation.
    
    Args:
        X (np.ndarray): Features
        y (np.ndarray): Target labels
        methods (list): List of resampling methods to try
    
    Returns:
        tuple: (best_method_name, best_method, best_f1)
    """
    if methods is None:
        # Default methods to try
        methods = [
            ("SMOTE", SMOTE(random_state=42, sampling_strategy=SAMPLING_STRATEGY)),
            ("ADASYN", ADASYN(random_state=42, sampling_strategy=SAMPLING_STRATEGY)),
            ("SMOTEENN", SMOTEENN(random_state=42)),
        ]
    
    # Split data for validation
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=CV_TEST_SIZE, stratify=y, random_state=42)
    
    best_method = None
    best_name = None
    best_f1 = 0
    best_X = None
    best_y = None
    
    # Try each method
    for name, method in methods:
        try:
            # Apply resampling
            X_res, y_res = method.fit_resample(X_train, y_train)
            
            # Train a quick model to evaluate
            temp_model = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
            temp_model.fit(X_res, y_res)
            y_pred = temp_model.predict(X_val)
            f1 = f1_score(y_val, y_pred, average='macro')  # Use macro F1 for imbalanced data
            
            print(f"  {name} resampling F1: {f1:.4f}, distribution: {np.bincount(y_res)}")
            
            # Update if better
            if f1 > best_f1:
                best_f1 = f1
                best_name = name
                best_method = method
                best_X = X_res
                best_y = y_res
        except Exception as e:
            print(f"  {name} resampling failed: {e}")
    
    return best_name, best_method, best_f1, best_X, best_y


def apply_class_balancing(X, y, method=CLASS_BALANCE_METHOD):
    """
    Apply class balancing to the dataset.
    
    Args:
        X (np.ndarray): Features
        y (np.ndarray): Target labels
        method (str): Resampling method to use
    
    Returns:
        tuple: (X_resampled, y_resampled)
    """
    # Check if balancing is needed
    needs_balancing, ratio = check_class_imbalance(y)
    if not needs_balancing:
        return X, y
    
    print(f"Applying class balancing (imbalance ratio: {ratio:.2f})...")
    
    if method == 'auto':
        # Use CV to select best method
        name, resampler, f1, X_res, y_res = select_best_resampling_method(X, y)
        
        if name:
            print(f"  Selected {name} resampling method (F1: {f1:.4f})")
            
            # Apply to full dataset for consistency
            try:
                X_resampled, y_resampled = resampler.fit_resample(X, y)
                print(f"  Class distribution after resampling: {np.bincount(y_resampled)}")
                return X_resampled, y_resampled
            except Exception as e:
                print(f"  Failed to apply to full dataset: {e}, using best CV result")
                return X_res, y_res
    
    # Apply specific method
    try:
        if method == 'SMOTE':
            resampler = SMOTE(random_state=42, sampling_strategy=SAMPLING_STRATEGY)
        elif method == 'ADASYN':
            resampler = ADASYN(random_state=42, sampling_strategy=SAMPLING_STRATEGY)
        elif method == 'SMOTEENN':
            resampler = SMOTEENN(random_state=42)
        else:
            print(f"Unknown resampling method: {method}, using SMOTE")
            resampler = SMOTE(random_state=42, sampling_strategy=SAMPLING_STRATEGY)
        
        X_resampled, y_resampled = resampler.fit_resample(X, y)
        print(f"  Class distribution after {method} resampling: {np.bincount(y_resampled)}")
        return X_resampled, y_resampled
    
    except Exception as e:
        print(f"Resampling failed: {e}")
        return X, y


def create_sample_weights(y, weight_dict=None):
    """
    Create sample weights based on class distribution.
    
    Args:
        y (np.ndarray): Target labels
        weight_dict (dict): Custom weights per class
    
    Returns:
        np.ndarray: Sample weights
    """
    # If no weights provided, calculate balanced weights
    if weight_dict is None:
        class_counts = np.bincount(y)
        weight_dict = {
            i: len(y) / (len(class_counts) * count) 
            for i, count in enumerate(class_counts)
        }
    
    # Create sample weights array
    sample_weights = np.ones(len(y))
    for i, label in enumerate(y):
        sample_weights[i] = weight_dict[label]
    
    return sample_weights
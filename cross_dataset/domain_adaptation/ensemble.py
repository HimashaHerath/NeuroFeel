"""
Ensemble domain adaptation method combining multiple adaptation techniques.
"""

import numpy as np
from sklearn.preprocessing import StandardScaler

from .coral import coral_transform, calculate_domain_discrepancy
from .subspace import subspace_alignment
from cross_dataset.config import ENSEMBLE_WEIGHTS


def ensemble_domain_adaptation(source_features, target_features, weights=None):
    """
    Apply ensemble of domain adaptation methods for better performance.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        weights (list): Weights for subspace, CORAL, and scaling methods
    
    Returns:
        np.ndarray: Transformed source features
    """
    if weights is None:
        weights = ENSEMBLE_WEIGHTS  # [0.4, 0.4, 0.2] by default
    
    # Apply multiple adaptation methods
    try:
        # 1. Subspace alignment (with safer implementation)
        try:
            n_comp = min(source_features.shape[1], target_features.shape[1], 
                        min(source_features.shape[0], target_features.shape[0]) - 1) // 2
            n_comp = max(2, min(5, n_comp))  # At least 2, at most 5 components
            adapted_subspace = subspace_alignment(source_features, target_features, n_comp)
        except Exception as e:
            print(f"Subspace alignment in ensemble failed: {e}")
            adapted_subspace = source_features
        
        # 2. CORAL transformation
        try:
            adapted_coral = coral_transform(source_features, target_features)
        except Exception as e:
            print(f"CORAL in ensemble failed: {e}")
            adapted_coral = source_features
        
        # 3. Simple standardization to match distributions
        scaler = StandardScaler()
        scaler.fit(target_features)
        adapted_scaled = scaler.transform(source_features)
        
        # Normalize weights
        weights = np.array(weights) / sum(weights)
        
        # Combine adaptations
        adapted_ensemble = (
            weights[0] * adapted_subspace + 
            weights[1] * adapted_coral + 
            weights[2] * adapted_scaled
        )
        
        return adapted_ensemble
    except Exception as e:
        print(f"Ensemble adaptation failed: {e}, using simple standardization")
        # Fall back to simple standardization
        scaler = StandardScaler()
        scaler.fit(target_features)
        return scaler.transform(source_features)


def measure_domain_gap(source_features, target_features, transformed_features=None):
    """
    Measure the domain gap before and after adaptation.
    
    Args:
        source_features (np.ndarray): Original source features
        target_features (np.ndarray): Target features
        transformed_features (np.ndarray): Transformed source features
    
    Returns:
        dict: Gap measurements
    """
    # Calculate domain gap before adaptation
    gap_before = calculate_domain_discrepancy(source_features, target_features)
    
    # If transformed features are provided, calculate gap after adaptation
    if transformed_features is not None:
        gap_after = calculate_domain_discrepancy(transformed_features, target_features)
        gap_reduction = 1.0 - (gap_after / gap_before) if gap_before > 0 else 0.0
    else:
        gap_after = None
        gap_reduction = None
    
    return {
        'gap_before': gap_before,
        'gap_after': gap_after,
        'gap_reduction': gap_reduction,
        'gap_reduction_percent': gap_reduction * 100.0 if gap_reduction is not None else None
    }


def optimize_adaptation_weights(source_features, target_features, weight_grid=None):
    """
    Find optimal weights for ensemble adaptation using grid search.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        weight_grid (list): List of weight combinations to try
    
    Returns:
        tuple: (optimal_weights, gap_reduction)
    """
    if weight_grid is None:
        # Default weight grid for [subspace, coral, scaling]
        weight_grid = [
            [0.8, 0.1, 0.1],
            [0.1, 0.8, 0.1],
            [0.1, 0.1, 0.8],
            [0.4, 0.4, 0.2],
            [0.33, 0.33, 0.34],
            [0.6, 0.2, 0.2],
            [0.2, 0.6, 0.2]
        ]
    
    best_reduction = 0.0
    best_weights = [0.33, 0.33, 0.34]  # Default equal weights
    
    for weights in weight_grid:
        # Apply adaptation with these weights
        try:
            adapted = ensemble_domain_adaptation(source_features, target_features, weights)
            
            # Measure gap reduction
            gap_info = measure_domain_gap(source_features, target_features, adapted)
            reduction = gap_info['gap_reduction']
            
            # Update if better
            if reduction is not None and reduction > best_reduction:
                best_reduction = reduction
                best_weights = weights
        except Exception:
            continue
    
    return best_weights, best_reduction
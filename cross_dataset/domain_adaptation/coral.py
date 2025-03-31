"""
CORAL (CORrelation ALignment) domain adaptation method.
"""

import numpy as np
import scipy
from cross_dataset.config import CORAL_REG_PARAM


def coral_transform(source_features, target_features, reg_param=CORAL_REG_PARAM):
    """
    Apply CORAL transformation to align source features with target domain.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        reg_param (float): Regularization parameter
    
    Returns:
        np.ndarray: Transformed source features
    """
    try:
        # Center the data
        source_mean = np.mean(source_features, axis=0)
        target_mean = np.mean(target_features, axis=0)
        source_centered = source_features - source_mean
        target_centered = target_features - target_mean
        
        # Calculate covariance matrices with regularization
        source_cov = np.cov(source_centered, rowvar=False) + np.eye(source_centered.shape[1]) * reg_param
        target_cov = np.cov(target_centered, rowvar=False) + np.eye(target_centered.shape[1]) * reg_param
        
        # Compute transformation matrix
        source_cov_sqrt = scipy.linalg.sqrtm(source_cov)
        source_cov_inv_sqrt = scipy.linalg.inv(source_cov_sqrt)
        target_cov_sqrt = scipy.linalg.sqrtm(target_cov)
        
        # Ensure no complex numbers in the transformation
        transform = np.real(np.dot(np.dot(source_cov_inv_sqrt, target_cov_sqrt), source_cov_inv_sqrt))
        
        # Apply transformation and add target mean
        transformed = np.dot(source_centered, transform) + target_mean
        return transformed
    
    except Exception as e:
        print(f"CORAL transform failed: {e}")
        return source_features  # Return original features on failure


def calculate_domain_discrepancy(source_features, target_features):
    """
    Calculate domain discrepancy between source and target domains.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
    
    Returns:
        float: Domain discrepancy measure
    """
    # Calculate mean discrepancy
    source_mean = np.mean(source_features, axis=0)
    target_mean = np.mean(target_features, axis=0)
    mean_discrepancy = np.linalg.norm(source_mean - target_mean)
    
    return mean_discrepancy


def calculate_coral_improvement(source_features, target_features, coral_transformed):
    """
    Calculate improvement in domain alignment after CORAL transformation.
    
    Args:
        source_features (np.ndarray): Original source domain features
        target_features (np.ndarray): Target domain features
        coral_transformed (np.ndarray): CORAL-transformed source features
    
    Returns:
        dict: Metrics of improvement
    """
    # Calculate discrepancy before and after transformation
    discrepancy_before = calculate_domain_discrepancy(source_features, target_features)
    discrepancy_after = calculate_domain_discrepancy(coral_transformed, target_features)
    
    # Calculate improvement
    improvement = 1.0 - (discrepancy_after / discrepancy_before) if discrepancy_before > 0 else 0.0
    
    return {
        'discrepancy_before': discrepancy_before,
        'discrepancy_after': discrepancy_after,
        'improvement': improvement,
        'improvement_percent': improvement * 100.0
    }
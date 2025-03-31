"""
Subspace alignment domain adaptation method.
"""

import numpy as np
from sklearn.decomposition import PCA
from cross_dataset.config import SUBSPACE_MIN_COMPONENTS


def subspace_alignment(source_features, target_features, n_components=None):
    """
    Apply subspace alignment to align source features with target domain.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        n_components (int): Number of components to use
    
    Returns:
        np.ndarray: Transformed source features
    """
    # Determine number of components if not specified
    if n_components is None:
        n_components = min(source_features.shape[1] // 2 + 1, 
                         min(source_features.shape[0], target_features.shape[0]) - 1)
        n_components = max(n_components, SUBSPACE_MIN_COMPONENTS)  # At least 2 components
    
    # Make sure n_components is valid
    n_components = min(n_components, 
                     min(source_features.shape[1], target_features.shape[1]), 
                     min(source_features.shape[0], target_features.shape[0]) - 1)
    
    try:
        # Learn source subspace
        source_pca = PCA(n_components=n_components)
        source_pca.fit(source_features)
        Xs = source_pca.transform(source_features)
        source_components = source_pca.components_
        
        # Learn target subspace
        target_pca = PCA(n_components=n_components)
        target_pca.fit(target_features)
        target_components = target_pca.components_
        
        # Transform source components to target subspace
        transform_matrix = np.dot(source_components, target_components.T)
        
        # Apply transformation - align source features to target domain
        Xs_aligned = np.dot(Xs, transform_matrix)
        
        # Project back to original feature space using target components
        aligned_features = np.dot(Xs_aligned, target_components)
        
        return aligned_features
    except Exception as e:
        print(f"Subspace alignment failed: {e}")
        return source_features  # Return original features on failure


def calculate_subspace_error(source_features, target_features, n_components=None):
    """
    Calculate the subspace alignment error between domains.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        n_components (int): Number of components to use
    
    Returns:
        float: Subspace alignment error
    """
    # Determine number of components
    if n_components is None:
        n_components = min(source_features.shape[1] // 2 + 1, 
                         min(source_features.shape[0], target_features.shape[0]) - 1)
        n_components = max(n_components, SUBSPACE_MIN_COMPONENTS)
    
    try:
        # Learn source subspace
        source_pca = PCA(n_components=n_components)
        source_pca.fit(source_features)
        source_components = source_pca.components_
        
        # Learn target subspace
        target_pca = PCA(n_components=n_components)
        target_pca.fit(target_features)
        target_components = target_pca.components_
        
        # Calculate Frobenius norm between subspaces
        alignment_error = np.linalg.norm(np.dot(source_components, source_components.T) - 
                                       np.dot(target_components, target_components.T), 'fro')
        
        return alignment_error
    except Exception as e:
        print(f"Error calculating subspace error: {e}")
        return float('inf')


def analyze_subspace_similarity(source_features, target_features, n_components_range=None):
    """
    Analyze subspace similarity across different numbers of components.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        n_components_range (list): List of number of components to try
    
    Returns:
        dict: Analysis results
    """
    if n_components_range is None:
        max_components = min(source_features.shape[1], target_features.shape[1], 
                           min(source_features.shape[0], target_features.shape[0]) - 1)
        n_components_range = range(2, min(10, max_components))
    
    results = {}
    
    for n in n_components_range:
        error = calculate_subspace_error(source_features, target_features, n)
        results[n] = error
    
    # Find optimal number of components
    optimal_n = min(results, key=results.get)
    
    return {
        'errors': results,
        'optimal_n': optimal_n,
        'optimal_error': results[optimal_n]
    }
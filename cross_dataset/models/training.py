"""
Model training functions for cross-dataset emotion recognition.
"""

import numpy as np
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.svm import SVC

from .balancing import apply_class_balancing, create_sample_weights
from cross_dataset.domain_adaptation.ensemble import ensemble_domain_adaptation, measure_domain_gap
from cross_dataset.config import (
    RF_N_ESTIMATORS, 
    RF_MAX_DEPTH,
    GB_N_ESTIMATORS,
    GB_MAX_DEPTH,
    GB_LEARNING_RATE,
    SVM_C,
    SVM_KERNEL,
    ENSEMBLE_MODEL_WEIGHTS
)


def create_model_ensemble():
    """
    Create an ensemble of models for robust prediction.
    
    Returns:
        VotingClassifier: Ensemble model
    """
    # Random Forest
    rf = RandomForestClassifier(
        n_estimators=RF_N_ESTIMATORS, 
        max_depth=RF_MAX_DEPTH, 
        random_state=42, 
        class_weight='balanced'
    )
    
    # Gradient Boosting
    gb = GradientBoostingClassifier(
        n_estimators=GB_N_ESTIMATORS, 
        max_depth=GB_MAX_DEPTH, 
        learning_rate=GB_LEARNING_RATE, 
        random_state=42
    )
    
    # Support Vector Machine
    svm = SVC(
        kernel=SVM_KERNEL, 
        probability=True, 
        C=SVM_C, 
        random_state=42,
        class_weight='balanced'
    )
    
    # Create voting ensemble
    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('gb', gb), ('svm', svm)],
        voting='soft',
        weights=ENSEMBLE_MODEL_WEIGHTS
    )
    
    return ensemble


def train_cross_dataset_model(wesad_X, wesad_y, kemocon_X, kemocon_y, adaptation_method='ensemble'):
    """
    Train a model for cross-dataset prediction (WESAD → K-EmoCon).
    
    Args:
        wesad_X (np.ndarray): WESAD features
        wesad_y (np.ndarray): WESAD target labels
        kemocon_X (np.ndarray): K-EmoCon features
        kemocon_y (np.ndarray): K-EmoCon target labels
        adaptation_method (str): Domain adaptation method
    
    Returns:
        tuple: (model, scaler, info)
    """
    print("\nTraining WESAD → K-EmoCon model with balanced classes:")
    
    # Balance classes if needed
    wesad_X_balanced, wesad_y_balanced = apply_class_balancing(wesad_X, wesad_y)
    
    # Scale features with robust scaler for better handling of outliers
    scaler = RobustScaler()
    wesad_X_scaled = scaler.fit_transform(wesad_X_balanced)
    kemocon_X_scaled = scaler.transform(kemocon_X)
    
    # Initialize variables for adaptation
    wesad_adapted = None
    gap_info = None
    
    # Apply domain adaptation if specified
    if adaptation_method:
        print(f"Applying {adaptation_method} domain adaptation...")
        
        if adaptation_method == 'ensemble':
            # Apply ensemble adaptation
            wesad_adapted = ensemble_domain_adaptation(wesad_X_scaled, kemocon_X_scaled)
            
            # Measure domain gap reduction
            gap_info = measure_domain_gap(wesad_X_scaled, kemocon_X_scaled, wesad_adapted)
            
            print(f"Domain gap before adaptation: {gap_info['gap_before']:.4f}")
            print(f"Domain gap after adaptation: {gap_info['gap_after']:.4f}")
            print(f"Gap reduction: {gap_info['gap_reduction_percent']:.2f}%")
            
            # Use adapted features for training
            wesad_X_train = wesad_adapted
        else:
            print(f"Unknown adaptation method: {adaptation_method}")
            wesad_X_train = wesad_X_scaled
            wesad_adapted = wesad_X_scaled  # Set adapted to scaled if no adaptation
    else:
        wesad_X_train = wesad_X_scaled
        wesad_adapted = wesad_X_scaled  # Set adapted to scaled if no adaptation
    
    # Create and train ensemble model
    ensemble = create_model_ensemble()
    
    # Create sample weights for GB
    sample_weights = create_sample_weights(wesad_y_balanced)
    
    # Train ensemble
    ensemble.fit(wesad_X_train, wesad_y_balanced)
    
    # Also train GB with sample weights
    ensemble.named_estimators_['gb'].fit(
        wesad_X_train, wesad_y_balanced, sample_weight=sample_weights)
    
    # Return trained model and additional info
    info = {
        'adaptation_method': adaptation_method,
        'gap_reduction': gap_info['gap_reduction_percent'] if gap_info else None,
        'gap_before': gap_info['gap_before'] if gap_info else None,
        'gap_after': gap_info['gap_after'] if gap_info else None,
        'class_distribution': np.bincount(wesad_y_balanced),
        'original_distribution': np.bincount(wesad_y),
        'adapted_features': wesad_adapted,  # Store adapted features
        'original_features': wesad_X_scaled,  # Store original scaled features
        'target_features': kemocon_X_scaled  # Store target features
    }
    
    return ensemble, scaler, info


def train_reverse_model(kemocon_X, kemocon_y, wesad_X, wesad_y, adaptation_method='ensemble'):
    """
    Train a model for reverse cross-dataset prediction (K-EmoCon → WESAD).
    
    Args:
        kemocon_X (np.ndarray): K-EmoCon features
        kemocon_y (np.ndarray): K-EmoCon target labels
        wesad_X (np.ndarray): WESAD features
        wesad_y (np.ndarray): WESAD target labels
        adaptation_method (str): Domain adaptation method
    
    Returns:
        tuple: (model, scaler, info)
    """
    print("\nTraining K-EmoCon → WESAD model with balanced classes:")
    
    # Balance classes if needed
    kemocon_X_balanced, kemocon_y_balanced = apply_class_balancing(kemocon_X, kemocon_y)
    
    # Scale features with robust scaler
    scaler = RobustScaler()
    kemocon_X_scaled = scaler.fit_transform(kemocon_X_balanced)
    wesad_X_scaled = scaler.transform(wesad_X)
    
    # Initialize variables for adaptation
    kemocon_adapted = None
    gap_info = None
    
    # Apply domain adaptation if specified
    if adaptation_method:
        print(f"Applying {adaptation_method} domain adaptation...")
        
        if adaptation_method == 'ensemble':
            # Apply ensemble adaptation
            kemocon_adapted = ensemble_domain_adaptation(kemocon_X_scaled, wesad_X_scaled)
            
            # Measure domain gap reduction
            gap_info = measure_domain_gap(kemocon_X_scaled, wesad_X_scaled, kemocon_adapted)
            
            print(f"Domain gap before adaptation: {gap_info['gap_before']:.4f}")
            print(f"Domain gap after adaptation: {gap_info['gap_after']:.4f}")
            print(f"Gap reduction: {gap_info['gap_reduction_percent']:.2f}%")
            
            # Use adapted features for training
            kemocon_X_train = kemocon_adapted
        else:
            print(f"Unknown adaptation method: {adaptation_method}")
            kemocon_X_train = kemocon_X_scaled
            kemocon_adapted = kemocon_X_scaled  # Set adapted to scaled if no adaptation
    else:
        kemocon_X_train = kemocon_X_scaled
        kemocon_adapted = kemocon_X_scaled  # Set adapted to scaled if no adaptation
    
    # Create and train ensemble model
    ensemble = create_model_ensemble()
    
    # Create sample weights for GB
    sample_weights = create_sample_weights(kemocon_y_balanced)
    
    # Train ensemble
    ensemble.fit(kemocon_X_train, kemocon_y_balanced)
    
    # Also train GB with sample weights
    ensemble.named_estimators_['gb'].fit(
        kemocon_X_train, kemocon_y_balanced, sample_weight=sample_weights)
    
    # Return trained model and additional info
    info = {
        'adaptation_method': adaptation_method,
        'gap_reduction': gap_info['gap_reduction_percent'] if gap_info else None,
        'gap_before': gap_info['gap_before'] if gap_info else None,
        'gap_after': gap_info['gap_after'] if gap_info else None,
        'class_distribution': np.bincount(kemocon_y_balanced),
        'original_distribution': np.bincount(kemocon_y),
        'adapted_features': kemocon_adapted,  # Store adapted features
        'original_features': kemocon_X_scaled,  # Store original scaled features
        'target_features': wesad_X_scaled  # Store target features
    }
    
    return ensemble, scaler, info


def train_bidirectional_models(wesad_X, wesad_y, kemocon_X, kemocon_y, adaptation_method='ensemble'):
    """
    Train models for bidirectional cross-dataset prediction.
    
    Args:
        wesad_X (np.ndarray): WESAD features
        wesad_y (np.ndarray): WESAD target labels
        kemocon_X (np.ndarray): K-EmoCon features
        kemocon_y (np.ndarray): K-EmoCon target labels
        adaptation_method (str): Domain adaptation method
    
    Returns:
        dict: Dictionary with trained models and information
    """
    # Train WESAD → K-EmoCon model
    w2k_model, w2k_scaler, w2k_info = train_cross_dataset_model(
        wesad_X, wesad_y, kemocon_X, kemocon_y, adaptation_method)
    
    # Train K-EmoCon → WESAD model
    k2w_model, k2w_scaler, k2w_info = train_reverse_model(
        kemocon_X, kemocon_y, wesad_X, wesad_y, adaptation_method)
    
    # Return results
    return {
        'wesad_to_kemocon': {
            'model': w2k_model,
            'scaler': w2k_scaler,
            'info': w2k_info
        },
        'kemocon_to_wesad': {
            'model': k2w_model,
            'scaler': k2w_scaler,
            'info': k2w_info
        }
    }
"""
Feature mapping functions for cross-dataset emotion recognition.
"""

import pandas as pd
import numpy as np
from sklearn.feature_selection import mutual_info_classif


# Default emotion mapping for WESAD (refined for better alignment)
DEFAULT_EMOTION_MAP = {
    1: {"arousal": 2.5, "valence": 3.1},  # Baseline - slightly increased valence
    2: {"arousal": 4.5, "valence": 1.5},  # Stress - lower valence for better separation
    3: {"arousal": 4.2, "valence": 4.2},  # Amusement - higher arousal and valence
    4: {"arousal": 1.6, "valence": 3.8}   # Meditation - slightly higher arousal
}

# Extended feature mapping with physiological features
DEFAULT_FEATURE_MAPPING = {
    # Core features - directly mapped
    'ECG_mean': 'HR_mean',
    'ECG_std': 'HR_std',
    'ECG_min': 'HR_min',
    'ECG_max': 'HR_max',
    'ECG_range': 'HR_range',
    'EDA_mean': 'EDA_mean',
    'EDA_std': 'EDA_std',
    'EDA_min': 'EDA_min',
    'EDA_max': 'EDA_max',
    'EDA_range': 'EDA_range',
    'TEMP_mean': 'TEMP_mean',
    'TEMP_std': 'TEMP_std',
    'TEMP_min': 'TEMP_min',
    'TEMP_max': 'TEMP_max',
    'TEMP_range': 'TEMP_range',
    
    # Advanced features
    'ECG_slope': 'HR_slope',
    'ECG_energy': 'HR_energy',
    'ECG_entropy': 'HR_entropy', 
    'ECG_kurtosis': 'HR_kurtosis',
    'ECG_skewness': 'HR_skewness',
    'EDA_slope': 'EDA_slope',
    'EDA_energy': 'EDA_energy',
    'EDA_entropy': 'EDA_entropy',
    'EDA_kurtosis': 'EDA_kurtosis',
    'EDA_skewness': 'EDA_skewness',
    'TEMP_slope': 'TEMP_slope',
    'TEMP_energy': 'TEMP_energy',
    'TEMP_entropy': 'TEMP_entropy',
    'TEMP_kurtosis': 'TEMP_kurtosis',
    'TEMP_skewness': 'TEMP_skewness',
    
    # Frequency domain features
    'ECG_low_freq_power': 'HR_low_freq_power',
    'ECG_high_freq_power': 'HR_high_freq_power',
    'ECG_lf_hf_ratio': 'HR_lf_hf_ratio',
    'ECG_wavelet_approx_energy': 'HR_wavelet_approx_energy',
    'ECG_wavelet_detail1_energy': 'HR_wavelet_detail1_energy',
    'EDA_low_freq_power': 'EDA_low_freq_power',
    'EDA_high_freq_power': 'EDA_high_freq_power',
    'EDA_lf_hf_ratio': 'EDA_lf_hf_ratio',
    'EDA_wavelet_approx_energy': 'EDA_wavelet_approx_energy',
    'EDA_wavelet_detail1_energy': 'EDA_wavelet_detail1_energy',
}


def map_features(wesad_df, kemocon_df, feature_mapping=None, use_mutual_info=True, target='arousal', top_n=25):
    """
    Map features between WESAD and K-EmoCon datasets.
    
    Args:
        wesad_df (pd.DataFrame): WESAD dataset
        kemocon_df (pd.DataFrame): K-EmoCon dataset
        feature_mapping (dict): Mapping between WESAD and K-EmoCon features
        use_mutual_info (bool): Whether to use mutual information for feature selection
        target (str): Target variable for mutual information calculation
        top_n (int): Number of top features to select
    
    Returns:
        tuple: (wesad_features, kemocon_features) - Lists of selected feature names
    """
    if wesad_df is None or kemocon_df is None:
        print("Both datasets must be provided")
        return [], []
    
    # Use default mapping if not provided
    if feature_mapping is None:
        feature_mapping = DEFAULT_FEATURE_MAPPING
    
    # Initialize with features from mapping that exist in both datasets
    common_candidates = []
    
    for wesad_name, kemocon_name in feature_mapping.items():
        if wesad_name in wesad_df.columns and kemocon_name in kemocon_df.columns:
            common_candidates.append((wesad_name, kemocon_name))
    
    # Filter features based on data quality
    qualified_features = []
    for wesad_name, kemocon_name in common_candidates:
        # Skip features with too many missing values
        if (wesad_df[wesad_name].isna().sum() > 0.1 * len(wesad_df) or
            kemocon_df[kemocon_name].isna().sum() > 0.1 * len(kemocon_df)):
            continue
            
        # Skip features with all constant values
        if (wesad_df[wesad_name].std() < 1e-6 or
            kemocon_df[kemocon_name].std() < 1e-6):
            continue
        
        qualified_features.append((wesad_name, kemocon_name))
    
    if use_mutual_info and target in wesad_df.columns and target in kemocon_df.columns:
        # Compute mutual information for WESAD features
        wesad_mi = {}
        # Create binary target for mutual info (above/below median)
        wesad_target = (wesad_df[target] > wesad_df[target].median()).astype(int)
        
        for wesad_name, _ in qualified_features:
            try:
                mi = mutual_info_classif(
                    wesad_df[wesad_name].values.reshape(-1, 1), 
                    wesad_target,
                    random_state=42
                )[0]
                wesad_mi[wesad_name] = mi
            except Exception:
                wesad_mi[wesad_name] = 0
        
        # Compute mutual information for K-EmoCon features
        kemocon_mi = {}
        kemocon_target = (kemocon_df[target] > kemocon_df[target].median()).astype(int)
        
        for _, kemocon_name in qualified_features:
            try:
                mi = mutual_info_classif(
                    kemocon_df[kemocon_name].values.reshape(-1, 1), 
                    kemocon_target,
                    random_state=42
                )[0]
                kemocon_mi[kemocon_name] = mi
            except Exception:
                kemocon_mi[kemocon_name] = 0
        
        # Combine scores and select top features
        feature_scores = []
        for wesad_name, kemocon_name in qualified_features:
            combined_score = wesad_mi.get(wesad_name, 0) + kemocon_mi.get(kemocon_name, 0)
            feature_scores.append((wesad_name, kemocon_name, combined_score))
        
        # Sort by combined score and select top features
        feature_scores.sort(key=lambda x: x[2], reverse=True)
        
        # Take top N features or all if less
        top_n = min(top_n, len(feature_scores))
        selected_features = feature_scores[:top_n]
        
        # Print top features with scores
        print(f"\nTop features by mutual information for {target}")
        for wesad_name, kemocon_name, score in selected_features[:10]:
            print(f"  {wesad_name}/{kemocon_name}: {score:.4f}")
        
        # Extract feature names
        wesad_features = [f[0] for f in selected_features]
        kemocon_features = [f[1] for f in selected_features]
    else:
        # Use all qualified features if not using mutual information
        wesad_features = [f[0] for f in qualified_features]
        kemocon_features = [f[1] for f in qualified_features]
    
    print(f"Selected {len(wesad_features)} common features between datasets")
    return wesad_features, kemocon_features


def create_mapped_dataframes(wesad_df, kemocon_df, wesad_features, kemocon_features):
    """
    Create new dataframes with only the mapped features.
    
    Args:
        wesad_df (pd.DataFrame): WESAD dataset
        kemocon_df (pd.DataFrame): K-EmoCon dataset
        wesad_features (list): List of WESAD feature names
        kemocon_features (list): List of K-EmoCon feature names
    
    Returns:
        tuple: (wesad_mapped_df, kemocon_mapped_df) - DataFrames with mapped features
    """
    # Create copies with only the target features and metadata
    metadata_cols = ['subject_id', 'participant_id', 'dataset', 'arousal', 'valence', 'label']
    
    # Select columns that exist in the dataframes
    wesad_meta = [col for col in metadata_cols if col in wesad_df.columns]
    kemocon_meta = [col for col in metadata_cols if col in kemocon_df.columns]
    
    # Create new dataframes
    wesad_mapped_df = wesad_df[wesad_meta + wesad_features].copy()
    kemocon_mapped_df = kemocon_df[kemocon_meta + kemocon_features].copy()
    
    return wesad_mapped_df, kemocon_mapped_df


def convert_to_binary_targets(wesad_df, kemocon_df, target='arousal'):
    """
    Convert target variables to binary classification targets.
    
    Args:
        wesad_df (pd.DataFrame): WESAD dataset
        kemocon_df (pd.DataFrame): K-EmoCon dataset
        target (str): Target variable ('arousal' or 'valence')
    
    Returns:
        tuple: (wesad_y, kemocon_y) - Binary target variables
    """
    if target not in wesad_df.columns or target not in kemocon_df.columns:
        print(f"Target variable '{target}' not found in both datasets")
        return None, None
    
    # Convert to binary classification using median thresholds
    wesad_threshold = wesad_df[target].median()
    kemocon_threshold = kemocon_df[target].median()
    
    wesad_y = (wesad_df[target] > wesad_threshold).astype(int)
    kemocon_y = (kemocon_df[target] > kemocon_threshold).astype(int)
    
    # Report class distribution
    print(f"WESAD {target} distribution: {np.bincount(wesad_y)}")
    print(f"K-EmoCon {target} distribution: {np.bincount(kemocon_y)}")
    
    return wesad_y, kemocon_y
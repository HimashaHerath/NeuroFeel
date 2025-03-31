"""
Feature selection utilities.
"""

import numpy as np
import pandas as pd
from sklearn.feature_selection import mutual_info_classif


def select_best_features(all_features_df, scaler, n_features=20):
    """
    Select best features using mutual information.
    
    Args:
        all_features_df (pd.DataFrame): DataFrame with all features
        scaler (sklearn.preprocessing.StandardScaler): Already fitted scaler
        n_features (int): Number of features to select
    
    Returns:
        list: List of selected feature names
    """
    print("Selecting best features...")
    
    # Get feature names (exclude metadata and label)
    metadata_cols = ['subject_id', 'segment_id', 'timestamp', 'label']
    feature_cols = [col for col in all_features_df.columns if col not in metadata_cols]
    
    # Extract features and labels
    X = all_features_df[feature_cols].values
    y = all_features_df['label'].values
    
    # Use the already fitted scaler to transform the data
    X_scaled = scaler.transform(X)
    
    # Calculate mutual information for feature selection
    mi_scores = mutual_info_classif(X_scaled, y, random_state=42)
    
    # Create feature ranking
    feature_ranking = [(feature, score) for feature, score in zip(feature_cols, mi_scores)]
    feature_ranking.sort(key=lambda x: x[1], reverse=True)
    
    # Select top features
    selected_features = [feature for feature, _ in feature_ranking[:n_features]]
    
    print(f"Selected {len(selected_features)} best features:")
    for i, (feature, score) in enumerate(feature_ranking[:n_features]):
        print(f"  {i+1}. {feature}: MI = {score:.4f}")
    
    return selected_features


def identify_subject_important_features(subject_data, global_features):
    """
    Identify most discriminative features for a specific subject.
    
    Args:
        subject_data (pd.DataFrame): DataFrame with subject features
        global_features (list): List of global feature names
    
    Returns:
        list: List of feature rankings for this subject
    """
    subject_id = subject_data['subject_id'].iloc[0]
    print(f"  Identifying important features for S{subject_id}...")
    
    # Extract features and labels
    X = subject_data[global_features].values
    y = subject_data['label'].values
    
    # Calculate mutual information for this subject
    mi_scores = mutual_info_classif(X, y, random_state=42)
    
    # Create feature ranking
    feature_ranking = [(feature, score) for feature, score in zip(global_features, mi_scores)]
    feature_ranking.sort(key=lambda x: x[1], reverse=True)
    
    print(f"  Top 5 important features for S{subject_id}:")
    for i, (feature, score) in enumerate(feature_ranking[:5]):
        print(f"    {i+1}. {feature}: MI = {score:.4f}")
    
    # Return feature rankings
    return feature_ranking
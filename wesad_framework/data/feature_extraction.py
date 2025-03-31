"""
Feature extraction utilities for physiological signals.
"""

import numpy as np
import pandas as pd


def extract_features(subject_data, segment_length=8400, overlap=4200):
    """
    Extract features from subject data.
    
    Args:
        subject_data (dict): Subject data dictionary
        segment_length (int): Length of each segment in samples
        overlap (int): Overlap between segments in samples
    
    Returns:
        pd.DataFrame: DataFrame with extracted features
    """
    # Get labels and signals
    labels = subject_data['label']
    chest_signals = subject_data['signal']['chest']
    wrist_signals = subject_data['signal']['wrist']
    subject_id = subject_data['subject']
    
    # Initialize lists to store segments and their labels
    segments = []
    segment_labels = []
    segment_ids = []  # For tracking segments
    segment_timestamps = []  # For ensuring temporal separation
    
    # Process only the relevant emotional states (1: Baseline, 2: Stress, 3: Amusement, 4: Meditation)
    valid_states = [1, 2, 3, 4]
    
    # Iterate through the data with sliding window
    i = 0
    segment_counter = 0
    while i + segment_length <= len(labels):
        # Get labels for the current segment
        segment_label_values = labels[i:i+segment_length]
        
        # Check if this segment belongs to a single valid emotional state
        unique_labels = np.unique(segment_label_values)
        if len(unique_labels) == 1 and unique_labels[0] in valid_states:
            # Extract features for the current segment
            segment_features = {}
            
            # Add subject ID and temporal information
            segment_features['subject_id'] = subject_id
            segment_features['segment_id'] = f"S{subject_id}_{segment_counter}"
            segment_features['timestamp'] = i  # Store position in the recording
            
            # ECG features (highest importance from our model)
            ecg_data = chest_signals['ECG'][i:i+segment_length].flatten()
            segment_features = extract_signal_features(ecg_data, 'chest_ecg', segment_features)
            
            # EMG features (second highest importance from our model)
            emg_data = chest_signals['EMG'][i:i+segment_length].flatten()
            segment_features = extract_signal_features(emg_data, 'chest_emg', segment_features)
            
            # Respiration features
            resp_data = chest_signals['Resp'][i:i+segment_length].flatten()
            segment_features = extract_signal_features(resp_data, 'chest_resp', segment_features)
            
            # Add the segment to our dataset
            segments.append(segment_features)
            segment_labels.append(unique_labels[0])
            segment_ids.append(segment_features['segment_id'])
            segment_timestamps.append(i)
            
            segment_counter += 1
        
        # Move to the next segment with overlap
        i += segment_length - overlap
    
    # Convert to DataFrame
    features_df = pd.DataFrame(segments)
    features_df['label'] = segment_labels
    
    # Handle any NaN values
    features_df = features_df.fillna(0)
    
    return features_df


def extract_signal_features(signal_data, prefix, features_dict):
    """
    Extract features from a single physiological signal.
    
    Args:
        signal_data (np.array): 1D array of signal data
        prefix (str): Prefix for feature names
        features_dict (dict): Dictionary to add features to
    
    Returns:
        dict: Updated features dictionary
    """
    # Statistical features
    features_dict[f'{prefix}_mean'] = np.mean(signal_data)
    features_dict[f'{prefix}_std'] = np.std(signal_data)
    features_dict[f'{prefix}_min'] = np.min(signal_data)
    features_dict[f'{prefix}_max'] = np.max(signal_data)
    features_dict[f'{prefix}_range'] = np.max(signal_data) - np.min(signal_data)
    features_dict[f'{prefix}_median'] = np.median(signal_data)
    features_dict[f'{prefix}_iqr'] = np.percentile(signal_data, 75) - np.percentile(signal_data, 25)
    
    # Temporal features
    features_dict[f'{prefix}_mean_diff'] = np.mean(np.abs(np.diff(signal_data)))
    
    # Energy features
    features_dict[f'{prefix}_energy'] = np.sum(signal_data**2) / len(signal_data)
    
    return features_dict
"""
WESAD dataset loading and preprocessing functions.
"""

import os
import pickle
import numpy as np
import pandas as pd
from scipy import signal

from ..config import WESAD_PATH, SEGMENT_SIZE


def load_subject_data(subject_id):
    """
    Load and validate WESAD subject data.
    
    Args:
        subject_id (int): Subject ID to load
        
    Returns:
        dict: Subject data or None if not found/error
    """
    file_path = os.path.join(WESAD_PATH, f'S{subject_id}', f'S{subject_id}.pkl')
    if not os.path.exists(file_path):
        print(f"Data for subject S{subject_id} not found")
        return None
    
    try:
        with open(file_path, 'rb') as f:
            data = pickle.load(f, encoding='latin1')
        print(f"Loaded WESAD subject S{subject_id}")
        return data
    except Exception as e:
        print(f"Error loading subject S{subject_id}: {e}")
        return None


def process_wesad_data(subject_ids, extract_features_func, emotion_map, segment_size=SEGMENT_SIZE):
    """
    Process WESAD subjects with enhanced feature extraction.
    
    Args:
        subject_ids (list): List of subject IDs to process
        extract_features_func (callable): Function to extract features from signals
        emotion_map (dict): Mapping from WESAD emotion labels to arousal-valence
        segment_size (int): Window size in seconds
    
    Returns:
        pd.DataFrame: Processed data or None if error
    """
    all_samples = []
    
    for subject_id in subject_ids:
        subject_data = load_subject_data(subject_id)
        if subject_data is None:
            continue
        
        print(f"Processing WESAD subject S{subject_id}...")
        
        # Extract data
        labels = subject_data['label']
        chest_signals = subject_data['signal']['chest']
        sampling_rate = subject_data.get('sampling_rate', 700)
        
        # Calculate segment length and stride based on sampling rate
        segment_length = int(segment_size * sampling_rate)
        stride = segment_length // 2  # 50% overlap
        
        for i in range(0, len(labels) - segment_length, stride):
            segment_labels = labels[i:i+segment_length]
            unique_labels = np.unique(segment_labels)
            
            # Only process segments with a single valid emotion label
            if len(unique_labels) == 1 and unique_labels[0] in [1, 2, 3, 4]:
                emotion_label = unique_labels[0]
                
                # Initialize feature dictionary with metadata
                features = {
                    'subject_id': subject_id,
                    'label': emotion_label,
                    'dataset': 'WESAD',
                    'arousal': emotion_map[emotion_label]['arousal'],
                    'valence': emotion_map[emotion_label]['valence']
                }
                
                # Process signals with error handling
                try:
                    # Extract and downsample ECG
                    ecg = chest_signals['ECG'][i:i+segment_length]
                    ecg_downsampled = signal.resample(ecg, int(len(ecg) * 4 / sampling_rate))
                    
                    # Extract features
                    ecg_features = extract_features_func(ecg_downsampled, sampling_rate=4)
                    
                    # Add features to dictionary with ECG prefix
                    for name, value in ecg_features.items():
                        # Convert numpy arrays to scalar values
                        if isinstance(value, np.ndarray):
                            if value.size == 1:
                                features[f'ECG_{name}'] = float(value)
                            else:
                                features[f'ECG_{name}'] = float(value[0]) if value.size > 0 else 0.0
                        else:
                            features[f'ECG_{name}'] = value
                            
                    # Additional signals can be processed here (EMG, EDA, etc.)
                    
                except Exception as e:
                    print(f"Error processing signals: {e}")
                
                # Only add samples with sufficient features
                if len(features) > 5:  # More than just metadata fields
                    all_samples.append(features)
        
        # Progress report
        print(f"  Added {len(all_samples)} segments from subject {subject_id}")
    
    # Convert to DataFrame
    if not all_samples:
        print("No WESAD samples extracted")
        return None
    
    df = pd.DataFrame(all_samples)
    
    # Clean up data - replace NaN and infinite values with median
    for col in df.columns:
        if col not in ['subject_id', 'label', 'dataset', 'arousal', 'valence']:
            # Handle potential infinite values
            df[col] = df[col].replace([np.inf, -np.inf], np.nan)
            
            # Replace NaN with median values
            try:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
            except TypeError:
                print(f"Warning: Column {col} contains non-numeric values, using mode instead")
                mode_val = df[col].mode().iloc[0] if not df[col].mode().empty else 0
                df[col] = df[col].fillna(mode_val)
    
    print(f"Extracted {len(df)} WESAD samples with {len(df.columns)-5} features")
    return df


def get_available_subjects():
    """
    Get list of available subjects in the WESAD dataset.
    
    Returns:
        list: Available subject IDs
    """
    potential_subjects = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17]
    available_subjects = []
    
    for subject_id in potential_subjects:
        subject_dir = os.path.join(WESAD_PATH, f'S{subject_id}')
        if os.path.exists(subject_dir):
            available_subjects.append(subject_id)
    
    return available_subjects
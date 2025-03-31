"""
K-EmoCon dataset loading and preprocessing functions.
"""

import os
import pandas as pd
import numpy as np

from ..config import KEMOCON_PATH, SEGMENT_SIZE


def load_metadata(participant_id):
    """
    Load and validate K-EmoCon metadata.
    
    Args:
        participant_id (int): Participant ID to load
        
    Returns:
        pd.Series: Participant metadata or None if not found/error
    """
    file_path = os.path.join(KEMOCON_PATH, "metadata", "subjects.csv")
    if not os.path.exists(file_path):
        print(f"Metadata file not found: {file_path}")
        return None
    
    try:
        subjects = pd.read_csv(file_path)
        participant_data = subjects[subjects['pid'] == int(participant_id)]
        
        if len(participant_data) == 0:
            print(f"No metadata for participant {participant_id}")
            return None
        
        return participant_data.iloc[0]
    except Exception as e:
        print(f"Error loading metadata: {e}")
        return None


def load_annotations(participant_id):
    """
    Load self-annotations for a K-EmoCon participant.
    
    Args:
        participant_id (int): Participant ID to load
        
    Returns:
        pd.DataFrame: Annotations or None if not found/error
    """
    anno_path = os.path.join(KEMOCON_PATH, "emotion_annotations", 
                           "self_annotations", f"P{participant_id}.self.csv")
    
    if not os.path.exists(anno_path):
        print(f"No annotations found for participant {participant_id}")
        return None
    
    try:
        return pd.read_csv(anno_path)
    except Exception as e:
        print(f"Error loading annotations: {e}")
        return None


def load_physiological_data(participant_id):
    """
    Load physiological data for a K-EmoCon participant.
    
    Args:
        participant_id (int): Participant ID to load
        
    Returns:
        dict: Dictionary of signal dataframes or empty dict if error
    """
    signals = {}
    
    for signal_type in ['HR', 'EDA', 'BVP', 'TEMP']:
        file_path = os.path.join(KEMOCON_PATH, "e4_data", str(participant_id), 
                               f"E4_{signal_type}.csv")
        
        if os.path.exists(file_path):
            try:
                signals[signal_type] = pd.read_csv(file_path)
                print(f"  Loaded {len(signals[signal_type])} {signal_type} readings")
            except Exception as e:
                print(f"  Error loading {signal_type} data: {e}")
    
    return signals


def create_timestamp_mapping(metadata, annotations):
    """
    Create a function to map annotation times to debate timestamps.
    
    Args:
        metadata (pd.Series): Participant metadata
        annotations (pd.DataFrame): Participant annotations
    
    Returns:
        function: Function to convert annotation seconds to debate timestamp
    """
    debate_start = metadata['startTime']
    debate_end = metadata['endTime']
    anno_min = annotations['seconds'].min()
    anno_max = annotations['seconds'].max()
    
    def sec_to_ts(sec):
        # Map annotation seconds to debate timestamp
        norm_sec = (sec - anno_min) / (anno_max - anno_min)
        return debate_start + norm_sec * (debate_end - debate_start)
    
    return sec_to_ts


def process_kemocon_data(participant_ids, extract_features_func, window_size=SEGMENT_SIZE):
    """
    Process K-EmoCon participants with enhanced feature extraction.
    
    Args:
        participant_ids (list): List of participant IDs to process
        extract_features_func (callable): Function to extract features from signals
        window_size (int): Window size in seconds
    
    Returns:
        pd.DataFrame: Processed data or None if error
    """
    all_samples = []
    
    for pid in participant_ids:
        print(f"Processing K-EmoCon participant {pid}...")
        
        # Load metadata for timestamp mapping
        metadata = load_metadata(pid)
        if metadata is None:
            continue
        
        # Load annotations
        annotations = load_annotations(pid)
        if annotations is None:
            continue
        
        # Load physiological data
        signals = load_physiological_data(pid)
        if not signals:
            print(f"No physiological data for participant {pid}")
            continue
        
        # Create timestamp mapping function
        sec_to_ts = create_timestamp_mapping(metadata, annotations)
        
        # Convert window size to milliseconds
        window_ms = window_size * 1000
        
        # For each annotation, extract features
        for _, row in annotations.iterrows():
            features = {
                'participant_id': pid,
                'dataset': 'K-EmoCon',
                'arousal': row['arousal'],
                'valence': row['valence']
            }
            
            # Calculate timestamp
            timestamp = sec_to_ts(row['seconds'])
            
            # Extract physiological features
            has_features = False
            
            for signal_type, data in signals.items():
                # Get data in this time window
                window_start = timestamp - (window_ms / 2)
                window_end = timestamp + (window_ms / 2)
                
                signal_window = data[(data['timestamp'] >= window_start) & 
                                    (data['timestamp'] <= window_end)]
                
                if len(signal_window) > 3 and 'value' in signal_window.columns:
                    signal_values = signal_window['value'].values
                    
                    # Check for quality
                    if np.isnan(signal_values).any() or len(signal_values) < 4:
                        continue
                    
                    # Extract features
                    signal_features = extract_features_func(signal_values, sampling_rate=4)
                    
                    for name, value in signal_features.items():
                        features[f'{signal_type}_{name}'] = value
                    
                    has_features = True
            
            if has_features:
                all_samples.append(features)
    
    # Convert to DataFrame
    if not all_samples:
        print("No K-EmoCon samples extracted")
        return None
    
    df = pd.DataFrame(all_samples)
    
    # Remove samples with NaN or infinite values
    df = df.replace([np.inf, -np.inf], np.nan)
    df_clean = df.dropna()
    
    feature_count = len(df_clean.columns) - 4  # Subtract id, dataset, arousal, valence
    print(f"Extracted {len(df)} K-EmoCon samples, {len(df_clean)} after removing NaN values")
    print(f"Features extracted: {feature_count}")
    
    return df_clean


def get_available_participants():
    """
    Get list of available participants in the K-EmoCon dataset.
    
    Returns:
        list: Available participant IDs
    """
    potential_participants = list(range(1, 17))  # 1-16
    available_participants = []
    
    for pid in potential_participants:
        # Check for self-annotations
        anno_path = os.path.join(KEMOCON_PATH, "emotion_annotations", 
                               "self_annotations", f"P{pid}.self.csv")
        
        # Check for physiological data
        hr_path = os.path.join(KEMOCON_PATH, "e4_data", str(pid), "E4_HR.csv")
        
        if os.path.exists(anno_path) and os.path.exists(hr_path):
            available_participants.append(pid)
    
    return available_participants
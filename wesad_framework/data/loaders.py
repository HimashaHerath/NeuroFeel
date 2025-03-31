"""
Data loading utilities for the WESAD dataset.
"""

import os
import pickle
import pandas as pd
import numpy as np


def get_dataset_path():
    """
    Get the path to the WESAD dataset.
    Returns:
        str: Path to the WESAD dataset
    """
    # This can be loaded from a config file or environment variable
    return os.environ.get('WESAD_PATH', r"C:\Users\HIMASHA\Downloads\Compressed\WESAD\WESAD")


def get_available_subjects():
    """
    Get list of available subjects in the dataset.
    
    Returns:
        list: List of available subject IDs
    """
    data_path = get_dataset_path()
    potential_subjects = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17]
    available_subjects = []
    
    for subject_id in potential_subjects:
        subject_dir = os.path.join(data_path, f'S{subject_id}')
        if os.path.exists(subject_dir):
            available_subjects.append(subject_id)
    
    return available_subjects


def load_subject_data(subject_id):
    """
    Load data for a specific subject.
    
    Args:
        subject_id (int): Subject ID to load
        
    Returns:
        dict: Subject data dictionary
    """
    data_path = get_dataset_path()
    subject_file = os.path.join(data_path, f'S{subject_id}', f'S{subject_id}.pkl')
    
    with open(subject_file, 'rb') as f:
        subject_data = pickle.load(f, encoding='latin1')
    
    return subject_data


def load_all_subjects():
    """
    Load data for all available subjects.
    
    Returns:
        dict: Dictionary mapping subject IDs to subject data
    """
    available_subjects = get_available_subjects()
    all_subjects_data = {}
    
    for subject_id in available_subjects:
        all_subjects_data[subject_id] = load_subject_data(subject_id)
    
    return all_subjects_data


def prepare_train_test_data(all_features_df, test_ratio=0.3):
    """
    Prepare training and testing data with temporal splitting.
    
    Args:
        all_features_df (pd.DataFrame): DataFrame with features for all subjects
        test_ratio (float): Proportion of data to use for testing
    
    Returns:
        tuple: (train_data_dict, test_data_dict, combined_train, combined_test)
    """
    print("Preparing train/test data...")
    
    # Initialize dictionaries for train and test data
    train_data = {}
    test_data = {}
    
    # Process each subject separately
    for subject_id in all_features_df['subject_id'].unique():
        # Get data for this subject
        subject_data = all_features_df[all_features_df['subject_id'] == subject_id]
        
        # For each emotion label, split temporally
        subject_train = []
        subject_test = []
        
        for label in subject_data['label'].unique():
            # Get data for this label
            label_data = subject_data[subject_data['label'] == label]
            
            # Sort by timestamp
            label_data = label_data.sort_values('timestamp')
            
            # Calculate split index (test_ratio of data goes to test set)
            split_idx = int(len(label_data) * (1 - test_ratio))
            
            # Split data
            label_train = label_data.iloc[:split_idx]
            label_test = label_data.iloc[split_idx:]
            
            # Add to subject's train and test sets
            subject_train.append(label_train)
            subject_test.append(label_test)
        
        # Combine all labels
        if len(subject_train) > 0:
            train_data[subject_id] = pd.concat(subject_train)
        else:
            train_data[subject_id] = pd.DataFrame()
        
        if len(subject_test) > 0:
            test_data[subject_id] = pd.concat(subject_test)
        else:
            test_data[subject_id] = pd.DataFrame()
    
    # Combine all subjects
    combined_train = pd.concat([df for df in train_data.values() if len(df) > 0])
    combined_test = pd.concat([df for df in test_data.values() if len(df) > 0])
    
    print(f"Train set: {len(combined_train)} samples")
    print(f"Test set: {len(combined_test)} samples")
    
    return train_data, test_data, combined_train, combined_test
"""
Configuration parameters for the WESAD framework.
"""

import os

# Data paths
WESAD_PATH = os.environ.get('WESAD_PATH', r"C:\Users\HIMASHA\Downloads\Compressed\WESAD\WESAD")
OUTPUT_DIR = os.environ.get('OUTPUT_DIR', './results')

# Feature extraction parameters
SEGMENT_LENGTH = 8400  # Length of each segment in samples
SEGMENT_OVERLAP = 4200  # Overlap between segments in samples

# Model parameters
BASE_MODEL_TYPE = 'neural_network'  # 'random_forest', 'svm', or 'neural_network'
NUM_FEATURES = 20  # Number of features to select
NUM_CALIBRATION = 5  # Number of calibration examples per class
USE_TRANSFER_LEARNING = True  # Whether to use transfer learning

# Evaluation parameters
TEST_RATIO = 0.3  # Proportion of data to use for testing
ADAPTIVE_THRESHOLD = 0.65  # Confidence threshold for adaptive model selection

# Visualization parameters
PLOT_INDIVIDUAL_SUBJECTS = True  # Whether to plot individual subject results
PLOT_FEATURE_IMPORTANCE = True  # Whether to plot feature importance
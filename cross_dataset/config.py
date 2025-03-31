"""
Configuration parameters for the Cross-Dataset Emotion Recognition Framework.
"""

import os

# Dataset paths
WESAD_PATH = os.environ.get('WESAD_PATH', r"C:\Users\HIMASHA\Downloads\Compressed\WESAD\WESAD")
KEMOCON_PATH = os.environ.get('KEMOCON_PATH', r"C:\Users\HIMASHA\Downloads\Compressed\K_EmoCon")

# Default subjects
DEFAULT_WESAD_SUBJECTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17]
DEFAULT_KEMOCON_PARTICIPANTS = [1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15]

# Feature extraction parameters
SEGMENT_SIZE = 12  # Window size in seconds
OVERLAP_RATIO = 0.5  # 50% overlap between segments
SAMPLING_RATE = 4  # Target sampling rate for processed signals

# Domain adaptation parameters
DEFAULT_ADAPTATION_METHOD = 'ensemble'  # 'coral', 'subspace', 'ensemble', or None
SUBSPACE_MIN_COMPONENTS = 2  # Minimum number of components for subspace alignment
CORAL_REG_PARAM = 0.1  # Regularization parameter for CORAL transformation
ENSEMBLE_WEIGHTS = [0.4, 0.4, 0.2]  # Weights for subspace, CORAL, and simple scaling

# Model parameters
CLASS_BALANCE_THRESHOLD = 0.7  # Apply balancing if minority/majority ratio is below this
CLASS_BALANCE_METHOD = 'SMOTE'  # Default resampling method ('SMOTE', 'ADASYN', 'SMOTEENN')
SAMPLING_STRATEGY = 0.8  # Sampling strategy for resampling methods
CV_TEST_SIZE = 0.2  # Test size for resampling method selection

# Ensemble model parameters
RF_N_ESTIMATORS = 100
RF_MAX_DEPTH = 8
GB_N_ESTIMATORS = 100
GB_MAX_DEPTH = 5
GB_LEARNING_RATE = 0.05
SVM_C = 1.0
SVM_KERNEL = 'rbf'
ENSEMBLE_MODEL_WEIGHTS = [0.4, 0.4, 0.2]  # RF, GB, SVM

# Evaluation parameters
DECISION_THRESHOLDS = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]

# Output parameters
RESULTS_DIR = './results'

# Saving options
SAVE_MODE_OPTIONS = ['minimal', 'standard', 'full', 'none']
DEFAULT_SAVE_MODE = 'standard'

# Save modes define what gets saved:
# - 'none': No saving except configuration
# - 'minimal': Only results and plots
# - 'standard': Results, plots, base models
# - 'full': Everything including all models

# Default saving options by category
SAVE_OPTIONS = {
    'none': {
        'save_models': False,
        'save_features': False,
        'save_plots': False,
        'save_results': True,  # Always save basic results
        'save_adaptation': False,
        'save_personal_models': False
    },
    'minimal': {
        'save_models': False,
        'save_features': False,
        'save_plots': True,
        'save_results': True,
        'save_adaptation': False,
        'save_personal_models': False
    },
    'standard': {
        'save_models': True,
        'save_features': True,
        'save_plots': True,
        'save_results': True,
        'save_adaptation': True,
        'save_personal_models': False
    },
    'full': {
        'save_models': True,
        'save_features': True,
        'save_plots': True,
        'save_results': True,
        'save_adaptation': True,
        'save_personal_models': True
    }
}
# Enhanced Emotion Recognition Framework for WESAD Dataset

This repository contains a modular framework for personalized emotion recognition using physiological signals from the WESAD dataset. The framework focuses on creating customized models for individual subjects to improve emotion recognition performance.

## Features

- **Modular Architecture**: Clean separation of data processing, model training, and evaluation
- **Transfer Learning**: Uses pre-trained base models to initialize personalized models
- **Ensemble Approach**: Combines base and personalized models for robust predictions
- **Adaptive Model Selection**: Dynamically selects predictions from the most confident model
- **Feature Importance Analysis**: Identifies most discriminative features for each subject
- **Comprehensive Evaluation**: Detailed metrics and visualizations for each subject
- **Flexible Saving Options**: Control what gets saved to disk for different usage scenarios
- **Flexible Saving Options**: Control what gets saved to disk for different usage scenarios

## Repository Structure

```
wesad_framework/
│
├── data/                        # Data-related operations
│   ├── __init__.py
│   ├── loaders.py               # Data loading functions
│   ├── preprocessing.py         # Signal preprocessing functions
│   └── feature_extraction.py    # Feature extraction from signals
│
├── models/                      # Model definitions and training
│   ├── __init__.py
│   ├── base_model.py            # Base model definition and training
│   ├── personal_model.py        # Personalized model implementation
│   ├── ensemble.py              # Ensemble model implementation
│   └── adaptive.py              # Adaptive model selection
│
├── features/                    # Feature selection and management
│   ├── __init__.py
│   ├── selection.py             # Feature selection algorithms
│   └── importance.py            # Feature importance analysis
│
├── evaluation/                  # Evaluation metrics and visualization
│   ├── __init__.py
│   ├── metrics.py               # Performance metrics calculation
│   └── visualization.py         # Visualization tools
│
├── utils/                       # Utility functions
│   ├── __init__.py
│   └── helpers.py               # Helper functions used across modules
│
├── config.py                    # Configuration parameters
├── framework.py                 # Main framework implementation
├── main.py                      # Main execution script
└── README.md                    # Documentation
```

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/wesad_framework.git
cd wesad_framework
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables for data paths:
```bash
export WESAD_PATH=/path/to/wesad/dataset
export OUTPUT_DIR=/path/to/output/directory
```

## Usage

Run the framework with default parameters:
```bash
python main.py
```

Customize the execution:
```bash
python main.py --model_type neural_network --num_features 20 --num_calibration 5
```

Disable transfer learning:
```bash
python main.py --no_transfer
```

### Saving Options

Control how much data is saved to disk with saving modes:

```bash
# Default - saves plots, base model, features, but not personal models
python main.py --save-mode standard

# Minimal - only saves results and plots (good for testing)
python main.py --save-mode minimal 

# Full - saves everything including all personal models (uses more disk space)
python main.py --save-mode full

# No saving - only saves configuration (fastest)
python main.py --save-mode none
```

Fine-grained control of saving options:

```bash
# Don't save any models
python main.py --no-save-models

# Don't save feature rankings
python main.py --no-save-features 

# Don't generate or save plots
python main.py --no-save-plots

# Don't save standardization scalers
python main.py --no-save-scalers
```

### Saving Options

Control how much data is saved to disk with saving modes:

```bash
# Default - saves plots, base model, features, but not personal models
python main.py --save-mode standard

# Minimal - only saves results and plots (good for testing)
python main.py --save-mode minimal 

# Full - saves everything including all personal models (uses more disk space)
python main.py --save-mode full

# No saving - only saves configuration (fastest)
python main.py --save-mode none
```

Fine-grained control of saving options:

```bash
# Don't save any models
python main.py --no-save-models

# Don't save feature rankings
python main.py --no-save-features 

# Don't generate or save plots
python main.py --no-save-plots

# Don't save standardization scalers
python main.py --no-save-scalers
```

## Configuration

Edit `config.py` to change default parameters:

- `WESAD_PATH`: Path to the WESAD dataset
- `OUTPUT_DIR`: Directory for output files
- `SEGMENT_LENGTH`: Length of each segment in samples
- `SEGMENT_OVERLAP`: Overlap between segments in samples
- `BASE_MODEL_TYPE`: Type of base model to use ('random_forest', 'svm', or 'neural_network')
- `NUM_FEATURES`: Number of features to select
- `NUM_CALIBRATION`: Number of calibration examples per class
- `USE_TRANSFER_LEARNING`: Whether to use transfer learning
- `TEST_RATIO`: Proportion of data to use for testing
- `ADAPTIVE_THRESHOLD`: Confidence threshold for adaptive model selection

### Saving Configuration

The framework supports different levels of disk usage through saving modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `standard` | Saves results, plots, and base model | Default for most runs |
| `minimal` | Only saves results and plots | Development and testing |
| `full` | Saves everything including personal models | Final production runs |
| `none` | Only saves basic configuration | Rapid experimentation |

These modes can be overridden with fine-grained flags for specific requirements.

### Saving Configuration

The framework supports different levels of disk usage through saving modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `standard` | Saves results, plots, and base model | Default for most runs |
| `minimal` | Only saves results and plots | Development and testing |
| `full` | Saves everything including personal models | Final production runs |
| `none` | Only saves basic configuration | Rapid experimentation |

These modes can be overridden with fine-grained flags for specific requirements.

## Results

The framework outputs:

1. **Visualizations** (if saving plots is enabled):
   - Confusion matrices for each subject
   - Feature importance plots for each subject
   - Overall results comparison plot

2. **Models** (depending on save mode):
   - Base model trained on all subjects
   - Personal models for each subject (in full mode)
   - Scalers for data standardization

3. **Data Files**:
   - JSON files with detailed metrics
   - Feature rankings in CSV format
   - Results tables in CSV and Excel formats
   - Configuration details for reproducibility

The output directory structure is organized by run timestamp:

```
results/
└── neural_network_run_YYYYMMDD_HHMMSS/
    ├── config.json              # Configuration parameters
    ├── config.txt               # Human-readable configuration
    ├── environment_info.json    # System information
    ├── features/                # Feature rankings
    ├── logs/                    # Runtime logs
    ├── main_script.py           # Copy of execution script
    ├── models/                  # Saved models
    ├── results/                 # Results data
    │   ├── results_table.csv
    │   ├── results_table.xlsx
    │   ├── summary.json
    │   └── summary.txt
    ├── scalers/                 # Saved scalers
    └── visualizations/          # Plots and figures
        ├── confusion_matrix_S2.png/pdf
        ├── feature_importance/
        ├── model_accuracy_comparison.png/pdf
        └── model_improvement_comparison.png/pdf
```

## Citation
If you use this dataset, please follow the acknowledgment policy on the original dataset website: [WESAD Dataset Website](https://archive.ics.uci.edu/dataset/465/wesad+wearable+stress+and+affect+detection).
```
@article{schmidt2018introducing,
  title={Introducing WESAD, a multimodal dataset for Wearable Stress and Affect Detection},
  author={Philip Schmidt and Attila Reiss and Robert Duerichen and Claus Marberger and Kristof Van Laerhoven},
  journal={ICMI 2018},
  year={2018}
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
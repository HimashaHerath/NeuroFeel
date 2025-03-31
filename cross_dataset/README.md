# Cross-Dataset Emotion Recognition Framework

This repository contains a modular framework for cross-dataset emotion recognition between WESAD and K-EmoCon datasets. The framework enables emotion recognition models to be trained on one dataset and evaluated on another, addressing the domain shift challenge between different data collection environments.

## Features

- **Cross-Dataset Compatibility**: Map features between WESAD and K-EmoCon datasets
- **Domain Adaptation**: Multiple techniques to address dataset differences (CORAL, Subspace Alignment, Ensemble)
- **Class Balancing**: Advanced resampling techniques to handle imbalanced emotion classes
- **Bidirectional Evaluation**: Train and evaluate in both directions (WESAD→K-EmoCon, K-EmoCon→WESAD)
- **Comprehensive Metrics**: Focus on balanced performance metrics (balanced accuracy, PR-AUC)
- **Modular Architecture**: Clean separation of data processing, feature extraction, model training, and evaluation
- **Flexible Saving Options**: Control what artifacts are saved for different usage scenarios

## Repository Structure

```
cross_dataset/
│
├── data/                        # Data handling
│   ├── __init__.py
│   ├── wesad_loader.py          # WESAD data loading
│   └── kemocon_loader.py        # K-EmoCon data loading
│
├── features/                    # Feature extraction & mapping
│   ├── __init__.py
│   ├── extraction.py            # Feature extraction from signals
│   └── mapping.py               # Feature mapping between datasets
│
├── domain_adaptation/           # Domain adaptation methods
│   ├── __init__.py
│   ├── subspace.py              # Subspace alignment
│   ├── coral.py                 # CORAL transformation
│   └── ensemble.py              # Ensemble adaptation
│
├── models/                      # Model training and evaluation
│   ├── __init__.py
│   ├── training.py              # Model training
│   ├── evaluation.py            # Model evaluation
│   └── balancing.py             # Class balancing
│
├── visualization/               # Visualization utilities
│   ├── __init__.py
│   └── plots.py                 # Plotting functions
│
├── utils/                       # Utility functions
│   ├── __init__.py
│   └── helpers.py               # Helper functions
│
├── config.py                    # Configuration settings
├── framework.py                 # Main framework class
└── main.py                      # Cross-dataset execution script
```

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/neurofeel.git
cd neurofeel
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables for data paths:
```bash
export WESAD_PATH=/path/to/wesad/dataset
export KEMOCON_PATH=/path/to/kemocon/dataset
export RESULTS_DIR=/path/to/output/directory
```

## Usage

### Basic Usage

Run the cross-dataset framework with default parameters:
```bash
python -m cross_dataset.main
```

### Customize Dataset Selection

Specify which subjects/participants to include:
```bash
python -m cross_dataset.main --wesad-subjects 2,3,4,5 --kemocon-participants 1,4,5,8
```

### Configure Domain Adaptation

Choose a specific domain adaptation method:
```bash
python -m cross_dataset.main --adaptation-method coral
```

Available methods: `coral`, `subspace`, `ensemble`, or `none`

### Saving Options

Control how much data is saved to disk with saving modes:

```bash
# Default - saves plots, base model, features, but not personal models
python -m cross_dataset.main --save-mode standard

# Minimal - only saves results and plots (good for testing)
python -m cross_dataset.main --save-mode minimal 

# Full - saves everything including all personal models (uses more disk space)
python -m cross_dataset.main --save-mode full

# No saving - only saves configuration (fastest)
python -m cross_dataset.main --save-mode none
```

Fine-grained control of saving options:

```bash
# Don't save any models
python -m cross_dataset.main --no-save-models

# Don't save feature mappings
python -m cross_dataset.main --no-save-features 

# Don't generate or save plots
python -m cross_dataset.main --no-save-plots

# Don't save adaptation data
python -m cross_dataset.main --no-save-adaptation
```

### Target Emotion Selection

Train models for specific emotions:
```bash
# Train only arousal models
python -m cross_dataset.main --target arousal

# Train only valence models
python -m cross_dataset.main --target valence
```

## Configuration

Edit `config.py` to change default parameters:

- `WESAD_PATH`: Path to WESAD dataset
- `KEMOCON_PATH`: Path to K-EmoCon dataset
- `DEFAULT_WESAD_SUBJECTS`: Default list of WESAD subjects to use
- `DEFAULT_KEMOCON_PARTICIPANTS`: Default list of K-EmoCon participants to use
- `SEGMENT_SIZE`: Window size in seconds for feature extraction
- `DEFAULT_ADAPTATION_METHOD`: Default domain adaptation method
- `CLASS_BALANCE_THRESHOLD`: When to apply class balancing
- `DECISION_THRESHOLDS`: Candidate thresholds for optimizing classification
- `RESULTS_DIR`: Directory for saving results
- `SAVE_OPTIONS`: Presets for what to save

## Results

The framework outputs:

1. **Models**:
   - Trained models for both directions (WESAD→K-EmoCon, K-EmoCon→WESAD)
   - Model metadata and configurations
   - Adaptation data and statistics

2. **Evaluation Metrics**:
   - Accuracy, F1-Score, Balanced Accuracy
   - ROC-AUC and PR-AUC values
   - Classification reports and confusion matrices

3. **Visualizations**:
   - Confusion matrices for both directions
   - Precision-Recall curves
   - Feature importance plots
   - Domain adaptation effect visualizations
   - Class distribution plots

The output directory structure is organized by run timestamp:

```
results/
└── ensemble_run_YYYYMMDD_HHMMSS/
    ├── adaptation/              # Domain adaptation data
    ├── features/                # Feature mappings & processed data
    │   ├── wesad_processed.csv
    │   └── kemocon_processed.csv
    ├── models/                  # Trained models
    │   ├── arousal_wesad_to_kemocon_model.joblib
    │   └── valence_kemocon_to_wesad_model.joblib
    ├── results/                 # Detailed metrics
    │   ├── arousal/
    │   ├── valence/
    │   ├── overall_summary.csv
    │   └── summary.txt
    └── visualizations/          # Generated plots
        ├── arousal/
        └── valence/
```

## Performance

Typical performance metrics for cross-dataset emotion recognition:

| Direction | Target | Accuracy | F1-Score | Balanced Acc | ROC-AUC | PR-AUC |
|-----------|--------|----------|----------|--------------|---------|--------|
| WESAD → K-EmoCon | Arousal | 65-70% | 60-65% | 52-55% | 53-55% | 25-30% |
| K-EmoCon → WESAD | Arousal | 62-65% | 50-55% | 49-52% | 39-45% | 28-32% |
| WESAD → K-EmoCon | Valence | 75-80% | 70-75% | 48-52% | 42-48% | 15-20% |
| K-EmoCon → WESAD | Valence | 60-65% | 45-50% | 48-52% | 50-55% | 38-42% |

Performance varies based on selected subjects, adaptation methods, and balancing techniques.

## Citation

If you use this dataset, please follow the acknowledgment policy on the original dataset website: [WESAD Dataset Website](https://archive.ics.uci.edu/dataset/465/wesad+wearable+stress+and+affect+detection),[Zenodo Record](https://zenodo.org/records/3931963).

```
@article{schmidt2018introducing,
  title={Introducing WESAD, a multimodal dataset for Wearable Stress and Affect Detection},
  author={Philip Schmidt and Attila Reiss and Robert Duerichen and Claus Marberger and Kristof Van Laerhoven},
  journal={ICMI 2018},
  year={2018}
}
```
```
@article{park2020kemo,
  title={K-EmoCon, a multimodal sensor dataset for continuous emotion recognition in naturalistic conversations},
  author={Cheul Young Park and Narae Cha and Soowon Kang and Auk Kim and Ahsan Habib Khandoker and Leontios Hadjileontiadis and Alice Oh and Yong Jeong and Uichin Lee},
  journal={Scientific Data},
  year={2020}
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
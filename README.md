# NeuroFeel

A comprehensive emotion recognition framework featuring:

1. **WESAD Framework**: Personalized emotion recognition within the WESAD dataset
2. **Cross-Dataset Framework**: Cross-dataset emotion recognition between WESAD and K-EmoCon datasets

## Project Structure

```
NeuroFeel/
├── wesad_framework/        # Within-dataset emotion recognition
│   ├── data/
│   ├── models/
│   ├── features/
│   └── ...
│
├── cross_dataset/          # Cross-dataset emotion recognition
│   ├── data/
│   ├── models/
│   ├── features/
│   └── ...
│
└── main.py                 # Root entry point for the entire project
```

## Installation

1. Clone this repository:
```bash
git clone https://github.com/HimashaHerath/NeuroFeel
cd NeuroFeel
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables for dataset paths:
```bash
export WESAD_PATH=/path/to/wesad/dataset
export KEMOCON_PATH=/path/to/kemocon/dataset  # Optional for Cross-Dataset framework
```

## Usage

### Running Both Frameworks

To run both frameworks with default settings:
```bash
python main.py
```

### WESAD Framework Only

```bash
python main.py --framework wesad --wesad-model neural_network --wesad-save-mode standard
```

Options:
- `--wesad-model`: Choose from `random_forest`, `svm`, or `neural_network`
- `--wesad-save-mode`: Choose from `minimal`, `standard`, `full`, or `none`
- `--wesad-path`: Override the WESAD dataset path

### Cross-Dataset Framework Only

```bash
python main.py --framework cross-dataset --adaptation-method ensemble --target both
```

Options:
- `--adaptation-method`: Choose from `ensemble`, `coral`, `subspace`, or `none`
- `--target`: Choose from `arousal`, `valence`, or `both`
- `--wesad-path`: Override the WESAD dataset path
- `--kemocon-path`: Override the K-EmoCon dataset path

### Common Options

- `--output-dir`: Specify base output directory for results (default: `./results`)

## Results

Results are saved in the specified output directory with the following structure:

```
results/
├── wesad/
│   └── neural_network_run_TIMESTAMP/
│       ├── config.json
│       ├── models/
│       ├── visualizations/
│       └── ...
│
└── cross_dataset/
    └── run_TIMESTAMP/
        ├── config.json
        ├── arousal/
        │   ├── feature_importance.csv
        │   └── metrics.csv
        ├── valence/
        │   ├── feature_importance.csv
        │   └── metrics.csv
        └── visualizations/
            ├── confusion_matrices_arousal.png
            ├── pr_curves_arousal.png
            └── ...
```

## Citation

If you use this framework in your research, please cite:

## License

This project is licensed under the MIT License - see the LICENSE file for details.
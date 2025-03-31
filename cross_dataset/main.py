"""
Main script for running the cross-dataset emotion recognition framework.
"""

import os
import argparse
import json
import shutil
import platform
import sys
from datetime import datetime

from cross_dataset.framework import CrossDatasetFramework
from .config import (
    WESAD_PATH, 
    KEMOCON_PATH, 
    RESULTS_DIR,
    DEFAULT_ADAPTATION_METHOD,
    SAVE_MODE_OPTIONS,
    DEFAULT_SAVE_MODE,
    SAVE_OPTIONS
)
from cross_dataset.save_demo_samples import save_demo_samples  # Add this import

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Cross-Dataset Emotion Recognition Framework'
    )
    
    # Dataset paths
    parser.add_argument(
        '--wesad-path',
        type=str,
        default=WESAD_PATH,
        help='Path to WESAD dataset'
    )
    
    parser.add_argument(
        '--kemocon-path',
        type=str,
        default=KEMOCON_PATH,
        help='Path to K-EmoCon dataset'
    )
    
    # Subject selection
    parser.add_argument(
        '--wesad-subjects',
        type=int,
        nargs='+',
        help='IDs of WESAD subjects to process'
    )
    
    parser.add_argument(
        '--kemocon-participants',
        type=int,
        nargs='+',
        help='IDs of K-EmoCon participants to process'
    )
    
    # Model settings
    parser.add_argument(
        '--adaptation-method',
        type=str,
        choices=['ensemble', 'coral', 'subspace', 'none'],
        default=DEFAULT_ADAPTATION_METHOD,
        help='Domain adaptation method'
    )
    
    parser.add_argument(
        '--target',
        type=str,
        choices=['arousal', 'valence', 'both'],
        default='both',
        help='Target to predict'
    )
    
    # Output settings
    parser.add_argument(
        '--output-dir',
        type=str,
        default=RESULTS_DIR,
        help='Output directory for results'
    )
    
    # Saving options
    save_group = parser.add_argument_group('Saving options')
    save_group.add_argument(
        '--save-mode',
        type=str,
        choices=SAVE_MODE_OPTIONS,
        default=DEFAULT_SAVE_MODE,
        help=('Control what gets saved: '
              'minimal (results and plots), '
              'standard (plots, results, and base models), '
              'full (everything), '
              'none (only configuration)')
    )
        # Add this inside the save_group argument group
    save_group.add_argument(
    '--save-demo-samples',
    dest='save_demo_samples',
    action='store_true',
    help='Save demo samples for later testing'
    )
    # Individual save flags to override save mode
    save_group.add_argument(
        '--no-save-models', 
        dest='save_models', 
        action='store_false',
        help='Do not save any models'
    )
    
    save_group.add_argument(
        '--no-save-features', 
        dest='save_features', 
        action='store_false',
        help='Do not save feature information'
    )
    
    save_group.add_argument(
        '--no-save-plots', 
        dest='save_plots', 
        action='store_false',
        help='Do not generate or save plots'
    )
    
    save_group.add_argument(
        '--no-save-adaptation', 
        dest='save_adaptation', 
        action='store_false',
        help='Do not save domain adaptation results'
    )
    
    save_group.add_argument(
        '--save-personal-models', 
        dest='save_personal_models', 
        action='store_true',
        help='Save all personal models (usually only in full mode)'
    )
    
    # Set defaults based on standard mode
    parser.set_defaults(**SAVE_OPTIONS['standard'])
    
    return parser.parse_args()


def setup_results_dir(base_dir, adaptation_method, target='both'):
    """Set up results directory with descriptive name."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Create descriptive directory name
    dir_name = f"{adaptation_method}_"
    if target != 'both':
        dir_name += f"{target}_"
    dir_name += f"run_{timestamp}"
    
    results_dir = os.path.join(base_dir, dir_name)
    os.makedirs(results_dir, exist_ok=True)
    
    # Create subdirectories
    subdirs = ['visualizations', 'models', 'features', 'results', 'adaptation']
    
    for subdir in subdirs:
        os.makedirs(os.path.join(results_dir, subdir), exist_ok=True)
    
    # Create target-specific directories
    for t in ['arousal', 'valence'] if target == 'both' else [target]:
        os.makedirs(os.path.join(results_dir, 'results', t), exist_ok=True)
        os.makedirs(os.path.join(results_dir, 'visualizations', t), exist_ok=True)
    
    return results_dir


def save_config(args, results_dir):
    """Save configuration to file in both JSON and readable text format."""
    # Convert to dictionary
    config = vars(args)
    config['timestamp'] = datetime.now().isoformat()
    config['platform'] = platform.platform()
    config['python_version'] = sys.version
    
    # Save as JSON
    with open(os.path.join(results_dir, 'config.json'), 'w') as f:
        json.dump(config, f, indent=4)
    
    # Save as readable text
    with open(os.path.join(results_dir, 'config.txt'), 'w') as f:
        f.write("Cross-Dataset Emotion Recognition Configuration\n")
        f.write("="*45 + "\n\n")
        
        # Add sections
        f.write("DATASET SETTINGS:\n")
        f.write(f"  WESAD Path: {config['wesad_path']}\n")
        f.write(f"  K-EmoCon Path: {config['kemocon_path']}\n")
        f.write(f"  WESAD Subjects: {config.get('wesad_subjects', 'All available')}\n")
        f.write(f"  K-EmoCon Participants: {config.get('kemocon_participants', 'All available')}\n\n")
        
        f.write("MODEL SETTINGS:\n")
        f.write(f"  Adaptation Method: {config['adaptation_method']}\n")
        f.write(f"  Target Variable: {config['target']}\n\n")
        
        f.write("SAVING SETTINGS:\n")
        f.write(f"  Save Mode: {config['save_mode']}\n")
        f.write(f"  Save Models: {config['save_models']}\n")
        f.write(f"  Save Features: {config['save_features']}\n")
        f.write(f"  Save Plots: {config['save_plots']}\n")
        f.write(f"  Save Adaptation: {config['save_adaptation']}\n")
        f.write(f"  Save Personal Models: {config['save_personal_models']}\n\n")
        
        f.write("SYSTEM INFORMATION:\n")
        f.write(f"  Timestamp: {config['timestamp']}\n")
        f.write(f"  Platform: {config['platform']}\n")
        f.write(f"  Python Version: {config['python_version']}\n")
    
    # Create a copy of the running script for reproducibility
    script_path = os.path.abspath(__file__)
    shutil.copy2(script_path, os.path.join(results_dir, 'main_script.py'))


def apply_save_mode(args):
    """Apply save mode settings and override with explicit flags."""
    # First apply the selected save mode
    for key, value in SAVE_OPTIONS[args.save_mode].items():
        if key not in vars(args) or vars(args)[key] is None:
            setattr(args, key, value)
    
    # Command-line flags override the save mode settings
    return args


def main():
    """Main function."""
    # Parse command line arguments
    args = parse_args()
    
    # Apply save mode and override with explicit flags
    args = apply_save_mode(args)
    
    # Setup results directory
    adaptation_method = args.adaptation_method.lower()
    if adaptation_method == 'none':
        adaptation_method = 'no_adaptation'
    
    results_dir = setup_results_dir(args.output_dir, adaptation_method, args.target)
    os.environ['RESULTS_DIR'] = results_dir
    
    # Save configuration
    save_config(args, results_dir)
    
    # Initialize framework with saving options
    framework = CrossDatasetFramework(
        wesad_path=args.wesad_path,
        kemocon_path=args.kemocon_path,
        results_dir=results_dir,
        save_options={
            'save_models': args.save_models,
            'save_features': args.save_features,
            'save_plots': args.save_plots,
            'save_results': True,  # Always save results
            'save_adaptation': args.save_adaptation,
            'save_personal_models': args.save_personal_models
        }
    )
    
    # Load datasets
    print("\nLoading WESAD dataset...")
    framework.load_wesad_data(args.wesad_subjects)
    
    print("\nLoading K-EmoCon dataset...")
    framework.load_kemocon_data(args.kemocon_participants)
    
    # Handle 'none' adaptation method
    adaptation_method = args.adaptation_method
    if adaptation_method.lower() == 'none':
        adaptation_method = None
    
    # Train models
    if args.target == 'arousal':
        framework.train_cross_dataset_models('arousal', adaptation_method)
    elif args.target == 'valence':
        framework.train_cross_dataset_models('valence', adaptation_method)
    else:  # Both
        framework.train_all_models(adaptation_method)
        
    # Add this block to save demo samples if requested
    if args.save_demo_samples:
        demo_dir = os.path.join(results_dir, 'demo')
        os.makedirs(demo_dir, exist_ok=True)
        save_demo_samples(framework, sample_size=20, save_dir=demo_dir)
    
    print(f"\nResults saved to {results_dir}")


if __name__ == '__main__':
    main()
"""
Main execution script for the WESAD framework.
"""

import argparse
import os
import json
import shutil
import platform
import sys
from datetime import datetime

from wesad_framework.framework import EnhancedPersonalizationFramework
from . import config


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Enhanced Personalization Framework for Emotion Recognition')
    
    # Main parameters
    parser.add_argument(
        '--model_type', 
        type=str, 
        default=config.BASE_MODEL_TYPE,
        choices=['random_forest', 'svm', 'neural_network'],
        help='Type of base model to use'
    )
    
    parser.add_argument(
        '--num_features', 
        type=int, 
        default=config.NUM_FEATURES,
        help='Number of features to select'
    )
    
    parser.add_argument(
        '--num_calibration', 
        type=int, 
        default=config.NUM_CALIBRATION,
        help='Number of calibration examples per class'
    )
    
    parser.add_argument(
        '--no_transfer', 
        action='store_true',
        help='Disable transfer learning'
    )
    
    parser.add_argument(
        '--output_dir', 
        type=str, 
        default=config.OUTPUT_DIR,
        help='Output directory for results'
    )
    
    # Saving options
    save_group = parser.add_argument_group('Saving options')
    save_group.add_argument(
        '--save-mode',
        type=str,
        choices=['minimal', 'standard', 'full', 'none'],
        default='standard',
        help=('Control what gets saved: '
              'minimal (only results and plots), '
              'standard (results, plots, and base models), '
              'full (everything including all personal models), '
              'none (nothing gets saved except config)')
    )
    
    save_group.add_argument('--no-save-models', dest='save_models', action='store_false',
                          help='Do not save trained models')
    save_group.add_argument('--no-save-features', dest='save_features', action='store_false',
                          help='Do not save feature rankings')
    save_group.add_argument('--no-save-plots', dest='save_plots', action='store_false',
                          help='Do not save visualization plots')
    save_group.add_argument('--no-save-scalers', dest='save_scalers', action='store_false',
                          help='Do not save fitted scalers')
    
    save_group.add_argument('--save-test-data', dest='save_test_data', action='store_true',
                      help='Save test data for later demonstrations')
    
    # Set defaults for saving options
    parser.set_defaults(save_models=True, save_features=True, save_plots=True, save_scalers=True)
    
    return parser.parse_args()


def main():
    """Main function to run the framework."""
    # Parse arguments
    args = parse_args()
    
    # Process save mode settings
    if args.save_mode == 'none':
        args.save_models = False
        args.save_features = False
        args.save_plots = False
        args.save_scalers = False
        args.save_test_data = False
    elif args.save_mode == 'minimal':
        args.save_models = False
        args.save_features = False
        args.save_plots = True
        args.save_scalers = False
        args.save_test_data = False
    elif args.save_mode == 'standard':
        args.save_models = True
        args.save_features = True
        args.save_plots = True
        args.save_scalers = True
        args.save_personal_models = False
        args.save_test_data = True  # Save test data in standard mode
    elif args.save_mode == 'full':
        args.save_models = True
        args.save_features = True
        args.save_plots = True
        args.save_scalers = True
        args.save_personal_models = True
        args.save_test_data = True  # Save test data in full mode
        
    
    # Create output directory with timestamp and model type
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    run_name = f"{args.model_type}_run_{timestamp}"
    output_dir = os.path.join(args.output_dir, run_name)
    os.makedirs(output_dir, exist_ok=True)
    
    # Create subdirectories only if needed
    if args.save_plots:
        os.makedirs(os.path.join(output_dir, 'visualizations'), exist_ok=True)
    if args.save_models:
        os.makedirs(os.path.join(output_dir, 'models'), exist_ok=True)
    if args.save_test_data:
        os.makedirs(os.path.join(output_dir, 'test_data'), exist_ok=True)
    
    # Always create results directory
    os.makedirs(os.path.join(output_dir, 'results'), exist_ok=True)
    
    if args.save_features:
        os.makedirs(os.path.join(output_dir, 'features'), exist_ok=True)
    if args.save_scalers:
        os.makedirs(os.path.join(output_dir, 'scalers'), exist_ok=True)
    
    # Set up logging to file
    os.makedirs(os.path.join(output_dir, 'logs'), exist_ok=True)
    log_file = os.path.join(output_dir, 'logs', 'run.log')
    
    # Create a copy of the running script for reproducibility
    script_path = os.path.abspath(__file__)
    shutil.copy2(script_path, os.path.join(output_dir, 'main_script.py'))
    
    # Save environment info
    env_info = {
        'python_version': sys.version,
        'platform': platform.platform(),
        'timestamp': timestamp,
        'command_line_args': vars(args)
    }
    
    with open(os.path.join(output_dir, 'environment_info.json'), 'w') as f:
        json.dump(env_info, f, indent=2)
    
    # Initialize framework
    framework = EnhancedPersonalizationFramework(
        base_model_type=args.model_type,
        output_dir=output_dir,
        save_options={
            'save_models': args.save_models,
            'save_features': args.save_features,
            'save_plots': args.save_plots,
            'save_scalers': args.save_scalers,
            'save_personal_models': getattr(args, 'save_personal_models', False),
            'save_test_data': getattr(args, 'save_test_data', False)  # Add this option
        }
    )
    
    # Run framework
    results = framework.run(
        n_features=args.num_features,
        num_calibration=args.num_calibration,
        use_transfer_learning=not args.no_transfer
    )
    
    # Save detailed configuration
    config_dict = {
        # Framework parameters
        'model_type': args.model_type,
        'num_features': args.num_features,
        'num_calibration': args.num_calibration,
        'use_transfer_learning': not args.no_transfer,
        'timestamp': timestamp,
        
        # Additional config parameters from config.py
        'segment_length': config.SEGMENT_LENGTH,
        'segment_overlap': config.SEGMENT_OVERLAP,
        'test_ratio': config.TEST_RATIO,
        'adaptive_threshold': config.ADAPTIVE_THRESHOLD,
        
        # Dataset info
        'dataset_path': config.WESAD_PATH,
        'output_directory': output_dir
    }
    
    # Save in both JSON and readable text formats
    with open(os.path.join(output_dir, 'config.json'), 'w') as f:
        json.dump(config_dict, f, indent=4)
    
    with open(os.path.join(output_dir, 'config.txt'), 'w') as f:
        f.write("WESAD Framework Configuration\n")
        f.write("===========================\n\n")
        for key, value in config_dict.items():
            f.write(f"{key}: {value}\n")
    
    # Save numeric results
    results_dict = {
        'mean_base_acc': results.get('mean_base_acc', 0),
        'mean_personal_acc': results.get('mean_personal_acc', 0),
        'mean_ensemble_acc': results.get('mean_ensemble_acc', 0),
        'mean_adaptive_acc': results.get('mean_adaptive_acc', 0),
        'mean_base_f1': results.get('mean_base_f1', 0),
        'mean_personal_f1': results.get('mean_personal_f1', 0),
        'mean_ensemble_f1': results.get('mean_ensemble_f1', 0),
        'mean_adaptive_f1': results.get('mean_adaptive_f1', 0),
        'personal_improvement': results.get('personal_improvement', 0),
        'ensemble_improvement': results.get('ensemble_improvement', 0),
        'adaptive_improvement': results.get('adaptive_improvement', 0),
        'run_timestamp': timestamp,
        'run_name': run_name
    }
    
    # Save in both JSON and readable text formats
    with open(os.path.join(output_dir, 'results', 'summary.json'), 'w') as f:
        json.dump(results_dict, f, indent=4)
    
    with open(os.path.join(output_dir, 'results', 'summary.txt'), 'w') as f:
        f.write("WESAD Framework Results Summary\n")
        f.write("==============================\n\n")
        f.write(f"Run: {run_name}\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("Accuracy Results:\n")
        f.write(f"  Base Model:     {results.get('mean_base_acc', 0):.4f}\n")
        f.write(f"  Personal Model: {results.get('mean_personal_acc', 0):.4f}\n")
        f.write(f"  Ensemble Model: {results.get('mean_ensemble_acc', 0):.4f}\n")
        f.write(f"  Adaptive Model: {results.get('mean_adaptive_acc', 0):.4f}\n\n")
        
        f.write("F1-Score Results:\n")
        f.write(f"  Base Model:     {results.get('mean_base_f1', 0):.4f}\n")
        f.write(f"  Personal Model: {results.get('mean_personal_f1', 0):.4f}\n")
        f.write(f"  Ensemble Model: {results.get('mean_ensemble_f1', 0):.4f}\n")
        f.write(f"  Adaptive Model: {results.get('mean_adaptive_f1', 0):.4f}\n\n")
        
        f.write("Improvements over Base Model:\n")
        f.write(f"  Personal Model: {results.get('personal_improvement', 0):.4f}\n")
        f.write(f"  Ensemble Model: {results.get('ensemble_improvement', 0):.4f}\n")
        f.write(f"  Adaptive Model: {results.get('adaptive_improvement', 0):.4f}\n")
    
    print(f"Results saved to {output_dir}")


if __name__ == "__main__":
    main()
"""
Enhanced Personalization Framework for Emotion Recognition.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# Import modules
from .data.loaders import get_available_subjects, load_all_subjects, prepare_train_test_data
from .data.feature_extraction import extract_features
from wesad_framework.features.selection import select_best_features, identify_subject_important_features
from wesad_framework.models.base_model import train_base_model
from wesad_framework.models.personal_model import create_personal_model
from wesad_framework.models.ensemble import learn_ensemble_weights, predict_with_ensemble
from wesad_framework.models.adaptive import predict_with_adaptive_selection
from wesad_framework.evaluation.metrics import evaluate_all_models, calculate_overall_results
from wesad_framework.evaluation.visualization import plot_confusion_matrices, plot_overall_results, plot_feature_importance
from wesad_framework.utils.helpers import save_model, save_scaler, save_features, save_results_table


class EnhancedPersonalizationFramework:
    """
    Enhanced Personalization Framework for Emotion Recognition.
    
    Key features:
    1. Transfer learning instead of training from scratch
    2. Ensemble approach for robust predictions
    3. Improved calibration data selection with diversity
    4. Stronger regularization for small-data learning
    5. Subject-specific feature importance analysis
    6. Adaptive model selection based on confidence
    """
    
    def __init__(self, base_model_type='neural_network', output_dir=None, save_options=None):
        """
        Initialize the framework.
        
        Args:
            base_model_type (str): Type of base model to use
            output_dir (str): Directory for output files
            save_options (dict): Options controlling what to save
        """
        self.base_model_type = base_model_type
        self.output_dir = output_dir or '.'
        
        # Set default save options
        self.save_options = {
            'save_models': True,
            'save_features': True,
            'save_plots': True,
            'save_scalers': True,
            'save_personal_models': False
        }
        
        # Update with provided options
        if save_options:
            self.save_options.update(save_options)
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize attributes
        self.base_model = None
        self.personal_models = {}
        self.feature_names = None
        self.global_scaler = StandardScaler()
        self.feature_scaler = None  # Scaler specifically for selected features
        self.selected_features = None
        self.calibration_examples = {}
        self.subject_features = {}
        self.ensemble_weights = {}
        
        print(f"Initialized framework with {base_model_type} base model")
    
    def save_test_data(self, subject_id, X_test, y_test, feature_names):
        """Save test data for a subject for later demonstration"""
        test_data_dir = os.path.join(self.output_dir, 'test_data')
        os.makedirs(test_data_dir, exist_ok=True)
        
        # Create test data package
        test_data = {
            'X_test': X_test,  # Raw features before scaling
            'y_test': y_test,  # Labels (0-indexed)
            'subject_id': subject_id,
            'feature_names': feature_names,
            'class_names': ['Baseline', 'Stress', 'Amusement', 'Meditation']
        }
        
        # Save to file
        test_file = os.path.join(test_data_dir, f'S{subject_id}_test.pkl')
        with open(test_file, 'wb') as f:
            pickle.dump(test_data, f)
        
        # Save a JSON version with a subset of samples for easier inspection
        import json
        import random
        
        # Select a random subset of samples (up to 10)
        n_samples = min(10, len(X_test))
        sample_indices = random.sample(range(len(X_test)), n_samples)
        
        # Format samples as JSON-serializable dictionary
        samples = []
        for idx in sample_indices:
            sample = {
                'features': {feature_names[i]: float(X_test[idx, i]) for i in range(len(feature_names))},
                'label': int(y_test[idx]) + 1,  # Convert back to 1-indexed
                'emotion': ['Baseline', 'Stress', 'Amusement', 'Meditation'][int(y_test[idx])]
            }
            samples.append(sample)
        
        # Save JSON version
        json_file = os.path.join(test_data_dir, f'S{subject_id}_test_samples.json')
        with open(json_file, 'w') as f:
            json.dump(samples, f, indent=2)
        
        print(f"  Saved {len(X_test)} test samples for S{subject_id}")
    
    
    
    def run(self, n_features=20, num_calibration=5, use_transfer_learning=True):
        """
        Run the complete personalization framework.
        
        Args:
            n_features (int): Number of features to select
            num_calibration (int): Number of calibration examples per class
            use_transfer_learning (bool): Whether to use transfer learning
        
        Returns:
            dict: Overall results
        """
        print("Enhanced Personalized Emotion Recognition Framework")
        print("--------------------------------------------------")
        
        # Load all subject data
        available_subjects = get_available_subjects()
        print(f"Available subjects: {available_subjects}")
        
        all_subjects_data = load_all_subjects()
        
        # Extract features for all subjects
        all_features_df = pd.DataFrame()
        
        for subject_id, subject_data in all_subjects_data.items():
            print(f"Extracting features for subject S{subject_id}...")
            features_df = extract_features(subject_data)
            all_features_df = pd.concat([all_features_df, features_df])
        
        print(f"\nTotal dataset size: {len(all_features_df)} segments")
        print(f"Class distribution:")
        for label, count in all_features_df['label'].value_counts().sort_index().items():
            label_name = ['Baseline', 'Stress', 'Amusement', 'Meditation'][label-1]
            print(f"  {label_name}: {count} segments")
        
        # Select best features
        print("\nSelecting features...")
        # First get all feature names (exclude metadata and label)
        metadata_cols = ['subject_id', 'segment_id', 'timestamp', 'label']
        all_feature_cols = [col for col in all_features_df.columns if col not in metadata_cols]
        
        # Fit the scaler on all features
        X_all = all_features_df[all_feature_cols].values
        self.global_scaler.fit(X_all)
        
        # Now select the best features
        self.selected_features = select_best_features(
            all_features_df, self.global_scaler, n_features=n_features)
        self.feature_names = self.selected_features
        
        # Prepare train/test data
        train_data_dict, test_data_dict, combined_train, combined_test = prepare_train_test_data(
            all_features_df, test_ratio=0.3)
        
        # Train base model
        self.base_model, self.feature_scaler = train_base_model(
            combined_train, self.feature_names, self.base_model_type, self.global_scaler)
        
        # Save base model if enabled
        if self.save_options['save_models']:
            save_model(
                self.base_model, 
                'base', 
                output_dir=self.output_dir,
                metadata={
                    'features': self.feature_names,
                    'model_type': self.base_model_type,
                    'num_samples': len(combined_train)
                }
            )
        
        # Save the scaler if enabled
        if self.save_options['save_scalers']:
            save_scaler(self.feature_scaler, 'feature_scaler', output_dir=self.output_dir)
        
        # Evaluate personalization for each subject
        results_list = []
        
        for subject_id in test_data_dict.keys():
            if len(test_data_dict[subject_id]) == 0:
                print(f"\nSkipping subject S{subject_id} (no test data)")
                continue
            
            print(f"\nEvaluating subject S{subject_id}...")
            
            # Get test data
            subject_test = test_data_dict[subject_id]
            print(f"  Test samples: {len(subject_test)}")
            
            # Extract features and labels
            X_test = subject_test[self.feature_names].values
            y_test = subject_test['label'].values - 1  # Convert to 0-indexed
            
            if self.save_options.get('save_test_data', False):
                self.save_test_data(subject_id, X_test, y_test, self.feature_names)
            
            # Standardize features
            X_test_scaled = self.feature_scaler.transform(X_test)
            
            # Create personalized model
            if subject_id in train_data_dict and len(train_data_dict[subject_id]) > 0:
                # Create personal model with transfer learning
                personal_model, calibration_data, feature_ranking = create_personal_model(
                    train_data_dict[subject_id], 
                    self.base_model,
                    self.feature_names,
                    self.feature_scaler,  # Use the feature-specific scaler
                    self.base_model_type,
                    num_calibration=num_calibration, 
                    use_transfer_learning=use_transfer_learning
                )
                
                # Store personal model and calibration data
                self.personal_models[subject_id] = personal_model
                self.calibration_examples[subject_id] = calibration_data
                self.subject_features[subject_id] = feature_ranking
                
                # Save personal model if enabled
                if self.save_options['save_models'] and self.save_options['save_personal_models']:
                    save_model(
                        personal_model, 
                        'personal', 
                        subject_id=subject_id,
                        output_dir=self.output_dir,
                        metadata={
                            'features': self.feature_names,
                            'calibration_samples': len(calibration_data),
                            'training_samples': len(train_data_dict[subject_id]),
                            'transfer_learning': use_transfer_learning
                        }
                    )
                
                # Save feature rankings if enabled
                if self.save_options['save_features']:
                    save_features(
                        feature_ranking, 
                        subject_id=subject_id, 
                        output_dir=self.output_dir
                    )
                
                # Learn ensemble weights
                self.ensemble_weights[subject_id] = learn_ensemble_weights(
                    subject_id, 
                    train_data_dict[subject_id], 
                    self.base_model, 
                    personal_model,
                    self.feature_names,
                    self.feature_scaler  # Use the feature-specific scaler
                )
                
                # Make predictions with ensemble model
                ensemble_pred = predict_with_ensemble(
                    subject_id, 
                    X_test_scaled, 
                    self.base_model, 
                    personal_model,
                    self.ensemble_weights[subject_id]
                )
                
                # Make predictions with adaptive model
                adaptive_pred = predict_with_adaptive_selection(
                    X_test_scaled, 
                    self.base_model, 
                    personal_model,
                    threshold=0.65
                )
                
                # Evaluate all models
                results = evaluate_all_models(
                    subject_id, 
                    X_test_scaled, 
                    y_test, 
                    self.base_model, 
                    personal_model, 
                    ensemble_pred, 
                    adaptive_pred
                )
                
                # Visualize confusion matrices
                confusions = {
                    'base': results['confusions']['base'],
                    'personal': results['confusions']['personal'],
                    'ensemble': results['confusions']['ensemble'],
                    'adaptive': results['confusions']['adaptive']
                }
                
                accuracies = {
                    'base': results['base_model_accuracy'],
                    'personal': results['personal_model_accuracy'],
                    'ensemble': results['ensemble_model_accuracy'],
                    'adaptive': results['adaptive_model_accuracy']
                }
                
                # Generate visualizations if enabled
                if self.save_options['save_plots']:
                    plot_confusion_matrices(subject_id, confusions, accuracies, output_dir=self.output_dir)
                    plot_feature_importance(subject_id, feature_ranking, output_dir=self.output_dir)
                
                # Add results to list
                results_list.append(results)
            else:
                print("  No training data for personalization, using base model only.")
        
        # Calculate overall results
        overall_results = calculate_overall_results(results_list)
        
        # Visualize overall results if enabled
        if 'results_df' in overall_results and len(overall_results['results_df']) > 1:
            if self.save_options['save_plots']:
                plot_overall_results(overall_results['results_df'], output_dir=self.output_dir)
            
            # Save results table in multiple formats (always save results)
            save_results_table(overall_results['results_df'], output_dir=self.output_dir)
        
        print("\nEnhanced personalization framework evaluation complete.")
        
        return overall_results
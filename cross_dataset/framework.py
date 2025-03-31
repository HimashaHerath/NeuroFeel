"""
Main framework class for cross-dataset emotion recognition.
"""

import os
import pickle
import pandas as pd
import numpy as np
import joblib

from .data.wesad_loader import process_wesad_data, get_available_subjects as get_wesad_subjects
from .data.kemocon_loader import process_kemocon_data, get_available_participants
from cross_dataset.features.extraction import extract_all_features
from cross_dataset.features.mapping import (
    map_features, 
    create_mapped_dataframes, 
    convert_to_binary_targets,
    DEFAULT_EMOTION_MAP
)
from cross_dataset.models.training import train_bidirectional_models
from cross_dataset.models.evaluation import evaluate_bidirectional_models, print_classification_reports, evaluate_feature_importance
from cross_dataset.visualization.plots import (
    plot_confusion_matrices,
    plot_precision_recall_curves, 
    plot_class_distributions,
    plot_feature_importance,
    plot_domain_adaptation_effect
)
from cross_dataset.domain_adaptation.ensemble import measure_domain_gap
from cross_dataset.config import (
    DEFAULT_WESAD_SUBJECTS,
    DEFAULT_KEMOCON_PARTICIPANTS,
    DEFAULT_ADAPTATION_METHOD,
    SEGMENT_SIZE,
    RESULTS_DIR,
    SAVE_OPTIONS,
    DEFAULT_SAVE_MODE
)


class CrossDatasetFramework:
    """
    Framework for cross-dataset emotion recognition between WESAD and K-EmoCon.
    """
    
    def __init__(self, wesad_path=None, kemocon_path=None, results_dir=None, save_options=None):
        """
        Initialize the cross-dataset framework.
        
        Args:
            wesad_path (str): Path to WESAD dataset
            kemocon_path (str): Path to K-EmoCon dataset
            results_dir (str): Directory for saving results
            save_options (dict): Options controlling what to save
        """
        # Set paths from arguments or config
        if wesad_path:
            os.environ['WESAD_PATH'] = wesad_path
        if kemocon_path:
            os.environ['KEMOCON_PATH'] = kemocon_path
        if results_dir:
            os.environ['RESULTS_DIR'] = results_dir
            self.results_dir = results_dir
        else:
            self.results_dir = RESULTS_DIR
        
        # Initialize dataset attributes
        self.wesad_data = None
        self.kemocon_data = None
        
        # Initialize model attributes
        self.arousal_models = None
        self.valence_models = None
        
        # Initialize feature mapping
        self.emotion_map = DEFAULT_EMOTION_MAP
        
        # Set save options
        self.save_options = SAVE_OPTIONS[DEFAULT_SAVE_MODE].copy()
        if save_options:
            self.save_options.update(save_options)
        
        print("Cross-dataset emotion recognition framework initialized")
        if self.save_options['save_models']:
            print("  Models will be saved")
        if self.save_options['save_features']:
            print("  Feature information will be saved")
        if self.save_options['save_plots']:
            print("  Plots will be generated and saved")
        if self.save_options['save_adaptation']:
            print("  Adaptation data will be saved")
        if self.save_options['save_personal_models']:
            print("  Individual models will be saved (including personal models)")
    
    def load_wesad_data(self, subject_ids=None):
        """
        Load and process WESAD data.
        
        Args:
            subject_ids (list): List of subject IDs to process
        
        Returns:
            pd.DataFrame: Processed WESAD data
        """
        # Use default subjects if none provided
        if subject_ids is None:
            subject_ids = DEFAULT_WESAD_SUBJECTS
        
        # Check available subjects
        available_subjects = get_wesad_subjects()
        valid_subjects = [sid for sid in subject_ids if sid in available_subjects]
        
        if not valid_subjects:
            print("No valid WESAD subjects found")
            return None
        
        # Process WESAD data
        self.wesad_data = process_wesad_data(
            valid_subjects, 
            extract_all_features, 
            self.emotion_map, 
            segment_size=SEGMENT_SIZE
        )
        
        # Save processed data if enabled
        if self.save_options['save_features']:
            data_file = os.path.join(self.results_dir, 'features', 'wesad_processed.csv')
            self.wesad_data.to_csv(data_file, index=False)
            print(f"Processed WESAD data saved to {data_file}")
        
        return self.wesad_data
    
    def load_kemocon_data(self, participant_ids=None):
        """
        Load and process K-EmoCon data.
        
        Args:
            participant_ids (list): List of participant IDs to process
        
        Returns:
            pd.DataFrame: Processed K-EmoCon data
        """
        # Use default participants if none provided
        if participant_ids is None:
            participant_ids = DEFAULT_KEMOCON_PARTICIPANTS
        
        # Check available participants
        available_participants = get_available_participants()
        valid_participants = [pid for pid in participant_ids if pid in available_participants]
        
        if not valid_participants:
            print("No valid K-EmoCon participants found")
            return None
        
        # Process K-EmoCon data
        self.kemocon_data = process_kemocon_data(
            valid_participants, 
            extract_all_features, 
            window_size=SEGMENT_SIZE
        )
        
        # Save processed data if enabled
        if self.save_options['save_features']:
            data_file = os.path.join(self.results_dir, 'features', 'kemocon_processed.csv')
            self.kemocon_data.to_csv(data_file, index=False)
            print(f"Processed K-EmoCon data saved to {data_file}")
        
        return self.kemocon_data
    
    def _save_model(self, model, name, scaler=None, metadata=None):
        """
        Save a model and related artifacts.
        
        Args:
            model: Trained model
            name (str): Name for the saved model
            scaler: Fitted scaler (optional)
            metadata (dict): Additional metadata
        
        Returns:
            str: Path to saved model
        """
        if not self.save_options['save_models']:
            return None
        
        # Create directory
        models_dir = os.path.join(self.results_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Prepare full model package
        model_package = {
            'model': model,
            'scaler': scaler,
            'metadata': metadata or {}
        }
        
        # Save with joblib for more efficient serialization
        model_path = os.path.join(models_dir, f"{name}.joblib")
        joblib.dump(model_package, model_path)
        
        # Save metadata separately as JSON for easy inspection
        if metadata:
            import json
            
            # Clean non-serializable types
            clean_meta = {}
            for key, value in metadata.items():
                if isinstance(value, (np.ndarray, np.number)):
                    clean_meta[key] = value.tolist() if hasattr(value, 'tolist') else float(value)
                elif isinstance(value, dict):
                    clean_meta[key] = {k: v for k, v in value.items() if not isinstance(v, (np.ndarray, np.number))}
                else:
                    clean_meta[key] = value
            
            meta_path = os.path.join(models_dir, f"{name}_metadata.json")
            with open(meta_path, 'w') as f:
                json.dump(clean_meta, f, indent=2)
        
        return model_path
    
    def _save_adaptation_data(self, source_features, target_features, adapted_features, name):
        """
        Save domain adaptation data for later analysis.
        
        Args:
            source_features (np.ndarray): Source domain features
            target_features (np.ndarray): Target domain features
            adapted_features (np.ndarray): Adapted source features
            name (str): Name for the saved data
        
        Returns:
            str: Path to saved data
        """
        if not self.save_options['save_adaptation']:
            return None
        
        # Create directory
        adapt_dir = os.path.join(self.results_dir, 'adaptation')
        os.makedirs(adapt_dir, exist_ok=True)
        
        # Measure domain gap reduction
        gap_info = measure_domain_gap(source_features, target_features, adapted_features)
        
        # Prepare data package
        adaptation_data = {
            'source_features': source_features,
            'target_features': target_features,
            'adapted_features': adapted_features,
            'gap_info': gap_info
        }
        
        # Save with joblib for more efficient serialization
        data_path = os.path.join(adapt_dir, f"{name}.joblib")
        joblib.dump(adaptation_data, data_path)
        
        # Save gap info separately as CSV
        gap_df = pd.DataFrame({
            'metric': ['gap_before', 'gap_after', 'gap_reduction', 'gap_reduction_percent'],
            'value': [
                gap_info['gap_before'],
                gap_info['gap_after'],
                gap_info['gap_reduction'],
                gap_info['gap_reduction_percent']
            ]
        })
        gap_path = os.path.join(adapt_dir, f"{name}_gap.csv")
        gap_df.to_csv(gap_path, index=False)
        
        # Generate plot if enabled
        if self.save_options['save_plots']:
            from .visualization.plots import plot_domain_adaptation_effect
            plot_domain_adaptation_effect(
                source_features, target_features, adapted_features,
                title=f"Domain Adaptation Effect - {name}",
                output_dir=os.path.join(self.results_dir, 'visualizations')
            )
        
        return data_path
    
    def train_cross_dataset_models(self, target='arousal', adaptation_method=None):
        """
        Train cross-dataset models for a specific target.
        
        Args:
            target (str): Target variable ('arousal' or 'valence')
            adaptation_method (str): Domain adaptation method
        
        Returns:
            dict: Trained models and evaluation results
        """
        if self.wesad_data is None or self.kemocon_data is None:
            print("Both datasets must be loaded first")
            return None
        
        # Use default adaptation method if none provided
        if adaptation_method is None:
            adaptation_method = DEFAULT_ADAPTATION_METHOD
        
        print(f"\n===== Enhanced Cross-Dataset Training for {target.capitalize()} =====")
        
        # Get common features between datasets with mutual information filtering
        wesad_features, kemocon_features = map_features(
            self.wesad_data, self.kemocon_data, 
            use_mutual_info=True, target=target
        )
        
        if not wesad_features:
            print("No common features found")
            return None
        
        # Save feature mapping if enabled
        if self.save_options['save_features']:
            feature_dir = os.path.join(self.results_dir, 'features')
            mapping_df = pd.DataFrame({
                'wesad_feature': wesad_features,
                'kemocon_feature': kemocon_features
            })
            mapping_df.to_csv(os.path.join(feature_dir, f"{target}_feature_mapping.csv"), index=False)
        
        # Create mapped dataframes with only the selected features
        wesad_mapped, kemocon_mapped = create_mapped_dataframes(
            self.wesad_data, self.kemocon_data,
            wesad_features, kemocon_features
        )
        
        # Convert targets to binary classification
        wesad_y, kemocon_y = convert_to_binary_targets(wesad_mapped, kemocon_mapped, target)
        
        # Extract feature arrays
        wesad_X = wesad_mapped[wesad_features].values
        kemocon_X = kemocon_mapped[kemocon_features].values
        
        # Train bidirectional models
        models = train_bidirectional_models(
            wesad_X, wesad_y, kemocon_X, kemocon_y, adaptation_method
        )
        
        # Extract adapted features for saving/visualization
        if adaptation_method and adaptation_method != 'none' and self.save_options['save_adaptation']:
            w2k_adapted = models['wesad_to_kemocon']['info'].get('adapted_features')
            k2w_adapted = models['kemocon_to_wesad']['info'].get('adapted_features')
            
            if w2k_adapted is not None:
                self._save_adaptation_data(
                    wesad_X, kemocon_X, w2k_adapted,
                    f"{target}_wesad_to_kemocon"
                )
            
            if k2w_adapted is not None:
                self._save_adaptation_data(
                    kemocon_X, wesad_X, k2w_adapted,
                    f"{target}_kemocon_to_wesad"
                )
        
        # Save the models if enabled
        if self.save_options['save_models']:
            # Always save base models
            self._save_model(
                models['wesad_to_kemocon']['model'],
                f"{target}_wesad_to_kemocon_model",
                scaler=models['wesad_to_kemocon']['scaler'],
                metadata={
                    'target': target,
                    'adaptation_method': adaptation_method,
                    'n_features': len(wesad_features),
                    'features': wesad_features,
                    'target_features': kemocon_features,
                    'class_balance': models['wesad_to_kemocon']['info'].get('class_distribution')
                }
            )
            
            self._save_model(
                models['kemocon_to_wesad']['model'],
                f"{target}_kemocon_to_wesad_model",
                scaler=models['kemocon_to_wesad']['scaler'],
                metadata={
                    'target': target,
                    'adaptation_method': adaptation_method,
                    'n_features': len(kemocon_features),
                    'features': kemocon_features,
                    'target_features': wesad_features,
                    'class_balance': models['kemocon_to_wesad']['info'].get('class_distribution')
                }
            )
            
            # Save component models if full saving is enabled
            if self.save_options['save_personal_models']:
                # Extract and save individual models from the ensemble
                if hasattr(models['wesad_to_kemocon']['model'], 'named_estimators_'):
                    w2k_estimators = models['wesad_to_kemocon']['model'].named_estimators_
                    for name, estimator in w2k_estimators.items():
                        self._save_model(
                            estimator,
                            f"{target}_wesad_to_kemocon_{name}",
                            scaler=models['wesad_to_kemocon']['scaler']
                        )
                
                if hasattr(models['kemocon_to_wesad']['model'], 'named_estimators_'):
                    k2w_estimators = models['kemocon_to_wesad']['model'].named_estimators_
                    for name, estimator in k2w_estimators.items():
                        self._save_model(
                            estimator,
                            f"{target}_kemocon_to_wesad_{name}",
                            scaler=models['kemocon_to_wesad']['scaler']
                        )
        
        # Evaluate models
        evaluation = evaluate_bidirectional_models(
            models, wesad_X, wesad_y, kemocon_X, kemocon_y
        )
        
        # Print detailed classification reports
        print_classification_reports(evaluation)
        
        # Save evaluation results
        results_dir = os.path.join(self.results_dir, 'results', target)
        os.makedirs(results_dir, exist_ok=True)
        
        # Create summary metrics DataFrame
        metrics = pd.DataFrame({
            'wesad_to_kemocon': {
                'accuracy': evaluation['wesad_to_kemocon']['accuracy'],
                'f1_score': evaluation['wesad_to_kemocon']['f1_score'],
                'balanced_accuracy': evaluation['wesad_to_kemocon']['balanced_accuracy'],
                'roc_auc': evaluation['wesad_to_kemocon']['roc_auc'],
                'pr_auc': evaluation['wesad_to_kemocon']['pr_auc'],
                'threshold': evaluation['wesad_to_kemocon']['threshold']
            },
            'kemocon_to_wesad': {
                'accuracy': evaluation['kemocon_to_wesad']['accuracy'],
                'f1_score': evaluation['kemocon_to_wesad']['f1_score'],
                'balanced_accuracy': evaluation['kemocon_to_wesad']['balanced_accuracy'],
                'roc_auc': evaluation['kemocon_to_wesad']['roc_auc'],
                'pr_auc': evaluation['kemocon_to_wesad']['pr_auc'],
                'threshold': evaluation['kemocon_to_wesad']['threshold']
            }
        }).T
        
        # Save summary metrics
        metrics.to_csv(os.path.join(results_dir, 'metrics_summary.csv'))
        
        # Save detailed classification reports
        w2k_report = pd.DataFrame(evaluation['wesad_to_kemocon']['classification_report']).T
        k2w_report = pd.DataFrame(evaluation['kemocon_to_wesad']['classification_report']).T
        
        w2k_report.to_csv(os.path.join(results_dir, 'wesad_to_kemocon_classification.csv'))
        k2w_report.to_csv(os.path.join(results_dir, 'kemocon_to_wesad_classification.csv'))
        
        # Save confusion matrices
        w2k_cm = pd.DataFrame(
            evaluation['wesad_to_kemocon']['confusion_matrix'],
            columns=['Pred_Low', 'Pred_High'],
            index=['True_Low', 'True_High']
        )
        k2w_cm = pd.DataFrame(
            evaluation['kemocon_to_wesad']['confusion_matrix'],
            columns=['Pred_Low', 'Pred_High'],
            index=['True_Low', 'True_High']
        )
        
        w2k_cm.to_csv(os.path.join(results_dir, 'wesad_to_kemocon_confusion.csv'))
        k2w_cm.to_csv(os.path.join(results_dir, 'kemocon_to_wesad_confusion.csv'))
        
        # Generate and save visualizations if enabled
        if self.save_options['save_plots']:
            viz_dir = os.path.join(self.results_dir, 'visualizations', target)
            os.makedirs(viz_dir, exist_ok=True)
            
            # Save paths instead of just returning them
            cm_path = plot_confusion_matrices(evaluation, target, output_dir=viz_dir)
            pr_path = plot_precision_recall_curves(evaluation, target, output_dir=viz_dir)
            
            # Plot class distributions
            w2k_info = models['wesad_to_kemocon']['info']
            k2w_info = models['kemocon_to_wesad']['info']
            
            # Create balanced distributions for visualization
            wesad_balanced_y = np.zeros(sum(w2k_info['class_distribution']), dtype=np.int64)
            wesad_balanced_y[w2k_info['class_distribution'][0]:] = 1

            kemocon_balanced_y = np.zeros(sum(k2w_info['class_distribution']), dtype=np.int64) 
            kemocon_balanced_y[k2w_info['class_distribution'][0]:] = 1
            
            dist_path = plot_class_distributions(
                wesad_y, kemocon_y, 
                wesad_balanced_y, kemocon_balanced_y, 
                target, output_dir=viz_dir
            )
            
            # Extract and plot feature importance
            w2k_model = models['wesad_to_kemocon']['model']
            importance_df = evaluate_feature_importance(w2k_model, wesad_features)
            
            # Save feature importance data
            importance_df.to_csv(os.path.join(results_dir, 'feature_importance.csv'), index=False)
            
            # Plot feature importance
            imp_path = plot_feature_importance(importance_df, target, output_dir=viz_dir)
        
        # Store models for later use
        if target == 'arousal':
            self.arousal_models = {
                'models': models,
                'evaluation': evaluation,
                'features': {
                    'wesad': wesad_features,
                    'kemocon': kemocon_features
                }
            }
        elif target == 'valence':
            self.valence_models = {
                'models': models,
                'evaluation': evaluation,
                'features': {
                    'wesad': wesad_features,
                    'kemocon': kemocon_features
                }
            }
        
        # Return combined results
        return {
            'models': models,
            'evaluation': evaluation,
            'features': {
                'wesad': wesad_features,
                'kemocon': kemocon_features
            },
            'importance': importance_df
        }
    
    def train_all_models(self, adaptation_method=None):
        """
        Train models for both arousal and valence.
        
        Args:
            adaptation_method (str): Domain adaptation method
        
        Returns:
            dict: Results for both targets
        """
        # Train arousal models
        arousal_results = self.train_cross_dataset_models('arousal', adaptation_method)
        
        # Train valence models
        valence_results = self.train_cross_dataset_models('valence', adaptation_method)
        
        # Print performance summary
        self._print_performance_summary()
        
        # Save overall summary if both targets were trained
        if arousal_results and valence_results:
            self._save_overall_summary()
        
        return {
            'arousal': arousal_results,
            'valence': valence_results
        }
    
    def _print_performance_summary(self):
        """Print summary of all model performance."""
        print("\n===== Performance Summary with Enhanced Metrics =====")
        
        if self.arousal_models:
            ar_w2k = self.arousal_models['evaluation']['wesad_to_kemocon']
            ar_k2w = self.arousal_models['evaluation']['kemocon_to_wesad']
            
            print(f"Arousal WESAD → K-EmoCon: Accuracy = {ar_w2k['accuracy']:.4f}, " 
                  f"F1 = {ar_w2k['f1_score']:.4f}, AUC = {ar_w2k['roc_auc']:.4f}, "
                  f"Balanced Acc = {ar_w2k['balanced_accuracy']:.4f}, PR-AUC = {ar_w2k['pr_auc']:.4f}")
                  
            print(f"Arousal K-EmoCon → WESAD: Accuracy = {ar_k2w['accuracy']:.4f}, " 
                  f"F1 = {ar_k2w['f1_score']:.4f}, AUC = {ar_k2w['roc_auc']:.4f}, "
                  f"Balanced Acc = {ar_k2w['balanced_accuracy']:.4f}, PR-AUC = {ar_k2w['pr_auc']:.4f}")
        
        if self.valence_models:
            val_w2k = self.valence_models['evaluation']['wesad_to_kemocon']
            val_k2w = self.valence_models['evaluation']['kemocon_to_wesad']
            
            print(f"Valence WESAD → K-EmoCon: Accuracy = {val_w2k['accuracy']:.4f}, " 
                  f"F1 = {val_w2k['f1_score']:.4f}, AUC = {val_w2k['roc_auc']:.4f}, "
                  f"Balanced Acc = {val_w2k['balanced_accuracy']:.4f}, PR-AUC = {val_w2k['pr_auc']:.4f}")
                  
            print(f"Valence K-EmoCon → WESAD: Accuracy = {val_k2w['accuracy']:.4f}, " 
                  f"F1 = {val_k2w['f1_score']:.4f}, AUC = {val_k2w['roc_auc']:.4f}, "
                  f"Balanced Acc = {val_k2w['balanced_accuracy']:.4f}, PR-AUC = {val_k2w['pr_auc']:.4f}")
    
    def _save_overall_summary(self):
        """Save overall summary of both arousal and valence results."""
        if not (self.arousal_models and self.valence_models):
            return
        
        # Create summary dataframe with all results
        summary_data = {
            'arousal_w2k_accuracy': self.arousal_models['evaluation']['wesad_to_kemocon']['accuracy'],
            'arousal_w2k_f1': self.arousal_models['evaluation']['wesad_to_kemocon']['f1_score'],
            'arousal_w2k_balanced_acc': self.arousal_models['evaluation']['wesad_to_kemocon']['balanced_accuracy'],
            'arousal_w2k_pr_auc': self.arousal_models['evaluation']['wesad_to_kemocon']['pr_auc'],
            
            'arousal_k2w_accuracy': self.arousal_models['evaluation']['kemocon_to_wesad']['accuracy'],
            'arousal_k2w_f1': self.arousal_models['evaluation']['kemocon_to_wesad']['f1_score'],
            'arousal_k2w_balanced_acc': self.arousal_models['evaluation']['kemocon_to_wesad']['balanced_accuracy'],
            'arousal_k2w_pr_auc': self.arousal_models['evaluation']['kemocon_to_wesad']['pr_auc'],
            
            'valence_w2k_accuracy': self.valence_models['evaluation']['wesad_to_kemocon']['accuracy'],
            'valence_w2k_f1': self.valence_models['evaluation']['wesad_to_kemocon']['f1_score'],
            'valence_w2k_balanced_acc': self.valence_models['evaluation']['wesad_to_kemocon']['balanced_accuracy'],
            'valence_w2k_pr_auc': self.valence_models['evaluation']['wesad_to_kemocon']['pr_auc'],
            
            'valence_k2w_accuracy': self.valence_models['evaluation']['kemocon_to_wesad']['accuracy'],
            'valence_k2w_f1': self.valence_models['evaluation']['kemocon_to_wesad']['f1_score'],
            'valence_k2w_balanced_acc': self.valence_models['evaluation']['kemocon_to_wesad']['balanced_accuracy'],
            'valence_k2w_pr_auc': self.valence_models['evaluation']['kemocon_to_wesad']['pr_auc'],
        }
        
        # Create summary in both wide and long format
        summary_wide = pd.DataFrame([summary_data])
        
        summary_long = pd.DataFrame({
            'target': ['arousal', 'arousal', 'valence', 'valence'],
            'direction': ['wesad_to_kemocon', 'kemocon_to_wesad', 'wesad_to_kemocon', 'kemocon_to_wesad'],
            'accuracy': [
                summary_data['arousal_w2k_accuracy'],
                summary_data['arousal_k2w_accuracy'],
                summary_data['valence_w2k_accuracy'],
                summary_data['valence_k2w_accuracy']
            ],
            'f1_score': [
                summary_data['arousal_w2k_f1'],
                summary_data['arousal_k2w_f1'],
                summary_data['valence_w2k_f1'],
                summary_data['valence_k2w_f1']
            ],
            'balanced_accuracy': [
                summary_data['arousal_w2k_balanced_acc'],
                summary_data['arousal_k2w_balanced_acc'],
                summary_data['valence_w2k_balanced_acc'],
                summary_data['valence_k2w_balanced_acc']
            ],
            'pr_auc': [
                summary_data['arousal_w2k_pr_auc'],
                summary_data['arousal_k2w_pr_auc'],
                summary_data['valence_w2k_pr_auc'],
                summary_data['valence_k2w_pr_auc']
            ]
        })
        
        # Save summary in both formats
        results_dir = os.path.join(self.results_dir, 'results')
        summary_wide.to_csv(os.path.join(results_dir, 'overall_summary_wide.csv'), index=False)
        summary_long.to_csv(os.path.join(results_dir, 'overall_summary.csv'), index=False)
        
        # Create a human-readable summary text file
        # Open file with utf-8 encoding to support Unicode characters
        with open(os.path.join(results_dir, 'summary.txt'), 'w', encoding='utf-8') as f:
            f.write("Cross-Dataset Emotion Recognition - Performance Summary\n")
            f.write("===================================================\n\n")
            
            f.write("AROUSAL RESULTS\n")
            f.write("--------------\n")
            f.write(f"WESAD → K-EmoCon:\n")  # Unicode arrow character
            f.write(f"  Accuracy: {summary_data['arousal_w2k_accuracy']:.4f}\n")
            f.write(f"  F1 Score: {summary_data['arousal_w2k_f1']:.4f}\n")
            f.write(f"  Balanced Accuracy: {summary_data['arousal_w2k_balanced_acc']:.4f}\n")
            f.write(f"  PR-AUC: {summary_data['arousal_w2k_pr_auc']:.4f}\n\n")
            
            f.write(f"K-EmoCon → WESAD:\n")  # Unicode arrow character
            f.write(f"  Accuracy: {summary_data['arousal_k2w_accuracy']:.4f}\n")
            f.write(f"  F1 Score: {summary_data['arousal_k2w_f1']:.4f}\n")
            f.write(f"  Balanced Accuracy: {summary_data['arousal_k2w_balanced_acc']:.4f}\n")
            f.write(f"  PR-AUC: {summary_data['arousal_k2w_pr_auc']:.4f}\n\n")
            
            f.write("VALENCE RESULTS\n")
            f.write("--------------\n")
            f.write(f"WESAD → K-EmoCon:\n")  # Unicode arrow character
            f.write(f"  Accuracy: {summary_data['valence_w2k_accuracy']:.4f}\n")
            f.write(f"  F1 Score: {summary_data['valence_w2k_f1']:.4f}\n")
            f.write(f"  Balanced Accuracy: {summary_data['valence_w2k_balanced_acc']:.4f}\n")
            f.write(f"  PR-AUC: {summary_data['valence_w2k_pr_auc']:.4f}\n\n")
            
            f.write(f"K-EmoCon → WESAD:\n")  # Unicode arrow character
            f.write(f"  Accuracy: {summary_data['valence_k2w_accuracy']:.4f}\n")
            f.write(f"  F1 Score: {summary_data['valence_k2w_f1']:.4f}\n")
            f.write(f"  Balanced Accuracy: {summary_data['valence_k2w_balanced_acc']:.4f}\n")
            f.write(f"  PR-AUC: {summary_data['valence_k2w_pr_auc']:.4f}\n\n")
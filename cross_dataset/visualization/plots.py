"""
Visualization utilities for cross-dataset emotion recognition.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import precision_recall_curve
from sklearn.decomposition import PCA

from cross_dataset.config import RESULTS_DIR


def setup_plots():
    """Set up global matplotlib settings."""
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['font.size'] = 12
    plt.style.use('seaborn-v0_8-whitegrid')


def ensure_results_dir(target=''):
    """
    Ensure the results directory exists.
    
    Args:
        target (str): Target subdirectory
    
    Returns:
        str: Full path to directory
    """
    full_path = os.path.join(RESULTS_DIR, target)
    os.makedirs(full_path, exist_ok=True)
    return full_path


def plot_confusion_matrices(evaluation_results, target='arousal', output_dir=None):
    """
    Plot confusion matrices for both directions.
    
    Args:
        evaluation_results (dict): Evaluation results
        target (str): Target variable name
        output_dir (str): Optional directory to save figures to
    
    Returns:
        str: Path to saved figure
    """
    setup_plots()
    plt.figure(figsize=(16, 8))
    
    # WESAD → K-EmoCon confusion matrix
    plt.subplot(1, 2, 1)
    cm = evaluation_results['wesad_to_kemocon']['confusion_matrix']
    
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
               xticklabels=['Low', 'High'], yticklabels=['Low', 'High'])
    
    plt.title(f'WESAD → K-EmoCon Confusion Matrix ({target})')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    
    # K-EmoCon → WESAD confusion matrix
    plt.subplot(1, 2, 2)
    cm = evaluation_results['kemocon_to_wesad']['confusion_matrix']
    
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
               xticklabels=['Low', 'High'], yticklabels=['Low', 'High'])
    
    plt.title(f'K-EmoCon → WESAD Confusion Matrix ({target})')
    plt.xlabel('Predicted')
    plt.ylabel('True')
    
    plt.tight_layout()
    
    # Save figure
    if output_dir is not None:
        results_dir = output_dir
    else:
        results_dir = ensure_results_dir()
    
    save_path = os.path.join(results_dir, f'confusion_matrices_{target}.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return save_path


def plot_precision_recall_curves(evaluation_results, target='arousal', output_dir=None):
    """
    Plot precision-recall curves for both directions.
    
    Args:
        evaluation_results (dict): Evaluation results
        target (str): Target variable name
        output_dir (str): Optional directory to save figures to
    
    Returns:
        str: Path to saved figure
    """
    setup_plots()
    plt.figure(figsize=(16, 8))
    
    # WESAD → K-EmoCon PR curve
    plt.subplot(1, 2, 1)
    
    y_true = evaluation_results['wesad_to_kemocon']['y_true']
    y_prob = evaluation_results['wesad_to_kemocon']['y_prob']
    
    precision, recall, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = evaluation_results['wesad_to_kemocon']['pr_auc']
    
    plt.plot(recall, precision, label=f'PR AUC: {pr_auc:.3f}')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title(f'WESAD → K-EmoCon PR Curve ({target})')
    plt.legend()
    
    # Add diagonal reference line
    plt.plot([0, 1], [0.5, 0.5], 'k--', alpha=0.5)
    
    # K-EmoCon → WESAD PR curve
    plt.subplot(1, 2, 2)
    
    y_true = evaluation_results['kemocon_to_wesad']['y_true']
    y_prob = evaluation_results['kemocon_to_wesad']['y_prob']
    
    precision, recall, _ = precision_recall_curve(y_true, y_prob)
    pr_auc = evaluation_results['kemocon_to_wesad']['pr_auc']
    
    plt.plot(recall, precision, label=f'PR AUC: {pr_auc:.3f}')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title(f'K-EmoCon → WESAD PR Curve ({target})')
    plt.legend()
    
    # Add diagonal reference line
    plt.plot([0, 1], [0.5, 0.5], 'k--', alpha=0.5)
    
    plt.tight_layout()
    
    # Save figure
    if output_dir is not None:
        results_dir = output_dir
    else:
        results_dir = ensure_results_dir()
    
    save_path = os.path.join(results_dir, f'pr_curves_{target}.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return save_path


def plot_class_distributions(wesad_y, kemocon_y, wesad_balanced_y=None, kemocon_balanced_y=None, target='arousal', output_dir=None):
    """
    Plot class distributions before and after balancing.
    
    Args:
        wesad_y (np.ndarray): Original WESAD labels
        kemocon_y (np.ndarray): Original K-EmoCon labels
        wesad_balanced_y (np.ndarray): Balanced WESAD labels
        kemocon_balanced_y (np.ndarray): Balanced K-EmoCon labels
        target (str): Target variable name
        output_dir (str): Optional directory to save figures to
    
    Returns:
        str: Path to saved figure
    """
    setup_plots()
    plt.figure(figsize=(16, 6))
    
    # Convert inputs to integers if they're not already
    wesad_y = np.asarray(wesad_y, dtype=np.int64)
    kemocon_y = np.asarray(kemocon_y, dtype=np.int64)
    
    # Class distributions
    w_original = np.bincount(wesad_y)
    k_original = np.bincount(kemocon_y)
    
    # Calculate ratios
    wesad_orig_ratio = w_original[0] / w_original[1] if w_original[1] > w_original[0] else w_original[1] / w_original[0]
    kemocon_orig_ratio = k_original[0] / k_original[1] if k_original[1] > k_original[0] else k_original[1] / k_original[0]
    
    # WESAD class distribution
    plt.subplot(1, 2, 1)
    
    labels = ['Original']
    ratios = [wesad_orig_ratio]
    
    if wesad_balanced_y is not None:
        # Convert to integer array safely
        wesad_balanced_y = np.asarray(wesad_balanced_y, dtype=np.int64)
        w_balanced = np.bincount(wesad_balanced_y)
        
        # Handle case where balanced array might have different number of classes
        if len(w_balanced) < 2:
            w_balanced = np.append(w_balanced, [0] * (2 - len(w_balanced)))
            
        wesad_bal_ratio = w_balanced[0] / w_balanced[1] if w_balanced[1] > w_balanced[0] else w_balanced[1] / w_balanced[0]
        labels.append('Balanced')
        ratios.append(wesad_bal_ratio)
    
    plt.bar(labels, ratios)
    plt.title(f'WESAD Class Balance ({target})')
    plt.ylabel('Minority/Majority Ratio')
    plt.ylim(0, 1.1)
    
    # Add count annotations
    for i, label in enumerate(labels):
        if label == 'Original':
            plt.text(i, ratios[i] + 0.05, f'{w_original[0]}/{w_original[1]}', ha='center')
        else:
            plt.text(i, ratios[i] + 0.05, f'{w_balanced[0]}/{w_balanced[1]}', ha='center')
    
    # K-EmoCon class distribution
    plt.subplot(1, 2, 2)
    
    labels = ['Original']
    ratios = [kemocon_orig_ratio]
    
    if kemocon_balanced_y is not None:
        # Convert to integer array safely
        kemocon_balanced_y = np.asarray(kemocon_balanced_y, dtype=np.int64)
        k_balanced = np.bincount(kemocon_balanced_y)
        
        # Handle case where balanced array might have different number of classes
        if len(k_balanced) < 2:
            k_balanced = np.append(k_balanced, [0] * (2 - len(k_balanced)))
            
        kemocon_bal_ratio = k_balanced[0] / k_balanced[1] if k_balanced[1] > k_balanced[0] else k_balanced[1] / k_balanced[0]
        labels.append('Balanced')
        ratios.append(kemocon_bal_ratio)
    
    plt.bar(labels, ratios)
    plt.title(f'K-EmoCon Class Balance ({target})')
    plt.ylabel('Minority/Majority Ratio')
    plt.ylim(0, 1.1)
    
    # Add count annotations
    for i, label in enumerate(labels):
        if label == 'Original':
            plt.text(i, ratios[i] + 0.05, f'{k_original[0]}/{k_original[1]}', ha='center')
        else:
            plt.text(i, ratios[i] + 0.05, f'{k_balanced[0]}/{k_balanced[1]}', ha='center')
    
    plt.tight_layout()
    
    # Save figure
    if output_dir is not None:
        results_dir = output_dir
    else:
        results_dir = ensure_results_dir()
    
    save_path = os.path.join(results_dir, f'class_distributions_{target}.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return save_path


def plot_feature_importance(importance_df, target='arousal', output_dir=None):
    """
    Plot feature importance.
    
    Args:
        importance_df (pd.DataFrame): Feature importance DataFrame
        target (str): Target variable name
        output_dir (str): Optional directory to save figures to
    
    Returns:
        str: Path to saved figure
    """
    setup_plots()
    plt.figure(figsize=(12, 8))
    
    # Select top 10 features
    top_n = min(10, len(importance_df))
    df_plot = importance_df.head(top_n).copy()
    
    # Plot
    sns.barplot(x='Importance', y='Feature', data=df_plot)
    plt.title(f'Top Features for {target.capitalize()} Prediction')
    plt.tight_layout()
    
    # Save figure
    if output_dir is not None:
        results_dir = output_dir
    else:
        results_dir = ensure_results_dir()
    
    save_path = os.path.join(results_dir, f'feature_importance_{target}.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return save_path



def plot_domain_adaptation_effect(source_features, target_features, adapted_features, title='', output_dir=None):
    """
    Visualize the effect of domain adaptation using PCA.
    
    Args:
        source_features (np.ndarray): Source domain features
        target_features (np.ndarray): Target domain features
        adapted_features (np.ndarray): Adapted source features
        title (str): Plot title
        output_dir (str): Optional directory to save figures to
    
    Returns:
        str: Path to saved figure
    """
    setup_plots()
    plt.figure(figsize=(14, 6))
    
    # Combine features for PCA
    combined = np.vstack([source_features, target_features, adapted_features])
    
    # Apply PCA
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(combined)
    
    # Split back into source, target, and adapted
    n_source = source_features.shape[0]
    n_target = target_features.shape[0]
    
    source_pca = pca_result[:n_source]
    target_pca = pca_result[n_source:n_source+n_target]
    adapted_pca = pca_result[n_source+n_target:]
    
    # Plot
    plt.subplot(1, 2, 1)
    plt.scatter(source_pca[:, 0], source_pca[:, 1], alpha=0.5, label='Source')
    plt.scatter(target_pca[:, 0], target_pca[:, 1], alpha=0.5, label='Target')
    plt.title('Before Adaptation')
    plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%})')
    plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%})')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.scatter(adapted_pca[:, 0], adapted_pca[:, 1], alpha=0.5, label='Adapted Source')
    plt.scatter(target_pca[:, 0], target_pca[:, 1], alpha=0.5, label='Target')
    plt.title('After Adaptation')
    plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%})')
    plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%})')
    plt.legend()
    
    plt.suptitle(title or 'Domain Adaptation Effect', fontsize=14)
    plt.tight_layout(rect=[0, 0, 1, 0.95])
    
    # Save figure
    if output_dir is not None:
        results_dir = output_dir
    else:
        results_dir = ensure_results_dir()
    
    save_path = os.path.join(results_dir, 'domain_adaptation_effect.png')
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    
    return save_path
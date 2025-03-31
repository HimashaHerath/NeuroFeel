"""
Visualization utilities for emotion recognition models.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from matplotlib.colors import LinearSegmentedColormap


def plot_confusion_matrices(subject_id, confusions, accuracies, output_dir=None):
    """
    Plot confusion matrices for all models.
    
    Args:
        subject_id (int): Subject ID
        confusions (dict): Dictionary of confusion matrices
        accuracies (dict): Dictionary of accuracies
        output_dir (str): Directory to save the figure
    
    Returns:
        str: Path to saved figure
    """
    plt.figure(figsize=(16, 8))
    
    # Set a higher DPI for better resolution
    plt.rcParams['figure.dpi'] = 150
    
    # Common colormap for all plots
    cmap = sns.color_palette("Blues", as_cmap=True)
    
    plt.subplot(2, 2, 1)
    cm = confusions['base']
    sns.heatmap(cm, annot=True, fmt='d', cmap=cmap,
              xticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'],
              yticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'])
    plt.title(f'Base Model (Acc: {accuracies["base"]:.3f})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    plt.subplot(2, 2, 2)
    cm = confusions['personal']
    sns.heatmap(cm, annot=True, fmt='d', cmap=cmap,
              xticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'],
              yticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'])
    plt.title(f'Personal Model (Acc: {accuracies["personal"]:.3f})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    plt.subplot(2, 2, 3)
    cm = confusions['ensemble']
    sns.heatmap(cm, annot=True, fmt='d', cmap=cmap,
              xticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'],
              yticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'])
    plt.title(f'Ensemble Model (Acc: {accuracies["ensemble"]:.3f})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    plt.subplot(2, 2, 4)
    cm = confusions['adaptive']
    sns.heatmap(cm, annot=True, fmt='d', cmap=cmap,
              xticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'],
              yticklabels=['Baseline', 'Stress', 'Amusement', 'Meditation'])
    plt.title(f'Adaptive Model (Acc: {accuracies["adaptive"]:.3f})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Add a main title with subject information
    plt.suptitle(f'Subject S{subject_id} - Confusion Matrices Comparison', fontsize=16, y=0.98)
    
    plt.tight_layout(rect=[0, 0, 1, 0.96])  # Adjust for the main title
    
    # Create visualization subfolder if it doesn't exist
    viz_dir = os.path.join(output_dir, 'visualizations')
    os.makedirs(viz_dir, exist_ok=True)
    
    # Save figure in multiple formats
    fig_path_png = os.path.join(viz_dir, f'confusion_matrix_S{subject_id}.png')
    fig_path_pdf = os.path.join(viz_dir, f'confusion_matrix_S{subject_id}.pdf')
    
    plt.savefig(fig_path_png, dpi=150, bbox_inches='tight')
    plt.savefig(fig_path_pdf, bbox_inches='tight')
    plt.close()
    
    return fig_path_png


def plot_overall_results(results_df, output_dir='.'):
    """
    Plot overall results comparing model performances across subjects.
    
    Args:
        results_df (pd.DataFrame): DataFrame of results
        output_dir (str): Directory to save the figure
    
    Returns:
        str: Path to saved figure
    """
    if len(results_df) <= 1:
        return None
    
    # Create visualization subfolder if it doesn't exist
    viz_dir = os.path.join(output_dir, 'visualizations')
    os.makedirs(viz_dir, exist_ok=True)
    
    # Create two plots: accuracy comparison and improvement comparison
    
    # 1. Accuracy comparison plot
    plt.figure(figsize=(14, 7))
    plt.rcParams['figure.dpi'] = 150
    
    # Sort by improvement
    results_df = results_df.copy()  # Create a copy to avoid warning
    results_df['adaptive_improvement'] = results_df['adaptive_model_accuracy'] - results_df['base_model_accuracy']
    results_df = results_df.sort_values('adaptive_improvement', ascending=False)
    
    # Create bar plot
    bar_width = 0.2
    x = np.arange(len(results_df))
    
    # Use more distinct colors
    base_color = '#1f77b4'  # blue
    personal_color = '#ff7f0e'  # orange
    ensemble_color = '#2ca02c'  # green
    adaptive_color = '#d62728'  # red
    
    plt.bar(x - bar_width*1.5, results_df['base_model_accuracy'], bar_width, label='Base Model', color=base_color)
    plt.bar(x - bar_width*0.5, results_df['personal_model_accuracy'], bar_width, label='Personal Model', color=personal_color)
    plt.bar(x + bar_width*0.5, results_df['ensemble_model_accuracy'], bar_width, label='Ensemble Model', color=ensemble_color)
    plt.bar(x + bar_width*1.5, results_df['adaptive_model_accuracy'], bar_width, label='Adaptive Model', color=adaptive_color)
    
    # Add value labels on top of bars for the adaptive model
    for i, acc in enumerate(results_df['adaptive_model_accuracy']):
        plt.text(x[i] + bar_width*1.5, acc + 0.01, f'{acc:.2f}', ha='center', fontsize=8)
    
    plt.xlabel('Subject', fontsize=12)
    plt.ylabel('Accuracy', fontsize=12)
    plt.title('Model Accuracy Comparison by Subject', fontsize=14)
    plt.xticks(x, [f'S{id}' for id in results_df['subject_id']])
    plt.legend(loc='lower right')
    plt.grid(axis='y', alpha=0.3)
    plt.ylim(0.5, 1.05)  # Set y-axis limit from 0.5 to 1.05 to see all bars clearly
    
    plt.tight_layout()
    
    # Save accuracy comparison figure
    fig_path_acc_png = os.path.join(viz_dir, 'model_accuracy_comparison.png')
    fig_path_acc_pdf = os.path.join(viz_dir, 'model_accuracy_comparison.pdf')
    plt.savefig(fig_path_acc_png, dpi=150, bbox_inches='tight')
    plt.savefig(fig_path_acc_pdf, bbox_inches='tight')
    plt.close()
    
    # 2. Improvement comparison plot
    plt.figure(figsize=(14, 7))
    
    # Calculate improvements
    results_df['personal_improvement'] = results_df['personal_model_accuracy'] - results_df['base_model_accuracy']
    results_df['ensemble_improvement'] = results_df['ensemble_model_accuracy'] - results_df['base_model_accuracy']
    
    # Sort by adaptive improvement
    results_df = results_df.sort_values('adaptive_improvement', ascending=False)
    
    # Create bar plot for improvements
    plt.bar(x - bar_width, results_df['personal_improvement'], bar_width, label='Personal Model', color=personal_color)
    plt.bar(x, results_df['ensemble_improvement'], bar_width, label='Ensemble Model', color=ensemble_color)
    plt.bar(x + bar_width, results_df['adaptive_improvement'], bar_width, label='Adaptive Model', color=adaptive_color)
    
    # Add horizontal line at y=0
    plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)
    
    # Add value labels for adaptive improvement
    for i, imp in enumerate(results_df['adaptive_improvement']):
        color = 'green' if imp >= 0 else 'red'
        plt.text(x[i] + bar_width, imp + (0.01 if imp >= 0 else -0.02), 
                 f'{imp:.2f}', ha='center', fontsize=8, color=color)
    
    plt.xlabel('Subject', fontsize=12)
    plt.ylabel('Improvement over Base Model', fontsize=12)
    plt.title('Model Improvement Comparison by Subject', fontsize=14)
    plt.xticks(x, [f'S{id}' for id in results_df['subject_id']])
    plt.legend(loc='upper right')
    plt.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    
    # Save improvement comparison figure
    fig_path_imp_png = os.path.join(viz_dir, 'model_improvement_comparison.png')
    fig_path_imp_pdf = os.path.join(viz_dir, 'model_improvement_comparison.pdf')
    plt.savefig(fig_path_imp_png, dpi=150, bbox_inches='tight')
    plt.savefig(fig_path_imp_pdf, bbox_inches='tight')
    plt.close()
    
    return fig_path_acc_png


def plot_feature_importance(subject_id, feature_ranking, num_features=10, output_dir='.'):
    """
    Plot feature importance for a specific subject.
    
    Args:
        subject_id (int): Subject ID
        feature_ranking (list): List of (feature, score) tuples
        num_features (int): Number of top features to plot
        output_dir (str): Directory to save the figure
    
    Returns:
        str: Path to saved figure
    """
    # Create visualization subfolder if it doesn't exist
    viz_dir = os.path.join(output_dir, 'visualizations', 'feature_importance')
    os.makedirs(viz_dir, exist_ok=True)
    
    plt.figure(figsize=(10, 7))
    plt.rcParams['figure.dpi'] = 150
    
    # Get top features
    top_features = feature_ranking[:num_features]
    
    # Extract features and scores
    features = [f[0] for f in top_features]
    scores = [f[1] for f in top_features]
    
    # Create a reversed list for better visualization (top feature at the top)
    features = features[::-1]
    scores = scores[::-1]
    
    # Create color gradient based on importance
    colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(features)))
    
    # Create bar plot
    y_pos = np.arange(len(features))
    bars = plt.barh(y_pos, scores, align='center', color=colors)
    
    # Add value labels
    for i, (bar, score) in enumerate(zip(bars, scores)):
        plt.text(score + max(scores)*0.01, bar.get_y() + bar.get_height()/2, 
                 f'{score:.3f}', va='center', fontsize=9)
    
    plt.yticks(y_pos, features)
    plt.xlabel('Mutual Information Score', fontsize=12)
    plt.title(f'Top {num_features} Important Features for Subject S{subject_id}', fontsize=14)
    
    # Group features by sensor type
    ecg_features = [i for i, f in enumerate(features) if 'ecg' in f.lower()]
    emg_features = [i for i, f in enumerate(features) if 'emg' in f.lower()]
    resp_features = [i for i, f in enumerate(features) if 'resp' in f.lower()]
    
    # Add colored background for different feature types
    if ecg_features:
        plt.axhspan(min(ecg_features)-0.4, max(ecg_features)+0.4, alpha=0.1, color='blue', label='ECG Features')
    if emg_features:
        plt.axhspan(min(emg_features)-0.4, max(emg_features)+0.4, alpha=0.1, color='green', label='EMG Features')
    if resp_features:
        plt.axhspan(min(resp_features)-0.4, max(resp_features)+0.4, alpha=0.1, color='red', label='Resp Features')
    
    plt.legend(loc='lower right')
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    
    # Save figure in multiple formats
    fig_path_png = os.path.join(viz_dir, f'feature_importance_S{subject_id}.png')
    fig_path_pdf = os.path.join(viz_dir, f'feature_importance_S{subject_id}.pdf')
    
    plt.savefig(fig_path_png, dpi=150, bbox_inches='tight')
    plt.savefig(fig_path_pdf, bbox_inches='tight')
    plt.close()
    
    return fig_path_png
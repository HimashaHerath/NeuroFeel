"""
Feature extraction and mapping modules.
"""

from .extraction import extract_features, extract_all_features, calculate_approximate_entropy
from .mapping import map_features, create_mapped_dataframes, convert_to_binary_targets, DEFAULT_EMOTION_MAP, DEFAULT_FEATURE_MAPPING

__all__ = [
    'extract_features', 'extract_all_features', 'calculate_approximate_entropy',
    'map_features', 'create_mapped_dataframes', 'convert_to_binary_targets',
    'DEFAULT_EMOTION_MAP', 'DEFAULT_FEATURE_MAPPING'
]
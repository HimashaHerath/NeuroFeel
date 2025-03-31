"""
Feature extraction functions for physiological signals.
"""

import numpy as np
from scipy import signal, stats  # Import stats module for skew and kurtosis


def extract_features(signal_data, sampling_rate=4):
    """
    Extract features from physiological signal with improved noise handling.
    
    Args:
        signal_data (array): Signal data
        sampling_rate (int): Sampling rate of the signal
    
    Returns:
        dict: Dictionary of extracted features
    """
    features = {}
    
    # Check for empty or too-short signals
    if signal_data is None or len(signal_data) < 5:
        # Return default values instead of empty features
        features['mean'] = 0
        features['std'] = 0
        features['min'] = 0
        features['max'] = 0
        features['range'] = 0
        features['energy'] = 0
        return features
    
    # Check for invalid data
    if np.isnan(signal_data).any() or np.isinf(signal_data).any():
        # Fix invalid values
        signal_data = np.nan_to_num(signal_data, nan=0, posinf=0, neginf=0)
    
    # Apply basic filtering only if we have enough samples
    try:
        if len(signal_data) >= 10:
            # Use robust IQR-based outlier removal
            q1, q3 = np.percentile(signal_data, [25, 75])
            iqr = q3 - q1
            lower_bound = q1 - 3 * iqr
            upper_bound = q3 + 3 * iqr
            filtered_signal = np.clip(signal_data, lower_bound, upper_bound)
        else:
            filtered_signal = signal_data  # Use original if too short for filtering
        
        # Make sure we don't have an empty array
        if len(filtered_signal) == 0:
            filtered_signal = np.array([0])
        
        # Basic statistical features
        features['mean'] = float(np.mean(filtered_signal))
        features['std'] = float(np.std(filtered_signal)) if len(filtered_signal) > 1 else 0.0
        features['min'] = float(np.min(filtered_signal))
        features['max'] = float(np.max(filtered_signal))
        features['range'] = features['max'] - features['min']
        features['energy'] = float(np.sum(filtered_signal**2) / max(1, len(filtered_signal)))
        
        # Only compute advanced features if we have enough data
        if len(filtered_signal) >= 10:
            # More advanced statistical features
            features['median'] = float(np.median(filtered_signal))
            # Use stats.skew and stats.kurtosis (not signal.skew/kurtosis)
            features['skewness'] = float(stats.skew(filtered_signal)) if len(filtered_signal) > 3 else 0.0
            features['kurtosis'] = float(stats.kurtosis(filtered_signal)) if len(filtered_signal) > 3 else 0.0
            
            # Temporal features
            features['slope'] = float(np.polyfit(np.arange(len(filtered_signal)), filtered_signal, 1)[0])
            
            # Add more features if we have enough samples
            if len(filtered_signal) >= 30:
                # Entropy approximation
                hist, _ = np.histogram(filtered_signal, bins=10)
                hist = hist / np.sum(hist)
                hist = hist[hist > 0]  # Remove zeros
                features['entropy'] = float(-np.sum(hist * np.log2(hist)))
        
        # Ensure all values are scalars, not arrays
        for key, value in list(features.items()):
            if isinstance(value, np.ndarray):
                if value.size == 1:
                    features[key] = float(value)
                else:
                    features[key] = float(value[0]) if value.size > 0 else 0.0
        
    except Exception as e:
        print(f"Error in feature extraction: {e}")
        # Return basic features with default values
        features['mean'] = 0.0
        features['std'] = 0.0
        features['min'] = 0.0
        features['max'] = 0.0
        features['range'] = 0.0
        features['energy'] = 0.0
    
    return features


def calculate_approximate_entropy(signal, m=2, r=0.2):
    """
    Calculate approximate entropy, a measure of signal complexity.
    
    Args:
        signal (array): Signal data
        m (int): Embedding dimension
        r (float): Tolerance
    
    Returns:
        float: Approximate entropy value
    """
    def _maxdist(x_i, x_j):
        return max([abs(ua - va) for ua, va in zip(x_i, x_j)])

    def _phi(m):
        N = len(signal) - m + 1
        C = np.zeros(N)
        # Create all possible m-length templates
        for i in range(N):
            # Extract the template
            x_i = signal[i:i+m]
            # Count matches
            for j in range(N):
                x_j = signal[j:j+m]
                if _maxdist(x_i, x_j) <= r:
                    C[i] += 1
        C = C / N
        return np.sum(np.log(C)) / N

    # Return ApEn
    try:
        return float(abs(_phi(m) - _phi(m+1)))
    except:
        return 0.0


def extract_frequency_features(signal_data, sampling_rate=4):
    """
    Extract frequency domain features from signal.
    
    Args:
        signal_data (array): Signal data
        sampling_rate (int): Sampling rate of the signal
    
    Returns:
        dict: Dictionary of extracted frequency features
    """
    features = {}
    
    try:
        # Check if we have enough samples for frequency analysis
        if len(signal_data) < sampling_rate * 3:  # Need at least 3 seconds
            return features
        
        # Ensure signal_data is a 1D array
        signal_data = np.asarray(signal_data).flatten()
        
        # Compute power spectral density
        freqs, psd = signal.welch(signal_data, fs=sampling_rate, nperseg=min(256, len(signal_data)))
        
        # Ensure both arrays are 1D and same length
        freqs = np.asarray(freqs).flatten()
        psd = np.asarray(psd).flatten()
        
        # Check if we have valid data
        if len(freqs) == 0 or len(psd) == 0:
            return features
            
        # Make sure both arrays have the same shape
        min_len = min(len(freqs), len(psd))
        freqs = freqs[:min_len]
        psd = psd[:min_len]
        
        # Create frequency band masks
        lf_indices = []
        hf_indices = []
        
        # Find indices for each frequency band
        for i, f in enumerate(freqs):
            if 0.04 <= f <= 0.15:
                lf_indices.append(i)
            elif 0.15 < f <= 0.4:
                hf_indices.append(i)
        
        # Calculate power in each band
        if lf_indices:
            lf_freqs = freqs[lf_indices]
            lf_psd = psd[lf_indices]
            lf_power = np.trapz(lf_psd, lf_freqs)
            features['low_freq_power'] = float(lf_power)
        else:
            features['low_freq_power'] = 0.0
            
        if hf_indices:
            hf_freqs = freqs[hf_indices]
            hf_psd = psd[hf_indices]
            hf_power = np.trapz(hf_psd, hf_freqs)
            features['high_freq_power'] = float(hf_power)
        else:
            features['high_freq_power'] = 0.0
            
        # Calculate ratio if both bands have power
        lf_power = features['low_freq_power']
        hf_power = features['high_freq_power']
        
        if hf_power > 0:
            features['lf_hf_ratio'] = float(lf_power / hf_power)
        else:
            features['lf_hf_ratio'] = 0.0
            
    except Exception as e:
        print(f"Error in frequency feature extraction: {e}")
        features['low_freq_power'] = 0.0
        features['high_freq_power'] = 0.0
        features['lf_hf_ratio'] = 0.0
    
    return features


def extract_wavelet_features(signal_data, wavelet='db4', level=3):
    """
    Extract wavelet-based features from signal.
    
    Args:
        signal_data (array): Signal data
        wavelet (str): Wavelet type
        level (int): Decomposition level
    
    Returns:
        dict: Dictionary of extracted wavelet features
    """
    features = {}
    
    try:
        import pywt
        
        # Ensure signal_data is a 1D array
        signal_data = np.asarray(signal_data).flatten()
        
        # Check if we have enough samples
        if len(signal_data) < 2**level:
            return features
        
        # Wavelet decomposition
        coeffs = pywt.wavedec(signal_data, wavelet, level=level)
        
        # Extract energy from approximation and detail coefficients
        features['wavelet_approx_energy'] = float(np.sum(coeffs[0]**2) / len(coeffs[0]))
        
        for i, detail in enumerate(coeffs[1:]):
            features[f'wavelet_detail{i+1}_energy'] = float(np.sum(detail**2) / len(detail))
        
    except Exception as e:
        print(f"Error in wavelet feature extraction: {e}")
    
    return features


def extract_all_features(signal_data, sampling_rate=4, include_advanced=True):
    """
    Extract all available features from signal.
    
    Args:
        signal_data (array): Signal data
        sampling_rate (int): Sampling rate of the signal
        include_advanced (bool): Whether to include advanced features
    
    Returns:
        dict: Dictionary of all extracted features
    """
    # Get basic statistical features
    features = extract_features(signal_data, sampling_rate)
    
    # Include advanced features if requested
    if include_advanced and len(signal_data) >= 30:
        # Get frequency domain features
        freq_features = extract_frequency_features(signal_data, sampling_rate)
        features.update(freq_features)
        
        # Get wavelet features
        try:
            wavelet_features = extract_wavelet_features(signal_data)
            features.update(wavelet_features)
        except ImportError:
            # PyWavelets not available
            pass
    
    return features
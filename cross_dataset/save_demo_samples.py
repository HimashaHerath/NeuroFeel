# File: cross_dataset/demo_utils.py
import numpy as np
import pickle
import os
import pandas as pd

def save_demo_samples(framework, sample_size=20, save_dir='./demo_data'):
    """
    Save samples from WESAD and K-EmoCon datasets for later demonstration.
    
    Args:
        framework: Initialized CrossDatasetFramework instance
        sample_size: Number of samples to save from each dataset
        save_dir: Directory to save samples
    
    Returns:
        dict: Paths to saved files
    """
    os.makedirs(save_dir, exist_ok=True)
    saved_files = {}
    
    print(f"Saving demo samples to {save_dir}...")
    
    # Save WESAD samples (for testing K-EmoCon→WESAD)
    if framework.wesad_data is not None:
        # Extract target distributions for reference
        arousal_median = framework.wesad_data['arousal'].median()
        valence_median = framework.wesad_data['valence'].median()
        
        # Get feature mappings
        arousal_features = framework.arousal_models['features']['wesad'] if hasattr(framework, 'arousal_models') else []
        valence_features = framework.valence_models['features']['wesad'] if hasattr(framework, 'valence_models') else []
        
        # Select stratified samples (balanced high/low)
        wesad_low_arousal = framework.wesad_data[framework.wesad_data['arousal'] <= arousal_median].sample(
            min(sample_size//2, len(framework.wesad_data[framework.wesad_data['arousal'] <= arousal_median])))
        wesad_high_arousal = framework.wesad_data[framework.wesad_data['arousal'] > arousal_median].sample(
            min(sample_size//2, len(framework.wesad_data[framework.wesad_data['arousal'] > arousal_median])))
        
        # Combine samples
        wesad_samples = pd.concat([wesad_low_arousal, wesad_high_arousal])
        
        # Save dataset
        wesad_demo_file = os.path.join(save_dir, 'wesad_demo_samples.pkl')
        with open(wesad_demo_file, 'wb') as f:
            pickle.dump({
                'samples': wesad_samples,
                'arousal_features': arousal_features,
                'valence_features': valence_features,
                'arousal_threshold': arousal_median,
                'valence_threshold': valence_median,
                'arousal_binary': (wesad_samples['arousal'] > arousal_median).astype(int).values,
                'valence_binary': (wesad_samples['valence'] > valence_median).astype(int).values
            }, f)
        
        saved_files['wesad'] = wesad_demo_file
        print(f"Saved {len(wesad_samples)} WESAD samples with {len(arousal_features)} arousal features "
              f"and {len(valence_features)} valence features")
    
    # Save K-EmoCon samples (for testing WESAD→K-EmoCon)
    if framework.kemocon_data is not None:
        # Extract target distributions for reference
        arousal_median = framework.kemocon_data['arousal'].median()
        valence_median = framework.kemocon_data['valence'].median()
        
        # Get feature mappings
        arousal_features = framework.arousal_models['features']['kemocon'] if hasattr(framework, 'arousal_models') else []
        valence_features = framework.valence_models['features']['kemocon'] if hasattr(framework, 'valence_models') else []
        
        # Select stratified samples (balanced high/low)
        kemocon_low_arousal = framework.kemocon_data[framework.kemocon_data['arousal'] <= arousal_median].sample(
            min(sample_size//2, len(framework.kemocon_data[framework.kemocon_data['arousal'] <= arousal_median])))
        kemocon_high_arousal = framework.kemocon_data[framework.kemocon_data['arousal'] > arousal_median].sample(
            min(sample_size//2, len(framework.kemocon_data[framework.kemocon_data['arousal'] > arousal_median])))
        
        # Combine samples
        kemocon_samples = pd.concat([kemocon_low_arousal, kemocon_high_arousal])
        
        # Save dataset
        kemocon_demo_file = os.path.join(save_dir, 'kemocon_demo_samples.pkl')
        with open(kemocon_demo_file, 'wb') as f:
            pickle.dump({
                'samples': kemocon_samples,
                'arousal_features': arousal_features,
                'valence_features': valence_features,
                'arousal_threshold': arousal_median,
                'valence_threshold': valence_median,
                'arousal_binary': (kemocon_samples['arousal'] > arousal_median).astype(int).values,
                'valence_binary': (kemocon_samples['valence'] > valence_median).astype(int).values
            }, f)
        
        saved_files['kemocon'] = kemocon_demo_file
        print(f"Saved {len(kemocon_samples)} K-EmoCon samples with {len(arousal_features)} arousal features "
              f"and {len(valence_features)} valence features")
    
    # Save models for prediction
    if hasattr(framework, 'arousal_models') and hasattr(framework, 'valence_models'):
        models_file = os.path.join(save_dir, 'demo_models.pkl')
        with open(models_file, 'wb') as f:
            pickle.dump({
                'arousal': {
                    'wesad_to_kemocon': {
                        'model': framework.arousal_models['models']['wesad_to_kemocon']['model'],
                        'scaler': framework.arousal_models['models']['wesad_to_kemocon']['scaler'],
                        'threshold': framework.arousal_models['evaluation']['wesad_to_kemocon']['threshold']
                    },
                    'kemocon_to_wesad': {
                        'model': framework.arousal_models['models']['kemocon_to_wesad']['model'],
                        'scaler': framework.arousal_models['models']['kemocon_to_wesad']['scaler'],
                        'threshold': framework.arousal_models['evaluation']['kemocon_to_wesad']['threshold']
                    }
                },
                'valence': {
                    'wesad_to_kemocon': {
                        'model': framework.valence_models['models']['wesad_to_kemocon']['model'],
                        'scaler': framework.valence_models['models']['wesad_to_kemocon']['scaler'],
                        'threshold': framework.valence_models['evaluation']['wesad_to_kemocon']['threshold']
                    },
                    'kemocon_to_wesad': {
                        'model': framework.valence_models['models']['kemocon_to_wesad']['model'],
                        'scaler': framework.valence_models['models']['kemocon_to_wesad']['scaler'],
                        'threshold': framework.valence_models['evaluation']['kemocon_to_wesad']['threshold']
                    }
                }
            }, f)
        saved_files['models'] = models_file
        print(f"Saved models and scalers for demo")
    
    # Create a helper demo script
    demo_script = """
import pickle
import numpy as np
import pandas as pd

def load_demo_data(wesad_file='wesad_demo_samples.pkl', 
                  kemocon_file='kemocon_demo_samples.pkl',
                  models_file='demo_models.pkl'):
    \"\"\"Load demonstration data and models\"\"\"
    # Load sample data
    with open(wesad_file, 'rb') as f:
        wesad_data = pickle.load(f)
    
    with open(kemocon_file, 'rb') as f:
        kemocon_data = pickle.load(f)
    
    # Load models and scalers
    with open(models_file, 'rb') as f:
        models = pickle.load(f)
    
    return wesad_data, kemocon_data, models

def test_cross_dataset_models():
    \"\"\"Demo of cross-dataset emotion recognition\"\"\"
    print("Loading demonstration data...")
    wesad_data, kemocon_data, models = load_demo_data()
    
    # Test WESAD → K-EmoCon for arousal
    print("\\nTesting WESAD to K-EmoCon arousal model:")
    kemocon_samples = kemocon_data['samples']
    arousal_features = kemocon_data['arousal_features']
    
    # Extract features
    X_test = kemocon_samples[arousal_features].values
    y_true = kemocon_data['arousal_binary']
    
    # Apply scaler and model
    model = models['arousal']['wesad_to_kemocon']['model']
    scaler = models['arousal']['wesad_to_kemocon']['scaler']
    threshold = models['arousal']['wesad_to_kemocon']['threshold']
    
    X_scaled = scaler.transform(X_test)
    y_proba = model.predict_proba(X_scaled)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)
    
    # Calculate accuracy
    accuracy = (y_pred == y_true).mean()
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Samples tested: {len(y_true)}")
    
    # Show sample predictions
    print("\\nSample predictions (first 5):")
    for i in range(min(5, len(y_true))):
        print(f"Sample {i+1}: Actual={y_true[i]}, Predicted={y_pred[i]}, Probability={y_proba[i]:.4f}")
    
    # Test K-EmoCon → WESAD for valence
    print("\\nTesting K-EmoCon to WESAD valence model:")
    wesad_samples = wesad_data['samples']
    valence_features = wesad_data['valence_features']
    
    # Extract features
    X_test = wesad_samples[valence_features].values
    y_true = wesad_data['valence_binary']
    
    # Apply scaler and model
    model = models['valence']['kemocon_to_wesad']['model']
    scaler = models['valence']['kemocon_to_wesad']['scaler']
    threshold = models['valence']['kemocon_to_wesad']['threshold']
    
    X_scaled = scaler.transform(X_test)
    y_proba = model.predict_proba(X_scaled)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)
    
    # Calculate accuracy
    accuracy = (y_pred == y_true).mean()
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Samples tested: {len(y_true)}")
    
    # Show sample predictions
    print("\\nSample predictions (first 5):")
    for i in range(min(5, len(y_true))):
        print(f"Sample {i+1}: Actual={y_true[i]}, Predicted={y_pred[i]}, Probability={y_proba[i]:.4f}")

if __name__ == "__main__":
    test_cross_dataset_models()
"""
    demo_script = demo_script.replace('\u2192', '->')

    # Save demo script
    script_file = os.path.join(save_dir, 'run_demo.py')
    with open(script_file, 'w') as f:
        f.write(demo_script)
    
    saved_files['demo_script'] = script_file
    print(f"Created demo script: {script_file}")
    
    return saved_files
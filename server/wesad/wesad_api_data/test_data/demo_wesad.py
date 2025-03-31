import os
import pickle
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def load_models(base_path):
    ""Load the base model and personal models""
    models = {'base': None, 'personal': {}}
    
    # Load base model
    try:
        with open(os.path.join(base_path, 'base_model.pkl'), 'rb') as f:
            models['base'] = pickle.load(f)
        print("Base model loaded successfully")
    except Exception as e:
        print(f"Error loading base model: {e}")
    
    # Load personal models
    personal_files = [f for f in os.listdir(base_path) if f.startswith('personal_SS') and f.endswith('.pkl')]
    for file in personal_files:
        try:
            subject_id = int(file.split('_SS')[1].split('_')[0].split('.')[0])
            with open(os.path.join(base_path, file), 'rb') as f:
                models['personal'][subject_id] = pickle.load(f)
            print(f"Personal model for S{subject_id} loaded successfully")
        except Exception as e:
            print(f"Error loading {file}: {e}")
    
    return models

def load_test_data(base_path, subject_id=None):
    ""Load test data for a subject or all subjects""
    if subject_id:
        # Load specific subject
        try:
            with open(os.path.join(base_path, f'S{subject_id}_test.pkl'), 'rb') as f:
                return {subject_id: pickle.load(f)}
        except Exception as e:
            print(f"Error loading test data for S{subject_id}: {e}")
            return {}
    else:
        # Load all available subjects
        test_data = {}
        test_files = [f for f in os.listdir(base_path) if f.endswith('_test.pkl')]
        
        for file in test_files:
            try:
                subject_id = int(file.split('S')[1].split('_')[0])
                with open(os.path.join(base_path, file), 'rb') as f:
                    test_data[subject_id] = pickle.load(f)
            except Exception as e:
                print(f"Error loading {file}: {e}")
        
        return test_data

def predict_emotion(model, X_test):
    ""Make a prediction with the model and return both class and probabilities""
    proba = model.predict_proba(X_test)
    pred_class = np.argmax(proba, axis=1)
    return pred_class, proba

def demo_single_subject(models, test_data, subject_id, class_names=['Baseline', 'Stress', 'Amusement', 'Meditation']):
    ""Run a demo for a single subject""
    if subject_id not in test_data:
        print(f"No test data for subject S{subject_id}")
        return
    
    data = test_data[subject_id]
    X_test = data['X_test']
    y_test = data['y_test']
    feature_names = data['feature_names']
    
    print(f"\nDemonstration for Subject S{subject_id}")
    print(f"Test set: {len(X_test)} samples, {len(feature_names)} features")
    
    # Make predictions with base model
    if models['base']:
        base_pred, base_proba = predict_emotion(models['base'], X_test)
        base_accuracy = accuracy_score(y_test, base_pred)
        print(f"\nBase model accuracy: {base_accuracy:.4f}")
        print("Classification report:")
        print(classification_report(y_test, base_pred, target_names=class_names))
    
    # Make predictions with personal model
    if subject_id in models['personal']:
        personal_pred, personal_proba = predict_emotion(models['personal'][subject_id], X_test)
        personal_accuracy = accuracy_score(y_test, personal_pred)
        print(f"\nPersonal model accuracy: {personal_accuracy:.4f}")
        print("Classification report:")
        print(classification_report(y_test, personal_pred, target_names=class_names))
        
        # Create ensemble predictions (0.5/0.5 weighting)
        if models['base']:
            ensemble_proba = base_proba * 0.5 + personal_proba * 0.5
            ensemble_pred = np.argmax(ensemble_proba, axis=1)
            ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
            print(f"\nEnsemble model accuracy: {ensemble_accuracy:.4f}")
            print("Classification report:")
            print(classification_report(y_test, ensemble_pred, target_names=class_names))
    
    # Show some example predictions
    print("\nExample predictions:")
    for i in range(min(5, len(X_test))):
        true_emotion = class_names[y_test[i]]
        base_emotion = class_names[base_pred[i]] if models['base'] else "N/A"
        personal_emotion = class_names[personal_pred[i]] if subject_id in models['personal'] else "N/A"
        
        print(f"Sample {i+1}:")
        print(f"  True emotion: {true_emotion}")
        print(f"  Base model prediction: {base_emotion} (confidence: {np.max(base_proba[i]):.4f})")
        print(f"  Personal model prediction: {personal_emotion} (confidence: {np.max(personal_proba[i]):.4f})")
        if models['base'] and subject_id in models['personal']:
            ensemble_emotion = class_names[ensemble_pred[i]]
            print(f"  Ensemble prediction: {ensemble_emotion} (confidence: {np.max(ensemble_proba[i]):.4f})\n")

def main():
    # Path to the models and test data
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    # Load models
    print("Loading models...")
    models = load_models(base_path)
    
    # Load test data
    print("\nLoading test data...")
    test_data = load_test_data(base_path)
    
    if not test_data:
        print("No test data found.")
        return
    
    # Run demo for each subject
    for subject_id in sorted(test_data.keys()):
        demo_single_subject(models, test_data, subject_id)
    
    print("\nDemo complete!")

if __name__ == "__main__":
    main()

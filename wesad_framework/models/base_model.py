"""
Base model implementation for emotion recognition.
"""

from sklearn.discriminant_analysis import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.base import clone


def get_model_types():
    """
    Get dictionary of model types with appropriate parameters.
    
    Returns:
        dict: Dictionary mapping model names to initialized model objects
    """
    model_types = {
        'random_forest': RandomForestClassifier(
            random_state=42, 
            n_estimators=100,
            max_depth=10,  # Limit tree depth to prevent overfitting
            class_weight='balanced'  # Handle class imbalance
        ),
        'svm': SVC(
            probability=True, 
            random_state=42, 
            kernel='rbf', 
            C=1.0,  # Lower C for stronger regularization
            class_weight='balanced'  # Handle class imbalance
        ),
        'neural_network': MLPClassifier(
            random_state=42, 
            max_iter=1000, 
            hidden_layer_sizes=(64, 32),  # Smaller network than original
            alpha=0.01,  # Stronger regularization
            learning_rate='adaptive',
            validation_fraction=0.2  # Use some data for validation
        )
    }
    
    return model_types


def get_transfer_model_types():
    """
    Get dictionary of model types for transfer learning.
    
    Returns:
        dict: Dictionary mapping model names to initialized model objects
    """
    transfer_model_types = {
        'neural_network': MLPClassifier(
            random_state=42, 
            max_iter=1000, 
            hidden_layer_sizes=(64, 32),
            alpha=0.01,
            learning_rate='adaptive'
        )
    }
    
    return transfer_model_types


def train_base_model(train_data, feature_names, model_type, scaler):
    """
    Train base model on all training data.
    
    Args:
        train_data (pd.DataFrame): Combined training data
        feature_names (list): List of feature names to use
        model_type (str): Type of model to train ('random_forest', 'svm', or 'neural_network')
        scaler (sklearn.preprocessing.StandardScaler): Fitted scaler for feature standardization
    
    Returns:
        object: Trained model
    """
    print("Training base model...")
    
    # Extract features and labels using only the selected feature names
    X_train = train_data[feature_names].values
    y_train = train_data['label'].values - 1  # Convert to 0-indexed
    
    # Create a new scaler specifically for the selected features
    feature_scaler = StandardScaler()
    X_train_scaled = feature_scaler.fit_transform(X_train)
    
    # Get model types
    model_types = get_model_types()
    
    # Train the base model
    if model_type in model_types:
        base_model = clone(model_types[model_type])
        base_model.fit(X_train_scaled, y_train)
        return base_model, feature_scaler
    else:
        raise ValueError(f"Unknown model type: {model_type}")
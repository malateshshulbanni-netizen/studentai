import pandas as pd
import numpy as np
import os

def load_data(file_path):
    """Load student data from CSV"""
    if not os.path.exists(file_path):
        print(f"[WARNING] File {file_path} not found. Creating sample data...")
        create_sample_data(file_path)
    
    df = pd.read_csv(file_path)
    print(f"[OK] Loaded {len(df)} records from {file_path}")
    return df

def create_sample_data(file_path):
    """Create sample student data for training"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic data
    attendance = np.random.randint(30, 100, n_samples)
    gpa = np.round(np.random.uniform(2.0, 9.5, n_samples), 1)
    backlogs = np.random.randint(0, 8, n_samples)
    assignment_completion = np.random.randint(20, 100, n_samples)
    engagement = np.random.choice(['High', 'Medium', 'Low'], n_samples)
    
    # Calculate dropout (simplified)
    dropout = []
    for i in range(n_samples):
        score = 0
        if attendance[i] < 60:
            score += 1
        if gpa[i] < 5.0:
            score += 1
        if backlogs[i] > 3:
            score += 1
        if assignment_completion[i] < 50:
            score += 1
        
        # Higher score = higher dropout chance
        if score >= 3:
            dropout.append(1)
        elif score == 2:
            dropout.append(1 if np.random.random() < 0.6 else 0)
        else:
            dropout.append(1 if np.random.random() < 0.1 else 0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'student_id': [f'STU{i:04d}' for i in range(n_samples)],
        'attendance': attendance,
        'gpa': gpa,
        'backlogs': backlogs,
        'assignment_completion': assignment_completion,
        'engagement': engagement,
        'dropout': dropout
    })
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    df.to_csv(file_path, index=False)
    print(f"[OK] Sample data created with {n_samples} records at {file_path}")
    print(f"[INFO] Dropout rate: {df['dropout'].mean()*100:.1f}%")

def preprocess_data(df):
    """Preprocess the data for training"""
    if 'student_id' in df.columns:
        X = df.drop(['student_id', 'dropout'], axis=1)
    else:
        X = df.drop(['dropout'], axis=1)
    y = df['dropout']
    X = X.fillna(X.mean())
    return X, y

def get_feature_names():
    return ['attendance', 'gpa', 'backlogs', 'assignment_completion', 'engagement']
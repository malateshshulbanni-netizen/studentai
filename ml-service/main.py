from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import os
import json
import subprocess
import shutil
from datetime import datetime
import pandas as pd
import numpy as np

app = FastAPI(
    title="StudentDrop AI ML Service",
    version="2.0.0"
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "student_dropout_model.pkl"
)

HISTORY_FILE = os.path.join(
    BASE_DIR,
    "models",
    "training_history.json"
)

DATA_DIR = os.path.join(BASE_DIR, "data")

ACTIVE_DATASET_FILE = os.path.join(
    DATA_DIR,
    "current_training_dataset.csv"
)

# ============================================================
# GLOBAL MODEL VARIABLES
# ============================================================

model = None
label_encoder = None
model_metrics = {}
feature_names = []
categorical_columns = []

# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    global model
    global label_encoder
    global model_metrics
    global feature_names
    global categorical_columns

    if not os.path.exists(MODEL_PATH):
        print("[WARNING] Model not found. Please train the model first.")
        model = None
        label_encoder = None
        model_metrics = {}
        feature_names = []
        categorical_columns = []
        return

    try:
        data = joblib.load(MODEL_PATH)

        model = data.get("model")
        label_encoder = data.get("label_encoder")
        model_metrics = data.get("metrics", {})
        feature_names = data.get("feature_names", [])
        categorical_columns = data.get("categorical_columns", [])

        print(
            "[OK] Model loaded successfully. "
            f"Accuracy: {model_metrics.get('accuracy', 'N/A')}"
        )
        
        print(f"[OK] Feature count: {len(feature_names)}")
        if len(feature_names) > 10:
            print(f"[OK] Features: {feature_names[:10]}...")
        else:
            print(f"[OK] Features: {feature_names}")
        
        if label_encoder is not None:
            print(
                f"[OK] Label encoder classes: "
                f"{label_encoder.classes_.tolist()}"
            )
        else:
            print("[WARNING] Label encoder is None. Please retrain the model.")

    except Exception as e:
        print(f"[WARNING] Error loading model: {e}")
        model = None
        label_encoder = None
        model_metrics = {}
        feature_names = []
        categorical_columns = []


# ============================================================
# TRAINING HISTORY
# ============================================================

def load_training_history():
    if not os.path.exists(HISTORY_FILE):
        return []

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARNING] Could not load training history: {e}")
        return []


def save_training_history(history):
    os.makedirs(
        os.path.dirname(HISTORY_FILE),
        exist_ok=True
    )

    with open(
        HISTORY_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            history,
            f,
            indent=2
        )


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):
    attendance: float
    gpa: float
    backlogs: int
    assignment_completion: float
    engagement: str


class BatchPredictionRequest(BaseModel):
    students: List[PredictionRequest]


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    load_model()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():
    return {
        "service": "StudentDrop AI ML Service",
        "version": "2.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "model_accuracy": (
            model_metrics.get("accuracy")
            if model_metrics
            else None
        ),
        "training_samples": (
            model_metrics.get("samples")
            if model_metrics
            else None
        ),
        "features": feature_names,
        "feature_count": len(feature_names),
        "label_encoder_available": label_encoder is not None
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================
# MODEL INFO
# ============================================================

@app.get("/api/model-info")
async def model_info():

    if model is None:
        return {
            "status": "no_model_loaded",
            "message": "Please train the model first.",
            "metrics": {}
        }

    return {
        "status": "loaded",
        "model_type": model_metrics.get(
            "model_type",
            type(model).__name__
        ),
        "features": feature_names,
        "feature_count": len(feature_names),
        "engagement_classes": (
            label_encoder.classes_.tolist()
            if label_encoder is not None
            else []
        ),
        "metrics": model_metrics
    }


# ============================================================
# TRAINING HISTORY
# ============================================================

@app.get("/api/training-history")
async def get_training_history():

    history = load_training_history()

    return {
        "success": True,
        "history": history
    }


# ============================================================
# UPLOAD DATASET
# ============================================================

@app.post("/api/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    try:

        os.makedirs(DATA_DIR, exist_ok=True)

        with open(
            ACTIVE_DATASET_FILE,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        import pandas as pd

        df = pd.read_csv(
            ACTIVE_DATASET_FILE
        )

        if df.empty:
            os.remove(ACTIVE_DATASET_FILE)

            raise HTTPException(
                status_code=400,
                detail="Uploaded CSV is empty."
            )

        if "dropout" not in df.columns:
            os.remove(ACTIVE_DATASET_FILE)

            raise HTTPException(
                status_code=400,
                detail=(
                    "CSV must contain a 'dropout' column."
                )
            )

        print(
            f"[OK] Dataset uploaded: "
            f"{file.filename}"
        )

        print(
            f"[INFO] Dataset rows: "
            f"{len(df)}"
        )

        print(
            f"[INFO] Dataset columns: "
            f"{len(df.columns)}"
        )

        return {
            "success": True,
            "message": (
                f"Dataset {file.filename} "
                "uploaded successfully."
            ),
            "file_path": ACTIVE_DATASET_FILE,
            "original_filename": file.filename,
            "samples": int(len(df)),
            "columns": int(len(df.columns)),
            "features": list(df.columns)
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Dataset upload failed: {str(e)}"
        )


# ============================================================
# TRAIN MODEL
# ============================================================

@app.post("/api/train")
async def train_model():

    global model
    global label_encoder
    global model_metrics
    global feature_names
    global categorical_columns

    try:

        if not os.path.exists(
            ACTIVE_DATASET_FILE
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "No training dataset found. "
                    "Please upload a CSV dataset first."
                )
            )

        import pandas as pd

        df = pd.read_csv(
            ACTIVE_DATASET_FILE
        )

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Training dataset is empty."
            )

        if "dropout" not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Training dataset must contain "
                    "'dropout' column."
                )
            )

        sample_count = len(df)

        print("=" * 60)
        print("[START] Starting model training")
        print("=" * 60)
        print(
            f"[INFO] Active dataset: "
            f"{ACTIVE_DATASET_FILE}"
        )
        print(
            f"[INFO] Samples: {sample_count}"
        )
        print(
            f"[INFO] Columns: {len(df.columns)}"
        )

        # ----------------------------------------------------
        # Run training script
        # ----------------------------------------------------

        command = [
            "python",
            "training/train.py",
            "--data",
            ACTIVE_DATASET_FILE,
            "--output",
            MODEL_PATH
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=BASE_DIR
        )

        print(result.stdout)

        if result.stderr:
            print(result.stderr)

        if result.returncode != 0:

            return {
                "success": False,
                "message": "Training failed.",
                "error": result.stderr,
                "output": result.stdout
            }

        # ----------------------------------------------------
        # Load newly trained model
        # ----------------------------------------------------

        load_model()

        # ----------------------------------------------------
        # Read metrics
        # ----------------------------------------------------

        metrics_path = MODEL_PATH.replace(
            ".pkl",
            "_metrics.json"
        )

        metrics = {}

        if os.path.exists(metrics_path):

            with open(
                metrics_path,
                "r",
                encoding="utf-8"
            ) as f:

                metrics = json.load(f)

        else:

            metrics = model_metrics.copy()

        # ----------------------------------------------------
        # Update training history
        # ----------------------------------------------------

        history = load_training_history()

        for item in history:
            item["status"] = "archived"

        current_version = len(history) + 1

        new_history_item = {
            "version": f"v{current_version}.0.0",
            "date": datetime.now().isoformat(),

            "accuracy": float(
                metrics.get("accuracy", 0)
            ),

            "precision": float(
                metrics.get("precision", 0)
            ),

            "recall": float(
                metrics.get("recall", 0)
            ),

            "f1_score": float(
                metrics.get("f1_score", 0)
            ),

            "roc_auc": float(
                metrics.get("roc_auc", 0)
            ),

            "samples": int(
                metrics.get(
                    "samples",
                    sample_count
                )
            ),

            "training_samples": int(
                metrics.get(
                    "training_samples",
                    0
                )
            ),

            "testing_samples": int(
                metrics.get(
                    "testing_samples",
                    0
                )
            ),

            "features": len(
                metrics.get(
                    "features",
                    []
                )
            ),

            "feature_names": metrics.get(
                "features",
                []
            ),

            "dropout_rate": float(
                metrics.get(
                    "dropout_rate",
                    0
                )
            ),

            "model_type": metrics.get(
                "model_type",
                "XGBClassifier"
            ),

            "status": "active"
        }

        history.insert(
            0,
            new_history_item
        )

        save_training_history(history)

        print("=" * 60)
        print("[SUCCESS] Training complete")
        print(
            f"[INFO] Samples: "
            f"{new_history_item['samples']}"
        )
        print(
            f"[INFO] Accuracy: "
            f"{new_history_item['accuracy']:.2%}"
        )
        print(
            f"[INFO] Features: "
            f"{new_history_item['features']}"
        )
        print("=" * 60)

        return {
            "success": True,
            "message": "Model trained successfully.",
            "output": result.stdout,
            "metrics": metrics,
            "samples": metrics.get(
                "samples",
                sample_count
            ),
            "accuracy": metrics.get(
                "accuracy",
                0
            ),
            "features": feature_names
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"[ERROR] Training error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# SINGLE PREDICTION - FIXED WITH ENGAGEMENT MAPPING
# ============================================================

@app.post(
    "/api/predict",
    response_model=PredictionResponse
)
async def predict(
    request: PredictionRequest
):

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )

    try:
        print(f"[DEBUG] Prediction request: attendance={request.attendance}, gpa={request.gpa}, backlogs={request.backlogs}, assignment_completion={request.assignment_completion}, engagement={request.engagement}")
        print(f"[DEBUG] Model features count: {len(feature_names)}")

        if label_encoder is None:
            raise HTTPException(
                status_code=503,
                detail="Label encoder is not available. Please retrain the model."
            )

        # ================================================
        # MAP ENGAGEMENT TO GENDER (since model was trained with gender)
        # ================================================
        engagement_to_gender = {
            'High': 'Female',
            'Medium': 'Male',
            'Low': 'Other'
        }
        
        # Get the mapped gender value
        mapped_gender = engagement_to_gender.get(request.engagement, 'Other')
        print(f"[DEBUG] Mapped engagement '{request.engagement}' → gender '{mapped_gender}'")
        
        # Check if mapped gender is valid
        gender_classes = label_encoder.classes_.tolist()
        print(f"[DEBUG] Valid label encoder values: {gender_classes}")
        
        if mapped_gender not in gender_classes:
            mapped_gender = gender_classes[0]  # Fallback to first valid value
            print(f"[DEBUG] Using fallback gender: {mapped_gender}")
        
        gender_encoded = label_encoder.transform([mapped_gender])[0]
        print(f"[DEBUG] Gender encoded value: {gender_encoded}")

        # ================================================
        # BUILD FEATURE VECTOR DYNAMICALLY
        # ================================================
        
        if feature_names and len(feature_names) > 0:
            # Create a dictionary for all features
            feature_dict = {}
            
            for feature in feature_names:
                feature_lower = feature.lower()
                
                # Map the 5 input features to model features
                if 'attendance' in feature_lower or 'overall_attendance' in feature_lower:
                    feature_dict[feature] = float(request.attendance)
                elif 'gpa' in feature_lower or 'current_gpa' in feature_lower or 'previous_semester_gpa' in feature_lower:
                    feature_dict[feature] = float(request.gpa)
                elif 'backlog' in feature_lower or 'failed_subjects' in feature_lower:
                    feature_dict[feature] = int(request.backlogs)
                elif 'assignment' in feature_lower or 'completion' in feature_lower or 'submissions' in feature_lower:
                    feature_dict[feature] = float(request.assignment_completion)
                elif 'gender' in feature_lower:
                    # Use the mapped gender value
                    feature_dict[feature] = int(gender_encoded)
                elif 'engagement' in feature_lower:
                    # Map engagement to numeric
                    engagement_map = {'High': 2, 'Medium': 1, 'Low': 0}
                    feature_dict[feature] = engagement_map.get(request.engagement, 1)
                else:
                    # For other features, use smart defaults
                    if 'score' in feature_lower or 'risk' in feature_lower:
                        feature_dict[feature] = 0.5
                    elif 'count' in feature_lower or 'semester' in feature_lower or 'year' in feature_lower:
                        feature_dict[feature] = 3
                    elif 'status' in feature_lower or 'type' in feature_lower:
                        feature_dict[feature] = 1
                    else:
                        feature_dict[feature] = 0
            
            # Create DataFrame with correct feature order
            df = pd.DataFrame([feature_dict])
            
            # Ensure all features are in the correct order
            for f in feature_names:
                if f not in df.columns:
                    df[f] = 0
            
            features = df[feature_names].values
            print(f"[DEBUG] Built features with {len(features[0])} features")
            
        else:
            # Fallback: use 5 features
            features = [[
                float(request.attendance),
                float(request.gpa),
                int(request.backlogs),
                float(request.assignment_completion),
                int(gender_encoded)
            ]]
            print(f"[DEBUG] Using 5 features (fallback)")

        # Predict
        prediction = model.predict(features)
        probability = model.predict_proba(features)[0][1]

        print(f"[DEBUG] Prediction: {prediction[0]}, Probability: {probability:.2%}")

        return PredictionResponse(
            prediction=int(prediction[0]),
            probability=float(probability),
            risk_level=(
                "HIGH" if probability > 0.7 else
                "MEDIUM" if probability > 0.4 else
                "LOW"
            )
        )

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# BATCH PREDICTION - FIXED WITH ENGAGEMENT MAPPING
# ============================================================

@app.post("/api/predict-batch")
async def predict_batch(
    request: BatchPredictionRequest
):

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded."
        )

    if label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Label encoder is not available. Please retrain the model."
        )

    # Engagement to gender mapping
    engagement_to_gender = {
        'High': 'Female',
        'Medium': 'Male',
        'Low': 'Other'
    }
    
    gender_classes = label_encoder.classes_.tolist()
    results = []

    for student in request.students:

        try:
            # Map engagement to gender
            mapped_gender = engagement_to_gender.get(student.engagement, 'Other')
            
            if mapped_gender not in gender_classes:
                mapped_gender = gender_classes[0]
            
            gender_encoded = label_encoder.transform([mapped_gender])[0]

            # Build features dynamically
            if feature_names and len(feature_names) > 0:
                feature_dict = {}
                
                for feature in feature_names:
                    feature_lower = feature.lower()
                    
                    if 'attendance' in feature_lower or 'overall_attendance' in feature_lower:
                        feature_dict[feature] = float(student.attendance)
                    elif 'gpa' in feature_lower or 'current_gpa' in feature_lower or 'previous_semester_gpa' in feature_lower:
                        feature_dict[feature] = float(student.gpa)
                    elif 'backlog' in feature_lower or 'failed_subjects' in feature_lower:
                        feature_dict[feature] = int(student.backlogs)
                    elif 'assignment' in feature_lower or 'completion' in feature_lower or 'submissions' in feature_lower:
                        feature_dict[feature] = float(student.assignment_completion)
                    elif 'gender' in feature_lower:
                        feature_dict[feature] = int(gender_encoded)
                    elif 'engagement' in feature_lower:
                        engagement_map = {'High': 2, 'Medium': 1, 'Low': 0}
                        feature_dict[feature] = engagement_map.get(student.engagement, 1)
                    else:
                        if 'score' in feature_lower or 'risk' in feature_lower:
                            feature_dict[feature] = 0.5
                        elif 'count' in feature_lower or 'semester' in feature_lower or 'year' in feature_lower:
                            feature_dict[feature] = 3
                        elif 'status' in feature_lower or 'type' in feature_lower:
                            feature_dict[feature] = 1
                        else:
                            feature_dict[feature] = 0
                
                df = pd.DataFrame([feature_dict])
                
                for f in feature_names:
                    if f not in df.columns:
                        df[f] = 0
                
                features = df[feature_names].values
            else:
                features = [[
                    float(student.attendance),
                    float(student.gpa),
                    int(student.backlogs),
                    float(student.assignment_completion),
                    int(gender_encoded)
                ]]

            prediction = model.predict(features)
            probability = model.predict_proba(features)[0][1]

            results.append({
                "prediction": int(prediction[0]),
                "probability": float(probability),
                "risk_level": (
                    "HIGH" if probability > 0.7 else
                    "MEDIUM" if probability > 0.4 else
                    "LOW"
                )
            })

        except Exception as e:
            results.append({
                "error": str(e)
            })

    return {
        "results": results
    }
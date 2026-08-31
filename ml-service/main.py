from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import joblib
import os
import json
import subprocess
import shutil
from datetime import datetime
import pandas as pd
import numpy as np


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="StudentDrop AI ML Service",
    version="3.0.0"
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

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

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

DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)

ACTIVE_DATASET_FILE = os.path.join(
    DATA_DIR,
    "current_training_dataset.csv"
)


# ============================================================
# GLOBAL MODEL VARIABLES
# ============================================================

model = None

label_encoder = None

encoders = {}

model_metrics = {}

feature_names = []

categorical_columns = []


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    global model
    global label_encoder
    global encoders
    global model_metrics
    global feature_names
    global categorical_columns

    if not os.path.exists(MODEL_PATH):

        print(
            "[WARNING] Model not found. "
            "Please train the model first."
        )

        model = None
        label_encoder = None
        encoders = {}
        model_metrics = {}
        feature_names = []
        categorical_columns = []

        return

    try:

        data = joblib.load(
            MODEL_PATH
        )

        model = data.get(
            "model"
        )

        label_encoder = data.get(
            "label_encoder"
        )

        encoders = data.get(
            "encoders",
            {}
        )

        model_metrics = data.get(
            "metrics",
            {}
        )

        feature_names = data.get(
            "feature_names",
            []
        )

        categorical_columns = data.get(
            "categorical_columns",
            []
        )

        if not categorical_columns:

            categorical_columns = list(
                encoders.keys()
            )

        print(
            "[OK] Model loaded successfully."
        )

        print(
            f"[OK] Model type: "
            f"{type(model).__name__}"
        )

        print(
            f"[OK] Accuracy: "
            f"{model_metrics.get('accuracy', 'N/A')}"
        )

        print(
            f"[OK] Feature count: "
            f"{len(feature_names)}"
        )

        print(
            f"[OK] Features: "
            f"{feature_names}"
        )

        print(
            f"[OK] Categorical columns: "
            f"{categorical_columns}"
        )

        print(
            f"[OK] Saved encoders: "
            f"{list(encoders.keys())}"
        )

        if label_encoder is not None:

            print(
                "[INFO] Legacy label encoder available: "
                f"{label_encoder.classes_.tolist()}"
            )

    except Exception as e:

        print(
            f"[WARNING] Error loading model: {e}"
        )

        model = None
        label_encoder = None
        encoders = {}
        model_metrics = {}
        feature_names = []
        categorical_columns = []


# ============================================================
# TRAINING HISTORY
# ============================================================

def load_training_history():

    if not os.path.exists(
        HISTORY_FILE
    ):

        return []

    try:

        with open(
            HISTORY_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except Exception as e:

        print(
            f"[WARNING] Could not load "
            f"training history: {e}"
        )

        return []


def save_training_history(
    history
):

    os.makedirs(
        os.path.dirname(
            HISTORY_FILE
        ),
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

    attendance: Optional[float] = None

    gpa: Optional[float] = None

    backlogs: Optional[int] = None

    assignment_completion: Optional[float] = None

    engagement: Optional[str] = None

    class Config:
        extra = "allow"


class BatchPredictionRequest(BaseModel):

    students: List[PredictionRequest]


class PredictionResponse(BaseModel):

    prediction: int

    probability: float

    risk_level: str

    used_features: List[str] = []

    missing_features: List[str] = []


# ============================================================
# STARTUP
# ============================================================

@app.on_event(
    "startup"
)
async def startup_event():

    os.makedirs(
        DATA_DIR,
        exist_ok=True
    )

    os.makedirs(
        os.path.dirname(
            MODEL_PATH
        ),
        exist_ok=True
    )

    load_model()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {

        "service":
            "StudentDrop AI ML Service",

        "version":
            "3.0.0",

        "status":
            "running",

        "model_loaded":
            model is not None,

        "model_accuracy":
            (
                model_metrics.get(
                    "accuracy"
                )
                if model_metrics
                else None
            ),

        "training_samples":
            (
                model_metrics.get(
                    "samples"
                )
                if model_metrics
                else None
            ),

        "features":
            feature_names,

        "feature_count":
            len(feature_names),

        "categorical_features":
            categorical_columns,

        "encoders":
            list(encoders.keys())
    }


# ============================================================
# HEALTH
# ============================================================

@app.get(
    "/api/health"
)
async def health_check():

    return {

        "status":
            "healthy",

        "model_loaded":
            model is not None,

        "timestamp":
            datetime.now().isoformat()
    }


# ============================================================
# MODEL INFO
# ============================================================

@app.get(
    "/api/model-info"
)
async def model_info():

    if model is None:

        return {

            "status":
                "no_model_loaded",

            "message":
                "Please train the model first.",

            "metrics":
                {}
        }

    return {

        "status":
            "loaded",

        "model_type":
            model_metrics.get(
                "model_type",
                type(model).__name__
            ),

        "features":
            feature_names,

        "feature_count":
            len(feature_names),

        "categorical_features":
            categorical_columns,

        "encoded_features":
            list(encoders.keys()),

        "metrics":
            model_metrics
    }


# ============================================================
# TRAINING HISTORY
# ============================================================

@app.get(
    "/api/training-history"
)
async def get_training_history():

    history = load_training_history()

    return {

        "success":
            True,

        "history":
            history
    }


# ============================================================
# UPLOAD DATASET
# ============================================================

@app.post(
    "/api/upload-dataset"
)
async def upload_dataset(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    try:

        os.makedirs(
            DATA_DIR,
            exist_ok=True
        )

        with open(
            ACTIVE_DATASET_FILE,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        df = pd.read_csv(
            ACTIVE_DATASET_FILE
        )

        if df.empty:

            os.remove(
                ACTIVE_DATASET_FILE
            )

            raise HTTPException(
                status_code=400,
                detail="Uploaded CSV is empty."
            )

        if "dropout" not in df.columns:

            os.remove(
                ACTIVE_DATASET_FILE
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "CSV must contain a "
                    "'dropout' column."
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

            "success":
                True,

            "message":
                (
                    f"Dataset {file.filename} "
                    "uploaded successfully."
                ),

            "file_path":
                ACTIVE_DATASET_FILE,

            "original_filename":
                file.filename,

            "samples":
                int(len(df)),

            "columns":
                int(len(df.columns)),

            "features":
                list(df.columns)
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Dataset upload failed: "
                f"{str(e)}"
            )
        )


# ============================================================
# TRAIN MODEL
# ============================================================

@app.post(
    "/api/train"
)
async def train_model():

    global model
    global label_encoder
    global encoders
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

        print(
            "=" * 60
        )

        print(
            "[START] Starting model training"
        )

        print(
            "=" * 60
        )

        print(
            f"[INFO] Active dataset: "
            f"{ACTIVE_DATASET_FILE}"
        )

        print(
            f"[INFO] Samples: "
            f"{sample_count}"
        )

        print(
            f"[INFO] Columns: "
            f"{len(df.columns)}"
        )

        print(
            f"[INFO] Training features: "
            f"{list(df.columns)}"
        )

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

        print(
            result.stdout
        )

        if result.stderr:

            print(
                result.stderr
            )

        if result.returncode != 0:

            return {

                "success":
                    False,

                "message":
                    "Training failed.",

                "error":
                    result.stderr,

                "output":
                    result.stdout
            }

        load_model()

        if model is None:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Training completed but "
                    "model could not be loaded."
                )
            )

        metrics_path = MODEL_PATH.replace(
            ".pkl",
            "_metrics.json"
        )

        metrics = {}

        if os.path.exists(
            metrics_path
        ):

            with open(
                metrics_path,
                "r",
                encoding="utf-8"
            ) as f:

                metrics = json.load(
                    f
                )

        else:

            metrics = (
                model_metrics.copy()
            )

        history = (
            load_training_history()
        )

        for item in history:

            item["status"] = "archived"

        current_version = (
            len(history) + 1
        )

        trained_features = metrics.get(
            "features",
            feature_names
        )

        new_history_item = {

            "version":
                f"v{current_version}.0.0",

            "date":
                datetime.now().isoformat(),

            "accuracy":
                float(
                    metrics.get(
                        "accuracy",
                        0
                    )
                ),

            "precision":
                float(
                    metrics.get(
                        "precision",
                        0
                    )
                ),

            "recall":
                float(
                    metrics.get(
                        "recall",
                        0
                    )
                ),

            "f1_score":
                float(
                    metrics.get(
                        "f1_score",
                        0
                    )
                ),

            "roc_auc":
                float(
                    metrics.get(
                        "roc_auc",
                        0
                    )
                ),

            "samples":
                int(
                    metrics.get(
                        "samples",
                        sample_count
                    )
                ),

            "training_samples":
                int(
                    metrics.get(
                        "training_samples",
                        0
                    )
                ),

            "testing_samples":
                int(
                    metrics.get(
                        "testing_samples",
                        0
                    )
                ),

            "features":
                len(
                    trained_features
                ),

            "feature_names":
                trained_features,

            "dropout_rate":
                float(
                    metrics.get(
                        "dropout_rate",
                        0
                    )
                ),

            "model_type":
                metrics.get(
                    "model_type",
                    "XGBClassifier"
                ),

            "status":
                "active"
        }

        history.insert(
            0,
            new_history_item
        )

        save_training_history(
            history
        )

        print(
            "=" * 60
        )

        print(
            "[SUCCESS] Training complete"
        )

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

        print(
            "=" * 60
        )

        return {

            "success":
                True,

            "message":
                "Model trained successfully.",

            "output":
                result.stdout,

            "metrics":
                metrics,

            "samples":
                metrics.get(
                    "samples",
                    sample_count
                ),

            "accuracy":
                metrics.get(
                    "accuracy",
                    0
                ),

            "features":
                feature_names,

            "feature_count":
                len(feature_names),

            "categorical_features":
                categorical_columns
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
# DYNAMIC FEATURE BUILDER - FIXED VERSION
# ============================================================

def build_prediction_dataframe(
    request_data: Dict[str, Any]
):

    if not feature_names:

        raise ValueError(
            "No trained feature names found."
        )

    # Normalize frontend keys
    normalized_input = {}

    for key, value in request_data.items():

        normalized_key = str(
            key
        ).strip().lower()

        normalized_input[
            normalized_key
        ] = value

    # Create one row
    row = {}

    used_features = []

    missing_features = []

    # Engagement mapping for numeric conversion
    engagement_mapping = {
        'high': 2,
        'medium': 1,
        'low': 0
    }

    for feature in feature_names:

        feature_key = str(
            feature
        ).strip().lower()

        if feature_key in normalized_input:

            value = normalized_input[
                feature_key
            ]

            # Handle null/empty values
            if (
                value is None
                or
                (
                    isinstance(
                        value,
                        str
                    )
                    and value.strip() == ""
                )
            ):

                row[feature] = np.nan

                missing_features.append(
                    feature
                )

            else:

                # SPECIAL HANDLING FOR ENGAGEMENT
                # Convert string engagement to numeric
                if feature_key == 'engagement' and isinstance(value, str):
                    value_lower = value.lower()
                    if value_lower in engagement_mapping:
                        row[feature] = float(engagement_mapping[value_lower])
                    else:
                        # Try to convert to float directly
                        try:
                            row[feature] = float(value)
                        except (ValueError, TypeError):
                            row[feature] = np.nan
                            missing_features.append(feature)
                else:
                    row[feature] = value

                used_features.append(
                    feature
                )

        else:

            row[feature] = np.nan

            missing_features.append(
                feature
            )

    df = pd.DataFrame(
        [row],
        columns=feature_names
    )

    # Apply saved encoders ONLY to categorical features
    for column, encoder in encoders.items():

        if column not in df.columns:

            continue

        value = df.at[
            0,
            column
        ]

        if pd.isna(value):

            continue

        # If value is already numeric, check if it's in encoder classes
        if isinstance(value, (int, float)):
            # Convert to string for comparison
            value_str = str(int(value))
            known_values = set(
                str(x)
                for x in encoder.classes_
            )
            
            # Try to find matching class by numeric value
            found_match = False
            for i, class_val in enumerate(encoder.classes_):
                try:
                    if float(class_val) == float(value):
                        df.at[0, column] = i
                        found_match = True
                        break
                except (ValueError, TypeError):
                    pass
            
            if not found_match:
                if value_str in known_values:
                    df.at[0, column] = encoder.transform([value_str])[0]
                else:
                    print(
                        f"[WARNING] Unknown numeric value "
                        f"'{value}' for feature "
                        f"'{column}'. Using NaN."
                    )
                    df.at[0, column] = np.nan
                    
                    if column not in missing_features:
                        missing_features.append(column)
                    
                    if column in used_features:
                        used_features.remove(column)
        else:
            # String value
            value = str(value)
            known_values = set(
                str(x)
                for x in encoder.classes_
            )

            if value not in known_values:

                print(
                    f"[WARNING] Unknown value "
                    f"'{value}' for feature "
                    f"'{column}'. Using NaN."
                )

                df.at[
                    0,
                    column
                ] = np.nan

                if column not in missing_features:

                    missing_features.append(
                        column
                    )

                if column in used_features:

                    used_features.remove(
                        column
                    )

            else:

                df.at[
                    0,
                    column
                ] = encoder.transform(
                    [value]
                )[0]

    # Numeric conversion
    for column in feature_names:

        if column in encoders:

            continue

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Final column order
    df = df[
        feature_names
    ]

    # Force all columns to float32
    df = df.astype(np.float32)

    print(
        "[DEBUG] Prediction dataframe:"
    )

    print(
        df.to_string(
            index=False
        )
    )

    print(
        f"[DEBUG] Data types: {df.dtypes.to_dict()}"
    )

    print(
        f"[DEBUG] Used features: "
        f"{used_features}"
    )

    print(
        f"[DEBUG] Missing features: "
        f"{missing_features}"
    )

    return (
        df,
        used_features,
        missing_features
    )


# ============================================================
# CALCULATE RISK
# ============================================================

def calculate_risk_level(
    probability
):

    probability = float(
        probability
    )

    if probability >= 0.70:

        return "HIGH"

    elif probability >= 0.40:

        return "MEDIUM"

    else:

        return "LOW"


# ============================================================
# SINGLE PREDICTION - FIXED VERSION
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
            detail=(
                "Model not loaded. "
                "Please train the model first."
            )
        )

    try:

        request_data = request.dict(
            exclude_none=False
        )

        print(
            "=" * 60
        )

        print(
            "[PREDICTION] New prediction request"
        )

        print(
            f"[DEBUG] Frontend data: "
            f"{request_data}"
        )

        print(
            f"[DEBUG] Model features: "
            f"{feature_names}"
        )

        features, used_features, missing_features = (
            build_prediction_dataframe(
                request_data
            )
        )

        if len(
            used_features
        ) == 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No trained features were "
                    "provided by the frontend."
                )
            )

        # Make prediction
        prediction = model.predict(
            features
        )

        probabilities = (
            model.predict_proba(
                features
            )
        )

        probability = float(
            probabilities[0][1]
        )

        risk_level = (
            calculate_risk_level(
                probability
            )
        )

        print(
            f"[RESULT] Prediction: "
            f"{prediction[0]}"
        )

        print(
            f"[RESULT] Dropout probability: "
            f"{probability:.2%}"
        )

        print(
            f"[RESULT] Risk level: "
            f"{risk_level}"
        )

        print(
            "=" * 60
        )

        return PredictionResponse(

            prediction=int(
                prediction[0]
            ),

            probability=probability,

            risk_level=risk_level,

            used_features=used_features,

            missing_features=missing_features
        )

    except HTTPException:

        raise

    except Exception as e:

        print(
            f"[ERROR] Prediction failed: "
            f"{e}"
        )

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# BATCH PREDICTION
# ============================================================

@app.post(
    "/api/predict-batch"
)
async def predict_batch(
    request: BatchPredictionRequest
):

    if model is None:

        raise HTTPException(
            status_code=503,
            detail="Model not loaded."
        )

    if not request.students:

        raise HTTPException(
            status_code=400,
            detail="No students provided."
        )

    results = []

    for index, student in enumerate(
        request.students
    ):

        try:

            request_data = student.dict(
                exclude_none=False
            )

            features, used_features, missing_features = (
                build_prediction_dataframe(
                    request_data
                )
            )

            if len(
                used_features
            ) == 0:

                results.append({

                    "student_index":
                        index,

                    "error":
                        (
                            "No trained features "
                            "were provided."
                        )
                })

                continue

            prediction = model.predict(
                features
            )

            probabilities = (
                model.predict_proba(
                    features
                )
            )

            probability = float(
                probabilities[0][1]
            )

            risk_level = (
                calculate_risk_level(
                    probability
                )
            )

            results.append({

                "student_index":
                    index,

                "prediction":
                    int(
                        prediction[0]
                    ),

                "probability":
                    probability,

                "risk_level":
                    risk_level,

                "used_features":
                    used_features,

                "missing_features":
                    missing_features
            })

        except Exception as e:

            results.append({

                "student_index":
                    index,

                "error":
                    str(e)
            })

    return {

        "success":
            True,

        "results":
            results,

        "total_students":
            len(
                request.students
            )
    }
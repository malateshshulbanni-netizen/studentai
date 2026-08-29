import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)

from xgboost import XGBClassifier


class ModelTrainer:

    def __init__(self):

        self.model = None

        self.label_encoder = None

        self.encoders = {}

        self.feature_names = []

        self.model_metrics = {}

    # ========================================================
    # PREPARE DATA
    # ========================================================

    def prepare_data(self, df):

        print(
            f"[INFO] Preparing {len(df):,} records..."
        )

        df = df.copy()

        # ----------------------------------------------------
        # Remove target from features
        # ----------------------------------------------------

        if "dropout" not in df.columns:

            raise ValueError(
                "Dataset must contain a 'dropout' column."
            )

        y = df["dropout"].copy()

        # ----------------------------------------------------
        # Convert target to numeric
        # ----------------------------------------------------

        if not pd.api.types.is_numeric_dtype(y):

            target_encoder = LabelEncoder()

            y = target_encoder.fit_transform(
                y.astype(str)
            )

        else:

            y = pd.to_numeric(
                y,
                errors="coerce"
            )

        # Remove rows where target is missing
        valid_target = y.notna()

        df = df.loc[
            valid_target
        ].copy()

        y = y.loc[
            valid_target
        ]

        y = y.astype(int)

        # ----------------------------------------------------
        # Remove target and ID/name columns
        # ----------------------------------------------------

        columns_to_remove = [
            "dropout",
            "student_id",
            "name"
        ]

        feature_df = df.drop(
            columns=[
                col
                for col in columns_to_remove
                if col in df.columns
            ],
            errors="ignore"
        )

        # ----------------------------------------------------
        # Remove columns with no useful information
        # ----------------------------------------------------

        useless_columns = []

        for column in feature_df.columns:

            # All values same
            if feature_df[column].nunique(
                dropna=False
            ) <= 1:

                useless_columns.append(
                    column
                )

        if useless_columns:

            print(
                "[INFO] Removing constant columns: "
                f"{useless_columns}"
            )

            feature_df = feature_df.drop(
                columns=useless_columns
            )

        # ----------------------------------------------------
        # Encode categorical columns
        # ----------------------------------------------------

        self.encoders = {}

        for column in feature_df.columns:

            if (
                feature_df[column].dtype == "object"
                or
                str(
                    feature_df[column].dtype
                ).startswith("category")
            ):

                print(
                    f"[INFO] Encoding categorical "
                    f"feature: {column}"
                )

                encoder = LabelEncoder()

                values = (
                    feature_df[column]
                    .fillna("Unknown")
                    .astype(str)
                )

                feature_df[column] = (
                    encoder.fit_transform(
                        values
                    )
                )

                self.encoders[
                    column
                ] = encoder
                
                # Also store the main label encoder for backward compatibility
                if column == "engagement" or "engagement" in column.lower():
                    self.label_encoder = encoder

            else:

                feature_df[column] = pd.to_numeric(
                    feature_df[column],
                    errors="coerce"
                )

        # ----------------------------------------------------
        # If no specific engagement column, use the first encoder as label_encoder
        # ----------------------------------------------------
        if self.label_encoder is None and self.encoders:
            # Use the first encoder as default
            first_key = list(self.encoders.keys())[0]
            self.label_encoder = self.encoders[first_key]
            print(f"[INFO] Set label_encoder from column: {first_key}")

        # ----------------------------------------------------
        # Fill missing numeric values
        # ----------------------------------------------------

        for column in feature_df.columns:

            if feature_df[column].isna().any():

                if pd.api.types.is_numeric_dtype(
                    feature_df[column]
                ):

                    median_value = (
                        feature_df[column]
                        .median()
                    )

                    if pd.isna(
                        median_value
                    ):
                        median_value = 0

                    feature_df[column] = (
                        feature_df[column]
                        .fillna(median_value)
                    )

                else:

                    feature_df[column] = (
                        feature_df[column]
                        .fillna(0)
                    )

        # ----------------------------------------------------
        # Feature names
        # ----------------------------------------------------

        self.feature_names = list(
            feature_df.columns
        )

        print(
            f"[OK] Selected "
            f"{len(self.feature_names)} features"
        )
        
        if self.label_encoder:
            print(
                f"[OK] Label encoder classes: "
                f"{self.label_encoder.classes_.tolist()}"
            )

        return feature_df, y

    # ========================================================
    # TRAIN
    # ========================================================

    def train(self, X, y):

        if len(X) < 10:

            raise ValueError(
                "At least 10 samples are required "
                "for training."
            )

        # ----------------------------------------------------
        # Check target classes
        # ----------------------------------------------------

        class_counts = y.value_counts()

        print(
            "\n[INFO] Target classes:"
        )

        print(
            class_counts
        )

        if len(class_counts) < 2:

            raise ValueError(
                "The 'dropout' column must contain "
                "at least two classes."
            )

        # ----------------------------------------------------
        # Train/test split
        # ----------------------------------------------------

        X_train, X_test, y_train, y_test = (
            train_test_split(
                X,
                y,
                test_size=0.20,
                random_state=42,
                stratify=y
            )
        )

        print(
            f"\n[INFO] Training samples: "
            f"{len(X_train):,}"
        )

        print(
            f"[INFO] Testing samples: "
            f"{len(X_test):,}"
        )

        print(
            f"[INFO] Features: "
            f"{len(X.columns)}"
        )

        # ----------------------------------------------------
        # Calculate class imbalance
        # ----------------------------------------------------

        negative_count = (
            (y_train == 0).sum()
        )

        positive_count = (
            (y_train == 1).sum()
        )

        if positive_count > 0:

            scale_pos_weight = (
                negative_count /
                positive_count
            )

        else:

            scale_pos_weight = 1.0

        print(
            f"[INFO] Class 0: "
            f"{negative_count:,}"
        )

        print(
            f"[INFO] Class 1: "
            f"{positive_count:,}"
        )

        print(
            f"[INFO] scale_pos_weight: "
            f"{scale_pos_weight:.2f}"
        )

        # ----------------------------------------------------
        # XGBoost
        # ----------------------------------------------------

        self.model = XGBClassifier(

            n_estimators=200,

            max_depth=6,

            learning_rate=0.05,

            subsample=0.85,

            colsample_bytree=0.85,

            random_state=42,

            eval_metric="logloss",

            objective="binary:logistic",

            scale_pos_weight=scale_pos_weight
        )

        # ----------------------------------------------------
        # Fit
        # ----------------------------------------------------

        print(
            "\n[INFO] Fitting XGBoost..."
        )

        self.model.fit(
            X_train,
            y_train
        )

        # ----------------------------------------------------
        # Predictions
        # ----------------------------------------------------

        y_pred = self.model.predict(
            X_test
        )

        y_pred_proba = (
            self.model.predict_proba(
                X_test
            )[:, 1]
        )

        # ----------------------------------------------------
        # Metrics
        # ----------------------------------------------------

        accuracy = accuracy_score(
            y_test,
            y_pred
        )

        precision = precision_score(
            y_test,
            y_pred,
            zero_division=0
        )

        recall = recall_score(
            y_test,
            y_pred,
            zero_division=0
        )

        f1 = f1_score(
            y_test,
            y_pred,
            zero_division=0
        )

        try:

            roc_auc = roc_auc_score(
                y_test,
                y_pred_proba
            )

        except Exception:

            roc_auc = 0.0

        # ----------------------------------------------------
        # Confusion matrix
        # ----------------------------------------------------

        cm = confusion_matrix(
            y_test,
            y_pred
        )

        if cm.shape == (2, 2):

            tn, fp, fn, tp = (
                cm.ravel()
            )

        else:

            tn = fp = fn = tp = 0

        # ----------------------------------------------------
        # Classification report
        # ----------------------------------------------------

        report = classification_report(
            y_test,
            y_pred,
            zero_division=0
        )

        print(
            "\n[RESULTS]"
        )

        print(
            f"Accuracy:  {accuracy:.2%}"
        )

        print(
            f"Precision: {precision:.2%}"
        )

        print(
            f"Recall:    {recall:.2%}"
        )

        print(
            f"F1 Score:  {f1:.2%}"
        )

        print(
            f"ROC-AUC:   {roc_auc:.2%}"
        )

        print(
            "\n[CONFUSION MATRIX]"
        )

        print(
            cm
        )

        print(
            "\n[CLASSIFICATION REPORT]"
        )

        print(
            report
        )

        # ----------------------------------------------------
        # Feature importance
        # ----------------------------------------------------

        feature_importance = {}

        if hasattr(
            self.model,
            "feature_importances_"
        ):

            importances = (
                self.model
                .feature_importances_
            )

            feature_importance = dict(
                sorted(
                    zip(
                        self.feature_names,
                        importances
                    ),
                    key=lambda x: x[1],
                    reverse=True
                )
            )

        # ----------------------------------------------------
        # Store metrics
        # ----------------------------------------------------

        dropout_rate = float(
            y.mean()
        )

        self.model_metrics = {

            "accuracy": float(
                accuracy
            ),

            "precision": float(
                precision
            ),

            "recall": float(
                recall
            ),

            "f1_score": float(
                f1
            ),

            "roc_auc": float(
                roc_auc
            ),

            "samples": int(
                len(X)
            ),

            "training_samples": int(
                len(X_train)
            ),

            "testing_samples": int(
                len(X_test)
            ),

            "features": list(
                self.feature_names
            ),

            "feature_count": int(
                len(self.feature_names)
            ),

            "dropout_rate": dropout_rate,

            "model_type": "XGBClassifier",

            "confusion_matrix": [
                [
                    int(tn),
                    int(fp)
                ],
                [
                    int(fn),
                    int(tp)
                ]
            ],

            "true_negatives": int(
                tn
            ),

            "false_positives": int(
                fp
            ),

            "false_negatives": int(
                fn
            ),

            "true_positives": int(
                tp
            ),

            "feature_importance": {
                k: float(v)
                for k, v
                in feature_importance.items()
            }
        }

        print(
            "\n[SUCCESS] Model trained successfully!"
        )

        return (
            accuracy,
            X_test,
            y_test,
            y_pred
        )

    # ========================================================
    # SAVE MODEL
    # ========================================================

    def save_model(
        self,
        filepath="models/student_dropout_model.pkl"
    ):

        directory = os.path.dirname(
            filepath
        )

        if directory:

            os.makedirs(
                directory,
                exist_ok=True
            )

        # ----------------------------------------------------
        # Save model with ALL components
        # ----------------------------------------------------

        save_data = {
            "model": self.model,
            "label_encoder": self.label_encoder,
            "encoders": self.encoders,
            "feature_names": self.feature_names,
            "metrics": self.model_metrics
        }

        joblib.dump(
            save_data,
            filepath
        )

        print(
            f"[OK] Model saved to "
            f"{filepath}"
        )
        
        if self.label_encoder:
            print(
                f"[OK] Label encoder classes: "
                f"{self.label_encoder.classes_.tolist()}"
            )

        # ----------------------------------------------------
        # Save metrics
        # ----------------------------------------------------

        metrics_path = filepath.replace(
            ".pkl",
            "_metrics.json"
        )

        with open(
            metrics_path,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                self.model_metrics,
                f,
                indent=2
            )

        print(
            f"[OK] Metrics saved to "
            f"{metrics_path}"
        )

    # ========================================================
    # LOAD MODEL
    # ========================================================

    def load_model(
        self,
        filepath="models/student_dropout_model.pkl"
    ):

        if not os.path.exists(
            filepath
        ):

            raise FileNotFoundError(
                f"Model file {filepath} not found"
            )

        data = joblib.load(
            filepath
        )

        self.model = data.get(
            "model"
        )

        self.label_encoder = data.get(
            "label_encoder"
        )

        self.encoders = data.get(
            "encoders",
            {}
        )

        self.feature_names = data.get(
            "feature_names",
            []
        )

        self.model_metrics = data.get(
            "metrics",
            {}
        )

        print(
            f"[OK] Model loaded from "
            f"{filepath}"
        )
        
        if self.label_encoder:
            print(
                f"[OK] Label encoder classes: "
                f"{self.label_encoder.classes_.tolist()}"
            )

        return self.model

    # ========================================================
    # PREDICT
    # ========================================================

    def predict(
        self,
        features
    ):

        if self.model is None:

            raise Exception(
                "Model not loaded."
            )

        # ----------------------------------------------------
        # Dictionary input
        # ----------------------------------------------------

        if isinstance(
            features,
            dict
        ):

            df = pd.DataFrame(
                [features]
            )

        # ----------------------------------------------------
        # DataFrame input
        # ----------------------------------------------------

        elif isinstance(
            features,
            pd.DataFrame
        ):

            df = features.copy()

        else:

            raise ValueError(
                "Features must be a "
                "dictionary or DataFrame."
            )

        # ----------------------------------------------------
        # Remove unused columns
        # ----------------------------------------------------

        for column in [
            "student_id",
            "name",
            "dropout"
        ]:

            if column in df.columns:

                df = df.drop(
                    columns=[column]
                )

        # ----------------------------------------------------
        # Apply saved categorical encoders
        # ----------------------------------------------------

        for column, encoder in (
            self.encoders.items()
        ):

            if column in df.columns:

                values = (
                    df[column]
                    .fillna("Unknown")
                    .astype(str)
                )

                known_values = set(
                    encoder.classes_
                )

                # Unknown categories become
                # the first known class.
                values = values.apply(
                    lambda x:
                    x
                    if x in known_values
                    else encoder.classes_[0]
                )

                df[column] = (
                    encoder.transform(
                        values
                    )
                )

        # ----------------------------------------------------
        # Make sure feature order matches training
        # ----------------------------------------------------

        for column in self.feature_names:

            if column not in df.columns:

                df[column] = 0

        df = df[
            self.feature_names
        ]

        # ----------------------------------------------------
        # Numeric conversion
        # ----------------------------------------------------

        for column in df.columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        df = df.fillna(0)

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        prediction = self.model.predict(
            df
        )

        probability = (
            self.model
            .predict_proba(df)[:, 1]
        )

        return {
            "prediction": int(
                prediction[0]
            ),

            "probability": float(
                probability[0]
            ),

            "risk_level": (
                "HIGH"
                if probability[0] > 0.7
                else
                "MEDIUM"
                if probability[0] > 0.4
                else
                "LOW"
            )
        }
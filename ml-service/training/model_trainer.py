import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier


class ModelTrainer:

    def __init__(self):

        self.model = None
        self.model_type = None
        self.scaler = None
        
        # Encoder for each categorical feature
        self.encoders = {}

        # Backward compatibility
        self.label_encoder = None

        # Exact training feature order
        self.feature_names = []

        # Training metrics
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
        # Validate target
        # ----------------------------------------------------

        if "dropout" not in df.columns:

            raise ValueError(
                "Dataset must contain a 'dropout' column."
            )

        # ----------------------------------------------------
        # TARGET
        # ----------------------------------------------------

        y = df["dropout"].copy()

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

        # Remove invalid target rows
        valid_target = y.notna()

        df = df.loc[
            valid_target
        ].copy()

        y = y.loc[
            valid_target
        ].copy()

        y = y.astype(int)

        # ----------------------------------------------------
        # REMOVE NON-FEATURE COLUMNS
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

        if feature_df.empty:

            raise ValueError(
                "No usable features found in dataset."
            )

        # ----------------------------------------------------
        # REMOVE CONSTANT COLUMNS
        # ----------------------------------------------------

        useless_columns = []

        for column in feature_df.columns:

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
        # RESET ENCODERS
        # ----------------------------------------------------

        self.encoders = {}
        self.label_encoder = None

        # ----------------------------------------------------
        # ENCODE FEATURES
        # ----------------------------------------------------

        categorical_columns = []

        for column in feature_df.columns:

            is_categorical = (
                feature_df[column].dtype == "object"
                or
                str(
                    feature_df[column].dtype
                ).startswith("category")
            )

            if is_categorical:

                categorical_columns.append(
                    column
                )

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

                # Always include Unknown
                values_for_fit = pd.concat(
                    [
                        values,
                        pd.Series(["Unknown"])
                    ],
                    ignore_index=True
                )

                encoder.fit(
                    values_for_fit
                )

                feature_df[column] = (
                    feature_df[column]
                    .fillna("Unknown")
                    .astype(str)
                )

                feature_df[column] = (
                    encoder.transform(
                        feature_df[column]
                    )
                )

                # IMPORTANT:
                # Store encoder for prediction
                self.encoders[column] = encoder

                # Legacy compatibility
                if self.label_encoder is None:

                    self.label_encoder = encoder

            else:

                feature_df[column] = pd.to_numeric(
                    feature_df[column],
                    errors="coerce"
                )

        # ----------------------------------------------------
        # FORCE ALL FEATURES TO NUMERIC
        # ----------------------------------------------------

        for column in feature_df.columns:

            feature_df[column] = pd.to_numeric(
                feature_df[column],
                errors="coerce"
            )

        # ----------------------------------------------------
        # FILL MISSING VALUES
        # ----------------------------------------------------

        for column in feature_df.columns:

            if feature_df[column].isna().any():

                median_value = (
                    feature_df[column]
                    .median()
                )

                if pd.isna(median_value):

                    median_value = 0

                feature_df[column] = (
                    feature_df[column]
                    .fillna(median_value)
                )

        # ----------------------------------------------------
        # FINAL NUMERIC SAFETY
        # ----------------------------------------------------

        feature_df = feature_df.astype(
            np.float32
        )

        # ----------------------------------------------------
        # FEATURE NAMES
        # ----------------------------------------------------

        self.feature_names = list(
            feature_df.columns
        )

        print(
            f"[OK] Selected "
            f"{len(self.feature_names)} features"
        )

        print(
            f"[OK] Feature names: "
            f"{self.feature_names}"
        )

        print(
            f"[OK] Categorical columns: "
            f"{categorical_columns}"
        )

        print(
            f"[OK] Saved encoders: "
            f"{list(self.encoders.keys())}"
        )

        if self.label_encoder is not None:

            print(
                "[INFO] Legacy label encoder available: "
                f"{self.label_encoder.classes_.tolist()}"
            )

        # ----------------------------------------------------
        # FINAL VALIDATION
        # ----------------------------------------------------

        print(
            "\n[INFO] Final training dtypes:"
        )

        print(
            feature_df.dtypes
        )

        invalid_columns = [
            column
            for column in feature_df.columns
            if not (
                pd.api.types.is_numeric_dtype(
                    feature_df[column]
                )
            )
        ]

        if invalid_columns:

            raise ValueError(
                "Non-numeric columns remain after "
                f"encoding: {invalid_columns}"
            )

        print(
            "\n[OK] All training features are numeric."
        )

        return feature_df, y

    # ========================================================
    # TRAIN WITH BOTH MODELS AND SELECT BEST
    # ========================================================

    def train(self, X, y):

        if len(X) < 10:

            raise ValueError(
                "At least 10 samples are required "
                "for training."
            )

        # ----------------------------------------------------
        # FINAL X NUMERIC CHECK
        # ----------------------------------------------------

        X = X.copy()

        for column in X.columns:

            X[column] = pd.to_numeric(
                X[column],
                errors="coerce"
            )

        X = X.astype(
            np.float32
        )

        # ----------------------------------------------------
        # TARGET
        # ----------------------------------------------------

        y = pd.to_numeric(
            y,
            errors="coerce"
        ).astype(int)

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
        # TRAIN TEST SPLIT
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
        # CLASS IMBALANCE
        # ----------------------------------------------------

        negative_count = int(
            (y_train == 0).sum()
        )

        positive_count = int(
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
        # TRAIN XGBOOST MODEL
        # ----------------------------------------------------

        print("\n" + "=" * 70)
        print("[TRAINING] XGBoost Classifier")
        print("=" * 70)

        xgb_model = XGBClassifier(

            n_estimators=200,

            max_depth=6,

            learning_rate=0.05,

            subsample=0.85,

            colsample_bytree=0.85,

            random_state=42,

            eval_metric="logloss",

            objective="binary:logistic",

            scale_pos_weight=scale_pos_weight,

            enable_categorical=False
        )

        print(
            "\n[INFO] Fitting XGBoost..."
        )

        xgb_model.fit(
            X_train,
            y_train
        )

        print(
            "[OK] XGBoost training completed."
        )

        # XGBoost predictions
        y_pred_xgb = xgb_model.predict(X_test)
        y_pred_proba_xgb = xgb_model.predict_proba(X_test)[:, 1]

        # XGBoost metrics
        accuracy_xgb = accuracy_score(y_test, y_pred_xgb)
        precision_xgb = precision_score(y_test, y_pred_xgb, zero_division=0)
        recall_xgb = recall_score(y_test, y_pred_xgb, zero_division=0)
        f1_xgb = f1_score(y_test, y_pred_xgb, zero_division=0)

        try:
            roc_auc_xgb = roc_auc_score(y_test, y_pred_proba_xgb)
        except Exception:
            roc_auc_xgb = 0.0

        print("\n[RESULTS] XGBoost:")
        print(f"  Accuracy:  {accuracy_xgb:.2%}")
        print(f"  Precision: {precision_xgb:.2%}")
        print(f"  Recall:    {recall_xgb:.2%}")
        print(f"  F1 Score:  {f1_xgb:.2%}")
        print(f"  ROC-AUC:   {roc_auc_xgb:.2%}")

        # ----------------------------------------------------
        # TRAIN LOGISTIC REGRESSION MODEL
        # ----------------------------------------------------

        print("\n" + "=" * 70)
        print("[TRAINING] Logistic Regression")
        print("=" * 70)

        # Scale features for Logistic Regression
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Adjust class weight for imbalance
        class_weight = {
            0: 1.0,
            1: scale_pos_weight
        }

        lr_model = LogisticRegression(
            class_weight=class_weight,
            max_iter=1000,
            random_state=42,
            C=1.0,
            solver='lbfgs'
        )

        print(
            "\n[INFO] Fitting Logistic Regression..."
        )

        lr_model.fit(
            X_train_scaled,
            y_train
        )

        print(
            "[OK] Logistic Regression training completed."
        )

        # Logistic Regression predictions
        y_pred_lr = lr_model.predict(X_test_scaled)
        y_pred_proba_lr = lr_model.predict_proba(X_test_scaled)[:, 1]

        # Logistic Regression metrics
        accuracy_lr = accuracy_score(y_test, y_pred_lr)
        precision_lr = precision_score(y_test, y_pred_lr, zero_division=0)
        recall_lr = recall_score(y_test, y_pred_lr, zero_division=0)
        f1_lr = f1_score(y_test, y_pred_lr, zero_division=0)

        try:
            roc_auc_lr = roc_auc_score(y_test, y_pred_proba_lr)
        except Exception:
            roc_auc_lr = 0.0

        print("\n[RESULTS] Logistic Regression:")
        print(f"  Accuracy:  {accuracy_lr:.2%}")
        print(f"  Precision: {precision_lr:.2%}")
        print(f"  Recall:    {recall_lr:.2%}")
        print(f"  F1 Score:  {f1_lr:.2%}")
        print(f"  ROC-AUC:   {roc_auc_lr:.2%}")

        # ----------------------------------------------------
        # SELECT BEST MODEL
        # ----------------------------------------------------

        print("\n" + "=" * 70)
        print("[MODEL SELECTION]")
        print("=" * 70)

        # Compare models by accuracy
        if accuracy_xgb >= accuracy_lr:
            self.model = xgb_model
            self.model_type = "XGBClassifier"
            self.scaler = None  # XGBoost doesn't need scaling
            accuracy = accuracy_xgb
            precision = precision_xgb
            recall = recall_xgb
            f1 = f1_xgb
            roc_auc = roc_auc_xgb
            y_pred = y_pred_xgb
            y_pred_proba = y_pred_proba_xgb
            cm = confusion_matrix(y_test, y_pred)
            
            print(f"[SELECTED] XGBoost Classifier")
            print(f"  Accuracy:  {accuracy_xgb:.2%}")
            print(f"  Reason: XGBoost accuracy ({accuracy_xgb:.2%}) >= Logistic Regression ({accuracy_lr:.2%})")
        else:
            self.model = lr_model
            self.model_type = "LogisticRegression"
            self.scaler = scaler  # Save scaler for prediction
            accuracy = accuracy_lr
            precision = precision_lr
            recall = recall_lr
            f1 = f1_lr
            roc_auc = roc_auc_lr
            y_pred = y_pred_lr
            y_pred_proba = y_pred_proba_lr
            cm = confusion_matrix(y_test, y_pred)
            
            print(f"[SELECTED] Logistic Regression")
            print(f"  Accuracy:  {accuracy_lr:.2%}")
            print(f"  Reason: Logistic Regression accuracy ({accuracy_lr:.2%}) > XGBoost ({accuracy_xgb:.2%})")

        # ----------------------------------------------------
        # CONFUSION MATRIX
        # ----------------------------------------------------

        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            tn = fp = fn = tp = 0

        # ----------------------------------------------------
        # REPORT
        # ----------------------------------------------------

        report = classification_report(
            y_test,
            y_pred,
            zero_division=0
        )

        print(
            "\n[FINAL RESULTS]"
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

        print(cm)

        print(
            "\n[CLASSIFICATION REPORT]"
        )

        print(report)

        # ----------------------------------------------------
        # FEATURE IMPORTANCE
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

        elif hasattr(
            self.model,
            "coef_"
        ):

            importances = np.abs(
                self.model.coef_[0]
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
        # METRICS
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

            "model_type": self.model_type,

            "categorical_features": list(
                self.encoders.keys()
            ),

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

            "true_negatives": int(tn),

            "false_positives": int(fp),

            "false_negatives": int(fn),

            "true_positives": int(tp),

            "feature_importance": {
                k: float(v)
                for k, v in feature_importance.items()
            },

            # Store both model performances for comparison
            "model_comparison": {
                "xgboost": {
                    "accuracy": float(accuracy_xgb),
                    "precision": float(precision_xgb),
                    "recall": float(recall_xgb),
                    "f1_score": float(f1_xgb),
                    "roc_auc": float(roc_auc_xgb)
                },
                "logistic_regression": {
                    "accuracy": float(accuracy_lr),
                    "precision": float(precision_lr),
                    "recall": float(recall_lr),
                    "f1_score": float(f1_lr),
                    "roc_auc": float(roc_auc_lr)
                }
            }
        }

        print(
            "\n[SUCCESS] Model trained successfully!"
        )

        print(
            f"\n[INFO] Selected model: {self.model_type}"
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

        save_data = {

            "model": self.model,

            "model_type": self.model_type,

            "scaler": self.scaler,

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

        print(
            f"[OK] Model type: {self.model_type}"
        )

        # ----------------------------------------------------
        # METRICS JSON
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

        if not os.path.exists(filepath):

            raise FileNotFoundError(
                f"Model file {filepath} not found"
            )

        data = joblib.load(
            filepath
        )

        self.model = data.get(
            "model"
        )

        self.model_type = data.get(
            "model_type",
            "XGBClassifier"
        )

        self.scaler = data.get(
            "scaler",
            None
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

        print(
            f"[OK] Model type: {self.model_type}"
        )

        print(
            f"[OK] Training features: "
            f"{self.feature_names}"
        )

        print(
            f"[OK] Encoders: "
            f"{list(self.encoders.keys())}"
        )

        if self.scaler is not None:
            print(
                f"[OK] Scaler loaded: {type(self.scaler).__name__}"
            )

        return self.model

    # ========================================================
    # PREDICT
    # ========================================================

    def predict(self, features):

        if self.model is None:

            raise Exception(
                "Model not loaded."
            )

        # ----------------------------------------------------
        # INPUT -> DATAFRAME
        # ----------------------------------------------------

        if isinstance(
            features,
            dict
        ):

            df = pd.DataFrame(
                [features]
            )

        elif isinstance(
            features,
            pd.DataFrame
        ):

            df = features.copy()

        else:

            raise ValueError(
                "Features must be a dictionary "
                "or DataFrame."
            )

        # ----------------------------------------------------
        # REMOVE NON-FEATURE COLUMNS
        # ----------------------------------------------------

        columns_to_remove = [
            "student_id",
            "name",
            "dropout"
        ]

        df = df.drop(
            columns=[
                col
                for col in columns_to_remove
                if col in df.columns
            ],
            errors="ignore"
        )

        # ----------------------------------------------------
        # BUILD EXACT TRAINING FEATURES
        # ----------------------------------------------------

        final_df = pd.DataFrame(
            index=df.index
        )

        for column in self.feature_names:

            if column in df.columns:

                final_df[column] = df[column]

            else:

                final_df[column] = np.nan

        # ----------------------------------------------------
        # APPLY ENCODERS
        # ----------------------------------------------------

        for column, encoder in self.encoders.items():

            if column not in final_df.columns:

                continue

            values = final_df[column]

            encoded_values = []

            known_values = set(
                encoder.classes_
            )

            for value in values:

                if pd.isna(value):

                    encoded_values.append(
                        np.nan
                    )

                    continue

                # If frontend already sends a number,
                # keep it as a number.
                if isinstance(
                    value,
                    (int, float, np.integer, np.floating)
                ):

                    if pd.isna(value):

                        encoded_values.append(
                            np.nan
                        )

                    else:

                        encoded_values.append(
                            float(value)
                        )

                    continue

                value = str(value).strip()

                if value in known_values:

                    encoded_value = (
                        encoder.transform(
                            [value]
                        )[0]
                    )

                    encoded_values.append(
                        float(encoded_value)
                    )

                else:

                    print(
                        f"[WARN] Unknown category "
                        f"'{value}' for {column}; "
                        f"using NaN."
                    )

                    encoded_values.append(
                        np.nan
                    )

            # IMPORTANT:
            # Explicitly create numeric Series.
            final_df[column] = pd.Series(
                encoded_values,
                index=final_df.index,
                dtype="float32"
            )

        # ----------------------------------------------------
        # NUMERIC FEATURES
        # ----------------------------------------------------

        for column in final_df.columns:

            if column not in self.encoders:

                final_df[column] = pd.to_numeric(
                    final_df[column],
                    errors="coerce"
                )

                final_df[column] = (
                    final_df[column]
                    .astype("float32")
                )

        # ----------------------------------------------------
        # EXACT FEATURE ORDER
        # ----------------------------------------------------

        final_df = final_df[
            self.feature_names
        ]

        # ----------------------------------------------------
        # FINAL NUMERIC SAFETY
        # ----------------------------------------------------

        for column in final_df.columns:

            final_df[column] = pd.to_numeric(
                final_df[column],
                errors="coerce"
            )

        final_df = final_df.astype(
            np.float32
        )

        # ----------------------------------------------------
        # VALIDATE DTYPES BEFORE PREDICTION
        # ----------------------------------------------------

        invalid_columns = [
            column
            for column in final_df.columns
            if not pd.api.types.is_numeric_dtype(
                final_df[column]
            )
        ]

        if invalid_columns:

            raise ValueError(
                "Prediction dataframe contains "
                f"non-numeric columns: {invalid_columns}"
            )

        # ----------------------------------------------------
        # SCALE IF USING LOGISTIC REGRESSION
        # ----------------------------------------------------

        if self.model_type == "LogisticRegression" and self.scaler is not None:

            final_df_scaled = pd.DataFrame(
                self.scaler.transform(final_df),
                columns=final_df.columns,
                index=final_df.index
            )
            
            final_df = final_df_scaled

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print(
            "\n[INFO] Prediction dataframe:"
        )

        print(
            final_df
        )

        print(
            "\n[INFO] Prediction dtypes:"
        )

        print(
            final_df.dtypes
        )

        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        prediction = self.model.predict(
            final_df
        )

        probability = (
            self.model
            .predict_proba(
                final_df
            )[:, 1]
        )

        probability_value = float(
            probability[0]
        )

        # ----------------------------------------------------
        # RISK LEVEL
        # ----------------------------------------------------

        if probability_value >= 0.70:

            risk_level = "HIGH"

        elif probability_value >= 0.40:

            risk_level = "MEDIUM"

        else:

            risk_level = "LOW"

        # ----------------------------------------------------
        # USED / MISSING FEATURES
        # ----------------------------------------------------

        features_used = []

        missing_features = []

        for column in self.feature_names:

            value = final_df.iloc[0][column]

            if pd.isna(value):

                missing_features.append(
                    column
                )

            else:

                features_used.append(
                    column
                )

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        return {

            "prediction": int(
                prediction[0]
            ),

            "probability": probability_value,

            "risk_level": risk_level,

            "features_used": features_used,

            "missing_features": missing_features
        }
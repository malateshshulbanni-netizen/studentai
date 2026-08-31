import os
import pandas as pd


# ============================================================
# LOAD DATA
# ============================================================

def load_data(file_path):
    """
    Load the complete student dataset.

    The loader does NOT select a fixed number of features.
    All columns are kept so that ModelTrainer can decide
    which columns are useful for training.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Dataset not found: {file_path}"
        )

    try:
        df = pd.read_csv(file_path)

    except Exception as e:
        raise ValueError(
            f"Could not read CSV file: {e}"
        )

    if df.empty:
        raise ValueError(
            "Dataset is empty."
        )

    if "dropout" not in df.columns:
        raise ValueError(
            "Dataset must contain a 'dropout' column."
        )

    print(
        f"[OK] Loaded {len(df):,} records "
        f"from {file_path}"
    )

    print(
        f"[INFO] Total columns: {len(df.columns)}"
    )

    print(
        f"[INFO] Dataset columns:"
    )

    for column in df.columns:
        print(f"  - {column}")

    return df


# ============================================================
# PREPROCESS DATA
# ============================================================

def preprocess_data(df):
    """
    Basic dataset preparation.

    IMPORTANT:
    This function does NOT limit the dataset to 5 features.

    All columns except:
        student_id
        name
        dropout

    are returned as potential model features.

    Detailed encoding/imputation should be handled by
    ModelTrainer so the exact same preprocessing can be
    saved and reused during prediction.
    """

    if not isinstance(df, pd.DataFrame):
        raise TypeError(
            "df must be a pandas DataFrame."
        )

    if "dropout" not in df.columns:
        raise ValueError(
            "Dataset must contain a 'dropout' column."
        )

    # --------------------------------------------------------
    # Target
    # --------------------------------------------------------

    y = df["dropout"].copy()

    # --------------------------------------------------------
    # Remove ID / name / target
    # --------------------------------------------------------

    columns_to_remove = [
        "student_id",
        "name",
        "dropout"
    ]

    feature_columns = [
        column
        for column in df.columns
        if column not in columns_to_remove
    ]

    X = df[feature_columns].copy()

    print(
        f"[INFO] Potential training features: "
        f"{len(X.columns)}"
    )

    print(
        f"[INFO] Features: {list(X.columns)}"
    )

    return X, y


# ============================================================
# FEATURE NAMES
# ============================================================

def get_feature_names(df=None):
    """
    Return feature names dynamically.

    If a DataFrame is supplied, all columns except
    student_id, name and dropout are returned.

    No hard-coded 5-feature list is used.
    """

    if df is None:
        return []

    excluded_columns = {
        "student_id",
        "name",
        "dropout"
    }

    return [
        column
        for column in df.columns
        if column not in excluded_columns
    ]
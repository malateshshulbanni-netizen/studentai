import sys
import os
import argparse
import pandas as pd

# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(
    0,
    PROJECT_ROOT
)

from training.model_trainer import ModelTrainer


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description="Train StudentDrop AI model"
    )

    parser.add_argument(
        "--data",
        default=os.path.join(
            PROJECT_ROOT,
            "data",
            "current_training_dataset.csv"
        ),
        help="Path to CSV training dataset"
    )

    parser.add_argument(
        "--output",
        default=os.path.join(
            PROJECT_ROOT,
            "models",
            "student_dropout_model.pkl"
        ),
        help="Path where model should be saved"
    )

    args = parser.parse_args()

    # ========================================================
    # START
    # ========================================================

    print("=" * 70)
    print("[START] StudentDrop AI Model Training")
    print("=" * 70)

    print(
        f"\n[INFO] Dataset: {args.data}"
    )

    print(
        f"[INFO] Model output: {args.output}"
    )

    # ========================================================
    # CHECK DATASET
    # ========================================================

    if not os.path.exists(args.data):

        print(
            f"[ERROR] Dataset does not exist: "
            f"{args.data}"
        )

        sys.exit(1)

    # ========================================================
    # LOAD DATASET
    # ========================================================

    print("\n[INFO] Loading dataset...")

    try:

        df = pd.read_csv(args.data)

        print(
            f"[OK] Loaded {len(df):,} records"
        )

        print(
            f"[INFO] Columns: {list(df.columns)}"
        )

    except Exception as e:

        print(
            f"[ERROR] Could not load dataset: {e}"
        )

        sys.exit(1)

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    if df.empty:

        print(
            "[ERROR] Dataset is empty."
        )

        sys.exit(1)

    if "dropout" not in df.columns:

        print(
            "[ERROR] 'dropout' column not found!"
        )

        print(
            "[INFO] Your dataset must contain "
            "the target column 'dropout'."
        )

        sys.exit(1)

    # ========================================================
    # DISPLAY DATASET INFORMATION
    # ========================================================

    print("\n" + "-" * 70)
    print("[DATASET INFORMATION]")
    print("-" * 70)

    print(
        f"Rows       : {len(df):,}"
    )

    print(
        f"Columns    : {len(df.columns):,}"
    )

    print(
        f"Target     : dropout"
    )

    # All columns except target and IDs
    excluded_columns = {
        "dropout",
        "student_id",
        "name"
    }

    available_features = [
        column
        for column in df.columns
        if column not in excluded_columns
    ]

    print(
        f"Features   : {len(available_features):,}"
    )

    print("\n[INFO] Training features:")

    for index, feature in enumerate(
        available_features,
        start=1
    ):

        print(
            f"  {index:>3}. {feature}"
        )

    # ========================================================
    # TARGET DISTRIBUTION
    # ========================================================

    print("\n" + "-" * 70)
    print("[TARGET DISTRIBUTION]")
    print("-" * 70)

    print(
        df["dropout"].value_counts(
            dropna=False
        )
    )

    # Safely calculate dropout rate
    try:

        target_numeric = pd.to_numeric(
            df["dropout"],
            errors="coerce"
        )

        dropout_rate = (
            target_numeric.mean()
            if target_numeric.notna().any()
            else 0
        )

    except Exception:

        dropout_rate = 0

    print(
        f"\n[INFO] Dropout rate: "
        f"{dropout_rate:.2%}"
    )

    # ========================================================
    # CREATE TRAINER
    # ========================================================

    print("\n[INFO] Creating ModelTrainer...")

    trainer = ModelTrainer()

    # ========================================================
    # PREPARE DATA
    # ========================================================

    print("\n" + "-" * 70)
    print("[DATA PREPARATION]")
    print("-" * 70)

    try:

        X, y = trainer.prepare_data(
            df
        )

    except Exception as e:

        print(
            f"[ERROR] Data preparation failed: {e}"
        )

        import traceback
        traceback.print_exc()

        sys.exit(1)

    # ========================================================
    # PREPARED DATA INFORMATION
    # ========================================================

    print(
        f"\n[OK] Samples: {X.shape[0]:,}"
    )

    print(
        f"[OK] Features: {X.shape[1]:,}"
    )

    print(
        "[OK] Feature names:"
    )

    for index, feature in enumerate(
        X.columns,
        start=1
    ):

        print(
            f"  {index:>3}. {feature}"
        )

    # ========================================================
    # TRAIN MODEL
    # ========================================================

    print("\n" + "-" * 70)
    print("[MODEL TRAINING]")
    print("-" * 70)

    try:

        accuracy, X_test, y_test, y_pred = (
            trainer.train(
                X,
                y
            )
        )

    except Exception as e:

        print(
            f"[ERROR] Model training failed: {e}"
        )

        import traceback
        traceback.print_exc()

        sys.exit(1)

    # ========================================================
    # SAVE MODEL
    # ========================================================

    print("\n" + "-" * 70)
    print("[MODEL SAVING]")
    print("-" * 70)

    try:

        output_directory = os.path.dirname(
            args.output
        )

        if output_directory:

            os.makedirs(
                output_directory,
                exist_ok=True
            )

        trainer.save_model(
            args.output
        )

    except Exception as e:

        print(
            f"[ERROR] Could not save model: {e}"
        )

        import traceback
        traceback.print_exc()

        sys.exit(1)

    # ========================================================
    # VERIFY MODEL
    # ========================================================

    if not os.path.exists(args.output):

        print(
            "[ERROR] Model file was not created."
        )

        sys.exit(1)

    file_size = os.path.getsize(
        args.output
    )

    print(
        f"\n[OK] Model file created:"
        f" {args.output}"
    )

    print(
        f"[OK] Model file size:"
        f" {file_size:,} bytes"
    )

    # ========================================================
    # VERIFY METRICS FILE
    # ========================================================

    metrics_path = args.output.replace(
        ".pkl",
        "_metrics.json"
    )

    if os.path.exists(metrics_path):

        print(
            f"[OK] Metrics file created:"
            f" {metrics_path}"
        )

    # ========================================================
    # TRAINING SUMMARY
    # ========================================================

    print("\n" + "=" * 70)
    print("[SUCCESS] TRAINING COMPLETE")
    print("=" * 70)

    print(
        f"[INFO] Total samples:"
        f" {len(X):,}"
    )

    print(
        f"[INFO] Training samples:"
        f" {len(X) - len(X_test):,}"
    )

    print(
        f"[INFO] Testing samples:"
        f" {len(X_test):,}"
    )

    print(
        f"[INFO] Feature count:"
        f" {X.shape[1]:,}"
    )

    print(
        f"[INFO] Accuracy:"
        f" {accuracy:.2%}"
    )

    print(
        f"[INFO] Model:"
        f" {type(trainer.model).__name__}"
    )

    # ========================================================
    # IMPORTANT INFORMATION
    # ========================================================

    print("\n[INFO] Saved model features:")

    print(
        trainer.feature_names
    )

    print(
        "\n[INFO] Categorical features:"
    )

    if trainer.encoders:

        for column in trainer.encoders:

            print(
                f"  - {column}"
            )

    else:

        print(
            "  None"
        )

    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()
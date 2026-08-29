import sys
import os
import argparse
import pandas as pd

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(
    0,
    PROJECT_ROOT
)

from preprocessing.data_loader import load_data
from training.model_trainer import ModelTrainer


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

    print("=" * 70)
    print("[START] StudentDrop AI Model Training")
    print("=" * 70)

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    print(
        f"\n[INFO] Dataset: {args.data}"
    )

    if not os.path.exists(args.data):

        print(
            f"[ERROR] Dataset does not exist: "
            f"{args.data}"
        )

        sys.exit(1)

    # --------------------------------------------------------
    # Load data
    # --------------------------------------------------------

    print("\n[INFO] Loading dataset...")

    try:
        df = pd.read_csv(args.data)
        print(f"[OK] Loaded {len(df):,} records")
        print(f"[INFO] Columns: {list(df.columns)}")
    except Exception as e:
        print(f"[ERROR] Could not load dataset: {e}")
        sys.exit(1)

    # --------------------------------------------------------
    # Validate target
    # --------------------------------------------------------

    if "dropout" not in df.columns:

        print(
            "[ERROR] 'dropout' column not found!"
        )

        sys.exit(1)

    # --------------------------------------------------------
    # Target distribution
    # --------------------------------------------------------

    print("\n[INFO] Target distribution:")

    print(
        df["dropout"].value_counts(
            dropna=False
        )
    )

    dropout_rate = df['dropout'].mean() if 'dropout' in df.columns else 0
    print(
        f"\n[INFO] Dropout rate: "
        f"{dropout_rate:.2%}"
    )

    # --------------------------------------------------------
    # Create trainer
    # --------------------------------------------------------

    trainer = ModelTrainer()

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    print("\n[INFO] Preparing data...")

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

    print(
        f"[OK] Samples: {X.shape[0]:,}"
    )

    print(
        f"[OK] Features: {X.shape[1]}"
    )

    print(
        f"[OK] Feature names: "
        f"{list(X.columns)}"
    )

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    print("\n[INFO] Training model...")

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

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    print("\n[INFO] Saving model...")

    try:
        # Create models directory if it doesn't exist
        os.makedirs(os.path.dirname(args.output), exist_ok=True)
        
        trainer.save_model(
            args.output
        )
        
        # Verify the model was saved
        if os.path.exists(args.output):
            print(f"[OK] Model file created: {args.output}")
            file_size = os.path.getsize(args.output)
            print(f"[OK] Model file size: {file_size} bytes")
        else:
            print(f"[ERROR] Model file was not created at {args.output}")
            sys.exit(1)

    except Exception as e:

        print(
            f"[ERROR] Could not save model: {e}"
        )
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("[SUCCESS] TRAINING COMPLETE")
    print("=" * 70)

    print(
        f"[INFO] Total samples: "
        f"{len(X):,}"
    )

    print(
        f"[INFO] Training samples: "
        f"{len(X) - len(X_test):,}"
    )

    print(
        f"[INFO] Testing samples: "
        f"{len(X_test):,}"
    )

    print(
        f"[INFO] Features: "
        f"{X.shape[1]}"
    )

    print(
        f"[INFO] Accuracy: "
        f"{accuracy:.2%}"
    )

    print(
        f"[INFO] Model: "
        f"{type(trainer.model).__name__}"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()
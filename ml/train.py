"""
Standalone training script.

Mirrors CELL 6 + 7 + 8 + 9 of the Colab notebook (see README) but is meant to
be run locally:

    cd ml
    python train.py

It expects ``weather_classification_data.csv`` in the same directory and writes:
  - weather_classifier.pkl
  - label_encoder.pkl
  - feature_importance.json

If matplotlib is installed it will also save ``evaluation_plots.png``.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "weather_classification_data.csv"
MODEL_PATH = HERE / "weather_classifier.pkl"
ENCODER_PATH = HERE / "label_encoder.pkl"
IMPORTANCE_PATH = HERE / "feature_importance.json"
PLOTS_PATH = HERE / "evaluation_plots.png"

CLOUD_COVER_MAP: Dict[str, int] = {"clear": 0, "partly cloudy": 1, "cloudy": 2, "overcast": 3}
SEASON_MAP: Dict[str, int] = {"Spring": 0, "Summer": 1, "Autumn": 2, "Winter": 3}
LOCATION_MAP: Dict[str, int] = {"inland": 0, "coastal": 1, "mountain": 2}
TARGET_MAP: Dict[str, int] = {"Sunny": 0, "Cloudy": 1, "Rainy": 2, "Snowy": 3}
TARGET_MAP_INVERSE: Dict[int, str] = {v: k for k, v in TARGET_MAP.items()}

FEATURE_COLS: List[str] = [
    "Temperature",
    "Humidity",
    "Wind Speed",
    "Precipitation (%)",
    "Cloud Cover",
    "Atmospheric Pressure",
    "UV Index",
    "Season",
    "Visibility (km)",
    "Location",
]
TARGET_COL = "Weather Type"
CLASS_NAMES = ["Sunny", "Cloudy", "Rainy", "Snowy"]


def load_dataset() -> pd.DataFrame:
    if not CSV_PATH.exists():
        print(f"❌ Dataset not found at {CSV_PATH}", file=sys.stderr)
        sys.exit(1)
    df = pd.read_csv(CSV_PATH)
    print(f"✅ Loaded {df.shape[0]} rows × {df.shape[1]} columns from {CSV_PATH.name}")
    return df


def encode(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    d["Cloud Cover"] = d["Cloud Cover"].map(CLOUD_COVER_MAP)
    d["Season"] = d["Season"].map(SEASON_MAP)
    d["Location"] = d["Location"].map(LOCATION_MAP)
    d[TARGET_COL] = d[TARGET_COL].map(TARGET_MAP)
    # Hard fail if anything didn't encode — otherwise XGBoost will see NaN later.
    if d[FEATURE_COLS + [TARGET_COL]].isnull().any().any():
        bad = d[FEATURE_COLS + [TARGET_COL]].isnull().sum()
        print(f"❌ Encoding produced NaN values:\n{bad[bad > 0]}", file=sys.stderr)
        sys.exit(1)
    return d


def train_and_evaluate() -> None:
    df = load_dataset()
    print(f"\n📊 Class distribution:\n{df[TARGET_COL].value_counts()}")
    print(f"\n📊 Missing values:\n{df.isnull().sum().sum()} total")

    df_enc = encode(df)
    X = df_enc[FEATURE_COLS]
    y = df_enc[TARGET_COL]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"\n✅ Split → train={X_train.shape[0]}, test={X_test.shape[0]}")

    pipeline = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "xgb",
                XGBClassifier(
                    eval_metric="mlogloss",
                    random_state=42,
                ),
            ),
        ]
    )

    param_grid = {
        "xgb__n_estimators": [100, 200, 300],
        "xgb__max_depth": [4, 6, 8],
        "xgb__learning_rate": [0.05, 0.1, 0.2],
        "xgb__subsample": [0.8, 1.0],
    }

    print("\n🔄 Running GridSearchCV (this can take 5-15 minutes on CPU)...")
    grid = GridSearchCV(
        pipeline,
        param_grid,
        cv=5,
        scoring="accuracy",
        n_jobs=-1,
        verbose=2,
    )
    grid.fit(X_train, y_train)
    best = grid.best_estimator_

    y_pred = best.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    print("\n" + "=" * 55)
    print(f"  TEST ACCURACY: {test_acc:.4f} ({test_acc * 100:.2f}%)")
    print("=" * 55)
    print(f"  Best params  : {grid.best_params_}")
    print(f"  Best CV acc  : {grid.best_score_:.4f}")
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cv_scores = cross_val_score(best, X, y, cv=5, scoring="accuracy")
    print(f"\n📊 5-Fold CV: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"   Individual folds: {[f'{s:.4f}' for s in cv_scores]}")

    # Save artifacts
    joblib.dump(best, MODEL_PATH)
    print(f"\n✅ Saved {MODEL_PATH.name}")

    label_encoders = {
        "cloud_cover": CLOUD_COVER_MAP,
        "season": SEASON_MAP,
        "location": LOCATION_MAP,
        "weather_type": TARGET_MAP,
        "weather_type_inverse": TARGET_MAP_INVERSE,
        "feature_cols": FEATURE_COLS,
    }
    joblib.dump(label_encoders, ENCODER_PATH)
    print(f"✅ Saved {ENCODER_PATH.name}")

    xgb_model = best.named_steps["xgb"]
    importances = {
        col: float(imp)
        for col, imp in sorted(
            zip(FEATURE_COLS, xgb_model.feature_importances_),
            key=lambda x: x[1],
            reverse=True,
        )
    }
    IMPORTANCE_PATH.write_text(json.dumps(importances, indent=2))
    print(f"✅ Saved {IMPORTANCE_PATH.name}")

    # Optional plots
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from sklearn.metrics import ConfusionMatrixDisplay

        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        cm = confusion_matrix(y_test, y_pred)
        ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=CLASS_NAMES).plot(
            ax=axes[0], cmap="Blues", colorbar=False
        )
        axes[0].set_title(f"Confusion Matrix\nTest Accuracy: {test_acc * 100:.2f}%")

        feat_imp = pd.Series(
            xgb_model.feature_importances_, index=FEATURE_COLS
        ).sort_values(ascending=True)
        feat_imp.plot(kind="barh", ax=axes[1], color="#6c63ff")
        axes[1].set_title("Feature Importances (XGBoost)")
        axes[1].set_xlabel("Importance Score")

        plt.tight_layout()
        plt.savefig(PLOTS_PATH, dpi=150, bbox_inches="tight")
        print(f"✅ Saved {PLOTS_PATH.name}")
    except Exception as e:  # pragma: no cover
        print(f"⚠️  Skipped plots ({e})")

    print(
        "\n🎉 Done!\n"
        f"   Model        : XGBoost {grid.best_params_}\n"
        f"   Test Accuracy: {test_acc * 100:.2f}%\n"
        f"   CV Accuracy  : {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%\n"
        f"   Classes      : {CLASS_NAMES}\n"
        f"   Features     : {len(FEATURE_COLS)}"
    )


if __name__ == "__main__":
    # Force deterministic behavior
    np.random.seed(42)
    train_and_evaluate()

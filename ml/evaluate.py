"""Re-evaluate the saved model against the full dataset.

Usage:
    python evaluate.py
"""

from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "weather_classification_data.csv"
MODEL_PATH = HERE / "weather_classifier.pkl"
ENCODER_PATH = HERE / "label_encoder.pkl"

FEATURE_COLS = [
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


def main() -> None:
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {CSV_PATH}")
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}. Run train.py first."
        )

    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)

    df = pd.read_csv(CSV_PATH)
    df["Cloud Cover"] = df["Cloud Cover"].map(encoders["cloud_cover"])
    df["Season"] = df["Season"].map(encoders["season"])
    df["Location"] = df["Location"].map(encoders["location"])
    df[TARGET_COL] = df[TARGET_COL].map(encoders["weather_type"])

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"Test accuracy: {acc:.4f} ({acc * 100:.2f}%)\n")
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=CLASS_NAMES))

    cm = confusion_matrix(y_test, y_pred)
    print("Confusion matrix (rows=true, cols=pred):")
    header = "          " + "  ".join(f"{n:>8s}" for n in CLASS_NAMES)
    print(header)
    for i, row in enumerate(cm):
        print(f"{CLASS_NAMES[i]:>8s}  " + "  ".join(f"{v:>8d}" for v in row))


if __name__ == "__main__":
    main()

"""CLI helper for sanity-checking the trained model against a single example.

Usage:
    python predict.py
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
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










def load_model() -> tuple[Any, Dict[str, Any]]:
    if not MODEL_PATH.exists() or not ENCODER_PATH.exists():
        raise FileNotFoundError(
            "Trained model files not found. Run train.py first, or move the "
            ".pkl files from Colab into the ml/ folder."
        )
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    return model, encoders


 


def predict(features: Dict[str, float]) -> Dict[str, Any]:
    model, encoders = load_model()
    inverse_map = encoders["weather_type_inverse"]

    row = pd.DataFrame([{k: features[k] for k in FEATURE_COLS}], columns=FEATURE_COLS)
    proba = model.predict_proba(row)[0]
    cls_id = int(np.argmax(proba))
    label = inverse_map[cls_id]

    class_names = ["Sunny", "Cloudy", "Rainy", "Snowy"]
    probabilities = {class_names[i]: float(proba[i]) for i in range(len(class_names))}
    return {
        "label": label,
        "class_id": cls_id,
        "confidence": float(proba[cls_id]),
        "probabilities": probabilities,
    }


if __name__ == "__main__":
    sample = {
        "Temperature": 14.0,
        "Humidity": 73.0,
        "Wind Speed": 9.5,
        "Precipitation (%)": 82.0,
        "Cloud Cover": 1,  # partly cloudy
        "Atmospheric Pressure": 1010.82,
        "UV Index": 2,
        "Season": 3,  # Winter
        "Visibility (km)": 3.5,
        "Location": 0,  # inland
    }
    print("Sample features:")
    for k, v in sample.items():
        print(f"  {k:24s} = {v}")
    result = predict(sample)
    print("\nPrediction:")
    print(f"  label      = {result['label']}")
    print(f"  class_id   = {result['class_id']}")
    print(f"  confidence = {result['confidence']:.4f}")
    print("  probabilities:")
    for k, v in result["probabilities"].items():
        print(f"    {k:7s} = {v:.4f}")

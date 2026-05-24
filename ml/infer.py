"""
Reads a JSON features object from stdin, runs the XGBoost model, writes JSON to stdout.
Called as a subprocess by the Next.js API route — no server needed.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

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
CLASS_NAMES = ["Sunny", "Cloudy", "Rainy", "Snowy"]


def main() -> None:
    import joblib
    import numpy as np
    import pandas as pd

    features = json.loads(sys.stdin.buffer.read())

    model = joblib.load(HERE / "weather_classifier.pkl")
    encoders = joblib.load(HERE / "label_encoder.pkl")

    row = pd.DataFrame(
        [{k: features[k] for k in FEATURE_COLS}],
        columns=FEATURE_COLS,
    )
    proba = model.predict_proba(row)[0]
    cls_id = int(np.argmax(proba))
    label = encoders["weather_type_inverse"][cls_id]

    result = {
        "label": label,
        "class_id": cls_id,
        "confidence": float(proba[cls_id]),
        "probabilities": {CLASS_NAMES[i]: float(proba[i]) for i in range(len(CLASS_NAMES))},
    }
    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()


if __name__ == "__main__":
    main()

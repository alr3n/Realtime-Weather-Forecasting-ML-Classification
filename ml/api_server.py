"""FastAPI microservice that serves XGBoost weather predictions.

Run locally:
    uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

Endpoints:
    GET  /health        -> {"status": "ok", "model_loaded": bool}
    GET  /              -> redirects to /docs
    POST /predict       -> {"features": MLFeatures} → MLPrediction
    GET  /feature-info  -> training-time encoder maps + feature columns
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

logger = logging.getLogger("ml.api_server")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

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
CLASS_NAMES = ["Sunny", "Cloudy", "Rainy", "Snowy"]


# ---------- Pydantic schemas ----------
class FeaturesIn(BaseModel):
    Temperature: float
    Humidity: float
    Wind_Speed: float = Field(..., alias="Wind Speed")
    Precipitation_pct: float = Field(..., alias="Precipitation (%)")
    Cloud_Cover: int = Field(..., alias="Cloud Cover")
    Atmospheric_Pressure: float = Field(..., alias="Atmospheric Pressure")
    UV_Index: int = Field(..., alias="UV Index")
    Season: int
    Visibility_km: float = Field(..., alias="Visibility (km)")
    Location: int

    class Config:
        populate_by_name = True

    def to_row(self) -> pd.DataFrame:
        return pd.DataFrame(
            [
                {
                    "Temperature": self.Temperature,
                    "Humidity": self.Humidity,
                    "Wind Speed": self.Wind_Speed,
                    "Precipitation (%)": self.Precipitation_pct,
                    "Cloud Cover": self.Cloud_Cover,
                    "Atmospheric Pressure": self.Atmospheric_Pressure,
                    "UV Index": self.UV_Index,
                    "Season": self.Season,
                    "Visibility (km)": self.Visibility_km,
                    "Location": self.Location,
                }
            ],
            columns=FEATURE_COLS,
        )


class PredictIn(BaseModel):
    features: FeaturesIn


class Probabilities(BaseModel):
    Sunny: float
    Cloudy: float
    Rainy: float
    Snowy: float


class PredictOut(BaseModel):
    label: str
    class_id: int
    confidence: float
    probabilities: Probabilities


# ---------- App lifecycle ----------
app = FastAPI(
    title="Weather Classifier ML API",
    description="XGBoost weather classification (Sunny / Cloudy / Rainy / Snowy).",
    version="1.0.0",
)

# Open CORS — the Next.js server is the primary caller, but we also allow
# direct browser hits for /docs and quick testing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class _ModelHolder:
    model: Optional[Any] = None
    encoders: Optional[Dict[str, Any]] = None


_holder = _ModelHolder()


@app.on_event("startup")
def _load_model() -> None:
    if not MODEL_PATH.exists() or not ENCODER_PATH.exists():
        logger.warning(
            "Model files not found at %s / %s. Train the model first (Colab notebook "
            "or python train.py) and place the .pkl files in this directory.",
            MODEL_PATH,
            ENCODER_PATH,
        )
        return
    try:
        _holder.model = joblib.load(MODEL_PATH)
        _holder.encoders = joblib.load(ENCODER_PATH)
        logger.info("✅ Loaded model from %s", MODEL_PATH)
    except Exception as exc:  # pragma: no cover
        logger.exception("Failed to load model: %s", exc)


# ---------- Routes ----------
@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": _holder.model is not None,
        "encoders_loaded": _holder.encoders is not None,
        "feature_cols": FEATURE_COLS,
        "classes": CLASS_NAMES,
    }


@app.get("/feature-info")
def feature_info() -> Dict[str, Any]:
    enc = _holder.encoders or {}
    return {
        "feature_cols": FEATURE_COLS,
        "classes": CLASS_NAMES,
        "encoders": {
            "cloud_cover": enc.get("cloud_cover"),
            "season": enc.get("season"),
            "location": enc.get("location"),
            "weather_type": enc.get("weather_type"),
        },
    }


@app.post("/predict", response_model=PredictOut)
def predict(body: PredictIn) -> PredictOut:
    if _holder.model is None or _holder.encoders is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model not loaded. Train it via the Colab notebook or run "
                "`python train.py`, then restart the server."
            ),
        )

    row = body.features.to_row()
    try:
        proba = _holder.model.predict_proba(row)[0]
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    cls_id = int(np.argmax(proba))
    label = _holder.encoders["weather_type_inverse"][cls_id]
    probabilities = Probabilities(
        Sunny=float(proba[0]),
        Cloudy=float(proba[1]),
        Rainy=float(proba[2]),
        Snowy=float(proba[3]),
    )
    return PredictOut(
        label=label,
        class_id=cls_id,
        confidence=float(proba[cls_id]),
        probabilities=probabilities,
    )


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)

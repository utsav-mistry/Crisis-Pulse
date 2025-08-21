from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from typing import Dict, List

import numpy as np

from .model_store import load_model, load_meta
from .trainer import FEATURES, DISASTER_CLASSES
from .data_sources import collect_features


# Default monitoring locations: (name, lat, lon)
DEFAULT_LOCATIONS = [
    ("Tokyo, Japan", 35.6762, 139.6503),
    ("San Francisco, USA", 37.7749, -122.4194),
    ("Delhi, India", 28.7041, 77.1025),
    ("Jakarta, Indonesia", -6.2088, 106.8456),
    ("Santiago, Chile", -33.4489, -70.6693),
]


def to_feature_vector(feature_dict: Dict[str, float]) -> List[float]:
    return [float(feature_dict.get(k, 0.0) or 0.0) for k in FEATURES]


def risk_level_from_prob(prob: float) -> str:
    if prob >= 0.85:
        return "Severe"
    if prob >= 0.7:
        return "High"
    if prob >= 0.5:
        return "Moderate"
    return "Low"


def predict_for_location(model, name: str, lat: float, lon: float, threshold: float = 0.7):
    feats = collect_features(lat, lon)
    x = np.array([to_feature_vector(feats)])

    # Support models without predict_proba
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(x)[0]
    else:
        # softmax on decision function if available else dummy
        pred_idx = int(getattr(model, "predict", lambda X: [0])(x)[0])
        proba = np.zeros(len(DISASTER_CLASSES))
        proba[pred_idx] = 1.0

    best_idx = int(np.argmax(proba))
    best_class = DISASTER_CLASSES[best_idx]
    best_prob = float(proba[best_idx])

    if best_class != "none" and best_prob >= threshold:
        out = {
            "location": name,
            "disaster": best_class.capitalize(),
            "risk_level": risk_level_from_prob(best_prob),
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "accuracy": round(best_prob, 4),
        }
        print(json.dumps(out, ensure_ascii=False))


def run_predictions(locations=None, threshold: float = 0.7):
    model = load_model()
    if model is None:
        # Train quickly on the fly if no model present
        try:
            from .trainer import train_and_save
            train_and_save(n_per_class=500)
            model = load_model()
        except Exception:
            return

    if locations is None:
        locations = DEFAULT_LOCATIONS

    for name, lat, lon in locations:
        predict_for_location(model, name, lat, lon, threshold=threshold)

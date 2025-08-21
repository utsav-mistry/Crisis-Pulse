import os
import json
from pathlib import Path

try:
    import joblib  # preferred for sklearn models
except Exception:  # pragma: no cover
    joblib = None
import pickle

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "disaster_risk_model.pkl"
META_PATH = MODEL_DIR / "model_meta.json"


def save_model(model, meta: dict | None = None) -> None:
    if joblib is not None:
        joblib.dump(model, MODEL_PATH)
    else:
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(model, f)
    if meta is not None:
        META_PATH.write_text(json.dumps(meta, indent=2))


def load_model():
    if not MODEL_PATH.exists():
        return None
    if joblib is not None:
        try:
            return joblib.load(MODEL_PATH)
        except Exception:
            pass
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def load_meta() -> dict:
    if META_PATH.exists():
        try:
            return json.loads(META_PATH.read_text())
        except Exception:
            return {}
    return {}

from __future__ import annotations

import numpy as np
from pathlib import Path
from datetime import datetime

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
except Exception:  # pragma: no cover
    RandomForestClassifier = None

from .model_store import save_model
from .data_ingest import load_csv_dataset, balance_by_oversample, FEATURES as CSV_FEATURES


DISASTER_CLASSES = [
    "none",
    "flood",
    "cyclone",
    "wildfire",
    "earthquake",
    "drought",
]

FEATURES = [
    "temperature",
    "humidity",
    "rainfall",
    "wind_speed",
    "soil_moisture",
    "seismic_activity",
    "sat_fire_index",
    "drought_index",
    "pressure",
    "cloud_cover",
]


class RuleBasedModel:
    """Fallback model when sklearn isn't available.
    Implements predict and predict_proba with heuristic rules.
    """

    classes_ = np.array(DISASTER_CLASSES)

    def predict_proba(self, X):
        # X shape: (n_samples, n_features)
        X = np.asarray(X)
        probs = []
        for row in X:
            (
                temperature,
                humidity,
                rainfall,
                wind_speed,
                soil_moisture,
                seismic_activity,
                sat_fire_index,
                drought_index,
                pressure,
                cloud_cover,
            ) = row
            p = {c: 0.0 for c in DISASTER_CLASSES}
            p["flood"] = float(max(0, (rainfall - 50) / 100) + max(0, (soil_moisture - 0.6)))
            p["cyclone"] = float(max(0, (wind_speed - 20) / 50))
            p["wildfire"] = float(max(0, (temperature - 30) / 20) + max(0, (sat_fire_index - 0.5)))
            p["earthquake"] = float(min(1.0, seismic_activity / 6.0))
            p["drought"] = float(max(0, (drought_index - 0.5)) + max(0, (temperature - 35) / 20))
            # none as residual
            total = sum(p[c] for c in DISASTER_CLASSES if c != "none")
            p["none"] = max(0.0, 1.0 - min(1.0, total))
            # normalize
            s = sum(p.values())
            if s == 0:
                probs.append([1.0] + [0.0] * (len(DISASTER_CLASSES) - 1))
            else:
                probs.append([p[c] / s for c in DISASTER_CLASSES])
        return np.array(probs)

    def predict(self, X):
        proba = self.predict_proba(X)
        idx = np.argmax(proba, axis=1)
        return self.classes_[idx]


def _generate_balanced_synthetic(n_per_class: int = 2000, seed: int = 42):
    rng = np.random.default_rng(seed)
    X = []
    y = []

    def clip(a, lo, hi):
        return np.clip(a, lo, hi)

    # None (normal conditions)
    for _ in range(n_per_class):
        temperature = rng.normal(25, 5)
        humidity = rng.uniform(40, 70)
        rainfall = rng.uniform(0, 10)
        wind_speed = rng.uniform(0, 10)
        soil_moisture = rng.uniform(0.2, 0.5)
        seismic_activity = rng.exponential(0.5)
        sat_fire_index = rng.uniform(0.1, 0.4)
        drought_index = rng.uniform(0.1, 0.4)
        pressure = rng.normal(1010, 5)
        cloud_cover = rng.uniform(20, 60)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("none")

    # Flood
    for _ in range(n_per_class):
        temperature = rng.normal(26, 3)
        humidity = rng.uniform(70, 95)
        rainfall = rng.uniform(60, 150)
        wind_speed = rng.uniform(5, 20)
        soil_moisture = rng.uniform(0.6, 0.95)
        seismic_activity = rng.exponential(0.4)
        sat_fire_index = rng.uniform(0.1, 0.3)
        drought_index = rng.uniform(0.0, 0.3)
        pressure = rng.normal(1005, 5)
        cloud_cover = rng.uniform(60, 100)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("flood")

    # Cyclone
    for _ in range(n_per_class):
        temperature = rng.normal(28, 3)
        humidity = rng.uniform(60, 90)
        rainfall = rng.uniform(20, 100)
        wind_speed = rng.uniform(25, 60)
        soil_moisture = rng.uniform(0.4, 0.8)
        seismic_activity = rng.exponential(0.4)
        sat_fire_index = rng.uniform(0.1, 0.4)
        drought_index = rng.uniform(0.0, 0.4)
        pressure = rng.normal(995, 6)
        cloud_cover = rng.uniform(60, 100)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("cyclone")

    # Wildfire
    for _ in range(n_per_class):
        temperature = rng.uniform(32, 48)
        humidity = rng.uniform(10, 35)
        rainfall = rng.uniform(0, 3)
        wind_speed = rng.uniform(5, 25)
        soil_moisture = rng.uniform(0.05, 0.25)
        seismic_activity = rng.exponential(0.4)
        sat_fire_index = rng.uniform(0.5, 0.95)
        drought_index = rng.uniform(0.5, 0.9)
        pressure = rng.normal(1008, 4)
        cloud_cover = rng.uniform(0, 30)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("wildfire")

    # Earthquake (features mostly seismic)
    for _ in range(n_per_class):
        temperature = rng.normal(25, 5)
        humidity = rng.uniform(30, 70)
        rainfall = rng.uniform(0, 20)
        wind_speed = rng.uniform(0, 15)
        soil_moisture = rng.uniform(0.2, 0.5)
        seismic_activity = rng.uniform(3.0, 7.5)  # magnitude-like
        sat_fire_index = rng.uniform(0.1, 0.4)
        drought_index = rng.uniform(0.1, 0.5)
        pressure = rng.normal(1010, 5)
        cloud_cover = rng.uniform(0, 80)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("earthquake")

    # Drought
    for _ in range(n_per_class):
        temperature = rng.uniform(30, 45)
        humidity = rng.uniform(10, 40)
        rainfall = rng.uniform(0, 2)
        wind_speed = rng.uniform(0, 12)
        soil_moisture = rng.uniform(0.05, 0.2)
        seismic_activity = rng.exponential(0.4)
        sat_fire_index = rng.uniform(0.3, 0.7)
        drought_index = rng.uniform(0.6, 0.95)
        pressure = rng.normal(1008, 4)
        cloud_cover = rng.uniform(0, 40)
        X.append([
            temperature, humidity, rainfall, wind_speed, soil_moisture,
            seismic_activity, sat_fire_index, drought_index, pressure, cloud_cover
        ])
        y.append("drought")

    X = np.array(X, dtype=float)
    y = np.array(y)
    return X, y


def train_and_save(n_per_class: int = 1500, prefer_csv: bool = True):
    """Train model, preferring CSV datasets when available.
    If CSVs are found under data/ paths, load, clean, and balance them; otherwise fall back to synthetic.
    """
    X = y = None
    if prefer_csv:
        try:
            # base_dir is two levels up from this file (project root)
            base_dir = Path(__file__).resolve().parents[2]
            X_csv, y_csv = load_csv_dataset(base_dir)
            # Balance dataset by oversampling minority classes
            X, y = balance_by_oversample(X_csv, y_csv)
        except Exception:
            # No CSVs or failed to load; fall back
            pass

    if X is None or y is None:
        X, y = _generate_balanced_synthetic(n_per_class=n_per_class)

    if RandomForestClassifier is None:
        model = RuleBasedModel()
        meta = {
            "model": "RuleBasedModel",
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "features": list(FEATURES),
            "classes": list(DISASTER_CLASSES),
            "accuracy": None,
        }
        save_model(model, meta)
        return meta

    # encode labels
    class_to_idx = {c: i for i, c in enumerate(DISASTER_CLASSES)}
    y_idx = np.array([class_to_idx[c] for c in y])

    X_train, X_test, y_train, y_test = train_test_split(X, y_idx, test_size=0.2, random_state=42, stratify=y_idx)
    rf = RandomForestClassifier(n_estimators=300, max_depth=None, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    preds = rf.predict(X_test)
    acc = float((preds == y_test).mean())

    meta = {
        "model": "RandomForestClassifier",
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "features": list(FEATURES),
        "classes": list(DISASTER_CLASSES),
        "accuracy": acc,
    }
    save_model(rf, meta)
    return meta

from __future__ import annotations

import glob
import os
from pathlib import Path
from typing import List, Tuple

import numpy as np

try:
    import pandas as pd
except Exception:  # pragma: no cover
    pd = None

# Expected features and label used by the trainer
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
LABEL_COL = "label"  # expected classes: none, flood, cyclone, wildfire, earthquake, drought


def _find_csv_files(base_dir: Path) -> List[Path]:
    candidates = []
    # Look for CSVs directly under the project root
    candidates.extend([Path(x) for x in glob.glob(str(base_dir / "*.csv"))])
    for sub in [
        "data/raw",
        "data",
        "dataset",
        "datasets",
        "models",
        "models/data",
        "api/pipeline/data",
        "api/sample_data",
    ]:
        p = base_dir / sub
        candidates.extend([Path(x) for x in glob.glob(str(p / "*.csv"))])

    # Also allow explicit external paths via env
    glob_pat = os.getenv("TRAINING_DATA_GLOB")
    if glob_pat:
        candidates.extend([Path(x) for x in glob.glob(glob_pat)])

    dir_pat = os.getenv("TRAINING_DATA_DIR")
    if dir_pat:
        candidates.extend([Path(x) for x in glob.glob(str(Path(dir_pat) / "*.csv"))])
    return list({c.resolve() for c in candidates})


def _coerce_numeric(df: 'pd.DataFrame', cols: List[str]) -> 'pd.DataFrame':
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
        else:
            df[c] = np.nan
    return df


def load_csv_dataset(base_dir: Path) -> Tuple[np.ndarray, np.ndarray]:
    """Load and merge CSVs into feature matrix X and labels y.
    Columns required: FEATURES + LABEL_COL. Missing numeric columns are imputed by median.
    Rows missing LABEL_COL are dropped.
    """
    if pd is None:
        raise RuntimeError("pandas is required to load CSV datasets. Install via: pip install pandas")

    files = _find_csv_files(base_dir)
    if not files:
        raise FileNotFoundError("No CSV files found in data/raw, data, dataset, or datasets directories.")

    frames = []
    for f in files:
        try:
            df = pd.read_csv(f)
            frames.append(df)
        except Exception:
            continue
    if not frames:
        raise RuntimeError("Failed to read any CSV files for training data.")

    df = pd.concat(frames, ignore_index=True)

    # Normalize columns to expected schema; coerce numeric
    df = _coerce_numeric(df, FEATURES)

    # Label normalization
    if LABEL_COL not in df.columns:
        # Try fallbacks
        for alt in ["target", "class", "disaster", "disaster_type"]:
            if alt in df.columns:
                df[LABEL_COL] = df[alt].astype(str).str.lower()
                break
    if LABEL_COL not in df.columns:
        raise RuntimeError(f"Missing label column '{LABEL_COL}' in CSV files")

    # Clean labels
    df[LABEL_COL] = df[LABEL_COL].astype(str).str.strip().str.lower()

    # Drop rows with no label
    df = df[df[LABEL_COL].notna() & (df[LABEL_COL] != "")]

    # Impute missing numeric features by median
    for c in FEATURES:
        med = df[c].median(skipna=True)
        df[c] = df[c].fillna(med if np.isfinite(med) else 0.0)

    # Filter to known classes
    allowed = {"none", "flood", "cyclone", "wildfire", "earthquake", "drought"}
    df = df[df[LABEL_COL].isin(allowed)]

    # Remove extreme outliers (5-sigma clip per column)
    for c in FEATURES:
        col = df[c]
        mu, sigma = col.mean(), col.std(ddof=0)
        if np.isfinite(mu) and np.isfinite(sigma) and sigma > 0:
            df = df[(df[c] >= mu - 5 * sigma) & (df[c] <= mu + 5 * sigma)]

    # Return X, y
    X = df[FEATURES].to_numpy(dtype=float)
    y = df[LABEL_COL].to_numpy(dtype=str)
    return X, y


def balance_by_oversample(X: np.ndarray, y: np.ndarray, seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    classes, counts = np.unique(y, return_counts=True)
    max_n = counts.max()
    X_out = []
    y_out = []
    for c in classes:
        idx = np.where(y == c)[0]
        if len(idx) == 0:
            continue
        need = max_n - len(idx)
        if need > 0:
            extra = rng.choice(idx, size=need, replace=True)
            sel = np.concatenate([idx, extra])
        else:
            sel = idx
        X_out.append(X[sel])
        y_out.append(np.full(len(sel), c, dtype=y.dtype))
    return np.vstack(X_out), np.concatenate(y_out)

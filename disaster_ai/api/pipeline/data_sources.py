from __future__ import annotations

import os
import time
import json
from typing import Dict, Any
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings


def _http_get(url: str, timeout: int = 10) -> dict | None:
    try:
        with urlopen(url, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None


def fetch_openweather(lat: float, lon: float) -> Dict[str, Any]:
    api_key = getattr(settings, "OPENWEATHER_API_KEY", None) or os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        # fallback mock
        import random
        return {
            "temperature": 20 + 15 * random.random(),
            "humidity": 30 + 60 * random.random(),
            "rainfall": 50 * random.random(),
            "wind_speed": 30 * random.random(),
            "pressure": 1000 + 20 * random.random(),
            "cloud_cover": 100 * random.random(),
        }
    params = urlencode({"lat": lat, "lon": lon, "appid": api_key, "units": "metric"})
    url = f"https://api.openweathermap.org/data/2.5/weather?{params}"
    data = _http_get(url)
    if not data:
        return {}
    main = data.get("main", {})
    wind = data.get("wind", {})
    rain = data.get("rain", {})
    clouds = data.get("clouds", {})
    return {
        "temperature": main.get("temp"),
        "humidity": main.get("humidity"),
        "rainfall": rain.get("1h") or rain.get("3h") or 0.0,
        "wind_speed": wind.get("speed"),
        "pressure": main.get("pressure"),
        "cloud_cover": clouds.get("all"),
    }


def fetch_usgs_earthquakes(lat: float, lon: float) -> Dict[str, Any]:
    # Use USGS API for recent earthquakes within radius
    radius_km = 300
    url = (
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&"
        f"latitude={lat}&longitude={lon}&maxradiuskm={radius_km}&orderby=time&limit=1"
    )
    data = _http_get(url)
    if not data or not data.get("features"):
        return {"seismic_activity": 0.0}
    feat = data["features"][0]
    mag = feat.get("properties", {}).get("mag") or 0.0
    return {"seismic_activity": mag}


def fetch_satellite_indices(lat: float, lon: float) -> Dict[str, Any]:
    # Placeholder for NASA/Copernicus/IMD sources. If no API keys, return mock realistic values.
    import random
    return {
        "soil_moisture": random.uniform(0.05, 0.95),
        "sat_fire_index": random.uniform(0.0, 1.0),
        "drought_index": random.uniform(0.0, 1.0),
    }


def collect_features(lat: float, lon: float) -> Dict[str, Any]:
    ow = fetch_openweather(lat, lon)
    usgs = fetch_usgs_earthquakes(lat, lon)
    sat = fetch_satellite_indices(lat, lon)
    features = {**ow, **usgs, **sat}
    return features

from __future__ import annotations

import csv
from pathlib import Path
from typing import Optional

from django.core.management.base import BaseCommand, CommandParser

from ...pipeline.trainer import DISASTER_CLASSES


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


class Command(BaseCommand):
    help = "Generate a large, clean, balanced CSV training dataset at the given path."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("output", type=str, help="Output CSV path (e.g., C:/data/disaster_training.csv)")
        parser.add_argument("--per-class", type=int, default=50000, help="Rows per class (default: 50k)")
        parser.add_argument("--seed", type=int, default=42, help="Random seed")

    def handle(self, *args, **options):
        import numpy as np

        out_path = Path(options["output"]).expanduser().resolve()
        per_class = int(options["per_class"])
        seed = int(options["seed"])

        out_path.parent.mkdir(parents=True, exist_ok=True)

        rng = np.random.default_rng(seed)

        def rows_for_class(label: str, n: int):
            for _ in range(n):
                if label == "none":
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
                elif label == "flood":
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
                elif label == "cyclone":
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
                elif label == "wildfire":
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
                elif label == "earthquake":
                    temperature = rng.normal(25, 5)
                    humidity = rng.uniform(30, 70)
                    rainfall = rng.uniform(0, 20)
                    wind_speed = rng.uniform(0, 15)
                    soil_moisture = rng.uniform(0.2, 0.5)
                    seismic_activity = rng.uniform(3.0, 7.5)
                    sat_fire_index = rng.uniform(0.1, 0.4)
                    drought_index = rng.uniform(0.1, 0.5)
                    pressure = rng.normal(1010, 5)
                    cloud_cover = rng.uniform(0, 80)
                elif label == "drought":
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
                else:
                    continue

                yield [
                    float(temperature),
                    float(humidity),
                    float(rainfall),
                    float(wind_speed),
                    float(soil_moisture),
                    float(seismic_activity),
                    float(sat_fire_index),
                    float(drought_index),
                    float(pressure),
                    float(cloud_cover),
                    label,
                ]

        with out_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([*FEATURES, "label"])  # header
            for label in DISASTER_CLASSES:
                n = per_class
                for row in rows_for_class(label, n):
                    writer.writerow(row)

        self.stdout.write(self.style.SUCCESS(f"Wrote CSV: {out_path} (rows: {per_class * len(DISASTER_CLASSES)})"))

from __future__ import annotations

import os
import threading
import time
from typing import Optional

from django.conf import settings

from .predictor import run_predictions


class _Scheduler:
    def __init__(self):
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()
        self._started = False

    def start(self):
        if self._started:
            return
        self._started = True

        # prevent duplicate start under autoreload
        if os.environ.get("RUN_MAIN") != "true":
            # In tests or management commands, RUN_MAIN may be None, still avoid duplicate
            pass
        self._thread = threading.Thread(target=self._loop, name="AI-PipelineScheduler", daemon=True)
        self._thread.start()

    def _loop(self):
        interval_min = getattr(settings, "PIPELINE_FETCH_INTERVAL_MINUTES", 60)
        threshold = float(getattr(settings, "PIPELINE_RISK_THRESHOLD", 0.7))
        interval_sec = max(60, int(interval_min * 60))  # not less than 60s

        # Initial small delay to let server boot
        time.sleep(2)
        while not self._stop.is_set():
            try:
                run_predictions(threshold=threshold)
            except Exception:
                # keep running; optionally log via Django logging
                pass
            self._stop.wait(interval_sec)

    def stop(self):
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)


scheduler = _Scheduler()

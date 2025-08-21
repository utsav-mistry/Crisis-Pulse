from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'Disaster AI API'

    def ready(self):
        """Start background scheduler when Django app is ready.
        Avoid duplicate starts under autoreload; the scheduler itself guards too.
        """
        try:
            from .pipeline.scheduler import scheduler
            scheduler.start()
        except Exception:
            # Do not crash app startup if scheduler fails
            pass

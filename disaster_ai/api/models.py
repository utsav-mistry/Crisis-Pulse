from django.db import models
from django.contrib.auth.models import User

class HistoricalDisaster(models.Model):
    DISASTER_TYPES = [
        ('flood', 'Flood'),
        ('drought', 'Drought'),
        ('earthquake', 'Earthquake'),
        ('cyclone', 'Cyclone'),
        ('landslide', 'Landslide'),
        ('tsunami', 'Tsunami'),
        ('wildfire', 'Wildfire'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    type = models.CharField(max_length=20, choices=DISASTER_TYPES)
    subtype = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    city = models.CharField(max_length=50, blank=True)
    date = models.DateField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='medium')
    casualties = models.IntegerField(default=0)
    damage_estimate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    coordinates = models.JSONField(null=True, blank=True)  # {lat: float, lon: float}
    source = models.CharField(max_length=50, default='manual')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['type', 'state', 'date']),
            models.Index(fields=['state', 'district']),
        ]
    
    def __str__(self):
        return f"{self.type} in {self.state} on {self.date}"

class DisasterPrediction(models.Model):
    PREDICTION_MODELS = [
        ('lstm', 'LSTM'),
        ('cnn', 'CNN'),
        ('random_forest', 'Random Forest'),
        ('xgboost', 'XGBoost'),
        ('ensemble', 'Ensemble'),
    ]
    
    CONFIDENCE_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    type = models.CharField(max_length=20, choices=HistoricalDisaster.DISASTER_TYPES)
    location = models.JSONField()  # {state: str, district: str, city: str, coordinates: {lat, lon}}
    predicted_date = models.DateField()
    severity = models.CharField(max_length=10, choices=HistoricalDisaster.SEVERITY_LEVELS)
    confidence = models.CharField(max_length=10, choices=CONFIDENCE_LEVELS)
    probability = models.FloatField()  # 0.0 to 1.0
    model_used = models.CharField(max_length=20, choices=PREDICTION_MODELS)
    model_version = models.CharField(max_length=20, default='1.0')
    input_features = models.JSONField()  # Features used for prediction
    prediction_metadata = models.JSONField(default=dict)  # Additional model outputs
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-predicted_date']
        indexes = [
            models.Index(fields=['type', 'location']),
            models.Index(fields=['predicted_date', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.type} prediction for {self.location.get('city', self.location.get('district'))} on {self.predicted_date}"

class WeatherData(models.Model):
    location = models.JSONField()  # {state, district, city, coordinates}
    date = models.DateField()
    temperature_max = models.FloatField()
    temperature_min = models.FloatField()
    humidity = models.FloatField()
    rainfall = models.FloatField()
    wind_speed = models.FloatField()
    pressure = models.FloatField()
    source = models.CharField(max_length=50, default='IMD')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['location', 'date']
        indexes = [
            models.Index(fields=['location', 'date']),
        ]
    
    def __str__(self):
        return f"Weather data for {self.location.get('city', 'Unknown')} on {self.date}"

class ModelConfiguration(models.Model):
    MODEL_TYPES = [
        ('prediction', 'Prediction Model'),
        ('classification', 'Classification Model'),
        ('regression', 'Regression Model'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    model_type = models.CharField(max_length=20, choices=MODEL_TYPES)
    version = models.CharField(max_length=20)
    parameters = models.JSONField()  # Model hyperparameters
    features = models.JSONField()  # List of input features
    target_variable = models.CharField(max_length=50)
    training_data_range = models.JSONField()  # {start_date, end_date}
    accuracy_metrics = models.JSONField(default=dict)  # Training metrics
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} v{self.version}"

class PredictionRequest(models.Model):
    REQUEST_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    request_type = models.CharField(max_length=50)  # 'disaster_prediction', 'weather_forecast', etc.
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='pending')
    error_message = models.TextField(blank=True)
    processing_time = models.FloatField(null=True, blank=True)  # in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.request_type} request by {self.user.username if self.user else 'Anonymous'} on {self.created_at}"

class ExternalDataSource(models.Model):
    SOURCE_TYPES = [
        ('weather', 'Weather API'),
        ('satellite', 'Satellite Data'),
        ('seismic', 'Seismic Data'),
        ('social_media', 'Social Media'),
        ('news', 'News API'),
    ]
    
    name = models.CharField(max_length=100)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    api_endpoint = models.URLField()
    api_key = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    last_fetch = models.DateTimeField(null=True, blank=True)
    fetch_interval = models.IntegerField(default=3600)  # in seconds
    configuration = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.source_type})"

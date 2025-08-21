from django.urls import path
from . import views

urlpatterns = [
    # Core prediction endpoints
    path('predict/', views.predict_disaster, name='predict_disaster'),
    
    # LLM and advice endpoints
    path('llm-advice/', views.llm_advice, name='llm_advice'),
    
    # Weather data endpoints
    path('weather/current/', views.get_current_weather, name='get_current_weather'),
    path('weather/forecast/', views.get_weather_forecast, name='get_weather_forecast'),
    
    # Historical data endpoints
    path('historical/disasters/', views.get_historical_disasters, name='get_historical_disasters'),
    path('historical/disasters/<str:state>/', views.get_disasters_by_state, name='get_disasters_by_state'),
    
    # Analytics and insights
    path('analytics/disaster-trends/', views.get_disaster_trends, name='get_disaster_trends'),
    path('analytics/risk-assessment/', views.risk_assessment, name='risk_assessment'),
    
    # Health check and status
    path('health/', views.health_check, name='health_check'),
    path('status/', views.service_status, name='service_status'),
    
    # Live feed endpoints
    path('live-feed/start/', views.start_live_feed, name='start_live_feed'),
    path('live-feed/stop/', views.stop_live_feed, name='stop_live_feed'),
    path('live-feed/predictions/', views.get_live_predictions, name='get_live_predictions'),
] 
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
import json
import time
import random

from .models import (
    HistoricalDisaster, DisasterPrediction, WeatherData, 
    ModelConfiguration, PredictionRequest, ExternalDataSource
)

# Core prediction endpoints
@api_view(['POST'])
def predict_disaster(request):
    """Enhanced disaster prediction with multiple model support"""
    try:
        start_time = time.time()
        
        # Parse JSON data
        data = request.data
        location = data.get('location', {})
        disaster_type = data.get('disaster_type')
        model_preference = data.get('model_preference', 'ensemble')
        
        # Create prediction request record
        prediction_request = PredictionRequest.objects.create(
            request_type='disaster_prediction',
            input_data=data,
            status='processing'
        )
        
        # Placeholder prediction logic (to be replaced with actual ML models)
        predictions = []
        confidence_score = 0.0
        
        if model_preference == 'ensemble':
            # Simulate ensemble prediction
            base_probability = random.uniform(0.1, 0.8)
            confidence_score = random.uniform(0.6, 0.95)
            
            # Generate multiple predictions
            for i in range(3):
                pred_date = timezone.now().date() + timedelta(days=random.randint(1, 30))
                prediction = DisasterPrediction.objects.create(
                    type=disaster_type or random.choice(['flood', 'drought', 'earthquake']),
                    location=location,
                    predicted_date=pred_date,
                    severity=random.choice(['low', 'medium', 'high']),
                    confidence=random.choice(['low', 'medium', 'high']),
                    probability=base_probability + random.uniform(-0.2, 0.2),
                    model_used=random.choice(['lstm', 'cnn', 'random_forest']),
                    input_features={'location': location, 'model': model_preference},
                    prediction_metadata={'ensemble_weight': random.uniform(0.2, 0.8)}
                )
                predictions.append(prediction)
        else:
            # Single model prediction
            pred_date = timezone.now().date() + timedelta(days=random.randint(1, 30))
            prediction = DisasterPrediction.objects.create(
                type=disaster_type or random.choice(['flood', 'drought', 'earthquake']),
                location=location,
                predicted_date=pred_date,
                severity=random.choice(['low', 'medium', 'high']),
                confidence=random.choice(['low', 'medium', 'high']),
                probability=random.uniform(0.1, 0.9),
                model_used=model_preference,
                input_features={'location': location, 'model': model_preference},
                prediction_metadata={'single_model': True}
            )
            predictions.append(prediction)
            confidence_score = random.uniform(0.5, 0.9)
        
        processing_time = time.time() - start_time
        
        # Update prediction request
        prediction_request.status = 'completed'
        prediction_request.output_data = {
            'predictions_count': len(predictions),
            'confidence_score': confidence_score
        }
        prediction_request.processing_time = processing_time
        prediction_request.completed_at = timezone.now()
        prediction_request.save()
        
        response_data = {
            'predictions': [
                {
                    'id': pred.id,
                    'type': pred.type,
                    'location': pred.location,
                    'predicted_date': pred.predicted_date.isoformat(),
                    'severity': pred.severity,
                    'confidence': pred.confidence,
                    'probability': pred.probability,
                    'model_used': pred.model_used,
                    'created_at': pred.created_at.isoformat()
                } for pred in predictions
            ],
            'confidence_score': confidence_score,
            'model_used': model_preference,
            'processing_time': processing_time,
            'metadata': {
                'request_id': prediction_request.id,
                'timestamp': timezone.now().isoformat()
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# LLM and advice endpoints
@api_view(['POST'])
def llm_advice(request):
    """Enhanced LLM advice with more context"""
    try:
        data = request.data
        dtype = data.get('type')
        location = data.get('location')
        severity = data.get('severity', 'medium')
        
        advice_templates = {
            'flood': {
                'low': f"For low severity flooding in {location}, monitor water levels and avoid low-lying areas.",
                'medium': f"For medium severity flooding in {location}, move to higher ground and avoid driving through water.",
                'high': f"For high severity flooding in {location}, evacuate immediately to designated shelters."
            },
            'drought': {
                'low': f"For low severity drought in {location}, conserve water and monitor local restrictions.",
                'medium': f"For medium severity drought in {location}, implement water-saving measures and check for water availability.",
                'high': f"For high severity drought in {location}, follow emergency water rationing and seek alternative sources."
            },
            'earthquake': {
                'low': f"For low magnitude earthquake in {location}, stay alert for aftershocks and check for damage.",
                'medium': f"For medium magnitude earthquake in {location}, evacuate buildings and move to open areas.",
                'high': f"For high magnitude earthquake in {location}, drop, cover, and hold on. Evacuate to safe zones immediately."
            }
        }
        
        advice = advice_templates.get(dtype, {}).get(severity, f"Stay alert and follow official instructions for {dtype} in {location}.")
        
        return Response({
            'advice': advice,
            'type': dtype,
            'location': location,
            'severity': severity,
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Weather data endpoints
@api_view(['GET'])
def get_current_weather(request):
    """Get current weather for location"""
    try:
        location = request.GET.get('location', '{}')
        try:
            location_data = json.loads(location)
        except:
            location_data = {}
        
        # Simulate weather data
        weather_data = {
            'temperature': random.uniform(15, 45),
            'humidity': random.uniform(30, 90),
            'rainfall': random.uniform(0, 50),
            'wind_speed': random.uniform(0, 30),
            'pressure': random.uniform(1000, 1020),
            'location': location_data,
            'timestamp': timezone.now().isoformat()
        }
        
        return Response(weather_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_weather_forecast(request):
    """Get weather forecast"""
    try:
        location = request.GET.get('location', '{}')
        days = int(request.GET.get('days', 7))
        
        try:
            location_data = json.loads(location)
        except:
            location_data = {}
        
        forecast = []
        for i in range(days):
            forecast.append({
                'date': (timezone.now().date() + timedelta(days=i)).isoformat(),
                'temperature_max': random.uniform(20, 40),
                'temperature_min': random.uniform(10, 25),
                'humidity': random.uniform(30, 90),
                'rainfall': random.uniform(0, 30),
                'wind_speed': random.uniform(0, 25)
            })
        
        return Response({
            'location': location_data,
            'forecast': forecast,
            'days': days
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Historical data endpoints
@api_view(['GET'])
def get_historical_disasters(request):
    """Get all historical disasters"""
    try:
        disasters = HistoricalDisaster.objects.all()
        data = []
        for disaster in disasters:
            data.append({
                'id': disaster.id,
                'type': disaster.type,
                'subtype': disaster.subtype,
                'state': disaster.state,
                'district': disaster.district,
                'city': disaster.city,
                'date': disaster.date.isoformat(),
                'severity': disaster.severity,
                'casualties': disaster.casualties,
                'damage_estimate': float(disaster.damage_estimate),
                'coordinates': disaster.coordinates,
                'source': disaster.source,
                'created_at': disaster.created_at.isoformat()
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_disasters_by_state(request, state):
    """Get disasters by state"""
    try:
        disasters = HistoricalDisaster.objects.filter(state__iexact=state)
        data = []
        for disaster in disasters:
            data.append({
                'id': disaster.id,
                'type': disaster.type,
                'subtype': disaster.subtype,
                'state': disaster.state,
                'district': disaster.district,
                'city': disaster.city,
                'date': disaster.date.isoformat(),
                'severity': disaster.severity,
                'casualties': disaster.casualties,
                'damage_estimate': float(disaster.damage_estimate),
                'coordinates': disaster.coordinates,
                'source': disaster.source,
                'created_at': disaster.created_at.isoformat()
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Analytics and insights
@api_view(['GET'])
def get_disaster_trends(request):
    """Get disaster trends analysis"""
    try:
        # Simulate trend analysis
        trends = {
            'total_disasters': random.randint(100, 500),
            'trend_period': 'last_5_years',
            'most_common_type': 'flood',
            'most_affected_state': 'Maharashtra',
            'trend_direction': 'increasing',
            'seasonal_patterns': {
                'monsoon': ['flood', 'landslide'],
                'summer': ['drought', 'wildfire'],
                'winter': ['cold_wave']
            }
        }
        
        return Response(trends)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def risk_assessment(request):
    """Perform risk assessment for location"""
    try:
        data = request.data
        location = data.get('location', {})
        
        # Simulate risk assessment
        risk_score = random.uniform(0.1, 0.9)
        risk_level = 'low' if risk_score < 0.3 else 'medium' if risk_score < 0.7 else 'high'
        
        assessment = {
            'location': location,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'factors': [
                'historical_disaster_frequency',
                'geographic_vulnerability',
                'population_density',
                'infrastructure_quality'
            ],
            'recommendations': [
                'Improve early warning systems',
                'Strengthen infrastructure',
                'Enhance emergency response capacity'
            ]
        }
        
        return Response(assessment)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Health check and status
@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    try:
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0'
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def service_status(request):
    """Service status and metrics"""
    try:
        status_data = {
            'service': 'Crisis Pulse AI Service',
            'status': 'operational',
            'uptime': '99.9%',
            'active_models': ModelConfiguration.objects.filter(is_active=True).count(),
            'total_predictions': DisasterPrediction.objects.count(),
            'total_requests': PredictionRequest.objects.count(),
            'last_updated': timezone.now().isoformat()
        }
        
        return Response(status_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

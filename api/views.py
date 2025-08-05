from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import HistoricalDisaster
from .serializers import HistoricalDisasterSerializer
from django.db import models

@api_view(['POST'])
def predict_disaster(request):
    state = request.data.get('state')
    month = request.data.get('month')
    # Placeholder: Use historical data frequency for prediction
    disasters = HistoricalDisaster.objects.filter(state__iexact=state, date__month=month)
    if not disasters.exists():
        return Response({'type': None, 'likelihood': 'low', 'explanation': 'No significant historical disasters found for this state and month.'})
    most_common = disasters.values('type').annotate(count=models.Count('type')).order_by('-count').first()
    return Response({
        'type': most_common['type'],
        'likelihood': 'high' if most_common['count'] > 10 else 'medium',
        'explanation': f"Historically, {most_common['type']}s are most common in {state} during month {month}. ({most_common['count']} events)"
    })

@api_view(['POST'])
def llm_advice(request):
    dtype = request.data.get('type')
    location = request.data.get('location')
    severity = request.data.get('severity', 'medium')
    advice = f"For a {severity} {dtype} in {location}, stay alert and follow official instructions."
    if dtype == 'flood':
        advice += " Move to higher ground if necessary."
    if dtype == 'drought':
        advice += " Conserve water and stay hydrated."
    return Response({'advice': advice}) 
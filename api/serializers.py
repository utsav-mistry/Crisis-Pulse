from rest_framework import serializers
from .models import HistoricalDisaster

class HistoricalDisasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalDisaster
        fields = '__all__' 
from django.db import models

class HistoricalDisaster(models.Model):
    DISASTER_TYPES = [
        ('flood', 'Flood'),
        ('drought', 'Drought'),
        ('cyclone', 'Cyclone'),
        ('earthquake', 'Earthquake'),
        # Add more as needed
    ]
    type = models.CharField(max_length=20, choices=DISASTER_TYPES)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50, blank=True, null=True)
    date = models.DateField()
    severity = models.CharField(max_length=10, choices=[('low','Low'),('medium','Medium'),('high','High')], default='medium')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.type} in {self.state} on {self.date}" 
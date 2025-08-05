from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict_disaster, name='predict_disaster'),
    path('llm-advice/', views.llm_advice, name='llm_advice'),
] 
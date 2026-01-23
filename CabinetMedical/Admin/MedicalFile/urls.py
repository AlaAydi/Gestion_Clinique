from django.urls import path
from .views import *

from .views import (
    DossierMedicalListCreateView,
    DossierMedicalDetailView,
    PatientHistoriqueMedicalView
)

urlpatterns = [
 
    

    # Dossiers Médicaux
    path('dossiers/', DossierMedicalListCreateView.as_view(), name='dossier-list'),
    path('dossiers/<int:pk>/', DossierMedicalDetailView.as_view(), name='dossier-detail'),
    path('patients/<int:patient_id>/historique/', PatientHistoriqueMedicalView.as_view(), name='patient-historique'),
    
  
]

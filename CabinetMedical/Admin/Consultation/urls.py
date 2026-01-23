from django.urls import path
from .views import *
from .views import (
    ConsultationListCreateView,
    ConsultationDetailView,
    ConsultationsByDateView,
    ConsultationsByPatientView,
    ConsultationsByDoctorView
)


urlpatterns = [
    # Consultations / Rendez-vous
    path('', ConsultationListCreateView.as_view(), name='consultation-list'),
    path('<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('date/<str:date>/', ConsultationsByDateView.as_view(), name='consultations-by-date'),
    path('patient/<int:patient_id>/', ConsultationsByPatientView.as_view(), name='consultations-by-patient'),
    path('doctor/<int:doctor_id>/', ConsultationsByDoctorView.as_view(), name='consultations-by-doctor'),
    
    
]

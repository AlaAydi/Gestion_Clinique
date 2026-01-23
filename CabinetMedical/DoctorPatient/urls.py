from django.urls import path
from .views import (
    # Patients
    DoctorPatientsListView,
    DoctorPatientDetailView,
    # Consultations
    DoctorConsultationsListView,
    DoctorConsultationDetailView,
    # Dossiers médicaux
    DoctorDossierMedicalListView,
    DoctorDossierMedicalDetailView,
    # Réclamations
    DoctorReclamationListView,
    DoctorReclamationDetailView,
    # Messages
    DoctorMessageListView,
    DoctorMessageDetailView,
)



urlpatterns = [
    # ========== ENDPOINTS POUR LES DOCTEURS ==========
    
    # Patients du docteur
    path('doctor/patients/', DoctorPatientsListView.as_view(), name='doctor-patients-list'),
    path('doctor/patients/<int:patient_id>/', DoctorPatientDetailView.as_view(), name='doctor-patient-detail'),
    
    # Consultations du docteur
    path('doctor/consultations/', DoctorConsultationsListView.as_view(), name='doctor-consultations-list'),
    path('doctor/consultations/<int:consultation_id>/', DoctorConsultationDetailView.as_view(), name='doctor-consultation-detail'),
    
    # Dossiers médicaux
    path('doctor/dossiers/', DoctorDossierMedicalListView.as_view(), name='doctor-dossiers-list'),
    path('doctor/dossiers/<int:dossier_id>/', DoctorDossierMedicalDetailView.as_view(), name='doctor-dossier-detail'),
    
    # Réclamations
    path('doctor/reclamations/', DoctorReclamationListView.as_view(), name='doctor-reclamations-list'),
    path('doctor/reclamations/<int:reclamation_id>/', DoctorReclamationDetailView.as_view(), name='doctor-reclamation-detail'),
    
    # Messages
    path('doctor/messages/', DoctorMessageListView.as_view(), name='doctor-messages-list'),
    path('doctor/messages/<int:message_id>/', DoctorMessageDetailView.as_view(), name='doctor-message-detail'),
    
]

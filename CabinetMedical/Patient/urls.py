from django.urls import path
from .views import (
    # Consultations
    PatientConsultationsListView,
    PatientConsultationDetailView,
    # Rendez-vous
    DoctorsAvailableListView,
    PatientPrendreRendezVousView,
    PatientAnnulerRendezVousView,
    # Dossiers médicaux
    PatientDossiersListView,
    PatientDossierDetailView,
    PatientDeposerDossierView,
    # Réclamations
    PatientReclamationsListView,
    PatientReclamationDetailView,
    # Messages
    PatientMessagesListView,
    PatientEnvoyerMessageView,
    PatientMessageDetailView, PatientCreateReclamationView,
)

urlpatterns = [
    # ========== CONSULTATIONS / RENDEZ-VOUS ==========
    
    # Liste des consultations du patient
    path('consultations/', PatientConsultationsListView.as_view(), name='patient-consultations-list'),
    path('consultations/<int:consultation_id>/', PatientConsultationDetailView.as_view(), name='patient-consultation-detail'),
    
    # Prendre et annuler rendez-vous
    path('doctors/', DoctorsAvailableListView.as_view(), name='patient-doctors-list'),
    path('rendez-vous/', PatientPrendreRendezVousView.as_view(), name='patient-prendre-rdv'),
    path('rendez-vous/<int:consultation_id>/annuler/', PatientAnnulerRendezVousView.as_view(), name='patient-annuler-rdv'),
    
    # ========== DOSSIERS MÉDICAUX ==========
    
    # Consulter et déposer dossiers médicaux
    path('dossiers/', PatientDossiersListView.as_view(), name='patient-dossiers-list'),
    path('dossiers/<int:dossier_id>/', PatientDossierDetailView.as_view(), name='patient-dossier-detail'),
    path('dossiers/deposer/', PatientDeposerDossierView.as_view(), name='patient-deposer-dossier'),
    
    # ========== RÉCLAMATIONS ==========
    
    # Réclamations reçues
    path('reclamations/', PatientReclamationsListView.as_view(), name='patient-reclamations-list'),
    path('reclamations/create/', PatientCreateReclamationView.as_view(), name='patient-create-reclamation'),
    path('reclamations/<int:reclamation_id>/', PatientReclamationDetailView.as_view(),
         name='patient-reclamation-detail'),
    # ========== MESSAGES ==========
    
    # Messages
    path('messages/', PatientMessagesListView.as_view(), name='patient-messages-list'),
    path('messages/envoyer/', PatientEnvoyerMessageView.as_view(), name='patient-envoyer-message'),
    path('messages/<int:message_id>/', PatientMessageDetailView.as_view(), name='patient-message-detail'),
]

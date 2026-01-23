from rest_framework import serializers
from users.models import Patient, Doctor, Consultation, DossierMedical
from .models import Reclamation, Message


class DoctorPatientSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des patients d'un docteur"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'username', 'email', 'nom', 'prenom', 'age',
            'address', 'telephone', 'antecedents', 'status', 'medical_file'
        ]
        read_only_fields = ['id', 'username', 'email']


class DoctorPatientUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier les informations d'un patient"""
    class Meta:
        model = Patient
        fields = ['nom', 'prenom', 'age', 'address', 'telephone', 'antecedents', 'status']


class DoctorDossierMedicalSerializer(serializers.ModelSerializer):
    """Serializer pour les dossiers médicaux"""
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    
    class Meta:
        model = DossierMedical
        fields = [
            'id', 'patient', 'patient_nom', 'patient_prenom',
            'observations', 'traitement', 'fichier',
            'date_derniere_visite', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_derniere_visite', 'created_at', 'updated_at']


class DoctorConsultationSerializer(serializers.ModelSerializer):
    """Serializer pour les consultations d'un docteur"""
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    patient_email = serializers.EmailField(source='patient.user.email', read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient', 'patient_nom', 'patient_prenom', 'patient_email',
            'start_time', 'end_time', 'motif'
        ]
        read_only_fields = ['id', 'end_time']


class ReclamationSerializer(serializers.ModelSerializer):
    """Serializer pour les réclamations"""
    doctor_nom = serializers.CharField(source='doctor.nom', read_only=True)
    doctor_prenom = serializers.CharField(source='doctor.prenom', read_only=True)
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    
    class Meta:
        model = Reclamation
        fields = [
            'id', 'doctor', 'doctor_nom', 'doctor_prenom',
            'patient', 'patient_nom', 'patient_prenom',
            'sujet', 'message', 'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReclamationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une réclamation"""
    class Meta:
        model = Reclamation
        fields = ['patient', 'sujet', 'message']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages"""
    expediteur_type = serializers.SerializerMethodField()
    expediteur_nom = serializers.SerializerMethodField()
    destinataire_type = serializers.SerializerMethodField()
    destinataire_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'expediteur_type', 'expediteur_nom',
            'destinataire_type', 'destinataire_nom',
            'contenu', 'lu', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_expediteur_type(self, obj):
        if obj.expediteur_doctor:
            return 'doctor'
        return 'patient'
    
    def get_expediteur_nom(self, obj):
        if obj.expediteur_doctor:
            return f"Dr. {obj.expediteur_doctor.nom} {obj.expediteur_doctor.prenom}"
        if obj.expediteur_patient:
            return f"{obj.expediteur_patient.nom} {obj.expediteur_patient.prenom}"
        return "Inconnu"
    
    def get_destinataire_type(self, obj):
        if obj.destinataire_doctor:
            return 'doctor'
        return 'patient'
    
    def get_destinataire_nom(self, obj):
        if obj.destinataire_doctor:
            return f"Dr. {obj.destinataire_doctor.nom} {obj.destinataire_doctor.prenom}"
        if obj.destinataire_patient:
            return f"{obj.destinataire_patient.nom} {obj.destinataire_patient.prenom}"
        return "Inconnu"


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un message"""
    class Meta:
        model = Message
        fields = ['destinataire_patient', 'contenu']

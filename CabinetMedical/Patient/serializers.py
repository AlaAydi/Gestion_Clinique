from rest_framework import serializers
from users.models import Consultation, DossierMedical, Patient, Doctor
from DoctorPatient.models import Reclamation, Message


class PatientConsultationSerializer(serializers.ModelSerializer):
    """Serializer pour les consultations du patient"""
    doctor_nom = serializers.CharField(source='doctor.nom', read_only=True)
    doctor_prenom = serializers.CharField(source='doctor.prenom', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty', read_only=True)
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'doctor', 'doctor_nom', 'doctor_prenom', 'doctor_specialty',
            'start_time', 'end_time', 'motif'
        ]
        read_only_fields = ['id', 'end_time']


class PatientConsultationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un rendez-vous"""
    class Meta:
        model = Consultation
        fields = ['doctor', 'start_time', 'motif']
    
    def validate_start_time(self, value):
        """Valider que la date est dans le futur"""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError("La date doit être dans le futur")
        return value


class PatientDossierMedicalSerializer(serializers.ModelSerializer):
    """Serializer pour les dossiers médicaux du patient"""
    doctor_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = DossierMedical
        fields = [
            'id', 'doctor_nom', 'observations', 'traitement', 
            'fichier', 'date_derniere_visite', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_derniere_visite', 'created_at', 'updated_at']
    
    def get_doctor_nom(self, obj):
        # Récupérer le docteur via les consultations
        consultation = Consultation.objects.filter(patient=obj.patient).first()
        if consultation:
            return f"Dr. {consultation.doctor.nom} {consultation.doctor.prenom}"
        return "N/A"


class PatientDossierDeposeSerializer(serializers.ModelSerializer):
    """Serializer pour déposer un nouveau dossier médical"""
    class Meta:
        model = DossierMedical
        fields = ['observations', 'traitement', 'fichier']


class PatientReclamationSerializer(serializers.ModelSerializer):
    doctor_nom = serializers.CharField(source='doctor.nom', read_only=True)
    doctor_prenom = serializers.CharField(source='doctor.prenom', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty', read_only=True)

    class Meta:
        model = Reclamation
        fields = [
            'id', 'doctor', 'doctor_nom', 'doctor_prenom', 'doctor_specialty',
            'sujet', 'message', 'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientReclamationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reclamation
        fields = ['doctor', 'sujet', 'message']


class PatientMessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages du patient"""
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
        return 'doctor' if obj.expediteur_doctor else 'patient'
    
    def get_expediteur_nom(self, obj):
        if obj.expediteur_doctor:
            return f"Dr. {obj.expediteur_doctor.nom} {obj.expediteur_doctor.prenom}"
        if obj.expediteur_patient:
            return f"{obj.expediteur_patient.nom} {obj.expediteur_patient.prenom}"
        return "Inconnu"
    
    def get_destinataire_type(self, obj):
        return 'doctor' if obj.destinataire_doctor else 'patient'
    
    def get_destinataire_nom(self, obj):
        if obj.destinataire_doctor:
            return f"Dr. {obj.destinataire_doctor.nom} {obj.destinataire_doctor.prenom}"
        if obj.destinataire_patient:
            return f"{obj.destinataire_patient.nom} {obj.destinataire_patient.prenom}"
        return "Inconnu"


class PatientMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer pour envoyer un message à un docteur"""
    class Meta:
        model = Message
        fields = ['destinataire_doctor', 'contenu']


class DoctorListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des docteurs disponibles"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'username', 'nom', 'prenom', 'specialty', 'phone', 'schedule', 'image']

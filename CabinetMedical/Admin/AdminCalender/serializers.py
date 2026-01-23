from rest_framework import serializers
from users.models import Consultation, Doctor, Patient


class CalendarConsultationSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(source='doctor.id', read_only=True)
    doctor_nom = serializers.SerializerMethodField()
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    patient_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Consultation
        fields = [
            'id',
            'doctor',
            'doctor_id',
            'doctor_nom',
            'patient',
            'patient_id',
            'patient_nom',
            'start_time',
            'end_time',
            'motif'
        ]
        read_only_fields = ['end_time']
    
    def get_doctor_nom(self, obj):
        return f"Dr. {obj.doctor.prenom} {obj.doctor.nom}" if obj.doctor else ""
    
    def get_patient_nom(self, obj):
        return f"{obj.patient.prenom} {obj.patient.nom}" if obj.patient else ""


class CalendarDoctorSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des médecins dans le calendrier"""
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = ['id', 'nom', 'prenom', 'nom_complet', 'specialty', 'schedule']
    
    def get_nom_complet(self, obj):
        return f"Dr. {obj.prenom} {obj.nom}"


class CalendarPatientSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des patients dans le calendrier"""
    nom_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'nom', 'prenom', 'nom_complet']
    
    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}"

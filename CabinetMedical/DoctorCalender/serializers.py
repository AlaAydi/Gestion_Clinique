from rest_framework import serializers
from users.models import Consultation, Doctor, Patient


class CalendarConsultationSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les consultations dans le calendrier"""
    patient_name = serializers.SerializerMethodField()
    patient_id = serializers.IntegerField(source='patient.id', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    doctor_id = serializers.IntegerField(source='doctor.id', read_only=True)
    date = serializers.SerializerMethodField()
    
    class Meta:
        model = Consultation
        fields = [
            'id',
            'doctor_id',
            'doctor_name',
            'patient_id',
            'patient_name',
            'start_time',
            'end_time',
            'date',
            'motif'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.nom} {obj.patient.prenom}" if obj.patient.nom else obj.patient.user.username
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.nom} {obj.doctor.prenom}" if obj.doctor.nom else obj.doctor.user.username
    
    def get_date(self, obj):
        return obj.start_time.date()


class DoctorCalendarSerializer(serializers.Serializer):
    """Serializer pour les paramètres de filtre du calendrier"""
    year = serializers.IntegerField(required=False)
    month = serializers.IntegerField(required=False, min_value=1, max_value=12)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

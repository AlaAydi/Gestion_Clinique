from rest_framework import serializers
from users.models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    patient_name = serializers.CharField(source='patient.user.username', read_only=True)

    class Meta:
        model = Consultation
        fields = [
            'id',
            'doctor',
            'doctor_name',
            'patient',
            'patient_name',
            'start_time',
            'end_time',
            'motif'
        ]
        read_only_fields = ['end_time']

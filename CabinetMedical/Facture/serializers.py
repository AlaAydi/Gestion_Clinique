from rest_framework import serializers
from .models import Facture
from users.models import Patient
from datetime import datetime


class FactureSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_email = serializers.EmailField(source='patient.user.email', read_only=True)
    consultation_date = serializers.DateTimeField(source='consultation.start_time', read_only=True, allow_null=True)
    
    class Meta:
        model = Facture
        fields = [
            'id',
            'numero_facture',
            'patient',
            'patient_name',
            'patient_email',
            'consultation',
            'consultation_date',
            'montant',
            'description',
            'statut',
            'methode_paiement',
            'date_creation',
            'date_paiement',
            'notes'
        ]
        read_only_fields = ['numero_facture', 'date_creation']
    
    def get_patient_name(self, obj):
        return f"{obj.patient.nom} {obj.patient.prenom}" if obj.patient.nom else obj.patient.user.username


class FactureCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = [
            'patient',
            'consultation',
            'montant',
            'description',
            'statut',
            'methode_paiement',
            'notes'
        ]
    
    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0")
        return value


class FacturePaymentSerializer(serializers.Serializer):
    methode_paiement = serializers.ChoiceField(
        choices=Facture.PAYMENT_METHOD_CHOICES,
        required=True
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        if not attrs.get('methode_paiement'):
            raise serializers.ValidationError("La méthode de paiement est requise")
        return attrs


class PatientFactureSerializer(serializers.ModelSerializer):
    """Serializer pour les factures côté patient (lecture seule)"""
    consultation_date = serializers.DateTimeField(source='consultation.start_time', read_only=True, allow_null=True)
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Facture
        fields = [
            'id',
            'numero_facture',
            'consultation',
            'consultation_date',
            'doctor_name',
            'montant',
            'description',
            'statut',
            'methode_paiement',
            'date_creation',
            'date_paiement'
        ]
    
    def get_doctor_name(self, obj):
        if obj.consultation and obj.consultation.doctor:
            doctor = obj.consultation.doctor
            return f"Dr. {doctor.nom} {doctor.prenom}" if doctor.nom else doctor.user.username
        return None

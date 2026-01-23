from rest_framework import serializers
from users.models import DossierMedical


class DossierMedicalSerializer(serializers.ModelSerializer):
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)

    class Meta:
        model = DossierMedical
        fields = [
            'id',
            'patient',
            'patient_nom',
            'patient_prenom',
            'observations',
            'traitement',
            'fichier',
            'date_derniere_visite',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['date_derniere_visite', 'created_at', 'updated_at']


class DossierMedicalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierMedical
        fields = ['patient', 'observations', 'traitement', 'fichier']
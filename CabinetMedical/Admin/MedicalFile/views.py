from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count

from users.models import DossierMedical, Patient
from .serializers import DossierMedicalSerializer, DossierMedicalCreateSerializer
from users.permissions import IsAdminOrDoctor


class DossierMedicalListCreateView(generics.ListCreateAPIView):
    """Liste et crée des dossiers médicaux"""
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get_queryset(self):
        qs = DossierMedical.objects.select_related('patient__user').all()
        
        # Filtrer par patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        
        return qs.order_by('-date_derniere_visite')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DossierMedicalCreateSerializer
        return DossierMedicalSerializer


class DossierMedicalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détails, modification et suppression d'un dossier médical"""
    queryset = DossierMedical.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return DossierMedicalCreateSerializer
        return DossierMedicalSerializer


class PatientHistoriqueMedicalView(APIView):
    """Afficher l'historique médical complet d'un patient"""
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get(self, request, patient_id):
        try:
            patient = Patient.objects.select_related('user').get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient non trouvé'}, status=404)
        
        dossiers = DossierMedical.objects.filter(
            patient_id=patient_id
        ).order_by('-date_derniere_visite')
        
        serializer = DossierMedicalSerializer(dossiers, many=True)
        
        return Response({
            'patient': {
                'id': patient.id,
                'nom': patient.nom,
                'prenom': patient.prenom,
                'age': patient.age,
                'antecedents': patient.antecedents
            },
            'historique': serializer.data
        })

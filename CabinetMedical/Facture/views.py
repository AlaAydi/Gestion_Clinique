from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from datetime import datetime
from .models import Facture
from .serializers import (
    FactureSerializer,
    FactureCreateSerializer,
    FacturePaymentSerializer,
    PatientFactureSerializer
)
from users.models import Patient
from users.permissions import IsAdminRole


class FactureListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste toutes les factures (Admin)
    POST: Créer une nouvelle facture (Admin)
    
    Query Parameters:
    - patient_id: Filtrer par patient
    - statut: Filtrer par statut (PAYEE, EN_ATTENTE, ANNULEE)
    - date_debut: Date de début (YYYY-MM-DD)
    - date_fin: Date de fin (YYYY-MM-DD)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FactureCreateSerializer
        return FactureSerializer
    
    def get_queryset(self):
        queryset = Facture.objects.select_related(
            'patient', 'patient__user', 'consultation', 'consultation__doctor'
        ).all()
        
        # Filtres
        patient_id = self.request.query_params.get('patient_id')
        statut = self.request.query_params.get('statut')
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        if statut:
            queryset = queryset.filter(statut=statut)
        
        if date_debut:
            try:
                date_debut_obj = datetime.strptime(date_debut, '%Y-%m-%d')
                queryset = queryset.filter(date_creation__gte=date_debut_obj)
            except ValueError:
                pass
        
        if date_fin:
            try:
                date_fin_obj = datetime.strptime(date_fin, '%Y-%m-%d')
                queryset = queryset.filter(date_creation__lte=date_fin_obj)
            except ValueError:
                pass
        
        return queryset


class FactureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupérer une facture
    PATCH/PUT: Modifier une facture
    DELETE: Supprimer une facture
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer


class FacturePaymentView(APIView):
    """
    POST: Marquer une facture comme payée
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def post(self, request, pk):
        try:
            facture = Facture.objects.get(pk=pk)
        except Facture.DoesNotExist:
            return Response(
                {'error': 'Facture non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if facture.statut == 'PAYEE':
            return Response(
                {'error': 'Cette facture est déjà payée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FacturePaymentSerializer(data=request.data)
        if serializer.is_valid():
            facture.statut = 'PAYEE'
            facture.methode_paiement = serializer.validated_data['methode_paiement']
            facture.date_paiement = datetime.now()
            if serializer.validated_data.get('notes'):
                facture.notes = serializer.validated_data['notes']
            facture.save()
            
            return Response(
                FactureSerializer(facture).data,
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientFacturesListView(generics.ListAPIView):
    """
    GET: Liste des factures du patient connecté
    
    Query Parameters:
    - statut: Filtrer par statut
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PatientFactureSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'PATIENT':
            return Facture.objects.none()
        
        try:
            patient = Patient.objects.get(user=self.request.user)
        except Patient.DoesNotExist:
            return Facture.objects.none()
        
        queryset = Facture.objects.filter(patient=patient).select_related(
            'consultation', 'consultation__doctor', 'consultation__doctor__user'
        )
        
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset


class PatientFactureDetailView(generics.RetrieveAPIView):
    """
    GET: Détails d'une facture du patient
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PatientFactureSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'PATIENT':
            return Facture.objects.none()
        
        try:
            patient = Patient.objects.get(user=self.request.user)
        except Patient.DoesNotExist:
            return Facture.objects.none()
        
        return Facture.objects.filter(patient=patient)


class FactureStatsView(APIView):
    """
    GET: Statistiques des factures (Admin)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        total_factures = Facture.objects.count()
        factures_payees = Facture.objects.filter(statut='PAYEE').count()
        factures_en_attente = Facture.objects.filter(statut='EN_ATTENTE').count()
        factures_annulees = Facture.objects.filter(statut='ANNULEE').count()
        
        montant_total = Facture.objects.aggregate(Sum('montant'))['montant__sum'] or 0
        montant_paye = Facture.objects.filter(statut='PAYEE').aggregate(Sum('montant'))['montant__sum'] or 0
        montant_en_attente = Facture.objects.filter(statut='EN_ATTENTE').aggregate(Sum('montant'))['montant__sum'] or 0
        
        return Response({
            'factures_count': {
                'total': total_factures,
                'payees': factures_payees,
                'en_attente': factures_en_attente,
                'annulees': factures_annulees
            },
            'montants': {
                'total': float(montant_total),
                'paye': float(montant_paye),
                'en_attente': float(montant_en_attente)
            }
        }, status=status.HTTP_200_OK)

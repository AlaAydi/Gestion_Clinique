from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils.dateparse import parse_date

from users.models import Patient, Doctor, Consultation, DossierMedical
from users.permissions import IsDoctorRole
from .models import Reclamation, Message
from .serializers import (
    DoctorPatientSerializer,
    DoctorPatientUpdateSerializer,
    DoctorDossierMedicalSerializer,
    DoctorConsultationSerializer,
    ReclamationSerializer,
    ReclamationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer
)


# ============ VUES POUR LES PATIENTS DU DOCTOR ============

class DoctorPatientsListView(APIView):
    """Liste des patients qui ont eu des consultations avec ce docteur"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        # Récupérer tous les patients qui ont eu une consultation avec ce docteur
        patient_ids = Consultation.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
        patients = Patient.objects.filter(id__in=patient_ids).select_related('user')
        
        # Filtres optionnels
        q = request.query_params.get('q')
        status_filter = request.query_params.get('status')
        
        if status_filter:
            patients = patients.filter(status__iexact=status_filter)
        
        if q:
            patients = patients.filter(
                Q(nom__icontains=q) |
                Q(prenom__icontains=q) |
                Q(user__email__icontains=q) |
                Q(user__username__icontains=q)
            )
        
        serializer = DoctorPatientSerializer(patients, many=True)
        return Response(serializer.data)


class DoctorPatientDetailView(APIView):
    """Détails et modification d'un patient"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request, patient_id):
        try:
            doctor = Doctor.objects.get(user=request.user)
            patient = Patient.objects.select_related('user').get(id=patient_id)
            
            # Vérifier que ce patient a bien eu une consultation avec ce docteur
            if not Consultation.objects.filter(doctor=doctor, patient=patient).exists():
                return Response({'error': 'Ce patient n\'est pas dans votre liste'}, status=403)
            
            serializer = DoctorPatientSerializer(patient)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient introuvable'}, status=404)
    
    def patch(self, request, patient_id):
        """Modifier les informations d'un patient"""
        try:
            doctor = Doctor.objects.get(user=request.user)
            patient = Patient.objects.get(id=patient_id)
            
            # Vérifier que ce patient a bien eu une consultation avec ce docteur
            if not Consultation.objects.filter(doctor=doctor, patient=patient).exists():
                return Response({'error': 'Ce patient n\'est pas dans votre liste'}, status=403)
            
            serializer = DoctorPatientUpdateSerializer(patient, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(DoctorPatientSerializer(patient).data)
            return Response(serializer.errors, status=400)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient introuvable'}, status=404)


# ============ VUES POUR LES CONSULTATIONS DU DOCTOR ============

class DoctorConsultationsListView(APIView):
    """Liste des consultations d'un docteur avec filtres"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        consultations = Consultation.objects.filter(doctor=doctor).select_related('patient__user')
        
        # Filtres
        patient_id = request.query_params.get('patient_id')
        date = request.query_params.get('date')
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        motif = request.query_params.get('motif')
        
        if patient_id:
            consultations = consultations.filter(patient_id=patient_id)
        
        if date:
            parsed_date = parse_date(date)
            if parsed_date:
                consultations = consultations.filter(start_time__date=parsed_date)
        
        if date_debut:
            parsed_debut = parse_date(date_debut)
            if parsed_debut:
                consultations = consultations.filter(start_time__date__gte=parsed_debut)
        
        if date_fin:
            parsed_fin = parse_date(date_fin)
            if parsed_fin:
                consultations = consultations.filter(start_time__date__lte=parsed_fin)
        
        if motif:
            consultations = consultations.filter(motif__icontains=motif)
        
        consultations = consultations.order_by('-start_time')
        serializer = DoctorConsultationSerializer(consultations, many=True)
        return Response(serializer.data)


class DoctorConsultationDetailView(APIView):
    """Détails d'une consultation"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request, consultation_id):
        try:
            doctor = Doctor.objects.get(user=request.user)
            consultation = Consultation.objects.select_related('patient__user').get(
                id=consultation_id,
                doctor=doctor
            )
            serializer = DoctorConsultationSerializer(consultation)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Consultation.DoesNotExist:
            return Response({'error': 'Consultation introuvable'}, status=404)


# ============ VUES POUR LES DOSSIERS MÉDICAUX ============

class DoctorDossierMedicalListView(APIView):
    """Liste et création de dossiers médicaux pour les patients du docteur"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        # Patients ayant eu des consultations avec ce docteur
        patient_ids = Consultation.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
        
        dossiers = DossierMedical.objects.filter(patient_id__in=patient_ids).select_related('patient')
        
        # Filtre par patient
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            dossiers = dossiers.filter(patient_id=patient_id)
        
        serializer = DoctorDossierMedicalSerializer(dossiers, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Créer un dossier médical pour un patient"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        patient_id = request.data.get('patient')
        
        # Vérifier que ce patient a eu une consultation avec ce docteur
        if not Consultation.objects.filter(doctor=doctor, patient_id=patient_id).exists():
            return Response({'error': 'Ce patient n\'est pas dans votre liste'}, status=403)
        
        serializer = DoctorDossierMedicalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DoctorDossierMedicalDetailView(APIView):
    """Détails et modification d'un dossier médical"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request, dossier_id):
        try:
            doctor = Doctor.objects.get(user=request.user)
            dossier = DossierMedical.objects.select_related('patient').get(id=dossier_id)
            
            # Vérifier que le patient a une consultation avec ce docteur
            if not Consultation.objects.filter(doctor=doctor, patient=dossier.patient).exists():
                return Response({'error': 'Accès non autorisé'}, status=403)
            
            serializer = DoctorDossierMedicalSerializer(dossier)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except DossierMedical.DoesNotExist:
            return Response({'error': 'Dossier médical introuvable'}, status=404)
    
    def patch(self, request, dossier_id):
        """Modifier un dossier médical"""
        try:
            doctor = Doctor.objects.get(user=request.user)
            dossier = DossierMedical.objects.get(id=dossier_id)
            
            # Vérifier que le patient a une consultation avec ce docteur
            if not Consultation.objects.filter(doctor=doctor, patient=dossier.patient).exists():
                return Response({'error': 'Accès non autorisé'}, status=403)
            
            serializer = DoctorDossierMedicalSerializer(dossier, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except DossierMedical.DoesNotExist:
            return Response({'error': 'Dossier médical introuvable'}, status=404)


# ============ VUES POUR LES RÉCLAMATIONS ============

class DoctorReclamationListView(APIView):
    """Liste et création de réclamations"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        reclamations = Reclamation.objects.filter(doctor=doctor).select_related('patient')
        
        # Filtre par statut
        statut = request.query_params.get('statut')
        if statut:
            reclamations = reclamations.filter(statut=statut)
        
        # Filtre par patient
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            reclamations = reclamations.filter(patient_id=patient_id)
        
        serializer = ReclamationSerializer(reclamations, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Créer une réclamation"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        patient_id = request.data.get('patient')
        
        # Vérifier que ce patient a une consultation avec ce docteur
        if not Consultation.objects.filter(doctor=doctor, patient_id=patient_id).exists():
            return Response({'error': 'Ce patient n\'est pas dans votre liste'}, status=403)
        
        serializer = ReclamationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(doctor=doctor)
            return Response(ReclamationSerializer(serializer.instance).data, status=201)
        return Response(serializer.errors, status=400)


class DoctorReclamationDetailView(APIView):
    """Détails et modification d'une réclamation"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request, reclamation_id):
        try:
            doctor = Doctor.objects.get(user=request.user)
            reclamation = Reclamation.objects.select_related('patient').get(
                id=reclamation_id,
                doctor=doctor
            )
            serializer = ReclamationSerializer(reclamation)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Reclamation.DoesNotExist:
            return Response({'error': 'Réclamation introuvable'}, status=404)
    
    def patch(self, request, reclamation_id):
        """Modifier le statut d'une réclamation"""
        try:
            doctor = Doctor.objects.get(user=request.user)
            reclamation = Reclamation.objects.get(id=reclamation_id, doctor=doctor)
            
            serializer = ReclamationSerializer(reclamation, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Reclamation.DoesNotExist:
            return Response({'error': 'Réclamation introuvable'}, status=404)


# ============ VUES POUR LES MESSAGES ============

class DoctorMessageListView(APIView):
    """Liste et envoi de messages"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        # Messages envoyés et reçus
        messages = Message.objects.filter(
            Q(expediteur_doctor=doctor) | Q(destinataire_doctor=doctor)
        ).select_related(
            'expediteur_doctor', 'expediteur_patient',
            'destinataire_doctor', 'destinataire_patient'
        )
        
        # Filtre par type (envoyés ou reçus)
        type_msg = request.query_params.get('type')
        if type_msg == 'envoyes':
            messages = messages.filter(expediteur_doctor=doctor)
        elif type_msg == 'recus':
            messages = messages.filter(destinataire_doctor=doctor)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Envoyer un message à un patient"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        
        patient_id = request.data.get('destinataire_patient')
        
        # Vérifier que ce patient a une consultation avec ce docteur
        if not Consultation.objects.filter(doctor=doctor, patient_id=patient_id).exists():
            return Response({'error': 'Ce patient n\'est pas dans votre liste'}, status=403)
        
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(expediteur_doctor=doctor)
            return Response(MessageSerializer(serializer.instance).data, status=201)
        return Response(serializer.errors, status=400)


class DoctorMessageDetailView(APIView):
    """Détails d'un message et marquer comme lu"""
    permission_classes = [IsAuthenticated, IsDoctorRole]
    
    def get(self, request, message_id):
        try:
            doctor = Doctor.objects.get(user=request.user)
            message = Message.objects.select_related(
                'expediteur_doctor', 'expediteur_patient',
                'destinataire_doctor', 'destinataire_patient'
            ).get(
                Q(id=message_id),
                Q(expediteur_doctor=doctor) | Q(destinataire_doctor=doctor)
            )
            
            # Marquer comme lu si le docteur est le destinataire
            if message.destinataire_doctor == doctor and not message.lu:
                message.lu = True
                message.save()
            
            serializer = MessageSerializer(message)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'error': 'Profil docteur introuvable'}, status=404)
        except Message.DoesNotExist:
            return Response({'error': 'Message introuvable'}, status=404)

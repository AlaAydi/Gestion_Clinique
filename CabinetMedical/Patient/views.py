from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, timedelta
import re

from users.models import Patient, Doctor, Consultation, DossierMedical
from DoctorPatient.models import Reclamation, Message
from .serializers import (
    PatientConsultationSerializer,
    PatientConsultationCreateSerializer,
    PatientDossierMedicalSerializer,
    PatientDossierDeposeSerializer,
    PatientReclamationSerializer,
    PatientMessageSerializer,
    PatientMessageCreateSerializer,
    DoctorListSerializer, PatientReclamationCreateSerializer
)


# ============ FONCTIONS UTILITAIRES POUR VALIDATION SCHEDULE ============
# ============ UTILS SCHEDULE (CORRIGÉES) ============

def parse_schedule(schedule_str):
    """
    Exemple accepté :
    "Lun - Ven | 08:00 - 16:00"
    """
    if not schedule_str:
        return None

    try:
        # Nettoyage
        schedule_str = schedule_str.lower()
        schedule_str = schedule_str.replace('|', '')
        schedule_str = schedule_str.replace(' ', '')

        # lun-ven08:00-16:00
        day_part, time_part = schedule_str.split('08')[0], schedule_str.split('08')[1]
        day_part = day_part.replace('-', '-')
        time_part = '08' + time_part

        fr_days = {
            'lun': 0, 'mar': 1, 'mer': 2,
            'jeu': 3, 'ven': 4, 'sam': 5, 'dim': 6
        }

        d1, d2 = day_part.split('-')
        start_day = fr_days[d1[:3]]
        end_day = fr_days[d2[:3]]

        days = set(range(start_day, end_day + 1))

        t1, t2 = time_part.split('-')
        start_time = datetime.strptime(t1, "%H:%M").time()
        end_time = datetime.strptime(t2, "%H:%M").time()

        return days, start_time, end_time

    except Exception as e:
        print("Erreur parsing schedule:", e)
        return None


def is_within_schedule(start_dt, end_dt, schedule):
    parsed = parse_schedule(schedule)
    if not parsed:
        return True

    days, t_start, t_end = parsed

    start_local = timezone.localtime(start_dt)
    end_local = timezone.localtime(end_dt)

    if start_local.weekday() not in days:
        return False

    if start_local.time() < t_start or end_local.time() > t_end:
        return False

    return True




# ============ VUES POUR LES CONSULTATIONS DU PATIENT ============

class PatientConsultationsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient = Patient.objects.get(user=request.user)
        consultations = Consultation.objects.filter(patient=patient)
        serializer = PatientConsultationSerializer(consultations, many=True)
        return Response(serializer.data)



class PatientConsultationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, consultation_id):
        patient = Patient.objects.get(user=request.user)
        consultation = Consultation.objects.get(id=consultation_id, patient=patient)
        serializer = PatientConsultationSerializer(consultation)
        return Response(serializer.data)


# ============ VUES POUR PRENDRE RENDEZ-VOUS ============

class DoctorsAvailableListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctors = Doctor.objects.filter(user__is_approved=True)
        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)


class PatientPrendreRendezVousView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        patient = Patient.objects.get(user=request.user)
        serializer = PatientConsultationCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        doctor = serializer.validated_data['doctor']
        start_time = serializer.validated_data['start_time']

        # 🔥 CORRECTION TIMEZONE (OBLIGATOIRE)
        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(
                start_time, timezone.get_current_timezone()
            )

        end_time = start_time + timedelta(minutes=30)

        if not is_within_schedule(start_time, end_time, doctor.schedule):
            return Response({
                "error": f"Le docteur n'est pas disponible à cet horaire. Horaires de travail: {doctor.schedule}"
            }, status=400)

        conflict = Consultation.objects.filter(
            doctor=doctor,
            start_time__lt=end_time,
            end_time__gt=start_time
        )

        if conflict.exists():
            return Response({
                "error": "Ce créneau horaire est déjà réservé"
            }, status=400)

        consultation = Consultation.objects.create(
            doctor=doctor,
            patient=patient,
            start_time=start_time,
            end_time=end_time,
            motif=serializer.validated_data.get('motif', '')
        )

        return Response(
            PatientConsultationSerializer(consultation).data,
            status=201
        )


from django.utils import timezone
from datetime import timedelta


class PatientAnnulerRendezVousView(APIView):
    """Annuler un rendez-vous"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, consultation_id):
        try:
            patient = Patient.objects.get(user=request.user)
            consultation = Consultation.objects.get(id=consultation_id, patient=patient)

            # Vérifier que le rendez-vous est dans le futur
            if consultation.start_time < timezone.now():
                return Response({
                    'error': 'Impossible d\'annuler un rendez-vous passé'
                }, status=400)

            # Vérifier que l'annulation se fait au moins 24h avant
            time_until_appointment = consultation.start_time - timezone.now()
            if time_until_appointment < timedelta(hours=24):
                return Response({
                    'error': 'Vous ne pouvez pas annuler ce rendez-vous moins de 24 heures avant'
                }, status=400)

            consultation.delete()
            return Response({'message': 'Rendez-vous annulé avec succès'}, status=200)

        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        except Consultation.DoesNotExist:
            return Response({'error': 'Rendez-vous introuvable'}, status=404)


# ============ VUES POUR LES DOSSIERS MÉDICAUX ============

class PatientDossiersListView(APIView):
    """Liste des dossiers médicaux du patient"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        
        dossiers = DossierMedical.objects.filter(patient=patient)
        serializer = PatientDossierMedicalSerializer(dossiers, many=True)
        return Response(serializer.data)


class PatientDossierDetailView(APIView):
    """Détails d'un dossier médical"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, dossier_id):
        try:
            patient = Patient.objects.get(user=request.user)
            dossier = DossierMedical.objects.get(id=dossier_id, patient=patient)
            serializer = PatientDossierMedicalSerializer(dossier)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        except DossierMedical.DoesNotExist:
            return Response({'error': 'Dossier médical introuvable'}, status=404)


class PatientDeposerDossierView(APIView):
    """Déposer un nouveau dossier médical"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        
        serializer = PatientDossierDeposeSerializer(data=request.data)
        if serializer.is_valid():
            dossier = serializer.save(patient=patient)
            return Response(
                PatientDossierMedicalSerializer(dossier).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=400)


# ============ VUES POUR LES RÉCLAMATIONS ============

class PatientReclamationsListView(APIView):
    """Liste des réclamations du patient"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)

        reclamations = Reclamation.objects.filter(patient=patient).select_related('doctor')

        # Filtre par statut
        statut = request.query_params.get('statut')
        if statut:
            reclamations = reclamations.filter(statut=statut)

        serializer = PatientReclamationSerializer(reclamations, many=True)
        return Response(serializer.data, status=200)


class PatientCreateReclamationView(APIView):
    """Créer une nouvelle réclamation"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)

        serializer = PatientReclamationCreateSerializer(data=request.data)

        if serializer.is_valid():
            # Créer la réclamation
            reclamation = serializer.save(
                patient=patient,
                statut='EN_ATTENTE'
            )

            # Retourner la réclamation créée avec toutes les infos
            response_serializer = PatientReclamationSerializer(reclamation)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientReclamationDetailView(APIView):
    """Détails d'une réclamation"""
    permission_classes = [IsAuthenticated]

    def get(self, request, reclamation_id):
        try:
            patient = Patient.objects.get(user=request.user)
            reclamation = Reclamation.objects.select_related('doctor').get(
                id=reclamation_id,
                patient=patient
            )
            serializer = PatientReclamationSerializer(reclamation)
            return Response(serializer.data, status=200)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        except Reclamation.DoesNotExist:
            return Response({'error': 'Réclamation introuvable'}, status=404)


# ============ VUES POUR LES MESSAGES ============

class PatientMessagesListView(APIView):
    """Liste des messages envoyés et reçus par le patient"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        
        # Messages envoyés et reçus
        messages = Message.objects.filter(
            Q(expediteur_patient=patient) | Q(destinataire_patient=patient)
        ).select_related(
            'expediteur_doctor', 'expediteur_patient',
            'destinataire_doctor', 'destinataire_patient'
        )
        
        # Filtre par type
        type_msg = request.query_params.get('type')
        if type_msg == 'envoyes':
            messages = messages.filter(expediteur_patient=patient)
        elif type_msg == 'recus':
            messages = messages.filter(destinataire_patient=patient)
        
        serializer = PatientMessageSerializer(messages, many=True)
        return Response(serializer.data)


class PatientEnvoyerMessageView(APIView):
    """Envoyer un message à un docteur"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        
        serializer = PatientMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(expediteur_patient=patient)
            return Response(
                PatientMessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=400)


class PatientMessageDetailView(APIView):
    """Détails d'un message et marquer comme lu"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, message_id):
        try:
            patient = Patient.objects.get(user=request.user)
            message = Message.objects.select_related(
                'expediteur_doctor', 'expediteur_patient',
                'destinataire_doctor', 'destinataire_patient'
            ).get(
                Q(id=message_id),
                Q(expediteur_patient=patient) | Q(destinataire_patient=patient)
            )
            
            # Marquer comme lu si le patient est le destinataire
            if message.destinataire_patient == patient and not message.lu:
                message.lu = True
                message.save()
            
            serializer = PatientMessageSerializer(message)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response({'error': 'Profil patient introuvable'}, status=404)
        except Message.DoesNotExist:
            return Response({'error': 'Message introuvable'}, status=404)

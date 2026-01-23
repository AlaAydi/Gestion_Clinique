from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from datetime import datetime, timedelta
from users.models import User, Doctor, Patient, Consultation
from users.permissions import IsAdminRole


class AdminDashboardStatsView(APIView):
    """
    API pour récupérer les statistiques du dashboard admin
    
    GET: Statistiques globales du système
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    
    def get(self, request):
        # Compter les utilisateurs
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.count()
        total_consultations = Consultation.objects.count()
        
        # Patients actifs vs inactifs
        active_patients = Patient.objects.filter(status='Actif').count()
        inactive_patients = Patient.objects.filter(status='Inactif').count()
        
        # Docteurs approuvés vs non approuvés
        approved_doctors = Doctor.objects.filter(user__is_approved=True).count()
        pending_doctors = Doctor.objects.filter(user__is_approved=False).count()
        
        # Consultations par période
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        consultations_today = Consultation.objects.filter(
            start_time__date=today
        ).count()
        
        consultations_this_week = Consultation.objects.filter(
            start_time__date__gte=week_ago
        ).count()
        
        consultations_this_month = Consultation.objects.filter(
            start_time__date__gte=month_ago
        ).count()
        
        # Consultations à venir
        upcoming_consultations = Consultation.objects.filter(
            start_time__gte=datetime.now()
        ).count()
        
        # Top 5 docteurs par nombre de consultations
        top_doctors = Doctor.objects.annotate(
            consultation_count=Count('consultations')
        ).order_by('-consultation_count')[:5]
        
        top_doctors_data = [
            {
                'id': doctor.id,
                'name': f"Dr. {doctor.nom} {doctor.prenom}" if doctor.nom else doctor.user.username,
                'specialty': doctor.specialty,
                'consultations_count': doctor.consultation_count
            }
            for doctor in top_doctors
        ]
        
        # Consultations par spécialité
        specialties = Doctor.objects.values('specialty').annotate(
            count=Count('consultations')
        ).order_by('-count')
        
        return Response({
            'overview': {
                'total_patients': total_patients,
                'total_doctors': total_doctors,
                'total_consultations': total_consultations,
                'active_patients': active_patients,
                'inactive_patients': inactive_patients,
                'approved_doctors': approved_doctors,
                'pending_doctors': pending_doctors
            },
            'consultations': {
                'today': consultations_today,
                'this_week': consultations_this_week,
                'this_month': consultations_this_month,
                'upcoming': upcoming_consultations
            },
            'top_doctors': top_doctors_data,
            'consultations_by_specialty': list(specialties)
        }, status=status.HTTP_200_OK)


class DoctorDashboardStatsView(APIView):
    """
    API pour récupérer les statistiques du dashboard docteur
    
    GET: Statistiques du docteur connecté
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Seuls les docteurs peuvent accéder à ces statistiques'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Profil docteur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Statistiques de consultations
        total_consultations = Consultation.objects.filter(doctor=doctor).count()
        
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        consultations_today = Consultation.objects.filter(
            doctor=doctor,
            start_time__date=today
        ).count()
        
        consultations_this_week = Consultation.objects.filter(
            doctor=doctor,
            start_time__date__gte=week_ago
        ).count()
        
        consultations_this_month = Consultation.objects.filter(
            doctor=doctor,
            start_time__date__gte=month_ago
        ).count()
        
        # Consultations à venir
        upcoming_consultations = Consultation.objects.filter(
            doctor=doctor,
            start_time__gte=datetime.now()
        ).order_by('start_time')[:5]
        
        upcoming_data = [
            {
                'id': consultation.id,
                'patient': f"{consultation.patient.nom} {consultation.patient.prenom}" if consultation.patient.nom else consultation.patient.user.username,
                'start_time': consultation.start_time,
                'motif': consultation.motif
            }
            for consultation in upcoming_consultations
        ]
        
        # Nombre de patients uniques
        unique_patients = Consultation.objects.filter(
            doctor=doctor
        ).values('patient').distinct().count()
        
        return Response({
            'overview': {
                'total_consultations': total_consultations,
                'total_patients': unique_patients,
                'consultations_today': consultations_today,
                'consultations_this_week': consultations_this_week,
                'consultations_this_month': consultations_this_month
            },
            'upcoming_consultations': upcoming_data,
            'doctor_info': {
                'name': f"Dr. {doctor.nom} {doctor.prenom}" if doctor.nom else doctor.user.username,
                'specialty': doctor.specialty,
                'schedule': doctor.schedule
            }
        }, status=status.HTTP_200_OK)


class PatientDashboardStatsView(APIView):
    """
    API pour récupérer les statistiques du dashboard patient
    
    GET: Statistiques du patient connecté
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'PATIENT':
            return Response(
                {'error': 'Seuls les patients peuvent accéder à ces statistiques'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Profil patient non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Statistiques de consultations
        total_consultations = Consultation.objects.filter(patient=patient).count()
        
        # Consultations passées
        past_consultations = Consultation.objects.filter(
            patient=patient,
            start_time__lt=datetime.now()
        ).count()
        
        # Consultations à venir
        upcoming_consultations = Consultation.objects.filter(
            patient=patient,
            start_time__gte=datetime.now()
        ).order_by('start_time')[:5]
        
        upcoming_data = [
            {
                'id': consultation.id,
                'doctor': f"Dr. {consultation.doctor.nom} {consultation.doctor.prenom}" if consultation.doctor.nom else consultation.doctor.user.username,
                'specialty': consultation.doctor.specialty,
                'start_time': consultation.start_time,
                'motif': consultation.motif
            }
            for consultation in upcoming_consultations
        ]
        
        # Nombre de dossiers médicaux
        total_dossiers = patient.dossiers.count()
        
        return Response({
            'overview': {
                'total_consultations': total_consultations,
                'past_consultations': past_consultations,
                'upcoming_consultations_count': upcoming_consultations.count(),
                'total_dossiers': total_dossiers
            },
            'upcoming_consultations': upcoming_data,
            'patient_info': {
                'name': f"{patient.nom} {patient.prenom}" if patient.nom else patient.user.username,
                'age': patient.age,
                'address': patient.address,
                'status': patient.status
            }
        }, status=status.HTTP_200_OK)

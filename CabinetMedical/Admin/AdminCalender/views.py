from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, timedelta
import re

from users.models import Consultation, Doctor, Patient
from users.permissions import IsAdminRole
from .serializers import (
    CalendarConsultationSerializer,
    CalendarDoctorSerializer,
    CalendarPatientSerializer
)


def parse_schedule(schedule_str):
    """Parse schedule string like 'Lun-Ven 9:00-17:00'"""
    if not schedule_str:
        return None
    try:
        s = schedule_str.strip().lower()
        parts = s.split()
        if len(parts) < 2:
            return None
        day_part = parts[0]
        time_part = parts[1]

        fr_map = {'lun':0,'mar':1,'mer':2,'jeu':3,'ven':4,'sam':5,'dim':6}
        en_map = {'mon':0,'tue':1,'wed':2,'thu':3,'fri':4,'sat':5,'sun':6}

        def day_to_num(token):
            t = token[:3]
            if t in fr_map:
                return fr_map[t]
            if t in en_map:
                return en_map[t]
            return None

        days = set()
        if '-' in day_part:
            a, b = day_part.split('-')
            na = day_to_num(a)
            nb = day_to_num(b)
            if na is None or nb is None:
                return None
            if na <= nb:
                rng = range(na, nb+1)
            else:
                rng = list(range(na, 7)) + list(range(0, nb+1))
            days.update(rng)
        else:
            n = day_to_num(day_part)
            if n is None:
                return None
            days.add(n)

        m = re.match(r"(\d{1,2}:\d{2})-(\d{1,2}:\d{2})", time_part)
        if not m:
            return None
        tstart = datetime.strptime(m.group(1), "%H:%M").time()
        tend = datetime.strptime(m.group(2), "%H:%M").time()

        return (days, tstart, tend)
    except Exception:
        return None


def is_within_schedule(start_dt, end_dt, schedule_str):
    """Check if consultation is within doctor's working hours"""
    parsed = parse_schedule(schedule_str)
    if not parsed:
        if not schedule_str or schedule_str.strip() == '':
            return True
        return True
    
    days, tstart, tend = parsed
    start_local = timezone.localtime(start_dt) if timezone.is_aware(start_dt) else start_dt
    end_local = timezone.localtime(end_dt) if timezone.is_aware(end_dt) else end_dt
    
    if start_local.weekday() not in days:
        return False
    if end_local.weekday() not in days:
        return False
    if start_local.time() < tstart:
        return False
    if end_local.time() > tend:
        return False
    return True


class AdminCalendarView(APIView):
    """
    Vue principale du calendrier admin.
    GET: Récupère les consultations + listes patients/doctors pour le calendrier
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Paramètres de période
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        doctor_id = request.query_params.get('doctor_id')

        # Récupérer les consultations
        consultations = Consultation.objects.select_related(
            'doctor', 'patient'
        ).all()

        if start_date:
            parsed_start = parse_date(start_date)
            if parsed_start:
                consultations = consultations.filter(start_time__date__gte=parsed_start)

        if end_date:
            parsed_end = parse_date(end_date)
            if parsed_end:
                consultations = consultations.filter(start_time__date__lte=parsed_end)

        if doctor_id:
            consultations = consultations.filter(doctor_id=doctor_id)

        consultations = consultations.order_by('start_time')

        # Récupérer patients et doctors pour les selects
        # Retourner tous les médecins (même ceux non approuvés) pour le calendrier admin
        doctors = Doctor.objects.select_related('user').all()
        patients = Patient.objects.select_related('user').all()

        return Response({
            'consultations': CalendarConsultationSerializer(consultations, many=True).data,
            'doctors': CalendarDoctorSerializer(doctors, many=True).data,
            'patients': CalendarPatientSerializer(patients, many=True).data
        })


class AdminCalendarConsultationView(APIView):
    """
    CRUD pour les consultations depuis le calendrier admin
    POST: Créer une consultation
    PUT/PATCH: Modifier une consultation
    DELETE: Supprimer une consultation
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        """Créer une nouvelle consultation"""
        data = request.data
        
        # Valider les champs requis
        doctor_id = data.get('doctor')
        patient_id = data.get('patient')
        start_time_str = data.get('start_time')
        motif = data.get('motif', '')

        if not all([doctor_id, patient_id, start_time_str]):
            return Response(
                {'error': 'Les champs doctor, patient et start_time sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que le médecin existe et est approuvé
        try:
            doctor = Doctor.objects.select_related('user').get(id=doctor_id)
            if not doctor.user.is_approved:
                return Response(
                    {'error': 'Ce médecin n\'est pas encore approuvé'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Médecin non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que le patient existe
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Parser start_time
        try:
            if 'T' in start_time_str:
                start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            else:
                start_time = datetime.strptime(start_time_str, '%Y-%m-%d %H:%M:%S')
            
            if timezone.is_naive(start_time):
                start_time = timezone.make_aware(start_time)
        except (ValueError, TypeError) as e:
            return Response(
                {'error': f'Format de date invalide: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculer end_time (+30 min)
        end_time = start_time + timedelta(minutes=30)

        # Vérifier les horaires de travail du médecin
        if not is_within_schedule(start_time, end_time, doctor.schedule):
            return Response({
                'error': f'Consultation hors des heures de travail du médecin. Horaires: {doctor.schedule}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier les conflits d'horaire
        conflicting = Consultation.objects.filter(
            doctor_id=doctor_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if conflicting.exists():
            return Response({
                'error': 'Conflit d\'horaire: ce médecin a déjà un rendez-vous à cette heure'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Créer la consultation
        consultation = Consultation.objects.create(
            doctor=doctor,
            patient=patient,
            start_time=start_time,
            end_time=end_time,
            motif=motif
        )

        return Response(
            CalendarConsultationSerializer(consultation).data,
            status=status.HTTP_201_CREATED
        )

    def put(self, request):
        """Modifier une consultation existante"""
        consultation_id = request.data.get('id')
        if not consultation_id:
            return Response(
                {'error': 'ID de consultation requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            consultation = Consultation.objects.get(id=consultation_id)
        except Consultation.DoesNotExist:
            return Response(
                {'error': 'Consultation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data

        # Mettre à jour les champs si fournis
        if 'doctor' in data:
            try:
                doctor = Doctor.objects.get(id=data['doctor'])
                consultation.doctor = doctor
            except Doctor.DoesNotExist:
                return Response({'error': 'Médecin non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        if 'patient' in data:
            try:
                patient = Patient.objects.get(id=data['patient'])
                consultation.patient = patient
            except Patient.DoesNotExist:
                return Response({'error': 'Patient non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        if 'start_time' in data:
            try:
                start_time_str = data['start_time']
                if 'T' in start_time_str:
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                else:
                    start_time = datetime.strptime(start_time_str, '%Y-%m-%d %H:%M:%S')
                
                if timezone.is_naive(start_time):
                    start_time = timezone.make_aware(start_time)
                
                end_time = start_time + timedelta(minutes=30)

                # Vérifier les horaires de travail
                if not is_within_schedule(start_time, end_time, consultation.doctor.schedule):
                    return Response({
                        'error': f'Consultation hors des heures de travail. Horaires: {consultation.doctor.schedule}'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Vérifier les conflits
                conflicting = Consultation.objects.filter(
                    doctor=consultation.doctor,
                    start_time__lt=end_time,
                    end_time__gt=start_time
                ).exclude(id=consultation_id)
                
                if conflicting.exists():
                    return Response({
                        'error': 'Conflit d\'horaire avec un autre rendez-vous'
                    }, status=status.HTTP_400_BAD_REQUEST)

                consultation.start_time = start_time
                consultation.end_time = end_time
            except (ValueError, TypeError) as e:
                return Response({'error': f'Format de date invalide: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        if 'motif' in data:
            consultation.motif = data['motif']

        consultation.save()
        return Response(CalendarConsultationSerializer(consultation).data)

    def delete(self, request):
        """Supprimer une consultation"""
        consultation_id = request.query_params.get('id') or request.data.get('id')
        if not consultation_id:
            return Response(
                {'error': 'ID de consultation requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            consultation = Consultation.objects.get(id=consultation_id)
            consultation.delete()
            return Response({'message': 'Consultation supprimée'}, status=status.HTTP_204_NO_CONTENT)
        except Consultation.DoesNotExist:
            return Response(
                {'error': 'Consultation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )


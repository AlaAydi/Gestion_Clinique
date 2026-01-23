from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.utils.dateparse import parse_date

from users.models import Consultation, Doctor, Patient
from .serializers import ConsultationSerializer
from users.permissions import IsAdminOrDoctor
from django.utils import timezone
from datetime import datetime, time as dtime
import re


def parse_schedule(schedule_str):
    """Module-level parser for schedule strings.
    Supports formats like "Lun-Ven 9:00-17:00" or "Mon-Fri 09:00-17:00".
    Returns (set_of_weekdays, start_time_obj, end_time_obj) or None if unparsable.
    """
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
            a,b = day_part.split('-')
            na = day_to_num(a)
            nb = day_to_num(b)
            if na is None or nb is None:
                return None
            if na <= nb:
                rng = range(na, nb+1)
            else:
                rng = list(range(na,7)) + list(range(0, nb+1))
            days.update(rng)
        elif ',' in day_part:
            for tok in day_part.split(','):
                n = day_to_num(tok)
                if n is not None:
                    days.add(n)
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
    parsed = parse_schedule(schedule_str)
    if not parsed:
        # if no schedule provided, allow; if schedule exists but unparsable, block to be safe
        if not schedule_str or schedule_str.strip() == '':
            return True
        if re.search(r'[a-zA-Z]', schedule_str):
            return False
        return True
    days, tstart, tend = parsed
    start_local = timezone.localtime(start_dt)
    end_local = timezone.localtime(end_dt)
    if start_local.weekday() not in days:
        return False
    if end_local.weekday() not in days:
        return False
    if start_local.time() < tstart:
        return False
    if end_local.time() > tend:
        return False
    return True


class ConsultationListCreateView(generics.ListCreateAPIView):
    """Liste et crée des consultations - vérifie les conflits d'horaire"""
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get_queryset(self):
        qs = Consultation.objects.select_related('doctor__user', 'patient__user').all()
        
        # Filtrer par date
        date = self.request.query_params.get('date')
        if date:
            parsed_date = parse_date(date)
            if parsed_date:
                qs = qs.filter(start_time__date=parsed_date)
        
        # Filtrer par patient
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        
        # Filtrer par médecin
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        
        return qs.order_by('start_time')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Vérifier les conflits d'horaire pour le médecin
        doctor_id = serializer.validated_data['doctor'].id
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data.get('end_time')
        
        # Calculer end_time si non fourni (30 min par défaut)
        if not end_time:
            from datetime import timedelta
            end_time = start_time + timedelta(minutes=30)

        # Vérifier que l'horaire est dans le schedule du médecin
        schedule = serializer.validated_data['doctor'].schedule
        if not is_within_schedule(start_time, end_time, schedule):
            return Response({'error': 'Consultation hors des heures de travail du médecin.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Chercher les conflits
        conflicting = Consultation.objects.filter(
            doctor_id=doctor_id,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        if conflicting.exists():
            return Response({
                'error': 'Conflit d\'horaire: ce médecin a déjà un rendez-vous à cette heure.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ConsultationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détails, modification et suppression d'une consultation"""
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Vérifier les conflits si on modifie l'horaire
        if 'start_time' in serializer.validated_data or 'end_time' in serializer.validated_data:
            doctor_id = serializer.validated_data.get('doctor', instance.doctor).id
            start_time = serializer.validated_data.get('start_time', instance.start_time)
            end_time = serializer.validated_data.get('end_time', instance.end_time)
            
            conflicting = Consultation.objects.filter(
                doctor_id=doctor_id,
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exclude(pk=instance.pk)
            
            if conflicting.exists():
                return Response({
                    'error': 'Conflit d\'horaire: ce médecin a déjà un rendez-vous à cette heure.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Vérifier que l'horaire modifié est dans le schedule du médecin
            schedule = serializer.validated_data.get('doctor', instance.doctor).schedule
            if not is_within_schedule(start_time, end_time, schedule):
                return Response({'error': 'Consultation hors des heures de travail du médecin.'}, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        return Response(serializer.data)

    


class ConsultationsByDateView(APIView):
    """Afficher les rendez-vous d'un jour donné"""
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get(self, request, date):
        parsed_date = parse_date(date)
        if not parsed_date:
            return Response({'error': 'Format de date invalide (YYYY-MM-DD)'}, status=400)
        
        consultations = Consultation.objects.filter(
            start_time__date=parsed_date
        ).select_related('doctor__user', 'patient__user').order_by('start_time')
        
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)


class ConsultationsByPatientView(APIView):
    """Afficher tous les rendez-vous d'un patient"""
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        consultations = Consultation.objects.filter(
            patient_id=patient_id
        ).select_related('doctor__user', 'patient__user').order_by('-start_time')
        
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)
    
    
class ConsultationsByDoctorView(APIView):
    """Afficher tous les rendez-vous d'un médecin"""
    permission_classes = [IsAuthenticated, IsAdminOrDoctor]

    def get(self, request, doctor_id):
        consultations = Consultation.objects.filter(
            doctor_id=doctor_id
        ).select_related('doctor__user', 'patient__user').order_by('-start_time')
        
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data)

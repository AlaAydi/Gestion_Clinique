from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from datetime import datetime, timedelta
from calendar import monthrange
from users.models import Consultation, Doctor
from .serializers import CalendarConsultationSerializer, DoctorCalendarSerializer


class DoctorCalendarView(APIView):
    """
    API pour récupérer les consultations d'un docteur pour le calendrier
    
    GET: Récupérer les consultations filtrées par période
    
    Query Parameters:
    - year: Année (optionnel)
    - month: Mois 1-12 (optionnel)
    - start_date: Date de début au format YYYY-MM-DD (optionnel)
    - end_date: Date de fin au format YYYY-MM-DD (optionnel)
    
    Si aucun paramètre n'est fourni, retourne les consultations du mois en cours
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Vérifier que l'utilisateur est un docteur
        if request.user.role != 'DOCTOR':
            return Response(
                {'error': 'Seuls les docteurs peuvent accéder à ce calendrier'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Profil docteur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer et valider les paramètres de filtre
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Déterminer la période à afficher
        if start_date and end_date:
            # Utiliser la plage de dates fournie
            try:
                start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
                end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            except ValueError:
                return Response(
                    {'error': 'Format de date invalide. Utilisez YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif year and month:
            # Utiliser l'année et le mois fournis
            try:
                year = int(year)
                month = int(month)
                if month < 1 or month > 12:
                    raise ValueError("Le mois doit être entre 1 et 12")
                
                # Premier jour du mois
                start_datetime = datetime(year, month, 1)
                # Dernier jour du mois
                last_day = monthrange(year, month)[1]
                end_datetime = datetime(year, month, last_day, 23, 59, 59)
            except (ValueError, TypeError) as e:
                return Response(
                    {'error': f'Paramètres invalides: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Par défaut: mois en cours
            now = datetime.now()
            start_datetime = datetime(now.year, now.month, 1)
            last_day = monthrange(now.year, now.month)[1]
            end_datetime = datetime(now.year, now.month, last_day, 23, 59, 59)
        
        # Récupérer les consultations du docteur pour la période
        consultations = Consultation.objects.filter(
            doctor=doctor,
            start_time__gte=start_datetime,
            start_time__lte=end_datetime
        ).select_related('patient', 'patient__user', 'doctor', 'doctor__user').order_by('start_time')
        
        # Sérialiser les données
        serializer = CalendarConsultationSerializer(consultations, many=True)
        
        # Organiser les données par date pour faciliter l'affichage dans le calendrier
        calendar_data = {}
        for consultation in serializer.data:
            date_key = consultation['start_time'][:10]  # YYYY-MM-DD
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            calendar_data[date_key].append(consultation)
        
        return Response({
            'period': {
                'start': start_datetime.strftime('%Y-%m-%d'),
                'end': end_datetime.strftime('%Y-%m-%d'),
            },
            'total_consultations': len(serializer.data),
            'consultations_by_date': calendar_data,
            'all_consultations': serializer.data
        }, status=status.HTTP_200_OK)

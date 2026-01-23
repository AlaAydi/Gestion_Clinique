from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import Patient, Doctor, Consultation
from .permissions import IsAdminRole
import io
from django.http import FileResponse
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    REPORTLAB_AVAILABLE = True
except Exception:
    REPORTLAB_AVAILABLE = False


class RapportCliniqueView(APIView):
    """Génère un rapport global de la clinique avec statistiques"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Statistiques de base
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.count()
        total_consultations = Consultation.objects.count()
        
        # Patients actifs vs inactifs
        patients_actifs = Patient.objects.filter(status='Actif').count()
        patients_inactifs = Patient.objects.filter(status='Inactif').count()
        
        # Spécialités les plus sollicitées
        specialites = Doctor.objects.values('specialty').annotate(
            count=Count('specialty'),
            nb_consultations=Count('consultations')
        ).order_by('-nb_consultations')
        
        # Consultations par médecin
        consultations_par_medecin = Doctor.objects.annotate(
            nb_consultations=Count('consultations')
        ).values('id', 'nom', 'prenom', 'specialty', 'nb_consultations').order_by('-nb_consultations')[:10]
        
        # Consultations récentes (7 derniers jours)
        seven_days_ago = timezone.now() - timedelta(days=7)
        consultations_recentes = Consultation.objects.filter(
            start_time__gte=seven_days_ago
        ).count()
        
        # Consultations à venir
        consultations_a_venir = Consultation.objects.filter(
            start_time__gt=timezone.now()
        ).count()
        
        return Response({
            'resume': {
                'total_patients': total_patients,
                'patients_actifs': patients_actifs,
                'patients_inactifs': patients_inactifs,
                'total_medecins': total_doctors,
                'total_consultations': total_consultations,
                'consultations_7_jours': consultations_recentes,
                'consultations_a_venir': consultations_a_venir
            },
            'specialites_sollicitees': list(specialites),
            'top_medecins': list(consultations_par_medecin)
        })


class RapportCliniquePDFView(APIView):
    """Génère le rapport clinique au format PDF (téléchargement)."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Reutiliser la logique de RapportCliniqueView
        total_patients = Patient.objects.count()
        total_doctors = Doctor.objects.count()
        total_consultations = Consultation.objects.count()

        patients_actifs = Patient.objects.filter(status='Actif').count()
        patients_inactifs = Patient.objects.filter(status='Inactif').count()

        specialites = Doctor.objects.values('specialty').annotate(
            count=Count('specialty'),
            nb_consultations=Count('consultations')
        ).order_by('-nb_consultations')

        consultations_par_medecin = Doctor.objects.annotate(
            nb_consultations=Count('consultations')
        ).values('id', 'nom', 'prenom', 'specialty', 'nb_consultations').order_by('-nb_consultations')[:10]

        seven_days_ago = timezone.now() - timedelta(days=7)
        consultations_recentes = Consultation.objects.filter(start_time__gte=seven_days_ago).count()
        consultations_a_venir = Consultation.objects.filter(start_time__gt=timezone.now()).count()

        if not REPORTLAB_AVAILABLE:
            return Response({
                'error': 'reportlab non installé. Installer avec `pip install reportlab` pour activer l\'export PDF.'
            }, status=500)

        # Générer PDF en mémoire avec Platypus pour un rendu plus élégant
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('title', parent=styles['Title'], alignment=1, fontSize=18, spaceAfter=12)
        h2_style = ParagraphStyle('h2', parent=styles['Heading2'], spaceAfter=8)
        normal = styles['Normal']

        elems = []
        elems.append(Paragraph('Rapport clinique', title_style))
        elems.append(Paragraph(f'Date: {timezone.now().strftime("%Y-%m-%d %H:%M")}', normal))
        elems.append(Spacer(1, 12))

        # Résumé chiffré
        summary_data = [
            ['Total patients', str(total_patients)],
            ['Patients actifs', str(patients_actifs)],
            ['Patients inactifs', str(patients_inactifs)],
            ['Total médecins', str(total_doctors)],
            ['Total consultations', str(total_consultations)],
            ['Consultations (7 derniers jours)', str(consultations_recentes)],
            ['Consultations à venir', str(consultations_a_venir)],
        ]
        t = Table(summary_data, colWidths=[8*cm, 6*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elems.append(t)
        elems.append(Spacer(1, 12))

        # Spécialités sollicitées
        elems.append(Paragraph('Spécialités sollicitées', h2_style))
        spec_data = [['Spécialité', 'Nombre consultations']]
        for spec in list(specialites)[:20]:
            spec_name = spec.get('specialty') or 'N/A'
            spec_data.append([spec_name, str(spec.get('nb_consultations', 0))])
        spec_table = Table(spec_data, colWidths=[10*cm, 4*cm])
        spec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4b79a1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
            ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.grey),
        ]))
        elems.append(spec_table)
        elems.append(Spacer(1, 12))

        # Top médecins
        elems.append(Paragraph('Top médecins (par nombre de consultations)', h2_style))
        doc_data = [['Médecin', 'Spécialité', 'Nb consultations']]
        for d in list(consultations_par_medecin):
            name = f"{d.get('nom') or ''} {d.get('prenom') or ''}".strip()
            doc_data.append([name, d.get('specialty') or 'N/A', str(d.get('nb_consultations', 0))])
        doc_table = Table(doc_data, colWidths=[8*cm, 4*cm, 2*cm])
        doc_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4b79a1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (2,1), (-1,-1), 'CENTER'),
            ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.grey),
        ]))
        elems.append(doc_table)

        # Footer
        elems.append(Spacer(1, 24))
        elems.append(Paragraph('Generated by Clinic Management System', ParagraphStyle('footer', parent=normal, fontSize=8, alignment=1, textColor=colors.grey)))

        doc.build(elems)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='rapport_clinique.pdf')


class StatistiquesConsultationsView(APIView):
    """Statistiques détaillées sur les consultations"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Filtres optionnels
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        qs = Consultation.objects.all()
        
        if date_debut:
            qs = qs.filter(start_time__date__gte=date_debut)
        if date_fin:
            qs = qs.filter(start_time__date__lte=date_fin)
        
        # Consultations par jour de la semaine
        from django.db.models.functions import ExtractWeekDay
        consultations_par_jour = qs.annotate(
            jour_semaine=ExtractWeekDay('start_time')
        ).values('jour_semaine').annotate(count=Count('id')).order_by('jour_semaine')
        
        # Mapping des jours
        jours = {1: 'Dimanche', 2: 'Lundi', 3: 'Mardi', 4: 'Mercredi', 5: 'Jeudi', 6: 'Vendredi', 7: 'Samedi'}
        consultations_formatted = [
            {'jour': jours.get(item['jour_semaine'], 'Inconnu'), 'count': item['count']}
            for item in consultations_par_jour
        ]
        
        # Motifs les plus fréquents
        motifs = qs.exclude(motif='').values('motif').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total_consultations': qs.count(),
            'consultations_par_jour': consultations_formatted,
            'motifs_frequents': list(motifs)
        })


class RechercheAvanceeView(APIView):
    """Recherche avancée multi-critères"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        query_type = request.query_params.get('type', 'patient')
        search = request.query_params.get('q', '')
        
        if query_type == 'patient':
            results = Patient.objects.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(user__email__icontains=search) |
                Q(telephone__icontains=search)
            ).select_related('user').values(
                'id', 'nom', 'prenom', 'age', 'telephone', 'address', 'status', 'user__email'
            )[:20]
            
        elif query_type == 'doctor':
            results = Doctor.objects.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(specialty__icontains=search) |
                Q(user__email__icontains=search)
            ).select_related('user').values(
                'id', 'nom', 'prenom', 'specialty', 'phone', 'user__email'
            )[:20]
            
        else:
            return Response({'error': 'Type invalide (patient ou doctor)'}, status=400)
        
        return Response({
            'type': query_type,
            'count': len(results),
            'results': list(results)
        })

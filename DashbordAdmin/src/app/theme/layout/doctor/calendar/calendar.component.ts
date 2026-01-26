import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventApi, CalendarOptions, EventInput } from '@fullcalendar/core';
import { DoctorService } from '../../../../core/services/doctor/doctor.service';
import { CalendarConsultation } from '../../../../models/doctor';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CalendarComponent implements OnInit {
  showModal = false;
  loading = true;
  error: string | null = null;

  selectedEvent: any = null;
  patientHistory: any[] = [];
  consultations: CalendarConsultation[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    editable: false,
    selectable: false,
    eventClick: this.handleEventClick.bind(this),
    locale: 'fr',
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    // Ajout de propriétés importantes
    height: 'auto',
    weekends: true,
    dayMaxEvents: true
  };

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadCalendarData();
  }

  loadCalendarData(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getCalendarConsultations().subscribe({
      next: (response) => {
        console.log('Réponse API:', response); // Debug

        this.consultations = [];

        // Vérifier si la réponse contient des données
        if (!response || !response.consultations_by_date) {
          console.warn('Aucune consultation trouvée dans la réponse');
          this.loading = false;
          return;
        }

        Object.entries(response.consultations_by_date).forEach(
          ([date, dayConsultations]: any) => {
            if (Array.isArray(dayConsultations)) {
              dayConsultations.forEach((c: any) => {
                console.log('Consultation individuelle:', c); // Debug détaillé

                this.consultations.push({
                  id: c.id,
                  patient_id: c.patient_id,
                  patient_nom: c.patient_nom || c.patient_name || `Patient ${c.patient_id}`,
                  patient_email: c.patient_email || c.email || '',
                  patient_telephone: c.patient_telephone || c.phone || c.telephone || '',
                  date,
                  heure: c.heure || c.hour || '00:00',
                  motif: c.motif || c.reason || 'Consultation',
                  statut: c.statut || c.status || 'En attente'
                });
              });
            }
          }
        );

        console.log('Consultations traitées:', this.consultations); // Debug

        // Créer les événements pour le calendrier
        const events: EventInput[] = this.consultations
          .filter(c => c.date && c.heure) // Filtrer les consultations avec date et heure valides
          .map(c => {
            // S'assurer du format correct de la date
            const heureFormatted = c.heure.includes(':') ? c.heure : `${c.heure}:00`;
            const eventDate = `${c.date}T${heureFormatted}`;

            const patientName = c.patient_nom || `Patient ${c.patient_id}`;

            console.log('Event créé:', {
              date: eventDate,
              title: `${c.heure} - ${patientName}`
            }); // Debug

            return {
              id: c.id.toString(),
              title: `${c.heure} - ${patientName}`,
              start: eventDate,
              backgroundColor: this.getStatusColor(c.statut),
              borderColor: this.getStatusColor(c.statut),
              textColor: '#ffffff',
              extendedProps: {
                consultation: c
              }
            };
          });

        console.log('Events créés:', events); // Debug

        // Mise à jour IMPORTANTE : réassigner calendarOptions pour déclencher la détection
        this.calendarOptions = {
          ...this.calendarOptions,
          events: events
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur API:', err); // Debug
        this.error = 'Erreur lors du chargement du calendrier';
        this.loading = false;
      }
    });
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'Confirmé': return '#28a745';
      case 'En attente': return '#ffc107';
      case 'Annulé': return '#dc3545';
      case 'Terminé': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  handleEventClick(arg: { event: EventApi }) {
    const consultation = arg.event.extendedProps['consultation'] as CalendarConsultation;

    if (!consultation) return;

    this.selectedEvent = {
      id: consultation.id,
      patient: consultation.patient_nom,
      phone: consultation.patient_telephone,
      email: consultation.patient_email,
      remark: consultation.motif,
      start: `${consultation.date}T${consultation.heure}`,
      statut: consultation.statut
    };

    this.patientHistory = this.consultations
      .filter(c => c.patient_nom === consultation.patient_nom && c.id !== consultation.id)
      .map(c => ({
        date: `${c.date} ${c.heure}`,
        remark: c.motif,
        statut: c.statut
      }));

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
    this.patientHistory = [];
  }
}

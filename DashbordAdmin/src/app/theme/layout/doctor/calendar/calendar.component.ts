import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventApi, CalendarOptions } from '@fullcalendar/core';
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
    }
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
        this.consultations = [];

        Object.keys(response.consultations_by_date || {}).forEach(date => {
          const dayConsultations = response.consultations_by_date[date];
          dayConsultations.forEach((c: any) => {
            this.consultations.push({
              id: c.id,
              patient_id: c.patient_id,
              patient_nom: c.patient_nom,
              patient_email: c.patient_email,
              patient_telephone: c.patient_telephone,
              date: date,
              heure: c.heure,
              motif: c.motif,
              statut: c.statut
            });
          });
        });

        // Map to FullCalendar events
        this.calendarOptions.events = this.consultations.map(c => ({
          id: c.id.toString(),
          title: `${c.heure} - ${c.patient_nom}`,
          start: `${c.date}T${c.heure}`,
          backgroundColor: this.getStatusColor(c.statut),
          borderColor: this.getStatusColor(c.statut),
          extendedProps: {
            consultation: c
          }
        }));

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du calendrier';
        this.loading = false;
        console.error('Calendar load error:', err);
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

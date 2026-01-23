import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, CalendarOptions, EventApi } from '@fullcalendar/core';
import { 
  AdminCalendarService, 
  CalendarConsultation, 
  CalendarDoctor, 
  CalendarPatient,
  CreateCalendarConsultation 
} from '../../../../core/services/admin/calendar.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CalenderComponent implements OnInit {

  // Données
  consultations: CalendarConsultation[] = [];
  doctors: CalendarDoctor[] = [];
  patients: CalendarPatient[] = [];

  // Modal
  showModal = false;
  modalTitle = '';
  modalAction: 'add' | 'edit' = 'add';
  selectedConsultation: CalendarConsultation | null = null;

  // Formulaire
  selectedPatientId: number | null = null;
  selectedDoctorId: number | null = null;
  selectedDate = '';
  selectedTime = '';
  motif = '';

  // État
  loading = false;
  error = '';
  successMessage = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    editable: true,
    selectable: true,
    events: [],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this)
  };

  constructor(private calendarService: AdminCalendarService) {}

  ngOnInit(): void {
    this.loadCalendarData();
  }

  loadCalendarData(): void {
    this.loading = true;
    console.log('Loading calendar data...');
    this.calendarService.getCalendarData().subscribe({
      next: (data) => {
        console.log('Calendar data received:', data);
        console.log('Doctors:', data.doctors);
        console.log('Patients:', data.patients);
        this.consultations = data.consultations || [];
        this.doctors = data.doctors || [];
        this.patients = data.patients || [];
        this.updateCalendarEvents();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données';
        console.error('Calendar API error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.loading = false;
      }
    });
  }

  updateCalendarEvents(): void {
    const events: EventInput[] = this.consultations.map(c => ({
      id: String(c.id),
      title: `${c.patient_nom} - ${c.doctor_nom}`,
      start: c.start_time,
      end: c.end_time,
      backgroundColor: this.getEventColor(c.doctor_id),
      borderColor: this.getEventColor(c.doctor_id),
      extendedProps: {
        consultation: c
      }
    }));
    this.calendarOptions = { ...this.calendarOptions, events };
  }

  getEventColor(doctorId: number): string {
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];
    return colors[doctorId % colors.length];
  }

  handleDateClick(arg: any): void {
    this.modalAction = 'add';
    this.selectedDate = arg.dateStr;
    this.selectedTime = '09:00';
    this.modalTitle = `Ajouter un rendez-vous le ${this.formatDate(arg.dateStr)}`;
    this.resetForm();
    this.showModal = true;
  }

  handleEventClick(arg: { event: EventApi }): void {
    const consultation = arg.event.extendedProps['consultation'] as CalendarConsultation;
    if (consultation) {
      this.modalAction = 'edit';
      this.selectedConsultation = consultation;
      this.modalTitle = 'Modifier le rendez-vous';
      
      // Remplir le formulaire
      this.selectedPatientId = consultation.patient_id;
      this.selectedDoctorId = consultation.doctor_id;
      const startDate = new Date(consultation.start_time);
      this.selectedDate = startDate.toISOString().split('T')[0];
      this.selectedTime = startDate.toTimeString().slice(0, 5);
      this.motif = consultation.motif || '';
      
      this.showModal = true;
    }
  }

  handleEventDrop(arg: { event: EventApi }): void {
    const consultation = arg.event.extendedProps['consultation'] as CalendarConsultation;
    if (consultation) {
      const newStartTime = arg.event.start?.toISOString();
      if (newStartTime) {
        this.calendarService.updateConsultation({
          id: consultation.id,
          start_time: newStartTime
        }).subscribe({
          next: () => {
            this.successMessage = 'Rendez-vous déplacé avec succès';
            this.loadCalendarData();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            this.error = err.error?.error || 'Erreur lors du déplacement';
            this.loadCalendarData(); // Recharger pour annuler le déplacement visuel
            setTimeout(() => this.error = '', 5000);
          }
        });
      }
    }
  }

  saveEvent(): void {
    if (!this.selectedPatientId || !this.selectedDoctorId || !this.selectedDate || !this.selectedTime) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    this.error = '';

    const startTime = `${this.selectedDate}T${this.selectedTime}:00`;

    if (this.modalAction === 'add') {
      const data: CreateCalendarConsultation = {
        patient: this.selectedPatientId,
        doctor: this.selectedDoctorId,
        start_time: startTime,
        motif: this.motif
      };

      this.calendarService.createConsultation(data).subscribe({
        next: () => {
          this.successMessage = 'Rendez-vous créé avec succès!';
          this.loadCalendarData();
          this.closeModal();
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la création du rendez-vous';
          this.loading = false;
        }
      });
    } else if (this.modalAction === 'edit' && this.selectedConsultation) {
      this.calendarService.updateConsultation({
        id: this.selectedConsultation.id,
        patient: this.selectedPatientId,
        doctor: this.selectedDoctorId,
        start_time: startTime,
        motif: this.motif
      }).subscribe({
        next: () => {
          this.successMessage = 'Rendez-vous modifié avec succès!';
          this.loadCalendarData();
          this.closeModal();
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la modification';
          this.loading = false;
        }
      });
    }
  }

  deleteEvent(): void {
    if (this.selectedConsultation && confirm('Voulez-vous vraiment supprimer ce rendez-vous ?')) {
      this.calendarService.deleteConsultation(this.selectedConsultation.id).subscribe({
        next: () => {
          this.successMessage = 'Rendez-vous supprimé';
          this.loadCalendarData();
          this.closeModal();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la suppression';
        }
      });
    }
  }

  resetForm(): void {
    this.selectedPatientId = null;
    this.selectedDoctorId = null;
    this.motif = '';
    this.selectedConsultation = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
    this.error = '';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getDoctorSchedule(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor?.schedule || 'Non défini';
  }
}
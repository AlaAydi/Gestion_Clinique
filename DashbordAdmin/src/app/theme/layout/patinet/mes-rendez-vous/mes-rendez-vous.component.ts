import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientConsultation, DoctorDisponible, CreateRendezVous } from '../../../../models/patient';

@Component({
  selector: 'app-mes-rendez-vous',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './mes-rendez-vous.component.html',
  styleUrls: ['./mes-rendez-vous.component.scss']
})
export class MesRendezVousComponent implements OnInit {
  // Data from API
  consultations: PatientConsultation[] = [];
  doctors: DoctorDisponible[] = [];

  // UI State
  loading = true;
  loadingDoctors = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  showModal = false;
  modalMode: 'add' | 'view' = 'add';
  selectedDate = '';
  selectedEvent: PatientConsultation | null = null;
  conflict = false;

  newAppointment = {
    doctor_id: 0,
    time: '',
    motif: ''
  };

  // Selected doctor schedule
  selectedDoctorSchedule: { start: string; end: string } | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    dateClick: info => this.onDateClick(info.dateStr),
    eventClick: info => this.onEventClick(info.event)
  };

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadConsultations();
    this.loadDoctors();
  }

  loadConsultations(): void {
    this.loading = true;
    this.patientService.getMyConsultations().subscribe({
      next: (data) => {
        this.consultations = data;
        this.calendarOptions.events = this.mapEvents();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des consultations';
        this.loading = false;
        console.error('Load consultations error:', err);
      }
    });
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.patientService.getAvailableDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loadingDoctors = false;
      },
      error: (err) => {
        console.error('Load doctors error:', err);
        this.loadingDoctors = false;
      }
    });
  }

  mapEvents() {
    return this.consultations.map(c => {
      const start = new Date(c.start_time);
      const end = new Date(c.end_time);

      // Determine color based on status
      let bgColor = '#1976d2'; // default blue
      if (c.statut === 'terminee') bgColor = '#4caf50'; // green
      else if (c.statut === 'annulee') bgColor = '#f44336'; // red
      else if (c.statut === 'en_attente') bgColor = '#ff9800'; // orange

      return {
        id: c.id.toString(),
        title: `Dr. ${c.doctor_name} (${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: bgColor,
        borderColor: bgColor
      };
    });
  }

  onDateClick(date: string) {
    // Don't allow past dates
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.showMessage('Vous ne pouvez pas prendre un rendez-vous dans le passé', 'error');
      return;
    }

    this.selectedDate = date;
    this.modalMode = 'add';
    this.newAppointment = { doctor_id: 0, time: '', motif: '' };
    this.selectedDoctorSchedule = null;
    this.conflict = false;
    this.showModal = true;
  }

  onEventClick(event: EventApi) {
    this.selectedEvent = this.consultations.find(c => c.id.toString() === event.id) || null;
    this.modalMode = 'view';
    this.showModal = true;
  }

  onDoctorChange(): void {
    const doctor = this.doctors.find(d => d.id === this.newAppointment.doctor_id);
    if (doctor && doctor.horaires_travail) {
      // Parse horaires_travail (format: "Lun-Ven: 09:00-17:00" or similar)
      const match = doctor.horaires_travail.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
      if (match) {
        this.selectedDoctorSchedule = { start: match[1], end: match[2] };
      } else {
        this.selectedDoctorSchedule = { start: '08:00', end: '18:00' }; // default
      }
    } else {
      this.selectedDoctorSchedule = { start: '08:00', end: '18:00' }; // default
    }
    this.newAppointment.time = '';
    this.checkAvailability();
  }

  getAvailableTimes(): string[] {
    if (!this.newAppointment.doctor_id || !this.selectedDate || !this.selectedDoctorSchedule) {
      return [];
    }

    const schedule = this.selectedDoctorSchedule;
    const startHour = Number(schedule.start.split(':')[0]);
    const startMin = Number(schedule.start.split(':')[1]);
    const endHour = Number(schedule.end.split(':')[0]);
    const endMin = Number(schedule.end.split(':')[1]);

    const availableTimes: string[] = [];
    const selectedDateObj = new Date(this.selectedDate);
    const now = new Date();

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === endHour && m > endMin) continue;
        if (h === startHour && m < startMin) continue;

        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        // Check if time is in the past for today
        if (selectedDateObj.toDateString() === now.toDateString()) {
          const [th, tm] = timeStr.split(':').map(Number);
          if (th < now.getHours() || (th === now.getHours() && tm <= now.getMinutes())) {
            continue;
          }
        }

        // Check for conflicts with existing consultations
        const conflict = this.consultations.some(c => {
          if (c.doctor_id !== this.newAppointment.doctor_id) return false;
          const cDate = new Date(c.start_time).toISOString().split('T')[0];
          if (cDate !== this.selectedDate) return false;
          const cTime = new Date(c.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return cTime === timeStr;
        });

        if (!conflict) availableTimes.push(timeStr);
      }
    }

    return availableTimes;
  }

  checkAvailability() {
    if (!this.newAppointment.doctor_id || !this.newAppointment.time) {
      this.conflict = false;
      return;
    }

    const selectedStart = new Date(`${this.selectedDate}T${this.newAppointment.time}`);
    const selectedEnd = new Date(selectedStart.getTime() + 60 * 60000);

    this.conflict = this.consultations.some(c => {
      if (c.doctor_id !== this.newAppointment.doctor_id) return false;
      const cDate = new Date(c.start_time).toISOString().split('T')[0];
      if (cDate !== this.selectedDate) return false;

      const existingStart = new Date(c.start_time);
      const existingEnd = new Date(c.end_time);
      return (selectedStart < existingEnd) && (selectedEnd > existingStart);
    });
  }

addAppointment(): void {
  if (this.conflict || this.submitting) return;

  if (!this.newAppointment.doctor_id || !this.newAppointment.time) {
    this.showMessage('Veuillez sélectionner un médecin et une heure', 'error');
    return;
  }

  this.submitting = true;

  const startTime = new Date(`${this.selectedDate}T${this.newAppointment.time}`);
  const endTime = new Date(startTime.getTime() + 60 * 60000);

  const rendezVous: CreateRendezVous = {
    doctor: this.newAppointment.doctor_id,
    start_time: startTime.toISOString(),
    motif: this.newAppointment.motif || 'Consultation générale'
  };

  this.patientService.prendreRendezVous(rendezVous).subscribe({
    next: (response) => {
      const newEvent = {
        id: response.id.toString(),
        title: `Dr. ${response.doctor_name} (${startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        backgroundColor: '#1976d2',
        borderColor: '#1976d2'
      };
      (this.calendarOptions.events as any).push(newEvent);

      this.showMessage('Rendez-vous ajouté avec succès !', 'success');
      this.closeModal();
      this.submitting = false;
    },
    error: (err) => {
      const errorMsg = err.error?.error || err.error?.detail || 'Erreur lors de la création du rendez-vous';
      this.showMessage(errorMsg, 'error');
      this.submitting = false;
      console.error('Create appointment error:', err);
    }
  });
}

cancelAppointment(): void {
  if (!this.selectedEvent) return;

  const now = new Date();
  const appointmentDateTime = new Date(this.selectedEvent.start_time);

  const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (appointmentDateTime < now) {
    this.showMessage('Impossible d\'annuler un rendez-vous passé', 'error');
    return;
  }

  if (diffHours < 24) {
    this.showMessage('Vous ne pouvez pas annuler ce rendez-vous moins de 24 heures avant', 'error');
    return;
  }

  const confirmMessage = `Êtes-vous sûr de vouloir annuler ce rendez-vous du ${appointmentDateTime.toLocaleDateString('fr-FR')} à ${appointmentDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  this.submitting = true;

  this.patientService.annulerRendezVous(this.selectedEvent.id).subscribe({
    next: (response) => {
      this.showMessage(response.message || 'Rendez-vous annulé avec succès', 'success');

      // Retirer la consultation de la liste locale
      this.consultations = this.consultations.filter(c => c.id !== this.selectedEvent!.id);

      // Mettre à jour les événements du calendrier
      this.calendarOptions.events = this.mapEvents();

      this.closeModal();
      this.submitting = false;
    },
    error: (err) => {
      console.error('Cancel appointment error:', err);

      let errorMsg = 'Erreur lors de l\'annulation du rendez-vous';

      if (err.error) {
        if (typeof err.error === 'string') {
          errorMsg = err.error;
        } else if (err.error.error) {
          errorMsg = err.error.error;
        } else if (err.error.detail) {
          errorMsg = err.error.detail;
        }
      }

      this.showMessage(errorMsg, 'error');
      this.submitting = false;
    }
  });
}

/**
 * Vérifie si un rendez-vous peut être annulé
 */
canCancelAppointment(consultation: PatientConsultation): boolean {
  if (!consultation || consultation.statut === 'annulee' || consultation.statut === 'terminee') {
    return false;
  }

  const now = new Date();
  const appointmentDateTime = new Date(consultation.start_time);

  // Vérifier si le rendez-vous est dans le futur
  if (appointmentDateTime < now) {
    return false;
  }

  // Calculer la différence en heures
  const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Permettre l'annulation si plus de 24h avant
  return diffHours >= 24;
}

/**
 * Retourne le message expliquant pourquoi l'annulation n'est pas possible
 */
getCancelReasonMessage(consultation: PatientConsultation): string {
  if (consultation.statut === 'annulee') {
    return 'Ce rendez-vous est déjà annulé';
  }

  if (consultation.statut === 'terminee') {
    return 'Ce rendez-vous est terminé';
  }

  const now = new Date();
  const appointmentDateTime = new Date(consultation.start_time);

  if (appointmentDateTime < now) {
    return 'Ce rendez-vous est déjà passé';
  }

  const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    const hoursRemaining = Math.floor(diffHours);
    const minutesRemaining = Math.floor((diffHours - hoursRemaining) * 60);
    return `Annulation impossible : moins de 24h avant le rendez-vous (${hoursRemaining}h${minutesRemaining}m restantes)`;
  }

  return '';
}

/**
 * Formatte la durée restante avant le rendez-vous
 */
getTimeUntilAppointment(consultation: PatientConsultation): string {
  const now = new Date();
  const appointmentDateTime = new Date(consultation.start_time);
  const diffMs = appointmentDateTime.getTime() - now.getTime();

  if (diffMs < 0) {
    return 'Passé';
  }

  const diffHours = diffMs / (1000 * 60 * 60);
  const days = Math.floor(diffHours / 24);
  const hours = Math.floor(diffHours % 24);
  const minutes = Math.floor((diffHours * 60) % 60);

  if (days > 0) {
    return `${days} jour${days > 1 ? 's' : ''} ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes} minutes`;
  }
}
  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.prenom} ${doctor.nom}` : 'Médecin';
  }

  payCash(consultation: PatientConsultation | null): void {
    if (!consultation) return;
    // Navigate to payment or handle cash payment
    this.showMessage('Paiement en espèces enregistré', 'success');
  }

  payOnline(consultation: PatientConsultation | null): void {
    if (!consultation) return;
    // Navigate to online payment
    this.showMessage('Redirection vers le paiement en ligne...', 'success');
  }

  downloadInvoice(consultation: PatientConsultation | null): void {
    if (!consultation) return;
    const invoiceContent = `Facture\nMédecin: Dr. ${consultation.doctor_name}\nDate: ${new Date(consultation.start_time).toLocaleDateString('fr-FR')}\nHeure: ${new Date(consultation.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\nMotif: ${consultation.motif || 'Consultation'}\nMontant: ${consultation.prix || 100} TND`;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_${consultation.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.successMessage = message;
      this.error = null;
    } else {
      this.error = message;
      this.successMessage = null;
    }

    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 5000);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'en_attente': 'badge-warning',
      'confirmee': 'badge-info',
      'terminee': 'badge-success',
      'annulee': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }
}

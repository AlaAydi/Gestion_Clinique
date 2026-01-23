import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientReclamation, PatientMessage, CreatePatientMessage, CreateReclamation, DoctorDisponible } from '../../../../models/patient';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.scss'
})
export class ReclamationsComponent implements OnInit {
reclamations: PatientReclamation[] = [];
  doctors: DoctorDisponible[] = [];

  loading = true;
  loadingDoctors = false;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  showModal = false;
  showDetailModal = false;
  selectedReclamation: PatientReclamation | null = null;

  newReclamation: CreateReclamation = {
    doctor: 0,
    sujet: '',
    message: ''
  };

  filterStatut: string = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadReclamations();
    this.loadDoctors();
  }

  loadReclamations(): void {
    this.loading = true;
    const filters = this.filterStatut ? { statut: this.filterStatut } : undefined;

    this.patientService.getMyReclamations(filters).subscribe({
      next: (data) => {
        this.reclamations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des réclamations';
        this.loading = false;
        console.error('Load reclamations error:', err);
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

  applyFilter(): void {
    this.loadReclamations();
  }

  openCreateModal(): void {
    this.newReclamation = {
      doctor: 0,
      sujet: '',
      message: ''
    };
    this.showModal = true;
  }

  openDetailModal(reclamation: PatientReclamation): void {
    this.selectedReclamation = reclamation;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.showDetailModal = false;
    this.selectedReclamation = null;
  }

  createReclamation(): void {
    if (!this.newReclamation.doctor || !this.newReclamation.sujet || !this.newReclamation.message) {
      this.showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    this.submitting = true;

    this.patientService.createReclamation(this.newReclamation).subscribe({
      next: (response) => {
        this.showToast('Réclamation créée avec succès', 'success');
        this.reclamations.unshift(response); // Ajouter en début de liste
        this.closeModal();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Create reclamation error:', err);

        let errorMsg = 'Erreur lors de la création de la réclamation';

        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.error) {
            errorMsg = err.error.error;
          } else if (err.error.detail) {
            errorMsg = err.error.detail;
          } else if (err.error.non_field_errors) {
            errorMsg = err.error.non_field_errors[0];
          } else if (err.error.doctor) {
            errorMsg = `Erreur docteur: ${Array.isArray(err.error.doctor) ? err.error.doctor[0] : err.error.doctor}`;
          }
        }

        this.showToast(errorMsg, 'error');
        this.submitting = false;
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
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
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'RESOLU': 'Résolu',
      'FERME': 'Fermé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'EN_COURS': 'badge-info',
      'RESOLU': 'badge-success',
      'FERME': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.prenom} ${doctor.nom}` : 'Médecin';
  }
}

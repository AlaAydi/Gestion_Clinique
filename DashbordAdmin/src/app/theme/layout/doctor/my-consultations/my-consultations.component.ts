import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DoctorService } from '../../../../core/services/doctor/doctor.service';
import { DoctorConsultation } from '../../../../models/doctor';

@Component({
  selector: 'app-my-consultations',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, ReactiveFormsModule],
  templateUrl: './my-consultations.component.html',
  styleUrl: './my-consultations.component.scss'
})
export class MyConsultationsComponent implements OnInit {

  consultations: DoctorConsultation[] = [];
  filteredConsultations: DoctorConsultation[] = [];
  filterForm: FormGroup;
  
  loading = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) {
    this.filterForm = this.fb.group({
      patient: [''],
      date: [''],
      statut: ['']
    });
  }

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.loading = true;
    this.error = null;
    
    this.doctorService.getMyConsultations().subscribe({
      next: (data) => {
        this.consultations = data;
        this.filteredConsultations = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des consultations';
        this.loading = false;
        console.error('Load consultations error:', err);
      }
    });
  }

  applyFilter() {
    const { patient, date, statut } = this.filterForm.value;

    this.filteredConsultations = this.consultations.filter(c =>
      (!patient || c.patient_nom.toLowerCase().includes(patient.toLowerCase())) &&
      (!date || c.date === date) &&
      (!statut || c.statut === statut)
    );
  }

  resetFilter() {
    this.filterForm.reset();
    this.filteredConsultations = [...this.consultations];
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Confirmé': return 'badge bg-success';
      case 'En attente': return 'badge bg-warning';
      case 'Annulé': return 'badge bg-danger';
      case 'Terminé': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  get patientControl() { return this.filterForm.get('patient') as FormControl; }
  get dateControl() { return this.filterForm.get('date') as FormControl; }
  get statutControl() { return this.filterForm.get('statut') as FormControl; }
}

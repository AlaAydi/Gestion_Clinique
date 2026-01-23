import { NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ConsultationService, AdminConsultation, CreateConsultation, UpdateConsultation } from '../../../../core/services/admin/consultation.service';
import { PatientService } from '../../../../core/services/admin/patient.service';
import { DoctorService } from '../../../../core/services/admin/doctor.service';
import { Patient } from '../../../../models/patient';
import { DoctorInfo } from '../../../../models/doctor';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit {
  consultations: AdminConsultation[] = [];
  filteredConsultations: AdminConsultation[] = [];
  patients: Patient[] = [];
  doctors: DoctorInfo[] = [];

  loading = false;
  error = '';
  successMessage = '';

  filterForm: FormGroup;
  showAddModal = false;
  showEditModal = false;
  addForm: FormGroup;
  editForm: FormGroup;
  selectedConsultation: AdminConsultation | null = null;

  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {
    this.filterForm = this.fb.group({
      patient_id: [''],
      doctor_id: [''],
      date: ['']
    });

    this.addForm = this.fb.group({
      patient: ['', Validators.required],
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      motif: ['']
    });

    this.editForm = this.fb.group({
      patient: ['', Validators.required],
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      motif: ['']
    });
  }

  ngOnInit(): void {
    this.loadConsultations();
    this.loadPatients();
    this.loadDoctors();
  }

  loadConsultations(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {};
    const formValues = this.filterForm.value;
    if (formValues.patient_id) filters.patient_id = formValues.patient_id;
    if (formValues.doctor_id) filters.doctor_id = formValues.doctor_id;
    if (formValues.date) filters.date = formValues.date;

    this.consultationService.getConsultations(filters).subscribe({
      next: (data) => {
        this.consultations = data;
        this.filteredConsultations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des consultations';
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients({}).subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => console.error('Erreur chargement patients', err)
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
      },
      error: (err) => console.error('Erreur chargement médecins', err)
    });
  }

  applyFilter(): void {
    this.loadConsultations();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadConsultations();
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.addForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.addForm.reset();
    this.error = '';
  }

  openEditModal(consultation: AdminConsultation): void {
    this.selectedConsultation = consultation;
    this.showEditModal = true;
    this.error = '';
    this.successMessage = '';

    // Parse start_time pour extraire date et heure
    const startDate = new Date(consultation.start_time);
    const date = startDate.toISOString().split('T')[0];
    const time = startDate.toTimeString().slice(0, 5);

    this.editForm.patchValue({
      patient: consultation.patient,
      doctor: consultation.doctor,
      date: date,
      time: time,
      motif: consultation.motif
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedConsultation = null;
    this.editForm.reset();
    this.error = '';
  }

  addConsultation(): void {
    if (this.addForm.valid) {
      this.loading = true;
      this.error = '';
      const formValue = this.addForm.value;

      // Combiner date et time en ISO string
      const startTime = this.combineDateTime(formValue.date, formValue.time);

      const createData: CreateConsultation = {
        patient: Number(formValue.patient),
        doctor: Number(formValue.doctor),
        start_time: startTime,
        motif: formValue.motif || ''
      };

      this.consultationService.createConsultation(createData).subscribe({
        next: () => {
          this.successMessage = 'Consultation créée avec succès!';
          this.loadConsultations();
          this.closeAddModal();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la création de la consultation';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  updateConsultation(): void {
    if (this.editForm.valid && this.selectedConsultation) {
      this.loading = true;
      this.error = '';
      const formValue = this.editForm.value;

      // Combiner date et time en ISO string
      const startTime = this.combineDateTime(formValue.date, formValue.time);

      const updateData: UpdateConsultation = {
        patient: Number(formValue.patient),
        doctor: Number(formValue.doctor),
        start_time: startTime,
        motif: formValue.motif
      };

      this.consultationService.updateConsultation(this.selectedConsultation.id, updateData).subscribe({
        next: () => {
          this.successMessage = 'Consultation mise à jour avec succès!';
          this.loadConsultations();
          this.closeEditModal();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la mise à jour de la consultation';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  deleteConsultation(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) return;

    this.consultationService.deleteConsultation(id).subscribe({
      next: () => {
        this.successMessage = 'Consultation supprimée avec succès!';
        this.loadConsultations();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression de la consultation';
        console.error(err);
      }
    });
  }

  // Helper: combine date string and time string into ISO datetime
  combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  // Helper: get patient name by ID
  getPatientName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : 'Patient inconnu';
  }

  // Helper: get doctor name by ID
  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.prenom} ${doctor.nom}` : 'Médecin inconnu';
  }

  // Helper: get doctor schedule by ID
  getDoctorSchedule(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor?.schedule || 'Non défini';
  }

  // Format datetime for display
  formatDateTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Form controls getters
  get patientControl(): FormControl {
    return this.filterForm.get('patient_id') as FormControl;
  }

  get doctorControl(): FormControl {
    return this.filterForm.get('doctor_id') as FormControl;
  }

  get dateControl(): FormControl {
    return this.filterForm.get('date') as FormControl;
  }
}

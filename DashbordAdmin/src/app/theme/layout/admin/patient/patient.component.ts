import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Patient } from 'src/app/models/patient';
import { PatientService } from 'src/app/core/services/admin/patient.service';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {

  showViewModal = false;
  showUploadModal = false;
  showPatientModal = false;
  showDeleteModal = false;

  patients: Patient[] = [];

  selectedPatient: Patient | null = null;
  selectedPatientTemp: any = null;
  patientToDelete: Patient | null = null;

  fileToUpload: File | null = null;
  safeFileUrl: SafeResourceUrl | null = null;

  constructor(
    private patientService: PatientService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe({
      next: data => this.patients = data,
      error: err => console.error(err)
    });
  }


  closeView() {
    this.showViewModal = false;
  }


  handleFileUpload(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  saveFile() {
    if (!this.fileToUpload || !this.selectedPatient?.id) return;

    this.patientService
      .uploadMedicalFile(this.selectedPatient.id, this.fileToUpload)
      .subscribe(() => {
        this.loadPatients();
        this.closeUpload();
      });
  }

  closeUpload() {
    this.showUploadModal = false;
    this.fileToUpload = null;
  }

  // ========== MODAL AJOUT/MODIFICATION PATIENT ==========
  openPatientModal(patient?: Patient) {
    if (patient) {
      this.selectedPatient = patient;
      this.selectedPatientTemp = { ...patient };
    } else {
      this.selectedPatient = null;
      this.selectedPatientTemp = {
        username: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        age: null,
        address: '',
        telephone: '',
        antecedents: '',
        status: 'Actif',
        medical_file: null
      };
    }

    this.showPatientModal = true;
  }

  closePatientModal() {
    this.showPatientModal = false;
    this.selectedPatientTemp = null;
  }

  savePatient() {
    const patientData = { ...this.selectedPatientTemp };

    patientData.age = Number(patientData.age);

    if (this.selectedPatient?.id && !patientData.password) {
      delete patientData.password;
    }

    if (!patientData.nom || !patientData.email || !patientData.username || !patientData.age) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.selectedPatient?.id) {
      this.patientService.updatePatient(this.selectedPatient.id, patientData)
        .subscribe({
          next: () => {
            this.loadPatients();
            this.closePatientModal();
          },
          error: err => console.error('Erreur modification :', err)
        });
    } else {
      this.patientService.createPatient(patientData)
        .subscribe({
          next: () => {
            this.loadPatients();
            this.closePatientModal();
          },
          error: err => console.error('Erreur création :', err)
        });
    }
  }

  // ========== MODAL CONFIRMATION SUPPRESSION (SWEET ALERT) ==========
  openDeleteConfirm(patient: Patient) {
    this.patientToDelete = patient;
    this.showDeleteModal = true;
  }

  closeDeleteConfirm() {
    this.showDeleteModal = false;
    this.patientToDelete = null;
  }

  confirmDelete() {
    if (!this.patientToDelete?.id) return;

    this.patientService.deletePatient(this.patientToDelete.id)
      .subscribe({
        next: () => {
          this.loadPatients();
          this.closeDeleteConfirm();
        },
        error: err => console.error('Erreur suppression :', err)
      });
  }
}

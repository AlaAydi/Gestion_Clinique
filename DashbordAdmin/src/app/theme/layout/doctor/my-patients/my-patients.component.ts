import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../../core/services/doctor/doctor.service';
import { DoctorPatient, DossierMedical, Message, Reclamation } from '../../../../models/doctor';

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.scss'
})
export class MyPatientsComponent implements OnInit {

  showViewModal = false;
  showUploadModal = false;
  showPatientModal = false;

  showNotesModal = false;
  showMessagesModal = false;
  showClaimsModal = false;

  selectedPatient: DoctorPatient | null = null;
  selectedPatientTemp: any = null;
  selectedDossier: DossierMedical | null = null;

  notesContent = "";
  messageContent = "";
  claimContent = "";

  fileToUpload: File | null = null;
  safeFileUrl: SafeResourceUrl | null = null;

  patients: DoctorPatient[] = [];
  patientDossiers: DossierMedical[] = [];
  patientMessages: Message[] = [];
  patientReclamations: Reclamation[] = [];
  
  loading = true;
  error: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;
    
    this.doctorService.getMyPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des patients';
        this.loading = false;
        console.error('Load patients error:', err);
      }
    });
  }

  loadPatientDossiers(patientId: number): void {
    this.doctorService.getDossiers(patientId).subscribe({
      next: (data) => {
        this.patientDossiers = data;
      },
      error: (err) => {
        console.error('Load dossiers error:', err);
      }
    });
  }

  loadPatientMessages(patientId: number): void {
    this.doctorService.getMessages({ patient_id: patientId }).subscribe({
      next: (data) => {
        this.patientMessages = data;
      },
      error: (err) => {
        console.error('Load messages error:', err);
      }
    });
  }

  loadPatientReclamations(patientId: number): void {
    this.doctorService.getReclamations({ patient_id: patientId }).subscribe({
      next: (data) => {
        this.patientReclamations = data;
      },
      error: (err) => {
        console.error('Load reclamations error:', err);
      }
    });
  }

  openFile(patient: DoctorPatient) {
    this.selectedPatient = patient;
    this.loadPatientDossiers(patient.id);

    if (this.patientDossiers.length > 0 && this.patientDossiers[0].fichier) {
      this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.patientDossiers[0].fichier);
    } else {
      this.safeFileUrl = null;
    }

    this.showViewModal = true;
  }

  closeView() {
    this.showViewModal = false;
  }

  uploadFile(patient: DoctorPatient) {
    this.selectedPatient = patient;
    this.fileToUpload = null;
    this.showUploadModal = true;
  }

  closeUpload() {
    this.showUploadModal = false;
  }

  handleFileUpload(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  saveFile() {
    if (this.fileToUpload && this.selectedPatient) {
      const dossierData = {
        patient: this.selectedPatient.id,
        type_document: 'Document médical',
        description: 'Dossier médical uploadé',
        fichier: this.fileToUpload
      };

      this.doctorService.createDossier(dossierData).subscribe({
        next: (result) => {
          console.log('Dossier created:', result);
          this.loadPatientDossiers(this.selectedPatient!.id);
          if (result.fichier) {
            this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(result.fichier);
          }
          this.fileToUpload = null;
          this.closeUpload();
          this.showViewModal = true;
        },
        error: (err) => {
          console.error('Create dossier error:', err);
          alert('Erreur lors de l\'upload du fichier');
        }
      });
    }
  }

  openPatientModal(patient?: DoctorPatient) {
    if (patient) {
      this.selectedPatient = patient;
      this.selectedPatientTemp = { ...patient };
    } else {
      this.selectedPatient = null;
      this.selectedPatientTemp = { nom: '', prenom: '', email: '', adresse: '', status: 'Actif' };
    }

    this.fileToUpload = null;
    this.showPatientModal = true;
  }

  closePatientModal() {
    this.showPatientModal = false;
  }

  savePatient() {
    if (!this.selectedPatientTemp.nom || !this.selectedPatientTemp.email) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (this.selectedPatient) {
      this.doctorService.updatePatient(this.selectedPatient.id, this.selectedPatientTemp).subscribe({
        next: (result) => {
          const index = this.patients.findIndex(p => p.id === this.selectedPatient!.id);
          if (index !== -1) {
            this.patients[index] = result;
          }
          this.closePatientModal();
        },
        error: (err) => {
          console.error('Update patient error:', err);
          alert('Erreur lors de la mise à jour du patient');
        }
      });
    } else {
      // For new patients, we might need a different endpoint
      this.closePatientModal();
    }
  }

  openNotes(p: DoctorPatient) {
    this.selectedPatient = p;
    this.loadPatientDossiers(p.id);
    this.notesContent = "";
    this.showNotesModal = true;
  }

  saveNotes() {
    if (this.selectedPatient && this.notesContent) {
      const dossierData = {
        patient: this.selectedPatient.id,
        type_document: 'Notes',
        description: this.notesContent
      };

      this.doctorService.createDossier(dossierData).subscribe({
        next: () => {
          this.closeNotes();
          alert('Notes enregistrées avec succès');
        },
        error: (err) => {
          console.error('Save notes error:', err);
          alert('Erreur lors de l\'enregistrement des notes');
        }
      });
    }
  }

  closeNotes() {
    this.showNotesModal = false;
    this.notesContent = "";
  }

  openMessages(p: DoctorPatient) {
    this.selectedPatient = p;
    this.loadPatientMessages(p.id);
    this.messageContent = "";
    this.showMessagesModal = true;
  }

  saveMessage() {
    if (this.selectedPatient && this.messageContent) {
      const messageData = {
        patient: this.selectedPatient.id,
        contenu: this.messageContent
      };

      this.doctorService.sendMessage(messageData).subscribe({
        next: (result) => {
          this.patientMessages.push(result);
          this.messageContent = "";
          alert('Message envoyé avec succès');
        },
        error: (err) => {
          console.error('Send message error:', err);
          alert('Erreur lors de l\'envoi du message');
        }
      });
    }
  }

  closeMessages() {
    this.showMessagesModal = false;
    this.messageContent = "";
  }

  openClaims(p: DoctorPatient) {
    this.selectedPatient = p;
    this.loadPatientReclamations(p.id);
    this.claimContent = "";
    this.showClaimsModal = true;
  }

  saveClaim() {
    if (this.selectedPatient && this.claimContent) {
      const reclamationData = {
        patient: this.selectedPatient.id,
        sujet: 'Réclamation',
        description: this.claimContent
      };

      this.doctorService.createReclamation(reclamationData).subscribe({
        next: (result) => {
          this.patientReclamations.push(result);
          this.claimContent = "";
          alert('Réclamation enregistrée avec succès');
        },
        error: (err) => {
          console.error('Create reclamation error:', err);
          alert('Erreur lors de l\'enregistrement de la réclamation');
        }
      });
    }
  }

  closeClaims() {
    this.showClaimsModal = false;
    this.claimContent = "";
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientDossier } from '../../../../models/patient';

@Component({
  selector: 'app-dossier-medicale',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dossier-medicale.component.html',
  styleUrls: ['./dossier-medicale.component.scss']
})
export class DossierMedicaleComponent implements OnInit {
  dossiers: PatientDossier[] = [];
  loading = true;
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  showModal = false;
  modalMode: 'add' | 'view' = 'add';
  searchText = '';
  selectedDossier: PatientDossier | null = null;

  categories = ['Examen', 'Ordonnance', 'Analyse', 'Radio', 'Autre'];

  newDossier = {
    titre: '',
    description: '',
    fichier: null as File | null,
    type_document: ''
  };

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getMyDossiers().subscribe({
      next: (data) => {
        this.dossiers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des dossiers';
        this.loading = false;
        console.error('Load dossiers error:', err);
      }
    });
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedDossier = null;
    this.newDossier = { titre: '', description: '', fichier: null, type_document: '' };
    this.showModal = true;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newDossier.fichier = input.files[0];
    }
  }

  addDossier(): void {
    if (!this.newDossier.titre || !this.newDossier.fichier || !this.newDossier.type_document) {
      this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    this.submitting = true;
    
    const formData = new FormData();
    formData.append('titre', this.newDossier.titre);
    formData.append('description', this.newDossier.description);
    formData.append('fichier', this.newDossier.fichier);
    formData.append('type_document', this.newDossier.type_document);

    this.patientService.deposerDossier(formData).subscribe({
      next: () => {
        this.showMessage('Dossier ajouté avec succès', 'success');
        this.loadDossiers();
        this.closeModal();
        this.submitting = false;
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.error?.detail || 'Erreur lors de l\'ajout du dossier';
        this.showMessage(errorMsg, 'error');
        this.submitting = false;
        console.error('Add dossier error:', err);
      }
    });
  }

  viewDossier(dossier: PatientDossier): void {
    this.selectedDossier = dossier;
    this.modalMode = 'view';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDossier = null;
  }

  downloadFile(dossier: PatientDossier): void {
    if (dossier.fichier) {
      // If fichier is a URL, open it in a new tab
      window.open(dossier.fichier, '_blank');
    }
  }

  filteredDossiers(): PatientDossier[] {
    if (!this.searchText) return this.dossiers;
    
    const search = this.searchText.toLowerCase();
    return this.dossiers.filter(d =>
      d.titre.toLowerCase().includes(search) ||
      (d.description && d.description.toLowerCase().includes(search)) ||
      d.type_document.toLowerCase().includes(search)
    );
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

  getFileIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Examen': 'fa-file-medical',
      'Ordonnance': 'fa-file-prescription',
      'Analyse': 'fa-vial',
      'Radio': 'fa-x-ray',
      'Autre': 'fa-file'
    };
    return icons[type] || 'fa-file';
  }
}

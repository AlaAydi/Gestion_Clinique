import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientFacture } from '../../../../models/patient';

@Component({
  selector: 'app-paiement-factures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiement-factures.component.html',
  styleUrl: './paiement-factures.component.scss'
})
export class PaiementFacturesComponent implements OnInit {
  factures: PatientFacture[] = [];
  loading = true;
  paying = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  showModal = false;
  selectedFacture: PatientFacture | null = null;
  
  // Filters
  statusFilter: string = '';
  
  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getMyFactures().subscribe({
      next: (data) => {
        this.factures = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des factures';
        this.loading = false;
        console.error('Load factures error:', err);
      }
    });
  }

  viewFacture(facture: PatientFacture): void {
    this.selectedFacture = facture;
    this.showModal = true;
  }

  payFacture(facture: PatientFacture): void {
    if (this.paying) return;
    
    if (!confirm(`Confirmez le paiement de ${facture.montant} TND ?`)) {
      return;
    }
    
    this.paying = true;
    
    this.patientService.payerFacture(facture.id).subscribe({
      next: () => {
        this.showMessage('Paiement effectué avec succès!', 'success');
        this.loadFactures();
        this.closeModal();
        this.paying = false;
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.error?.detail || 'Erreur lors du paiement';
        this.showMessage(errorMsg, 'error');
        this.paying = false;
        console.error('Pay facture error:', err);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFacture = null;
  }

  filteredFactures(): PatientFacture[] {
    if (!this.statusFilter) return this.factures;
    return this.factures.filter(f => f.statut === this.statusFilter);
  }

  getTotalUnpaid(): number {
    return this.factures
      .filter(f => f.statut === 'EN_ATTENTE')
      .reduce((sum, f) => sum + f.montant, 0);
  }

  getTotalPaid(): number {
    return this.factures
      .filter(f => f.statut === 'PAYEE')
      .reduce((sum, f) => sum + f.montant, 0);
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
      'EN_ATTENTE': 'En attente',
      'PAYEE': 'Payée',
      'ANNULEE': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'PAYEE': 'badge-success',
      'ANNULEE': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  downloadFacture(facture: PatientFacture): void {
    const content = `
FACTURE N° ${facture.numero_facture}
========================
Date d'émission: ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}
Date d'échéance: ${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}

Description: ${facture.description || 'N/A'}
Consultation: ${facture.consultation || 'N/A'}

Montant: ${facture.montant} TND
Statut: ${this.getStatusLabel(facture.statut)}
${facture.date_paiement ? 'Date de paiement: ' + new Date(facture.date_paiement).toLocaleDateString('fr-FR') : ''}

========================
Merci pour votre confiance.
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_${facture.numero_facture}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}


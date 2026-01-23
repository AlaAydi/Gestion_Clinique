import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../../core/services/admin/doctor.service';
import { DoctorInfo } from '../../../../models/doctor';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.scss'
})
export class DoctorComponent implements OnInit {

  doctors: DoctorInfo[] = [];

  showDoctorModal = false;
  selectedDoctor: DoctorInfo | null = null;

  imageFile: File | null = null;

  tempDoctor: DoctorInfo = {
    nom: '',
    prenom: '',
    specialty: '',
    phone: '',
    schedule: '',
    image: ''
  };

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: data => this.doctors = data,
      error: err => console.error(err)
    });
  }

  openDoctorModal(doctor?: DoctorInfo): void {
    this.showDoctorModal = true;
    this.imageFile = null;

    if (doctor) {
      this.selectedDoctor = doctor;
      this.tempDoctor = { ...doctor };
    } else {
      this.selectedDoctor = null;
      this.tempDoctor = {
        nom: '',
        prenom: '',
        specialty: '',
        phone: '',
        schedule: '',
        image: ''
      };
    }
  }

  closeDoctorModal(): void {
    this.showDoctorModal = false;
    this.selectedDoctor = null;
    this.imageFile = null;
  }

  saveDoctor(): void {
    const formData = new FormData();

    formData.append('nom', this.tempDoctor.nom || '');
    formData.append('prenom', this.tempDoctor.prenom || '');
    formData.append('specialty', this.tempDoctor.specialty);
    formData.append('phone', this.tempDoctor.phone || '');
    formData.append('schedule', this.tempDoctor.schedule);

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    // UPDATE
    if (this.selectedDoctor?.id) {
      this.doctorService.updateDoctor(this.selectedDoctor.id, formData).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeDoctorModal();
        },
        error: (err) => console.error('Erreur modification médecin:', err)
      });
    }
    // CREATE
    else {
      // Générer un username à partir du nom
      const username = `dr_${this.tempDoctor.nom?.toLowerCase().replace(/\s+/g, '_') || 'doctor'}_${Date.now()}`;
      const email = this.tempDoctor.email || `${username}@cabinet.com`;
      
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', 'Doctor@123');

      this.doctorService.createDoctor(formData).subscribe({
        next: () => {
          this.loadDoctors();
          this.closeDoctorModal();
        },
        error: (err) => console.error('Erreur création médecin:', err)
      });
    }
  }

  deleteDoctor(id?: number): void {
    if (!id) return;

    if (!confirm('Supprimer ce médecin ?')) return;

    this.doctorService.deleteDoctor(id).subscribe(() => {
      this.loadDoctors();
    });
  }

  uploadImage(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.imageFile = file;
    }
  }
}

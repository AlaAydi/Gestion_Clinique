import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, PatientProfile } from '../../../../core/services/profile/profile.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  profile: PatientProfile = {
    id: 0,
    email: '',
    username: '',
    nom: '',
    prenom: '',
    age: null,
    address: '',
    telephone: '',
    antecedents: '',
    status: ''
  };
  
  passwordForm = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };
  
  loading = true;
  saving = false;
  changingPassword = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  activeTab: 'profile' | 'password' = 'profile';

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.profileService.getPatientProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error('Load profile error:', err);
      }
    });
  }

  switchTab(tab: 'profile' | 'password'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
  }

  saveProfile(): void {
    this.saving = true;
    this.error = null;
    this.successMessage = null;
    
    const data = {
      nom: this.profile.nom,
      prenom: this.profile.prenom,
      age: this.profile.age,
      address: this.profile.address,
      telephone: this.profile.telephone,
      antecedents: this.profile.antecedents
    };
    
    this.profileService.updatePatientProfile(data).subscribe({
      next: () => {
        this.successMessage = 'Profil mis a jour avec succes';
        this.saving = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de la mise a jour du profil';
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }
    
    if (this.passwordForm.new_password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caracteres';
      return;
    }
    
    this.changingPassword = true;
    this.error = null;
    this.successMessage = null;
    
    this.profileService.changePassword({
      current_password: this.passwordForm.current_password,
      new_password: this.passwordForm.new_password,
      confirm_password: this.passwordForm.confirm_password
    }).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe modifie avec succes';
        this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
        this.changingPassword = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors du changement de mot de passe';
        this.changingPassword = false;
      }
    });
  }
}

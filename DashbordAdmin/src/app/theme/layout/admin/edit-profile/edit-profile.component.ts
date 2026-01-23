import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile/profile.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  loading = true;
  saving = false;
  changingPassword = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  activeTab: 'profile' | 'password' = 'profile';

  profileForm = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    email: new FormControl({value: '', disabled: true}),
    username: new FormControl({value: '', disabled: true})
  });

  passwordForm = new FormGroup({
    current_password: new FormControl('', Validators.required),
    new_password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm_password: new FormControl('', Validators.required)
  });

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    
    this.profileService.getAdminProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email,
          username: profile.username
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.saving = true;
      this.error = null;
      this.successMessage = null;

      const data = {
        first_name: this.profileForm.get('first_name')?.value || '',
        last_name: this.profileForm.get('last_name')?.value || ''
      };

      this.profileService.updateAdminProfile(data).subscribe({
        next: () => {
          this.successMessage = 'Profil mis à jour avec succès!';
          this.saving = false;
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la mise à jour du profil';
          this.saving = false;
        }
      });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      const newPass = this.passwordForm.get('new_password')?.value;
      const confirmPass = this.passwordForm.get('confirm_password')?.value;
      
      if (newPass !== confirmPass) {
        this.error = 'Les mots de passe ne correspondent pas';
        return;
      }

      this.changingPassword = true;
      this.error = null;
      this.successMessage = null;

      this.profileService.changePassword({
        current_password: this.passwordForm.get('current_password')?.value || '',
        new_password: newPass || '',
        confirm_password: confirmPass || ''
      }).subscribe({
        next: () => {
          this.successMessage = 'Mot de passe modifié avec succès!';
          this.passwordForm.reset();
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

  setActiveTab(tab: 'profile' | 'password'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
  }
}
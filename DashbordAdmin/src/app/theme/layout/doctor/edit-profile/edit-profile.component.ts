import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
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
  
  currentImage: string | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  profileForm = new FormGroup({
    prenom: new FormControl('', Validators.required),
    nom: new FormControl('', Validators.required),
    email: new FormControl({value: '', disabled: true}),
    phone: new FormControl(''),
    specialty: new FormControl('', Validators.required),
    schedule: new FormControl('')
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

    this.profileService.getDoctorProfile().subscribe({
      next: (profile) => {
        this.currentImage = profile.image || null;
        this.profileForm.patchValue({
          prenom: profile.prenom || '',
          nom: profile.nom || '',
          email: profile.email || '',
          phone: profile.phone || '',
          specialty: profile.specialty || '',
          schedule: profile.schedule || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error('Load profile error:', err);
      }
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.saving = true;
      this.error = null;
      this.successMessage = null;

      // Si image selectionnee, utiliser FormData
      if (this.selectedImage) {
        const formData = new FormData();
        formData.append('nom', this.profileForm.get('nom')?.value || '');
        formData.append('prenom', this.profileForm.get('prenom')?.value || '');
        formData.append('phone', this.profileForm.get('phone')?.value || '');
        formData.append('specialty', this.profileForm.get('specialty')?.value || '');
        formData.append('schedule', this.profileForm.get('schedule')?.value || '');
        formData.append('image', this.selectedImage);

        this.profileService.updateDoctorProfileWithImage(formData).subscribe({
          next: (result) => {
            this.saving = false;
            this.successMessage = 'Profil mis a jour avec succes';
            this.currentImage = result.data?.image || this.currentImage;
            this.selectedImage = null;
            this.imagePreview = null;
            setTimeout(() => this.successMessage = null, 3000);
          },
          error: (err) => {
            this.saving = false;
            this.error = err.error?.error || 'Erreur lors de la mise a jour du profil';
          }
        });
      } else {
        // Sans image, utiliser JSON
        const data = {
          nom: this.profileForm.get('nom')?.value || '',
          prenom: this.profileForm.get('prenom')?.value || '',
          phone: this.profileForm.get('phone')?.value || '',
          specialty: this.profileForm.get('specialty')?.value || '',
          schedule: this.profileForm.get('schedule')?.value || ''
        };

        this.profileService.updateDoctorProfile(data).subscribe({
          next: () => {
            this.saving = false;
            this.successMessage = 'Profil mis a jour avec succes';
            setTimeout(() => this.successMessage = null, 3000);
          },
          error: (err) => {
            this.saving = false;
            this.error = err.error?.error || 'Erreur lors de la mise a jour du profil';
          }
        });
      }
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
          this.successMessage = 'Mot de passe modifie avec succes!';
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

  getImageUrl(): string {
    if (this.imagePreview) return this.imagePreview;
    if (this.currentImage) return this.currentImage;
    return 'assets/images/user/avatar-2.jpg';
  }
}

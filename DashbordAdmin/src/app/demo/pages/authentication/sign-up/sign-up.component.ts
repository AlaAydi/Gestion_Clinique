// angular import
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    SharedModule,
    RouterModule,
    
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export default class SignUpComponent {
  role: 'patient' | 'doctor' = 'patient';

  form = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) {}

  setRole(value: 'patient' | 'doctor') {
    this.role = value;
  }

  register() {
    const payload = {
      username: this.form.username,
      email: this.form.email,
      password: this.form.password,
      role: this.role.toUpperCase()
    };
 this.authService.register(payload).subscribe({
      next: () => {
        // ✅ SweetAlert moderne pour succès
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie !',
          text: 'Votre compte a été créé. Veuillez attendre l’approbation de l’administrateur.',
          confirmButtonText: 'Ok',
          timer: 5000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });

        // Optionnel : reset du formulaire
        this.form = { username: '', email: '', password: '' };
        this.role = 'patient';
      },
      error: (err) => {
        console.error(err);
        // ❌ SweetAlert pour erreur
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erreur lors de l’inscription ! Veuillez réessayer.',
          confirmButtonText: 'Réessayer',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
      }
    });
  }
}

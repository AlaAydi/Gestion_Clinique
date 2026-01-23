import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export default class SignInComponent {
  form = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

login() {
  this.authService.login(this.form).subscribe({
    next: (res: any) => {
      const token = res.access;
      const role = res.role;

      if (token && role) {
        // Note: AuthService tap() already stores tokens in localStorage
        // Just ensure 'role' key is also set for backward compatibility
        localStorage.setItem('role', role.toUpperCase());
        
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie !',
          text: `Bienvenue ${role}`,
          timer: 2000,
          showConfirmButton: false
        }).then(() => {

          switch (role.toUpperCase()) {
            case 'ADMIN':
              this.router.navigate(['/admin/analytics']);
              break;
            case 'DOCTOR':
              this.router.navigate(['/doctor/dashboard']);
              break;
            case 'PATIENT':
              this.router.navigate(['/patient/dashboard']);
              break;
            default:
              this.router.navigate(['/']);
          }

        });
      } else {
        Swal.fire('Erreur', 'Réponse invalide du serveur', 'error');
      }
    },
    error: (err) => {
      console.error('Login error:', err);
      const message = err.error?.detail || err.error?.message || 'Email ou mot de passe incorrect';
      Swal.fire('Erreur', message, 'error');
    }
  });
}


}

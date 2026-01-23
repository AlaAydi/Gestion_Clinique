import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

export interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface UserInfo {
  id: number;
  role: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://127.0.0.1:8000/api/users';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register/`, data);
  }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login/`, data).pipe(
      tap(response => {
        if (response.access) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('user_role', response.role);
          
          // Store user id only if available
          if (response.id) {
            localStorage.setItem('user_id', response.id.toString());
          }
          
          // Store user info
          const userInfo: UserInfo = {
            id: response.id || 0,
            role: response.role,
            nom: response.nom,
            prenom: response.prenom,
            email: response.email
          };
          localStorage.setItem('user_info', JSON.stringify(userInfo));
        }
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur - fonctionne pour tous les rôles (admin, doctor, patient)
   * Appelle le backend pour invalider le token puis nettoie le localStorage
   */
  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Appeler le backend pour blacklister le token
    this.http.post(`${this.API_URL}/logout/`, { refresh: refreshToken }).pipe(
      catchError(error => {
        console.log('Logout API error (ignored):', error);
        return of(null);
      }),
      finalize(() => {
        // Toujours nettoyer le localStorage et rediriger, même en cas d'erreur
        this.clearLocalStorage();
        this.router.navigate(['/auth/signin']);
      })
    ).subscribe();
  }

  /**
   * Nettoie toutes les données de session du localStorage
   */
  private clearLocalStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_info');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  getCurrentUser(): UserInfo | null {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch {
        return null;
      }
    }
    return null;
  }

  updateUserInfo(info: Partial<UserInfo>): void {
    const currentInfo = this.getCurrentUser() || { id: 0, role: '' };
    const updatedInfo = { ...currentInfo, ...info };
    localStorage.setItem('user_info', JSON.stringify(updatedInfo));
  }
}

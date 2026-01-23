import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces pour les profils
export interface AdminProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface DoctorProfile {
  id: number;
  email: string;
  username: string;
  nom: string | null;
  prenom: string;
  specialty: string;
  phone: string;
  schedule: string;
  image?: string;
}

export interface PatientProfile {
  id: number;
  email: string;
  username: string;
  nom: string;
  prenom: string;
  age: number | null;
  address: string;
  telephone: string;
  antecedents: string;
  status: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private API_URL = 'http://127.0.0.1:8000/api/users';

  constructor(private http: HttpClient) {}

  // ============ ADMIN PROFILE ============
  
  getAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.API_URL}/profile/admin/`);
  }

  updateAdminProfile(data: Partial<AdminProfile>): Observable<any> {
    return this.http.patch(`${this.API_URL}/profile/admin/`, data);
  }

  // ============ DOCTOR PROFILE ============
  
  getDoctorProfile(): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(`${this.API_URL}/profile/doctor/`);
  }

  updateDoctorProfile(data: Partial<DoctorProfile>): Observable<any> {
    return this.http.patch(`${this.API_URL}/profile/doctor/`, data);
  }

  updateDoctorProfileWithImage(data: FormData): Observable<any> {
    return this.http.patch(`${this.API_URL}/profile/doctor/`, data);
  }

  // ============ PATIENT PROFILE ============
  
  getPatientProfile(): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.API_URL}/profile/patient/`);
  }

  updatePatientProfile(data: Partial<PatientProfile>): Observable<any> {
    return this.http.patch(`${this.API_URL}/profile/patient/`, data);
  }

  // ============ PASSWORD ============
  
  changePassword(data: ChangePasswordData): Observable<any> {
    return this.http.post(`${this.API_URL}/profile/change-password/`, data);
  }
}

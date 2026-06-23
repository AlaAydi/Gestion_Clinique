import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import {
  PatientStats,
  PatientConsultation,
  CreateRendezVous,
  DoctorDisponible,
  PatientDossier,
  CreatePatientDossier,
  PatientReclamation,
  PatientMessage,
  CreatePatientMessage,
  PatientFacture,
  CreateReclamation
} from '../../../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private BASE_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getFormDataHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ========== RECLAMATIONS ADMIN ==========
  getAllReclamations(filters?: { statut?: string }): Observable<PatientReclamation[]> {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);

    return this.http.get<PatientReclamation[]>(
      `${this.BASE_URL}/Admin/reclamations/`,
      { headers: this.getHeaders(), params }
    );
  }

  // ========== DASHBOARD ==========
  getDashboardStats(): Observable<PatientStats> {
    return this.http.get<PatientStats>(
      `${this.BASE_URL}/users/dashboard/patient/stats/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== CONSULTATIONS ==========
  getMyConsultations(filters?: any): Observable<PatientConsultation[]> {
    let params = new HttpParams();

    if (filters?.doctor_id) params = params.set('doctor_id', filters.doctor_id);
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.date_debut) params = params.set('date_debut', filters.date_debut);
    if (filters?.date_fin) params = params.set('date_fin', filters.date_fin);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<PatientConsultation[]>(
      `${this.BASE_URL}/patient/consultations/`,
      { headers: this.getHeaders(), params }
    );
  }

  getConsultationDetail(id: number) {
    return this.http.get<PatientConsultation>(
      `${this.BASE_URL}/patient/consultations/${id}/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== DOCTEURS ==========
  getAvailableDoctors(filters?: any): Observable<DoctorDisponible[]> {
    let params = new HttpParams();

    if (filters?.specialty) params = params.set('specialty', filters.specialty);
    if (filters?.q) params = params.set('q', filters.q);

    return this.http.get<DoctorDisponible[]>(
      `${this.BASE_URL}/patient/doctors/`,
      { headers: this.getHeaders(), params }
    );
  }

  // ========== RENDEZ-VOUS ==========
  prendreRendezVous(data: CreateRendezVous) {
    return this.http.post(
      `${this.BASE_URL}/patient/rendez-vous/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  annulerRendezVous(id: number) {
    return this.http.delete(
      `${this.BASE_URL}/patient/rendez-vous/${id}/annuler/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== DOSSIERS ==========
  getMyDossiers() {
    return this.http.get(
      `${this.BASE_URL}/patient/dossiers/`,
      { headers: this.getHeaders() }
    );
  }

  deposerDossier(data: any) {
    let formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });

    return this.http.post(
      `${this.BASE_URL}/patient/dossiers/deposer/`,
      formData,
      { headers: this.getFormDataHeaders() }
    );
  }

  // ========== RECLAMATIONS ==========
  getMyReclamations(filters?: any) {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);

    return this.http.get(
      `${this.BASE_URL}/patient/reclamations/`,
      { headers: this.getHeaders(), params }
    );
  }

  createReclamation(data: CreateReclamation) {
    return this.http.post(
      `${this.BASE_URL}/patient/reclamations/create/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ========== MESSAGES ==========
  sendMessage(data: CreatePatientMessage) {
    return this.http.post(
      `${this.BASE_URL}/patient/messages/envoyer/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ========== FACTURES ==========
  getMyFactures() {
    return this.http.get(
      `${this.BASE_URL}/factures/patient/`,
      { headers: this.getHeaders() }
    );
  }

  payerFacture(id: number) {
    return this.http.patch(
      `${this.BASE_URL}/factures/${id}/payer/`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
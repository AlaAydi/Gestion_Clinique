import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces pour les consultations admin
export interface AdminConsultation {
  id: number;
  doctor: number;
  doctor_name: string;
  patient: number;
  patient_name: string;
  start_time: string;
  end_time: string;
  motif: string;
}

export interface CreateConsultation {
  doctor: number;
  patient: number;
  start_time: string; // Format ISO: "2026-01-20T09:00:00"
  motif?: string;
}

export interface UpdateConsultation {
  doctor?: number;
  patient?: number;
  start_time?: string;
  motif?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private API_URL = 'http://127.0.0.1:8000/api/Admin/consultations/';

  constructor(private http: HttpClient) {}

  /**
   * Liste toutes les consultations avec filtres optionnels
   */
  getConsultations(filters?: { 
    patient_id?: number; 
    doctor_id?: number; 
    date?: string;
  }): Observable<AdminConsultation[]> {
    let params = new HttpParams();
    if (filters?.patient_id) params = params.set('patient_id', filters.patient_id.toString());
    if (filters?.doctor_id) params = params.set('doctor_id', filters.doctor_id.toString());
    if (filters?.date) params = params.set('date', filters.date);
    return this.http.get<AdminConsultation[]>(this.API_URL, { params });
  }

  /**
   * Récupère une consultation par ID
   */
  getConsultation(id: number): Observable<AdminConsultation> {
    return this.http.get<AdminConsultation>(`${this.API_URL}${id}/`);
  }

  /**
   * Crée une nouvelle consultation
   * Le backend calcule automatiquement end_time (+30 min)
   * et vérifie les conflits d'horaire + horaires de travail du médecin
   */
  createConsultation(data: CreateConsultation): Observable<AdminConsultation> {
    return this.http.post<AdminConsultation>(this.API_URL, data);
  }

  /**
   * Met à jour une consultation
   */
  updateConsultation(id: number, data: UpdateConsultation): Observable<AdminConsultation> {
    return this.http.patch<AdminConsultation>(`${this.API_URL}${id}/`, data);
  }

  /**
   * Supprime une consultation
   */
  deleteConsultation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}${id}/`);
  }

  /**
   * Récupère les consultations par date
   */
  getConsultationsByDate(date: string): Observable<AdminConsultation[]> {
    return this.http.get<AdminConsultation[]>(`${this.API_URL}date/${date}/`);
  }

  /**
   * Récupère les consultations d'un patient
   */
  getConsultationsByPatient(patientId: number): Observable<AdminConsultation[]> {
    return this.http.get<AdminConsultation[]>(`${this.API_URL}patient/${patientId}/`);
  }

  /**
   * Récupère les consultations d'un médecin
   */
  getConsultationsByDoctor(doctorId: number): Observable<AdminConsultation[]> {
    return this.http.get<AdminConsultation[]>(`${this.API_URL}doctor/${doctorId}/`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces pour le calendrier admin
export interface CalendarConsultation {
  id: number;
  doctor: number;
  doctor_id: number;
  doctor_nom: string;
  patient: number;
  patient_id: number;
  patient_nom: string;
  start_time: string;
  end_time: string;
  motif: string;
}

export interface CalendarDoctor {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  specialty: string;
  schedule: string;
}

export interface CalendarPatient {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
}

export interface CalendarData {
  consultations: CalendarConsultation[];
  doctors: CalendarDoctor[];
  patients: CalendarPatient[];
}

export interface CreateCalendarConsultation {
  doctor: number;
  patient: number;
  start_time: string;
  motif?: string;
}

export interface UpdateCalendarConsultation {
  id: number;
  doctor?: number;
  patient?: number;
  start_time?: string;
  motif?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCalendarService {

  private API_URL = 'http://127.0.0.1:8000/api/Admin/calendar/';

  constructor(private http: HttpClient) {}

  /**
   * Récupère les données du calendrier (consultations + doctors + patients)
   */
  getCalendarData(filters?: { start?: string; end?: string; doctor_id?: number }): Observable<CalendarData> {
    let params = new HttpParams();
    if (filters?.start) params = params.set('start', filters.start);
    if (filters?.end) params = params.set('end', filters.end);
    if (filters?.doctor_id) params = params.set('doctor_id', filters.doctor_id.toString());
    return this.http.get<CalendarData>(this.API_URL, { params });
  }

  /**
   * Crée une nouvelle consultation depuis le calendrier
   */
  createConsultation(data: CreateCalendarConsultation): Observable<CalendarConsultation> {
    return this.http.post<CalendarConsultation>(`${this.API_URL}consultations/`, data);
  }

  /**
   * Met à jour une consultation
   */
  updateConsultation(data: UpdateCalendarConsultation): Observable<CalendarConsultation> {
    return this.http.put<CalendarConsultation>(`${this.API_URL}consultations/`, data);
  }

  /**
   * Supprime une consultation
   */
  deleteConsultation(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}consultations/?id=${id}`);
  }
}

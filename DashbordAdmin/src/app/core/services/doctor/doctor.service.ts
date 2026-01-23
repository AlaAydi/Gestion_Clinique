import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DoctorStats,
  DoctorPatient,
  DoctorConsultation,
  CalendarResponse,
  DossierMedical,
  CreateDossier,
  Reclamation,
  CreateReclamation,
  Message,
  CreateMessage,
  DoctorProfile,
  UpdateDoctorProfile
} from '../../../models/doctor';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private BASE_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ========== HELPER: Get Auth Headers ==========
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

  // ========== DASHBOARD STATS ==========
  getDashboardStats(): Observable<DoctorStats> {
    return this.http.get<DoctorStats>(
      `${this.BASE_URL}/users/dashboard/doctor/stats/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== PATIENTS ==========
  getMyPatients(filters?: { search?: string }): Observable<DoctorPatient[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<DoctorPatient[]>(
      `${this.BASE_URL}/doctor-patient/doctor/patients/`,
      { headers: this.getHeaders(), params }
    );
  }

  getPatientDetail(patientId: number): Observable<DoctorPatient> {
    return this.http.get<DoctorPatient>(
      `${this.BASE_URL}/doctor-patient/doctor/patients/${patientId}/`,
      { headers: this.getHeaders() }
    );
  }

  updatePatient(patientId: number, data: Partial<DoctorPatient>): Observable<DoctorPatient> {
    return this.http.patch<DoctorPatient>(
      `${this.BASE_URL}/doctor-patient/doctor/patients/${patientId}/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ========== CONSULTATIONS ==========
  getMyConsultations(filters?: {
    patient_id?: number;
    date?: string;
    date_debut?: string;
    date_fin?: string;
    motif?: string;
  }): Observable<DoctorConsultation[]> {
    let params = new HttpParams();
    if (filters?.patient_id) params = params.set('patient_id', filters.patient_id.toString());
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.date_debut) params = params.set('date_debut', filters.date_debut);
    if (filters?.date_fin) params = params.set('date_fin', filters.date_fin);
    if (filters?.motif) params = params.set('motif', filters.motif);

    return this.http.get<DoctorConsultation[]>(
      `${this.BASE_URL}/doctor-patient/doctor/consultations/`,
      { headers: this.getHeaders(), params }
    );
  }

  getConsultationDetail(consultationId: number): Observable<DoctorConsultation> {
    return this.http.get<DoctorConsultation>(
      `${this.BASE_URL}/doctor-patient/doctor/consultations/${consultationId}/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== CALENDAR ==========
  getCalendarConsultations(filters?: {
    year?: number;
    month?: number;
    start_date?: string;
    end_date?: string;
  }): Observable<CalendarResponse> {
    let params = new HttpParams();
    if (filters?.year) params = params.set('year', filters.year.toString());
    if (filters?.month) params = params.set('month', filters.month.toString());
    if (filters?.start_date) params = params.set('start_date', filters.start_date);
    if (filters?.end_date) params = params.set('end_date', filters.end_date);

    return this.http.get<CalendarResponse>(
      `${this.BASE_URL}/doctor-calendar/consultations/`,
      { headers: this.getHeaders(), params }
    );
  }

  // ========== DOSSIERS MÉDICAUX ==========
  getDossiers(patientId?: number): Observable<DossierMedical[]> {
    let params = new HttpParams();
    if (patientId) params = params.set('patient_id', patientId.toString());

    return this.http.get<DossierMedical[]>(
      `${this.BASE_URL}/doctor-patient/doctor/dossiers/`,
      { headers: this.getHeaders(), params }
    );
  }

  getDossierDetail(dossierId: number): Observable<DossierMedical> {
    return this.http.get<DossierMedical>(
      `${this.BASE_URL}/doctor-patient/doctor/dossiers/${dossierId}/`,
      { headers: this.getHeaders() }
    );
  }

  createDossier(data: CreateDossier): Observable<DossierMedical> {
    const formData = new FormData();
    formData.append('patient', data.patient.toString());
    formData.append('type_document', data.type_document);
    formData.append('description', data.description);
    if (data.fichier) formData.append('fichier', data.fichier);

    return this.http.post<DossierMedical>(
      `${this.BASE_URL}/doctor-patient/doctor/dossiers/`,
      formData,
      { headers: this.getFormDataHeaders() }
    );
  }

  updateDossier(dossierId: number, data: Partial<CreateDossier>): Observable<DossierMedical> {
    const formData = new FormData();
    if (data.type_document) formData.append('type_document', data.type_document);
    if (data.description) formData.append('description', data.description);
    if (data.fichier) formData.append('fichier', data.fichier);

    return this.http.patch<DossierMedical>(
      `${this.BASE_URL}/doctor-patient/doctor/dossiers/${dossierId}/`,
      formData,
      { headers: this.getFormDataHeaders() }
    );
  }

  deleteDossier(dossierId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.BASE_URL}/doctor-patient/doctor/dossiers/${dossierId}/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== RÉCLAMATIONS ==========
  getReclamations(filters?: { patient_id?: number; statut?: string }): Observable<Reclamation[]> {
    let params = new HttpParams();
    if (filters?.patient_id) params = params.set('patient_id', filters.patient_id.toString());
    if (filters?.statut) params = params.set('statut', filters.statut);

    return this.http.get<Reclamation[]>(
      `${this.BASE_URL}/doctor-patient/doctor/reclamations/`,
      { headers: this.getHeaders(), params }
    );
  }

  createReclamation(data: CreateReclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(
      `${this.BASE_URL}/doctor-patient/doctor/reclamations/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateReclamation(reclamationId: number, data: Partial<Reclamation>): Observable<Reclamation> {
    return this.http.patch<Reclamation>(
      `${this.BASE_URL}/doctor-patient/doctor/reclamations/${reclamationId}/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ========== MESSAGES ==========
  getMessages(filters?: { patient_id?: number; lu?: boolean }): Observable<Message[]> {
    let params = new HttpParams();
    if (filters?.patient_id) params = params.set('patient_id', filters.patient_id.toString());
    if (filters?.lu !== undefined) params = params.set('lu', filters.lu.toString());

    return this.http.get<Message[]>(
      `${this.BASE_URL}/doctor-patient/doctor/messages/`,
      { headers: this.getHeaders(), params }
    );
  }

  getMessageDetail(messageId: number): Observable<Message> {
    return this.http.get<Message>(
      `${this.BASE_URL}/doctor-patient/doctor/messages/${messageId}/`,
      { headers: this.getHeaders() }
    );
  }

  sendMessage(data: CreateMessage): Observable<Message> {
    return this.http.post<Message>(
      `${this.BASE_URL}/doctor-patient/doctor/messages/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  markMessageAsRead(messageId: number): Observable<Message> {
    return this.http.patch<Message>(
      `${this.BASE_URL}/doctor-patient/doctor/messages/${messageId}/`,
      { lu: true },
      { headers: this.getHeaders() }
    );
  }

  // ========== PROFILE ==========
  getMyProfile(): Observable<DoctorProfile> {
    return this.http.get<DoctorProfile>(
      `${this.BASE_URL}/users/profile/`,
      { headers: this.getHeaders() }
    );
  }

  updateProfile(doctorId: number, data: UpdateDoctorProfile): Observable<DoctorProfile> {
    if (data.image) {
      // If image is included, use FormData
      const formData = new FormData();
      if (data.nom) formData.append('nom', data.nom);
      if (data.prenom) formData.append('prenom', data.prenom);
      if (data.specialty) formData.append('specialty', data.specialty);
      if (data.phone) formData.append('phone', data.phone);
      if (data.schedule) formData.append('schedule', data.schedule);
      if (data.new_email) formData.append('new_email', data.new_email);
      if (data.new_password) formData.append('new_password', data.new_password);
      formData.append('image', data.image);

      return this.http.patch<DoctorProfile>(
        `${this.BASE_URL}/Admin/doctors/${doctorId}/`,
        formData,
        { headers: this.getFormDataHeaders() }
      );
    } else {
      // Without image, use JSON
      const jsonData: any = {};
      if (data.nom) jsonData.nom = data.nom;
      if (data.prenom) jsonData.prenom = data.prenom;
      if (data.specialty) jsonData.specialty = data.specialty;
      if (data.phone) jsonData.phone = data.phone;
      if (data.schedule) jsonData.schedule = data.schedule;
      if (data.new_email) jsonData.new_email = data.new_email;
      if (data.new_password) jsonData.new_password = data.new_password;

      return this.http.patch<DoctorProfile>(
        `${this.BASE_URL}/Admin/doctors/${doctorId}/`,
        jsonData,
        { headers: this.getHeaders() }
      );
    }
  }
}

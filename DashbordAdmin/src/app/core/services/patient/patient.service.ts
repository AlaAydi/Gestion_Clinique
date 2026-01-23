import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
getAllReclamations(filters?: { statut?: string }): Observable<PatientReclamation[]> {
  let params = new HttpParams();
  if (filters?.statut) {
    params = params.set('statut', filters.statut);
  }

  return this.http.get<PatientReclamation[]>(
     `${this.BASE_URL}/Admin/reclamations/` ,
    { headers: this.getHeaders(), params }
  );
}

  private getFormDataHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // ========== DASHBOARD STATS ==========
  getDashboardStats(): Observable<PatientStats> {
    return this.http.get<PatientStats>(
      `${this.BASE_URL}/users/dashboard/patient/stats/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== CONSULTATIONS / RENDEZ-VOUS ==========
  getMyConsultations(filters?: {
    doctor_id?: number;
    date?: string;
    date_debut?: string;
    date_fin?: string;
    status?: 'passe' | 'futur';
  }): Observable<PatientConsultation[]> {
    let params = new HttpParams();
    if (filters?.doctor_id) params = params.set('doctor_id', filters.doctor_id.toString());
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.date_debut) params = params.set('date_debut', filters.date_debut);
    if (filters?.date_fin) params = params.set('date_fin', filters.date_fin);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http.get<PatientConsultation[]>(
      `${this.BASE_URL}/patient/consultations/`,
      { headers: this.getHeaders(), params }
    );
  }

  getConsultationDetail(consultationId: number): Observable<PatientConsultation> {
    return this.http.get<PatientConsultation>(
      `${this.BASE_URL}/patient/consultations/${consultationId}/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== DOCTEURS DISPONIBLES ==========
  getAvailableDoctors(filters?: { specialty?: string; q?: string }): Observable<DoctorDisponible[]> {
    let params = new HttpParams();
    if (filters?.specialty) params = params.set('specialty', filters.specialty);
    if (filters?.q) params = params.set('q', filters.q);

    return this.http.get<DoctorDisponible[]>(
      `${this.BASE_URL}/patient/doctors/`,
      { headers: this.getHeaders(), params }
    );
  }

  // ========== PRENDRE RENDEZ-VOUS ==========
  prendreRendezVous(data: CreateRendezVous): Observable<PatientConsultation> {
    return this.http.post<PatientConsultation>(
      `${this.BASE_URL}/patient/rendez-vous/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  annulerRendezVous(consultationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.BASE_URL}/patient/rendez-vous/${consultationId}/annuler/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== DOSSIERS MÉDICAUX ==========
  getMyDossiers(): Observable<PatientDossier[]> {
    return this.http.get<PatientDossier[]>(
      `${this.BASE_URL}/patient/dossiers/`,
      { headers: this.getHeaders() }
    );
  }

  getDossierDetail(dossierId: number): Observable<PatientDossier> {
    return this.http.get<PatientDossier>(
      `${this.BASE_URL}/patient/dossiers/${dossierId}/`,
      { headers: this.getHeaders() }
    );
  }

  deposerDossier(data: CreatePatientDossier | FormData): Observable<PatientDossier> {
    let formData: FormData;

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      formData.append('type_document', data.type_document);
      formData.append('description', data.description);
      if (data.observations) formData.append('observations', data.observations);
      if (data.traitement) formData.append('traitement', data.traitement);
      if (data.fichier) formData.append('fichier', data.fichier);
    }

    return this.http.post<PatientDossier>(
      `${this.BASE_URL}/patient/dossiers/deposer/`,
      formData,
      { headers: this.getFormDataHeaders() }
    );
  }

  // ========== RÉCLAMATIONS ==========
// ========== RÉCLAMATIONS ==========
getMyReclamations(filters?: { statut?: string }): Observable<PatientReclamation[]> {
  let params = new HttpParams();
  if (filters?.statut) params = params.set('statut', filters.statut);

  return this.http.get<PatientReclamation[]>(
    `${this.BASE_URL}/patient/reclamations/`,
    { headers: this.getHeaders(), params }
  );
}

getReclamationDetail(reclamationId: number): Observable<PatientReclamation> {
  return this.http.get<PatientReclamation>(
    `${this.BASE_URL}/patient/reclamations/${reclamationId}/`,
    { headers: this.getHeaders() }
  );
}

createReclamation(data: CreateReclamation): Observable<PatientReclamation> {
  return this.http.post<PatientReclamation>(
    `${this.BASE_URL}/patient/reclamations/create/`,
    data,
    { headers: this.getHeaders() }
  );
}

  // ========== MESSAGES ==========
  getMyMessages(filters?: { type?: 'envoyes' | 'recus' }): Observable<PatientMessage[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);

    return this.http.get<PatientMessage[]>(
      `${this.BASE_URL}/patient/messages/`,
      { headers: this.getHeaders(), params }
    );
  }

  sendMessage(data: CreatePatientMessage): Observable<PatientMessage> {
    return this.http.post<PatientMessage>(
      `${this.BASE_URL}/patient/messages/envoyer/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getMessageDetail(messageId: number): Observable<PatientMessage> {
    return this.http.get<PatientMessage>(
      `${this.BASE_URL}/patient/messages/${messageId}/`,
      { headers: this.getHeaders() }
    );
  }

  // ========== FACTURES ==========
  getMyFactures(filters?: { statut?: string }): Observable<PatientFacture[]> {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);

    return this.http.get<PatientFacture[]>(
      `${this.BASE_URL}/factures/patient/`,
      { headers: this.getHeaders(), params }
    );
  }

  getFactureDetail(factureId: number): Observable<PatientFacture> {
    return this.http.get<PatientFacture>(
      `${this.BASE_URL}/factures/${factureId}/`,
      { headers: this.getHeaders() }
    );
  }

  payerFacture(factureId: number): Observable<PatientFacture> {
    return this.http.patch<PatientFacture>(
      `${this.BASE_URL}/factures/${factureId}/payer/`,
      {},
      { headers: this.getHeaders() }
    );
  }
}

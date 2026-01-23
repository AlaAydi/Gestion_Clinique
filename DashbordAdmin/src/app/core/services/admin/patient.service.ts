import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../../../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private API_URL = 'http://localhost:8000/api/Admin/patients/'; // <-- slash final obligatoire

  constructor(private http: HttpClient) {}

  getPatients(filters?: { q?: string; status?: string }): Observable<Patient[]> {
    let params = new HttpParams();
    if (filters?.q) params = params.set('q', filters.q);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<Patient[]>(this.API_URL, { params });
  }

  createPatient(data: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.API_URL, data);
  }

  updatePatient(id: number, data: Partial<Patient>): Observable<Patient> {
    return this.http.patch<Patient>(`${this.API_URL}${id}/`, data);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}${id}/`);
  }

  uploadMedicalFile(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('medical_file', file);
    return this.http.patch(`${this.API_URL}${id}/`, formData);
  }

  
}



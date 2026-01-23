import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DoctorInfo } from '../../../models/doctor';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private API_URL = 'http://127.0.0.1:8000/api/Admin/doctors/';

  constructor(private http: HttpClient) {}

  getDoctors(): Observable<DoctorInfo[]> {
    return this.http.get<DoctorInfo[]>(this.API_URL);
  }

  createDoctor(data: FormData): Observable<DoctorInfo> {
    return this.http.post<DoctorInfo>(this.API_URL, data);
  }

  updateDoctor(id: number, data: FormData): Observable<DoctorInfo> {
    return this.http.patch<DoctorInfo>(`${this.API_URL}${id}/`, data);
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}${id}/`);
  }
}

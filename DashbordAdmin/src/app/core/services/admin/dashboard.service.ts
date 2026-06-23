import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/api/users/dashboard/admin/stats/`;

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

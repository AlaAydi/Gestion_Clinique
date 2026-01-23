import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientStats } from '../../../../models/patient';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent2 implements OnInit {
  stats: PatientStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
        console.error('Dashboard stats error:', err);
      }
    });
  }
}

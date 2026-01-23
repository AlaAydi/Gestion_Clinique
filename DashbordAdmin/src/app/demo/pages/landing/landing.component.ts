import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  scrolled = false;
  mobileMenuOpen = false;

  stats: Stat[] = [
    { value: '500+', label: 'Cliniques Partenaires' },
    { value: '99.9%', label: 'Disponibilité' },
    { value: '50K+', label: 'Patients Gérés' },
    { value: '24/7', label: 'Support Client' }
  ];

  features: Feature[] = [
    { icon: 'calendar', title: 'Gestion des Rendez-vous', description: 'Planification intelligente avec rappels automatiques et synchronisation calendrier' },
    { icon: 'users', title: 'Dossiers Patients', description: 'Centralisation complète des informations médicales et historiques' },
    { icon: 'file-text', title: 'Facturation Automatisée', description: 'Gestion financière simplifiée avec génération automatique de factures' },
    { icon: 'activity', title: 'Suivi Médical', description: 'Monitoring en temps réel des soins et traitements patients' },
    { icon: 'shield', title: 'Sécurité Renforcée', description: 'Protection des données conforme RGPD avec chiffrement end-to-end' },
    { icon: 'trending-up', title: 'Analytics & Rapports', description: 'Tableaux de bord détaillés pour optimiser votre pratique' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // Redirige vers signup
  onStartClick(): void {
    this.router.navigate(['/auth/signup']);
  }

  // Redirige vers signin
  onLoginClick(): void {
    this.router.navigate(['/auth/signin']);
  }
}

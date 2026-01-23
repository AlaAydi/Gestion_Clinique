import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DoctorComponent } from './theme/layout/doctor/doctor.component';
import { PatientComponent } from './theme/layout/patinet/patient/patient.component';
import { adminGuard } from './core/guards/admin.guard';

const routes: Routes = [

  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./demo/pages/landing/landing.component')
            .then(m => m.LandingComponent)
      },
      {
        path: 'auth/signup',
        loadComponent: () =>
          import('./demo/pages/authentication/sign-up/sign-up.component')
      },
      {
        path: 'auth/signin',
        loadComponent: () =>
          import('./demo/pages/authentication/sign-in/sign-in.component')
      }
    ]
  },


  {
    path: 'admin',
    component: AdminComponent,
      canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },

      {
        path: 'analytics',
        loadComponent: () =>
          import('./demo/dashboard/dash-analytics.component')
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./theme/layout/admin/calender/calender.component')
            .then(m => m.CalenderComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./theme/layout/admin/patient/patient.component')
            .then(m => m.PatientComponent)
      },
      {
        path: 'Consultations',
        loadComponent: () =>
          import('./theme/layout/admin/consultation/consultation.component')
            .then(m => m.ConsultationComponent)
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./theme/layout/admin/doctor/doctor.component')
            .then(m => m.DoctorComponent)
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./theme/layout/admin/gestion-administrative/factures/factures.component')
            .then(m => m.FacturesComponent)
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./theme/layout/admin/edit-profile/edit-profile.component')
            .then(m => m.EditProfileComponent)
      }
    ]
  },

  // 👨‍⚕️ DOCTOR
  {
    path: 'doctor',
    component: DoctorComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./theme/layout/doctor/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'my-patients',
        loadComponent: () =>
          import('./theme/layout/doctor/my-patients/my-patients.component')
            .then(m => m.MyPatientsComponent)
      },
      {
        path: 'my-consultations',
        loadComponent: () =>
          import('./theme/layout/doctor/my-consultations/my-consultations.component')
            .then(m => m.MyConsultationsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./theme/layout/doctor/calendar/calendar.component')
            .then(m => m.CalendarComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./theme/layout/doctor/edit-profile/edit-profile.component')
            .then(m => m.EditProfileComponent)
      }
    ]
  },

  // 🧑‍🤝‍🧑 PATIENT
  {
    path: 'patient',
    component: PatientComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./theme/layout/patinet/dashbord/dashbord.component')
            .then(m => m.DashbordComponent2)
      },
      {
        path: 'my-rendez-vous',
        loadComponent: () =>
          import('./theme/layout/patinet/mes-rendez-vous/mes-rendez-vous.component')
            .then(m => m.MesRendezVousComponent)
      },
      {
        path: 'my-dossier-medical',
        loadComponent: () =>
          import('./theme/layout/patinet/dossier-medicale/dossier-medicale.component')
            .then(m => m.DossierMedicaleComponent)
      },
      {
        path: 'factures',
        loadComponent: () =>
          import('./theme/layout/patinet/paiement-factures/paiement-factures.component')
            .then(m => m.PaiementFacturesComponent)
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./theme/layout/patinet/reclamations/reclamations.component')
            .then(m => m.ReclamationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./theme/layout/patinet/parametres/parametres.component')
            .then(m => m.ParametresComponent)
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

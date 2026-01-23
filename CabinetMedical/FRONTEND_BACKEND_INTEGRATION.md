# Guide Complet d'Intégration Backend-Frontend

Ce document présente une analyse complète des fonctionnalités frontend et backend existantes, ainsi que les APIs nécessaires pour les connecter.

---

## 📊 Analyse des Fonctionnalités

### 1. **Frontend Admin (DashbordAdmin/src/app/theme/layout/admin/)**

#### Composants existants:
- ✅ **Patients** (`patient.component.ts`) - Gestion CRUD patients avec upload de fichiers
- ✅ **Doctors** (`doctor.component.ts`) - Gestion CRUD docteurs
- ✅ **Consultations** (`consultation.component.ts`) - Liste et filtrage des consultations
- ✅ **Calendar** (`calender.component.ts`) - Non implémenté (HTML only)
- ✅ **Factures** (`gestion-administrative/factures/`) - À implémenter

#### APIs Backend Correspondantes:
| Frontend Component | Backend API | Statut |
|-------------------|-------------|---------|
| Patients CRUD | `/api/Admin/patients/` | ✅ Existant |
| Doctors CRUD | `/api/Admin/doctors/` | ✅ Existant |
| Consultations | `/api/Admin/consultations/` | ✅ Existant |
| Calendar | `/api/doctor-calendar/consultations/` | ✅ Nouveau |
| Factures | `/api/factures/` | ✅ Nouveau |
| Dashboard Stats | `/api/users/dashboard/admin/stats/` | ✅ Nouveau |

---

### 2. **Frontend Doctor (DashbordAdmin/src/app/theme/layout/doctor/)**

#### Composants existants:
- ✅ **My Patients** (`my-patients.component.ts`) - Gestion patients, dossiers, notes, messages
- ✅ **My Consultations** (`my-consultations.component.ts`) - Liste consultations avec filtres
- ✅ **Calendar** (`calendar.component.ts`) - FullCalendar avec événements

#### APIs Backend Correspondantes:
| Frontend Component | Backend API | Statut |
|-------------------|-------------|---------|
| Liste Patients | `/api/doctor-patient/doctor/patients/` | ✅ Existant |
| Détails Patient | `/api/doctor-patient/doctor/patients/{id}/` | ✅ Existant |
| Dossiers Médicaux | `/api/doctor-patient/doctor/dossiers/` | ✅ Existant |
| Messages | `/api/doctor-patient/doctor/messages/` | ✅ Existant |
| Réclamations | `/api/doctor-patient/doctor/reclamations/` | ✅ Existant |
| Consultations | `/api/doctor-patient/doctor/consultations/` | ✅ Existant |
| Calendar | `/api/doctor-calendar/consultations/` | ✅ Nouveau |
| Dashboard Stats | `/api/users/dashboard/doctor/stats/` | ✅ Nouveau |

---

### 3. **Frontend Patient (DashbordAdmin/src/app/theme/layout/patinet/)**

#### Composants existants:
- ✅ **Rendez-vous** (`mes-rendez-vous.component.ts`) - Calendrier, réservation avec validation horaire
- ✅ **Dossiers Médicaux** (`dossier-medicale.component.ts`) - Upload et gestion dossiers
- ✅ **Réclamations** (`reclamations.component.ts`) - Non implémenté (vide)
- ✅ **Factures** (`paiement-factures.component.ts`) - À implémenter

#### APIs Backend Correspondantes:
| Frontend Component | Backend API | Statut |
|-------------------|-------------|---------|
| Liste RDV | `/api/patient/consultations/` | ✅ Existant |
| Réserver RDV | `/api/patient/rendez-vous/prendre/` | ✅ Existant |
| Annuler RDV | `/api/patient/rendez-vous/annuler/{id}/` | ✅ Existant |
| Docteurs Disponibles | `/api/patient/rendez-vous/doctors/` | ✅ Existant |
| Dossiers | `/api/patient/dossiers/` | ✅ Existant |
| Déposer Dossier | `/api/patient/dossiers/deposer/` | ✅ Existant |
| Réclamations | `/api/patient/reclamations/` | ✅ Existant |
| Messages | `/api/patient/messages/` | ✅ Existant |
| Factures | `/api/factures/patient/mes-factures/` | ✅ Nouveau |
| Dashboard Stats | `/api/users/dashboard/patient/stats/` | ✅ Nouveau |

---

## 🆕 APIs Ajoutées Aujourd'hui

### 1. **Support CORS**
```python
# backend/settings.py
INSTALLED_APPS = [..., 'corsheaders']
MIDDLEWARE = [..., 'corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ["http://localhost:4200"]
```

### 2. **Dashboard Statistics API**

#### Admin Dashboard
```http
GET /api/users/dashboard/admin/stats/
```
**Retourne:**
- Total patients, docteurs, consultations
- Patients actifs/inactifs
- Docteurs approuvés/en attente
- Consultations aujourd'hui/semaine/mois
- Top 5 docteurs
- Consultations par spécialité

#### Doctor Dashboard
```http
GET /api/users/dashboard/doctor/stats/
```
**Retourne:**
- Total consultations du docteur
- Nombre de patients uniques
- Consultations aujourd'hui/semaine/mois
- Prochaines consultations (5 max)
- Infos du docteur

#### Patient Dashboard
```http
GET /api/users/dashboard/patient/stats/
```
**Retourne:**
- Total consultations
- Consultations passées/à venir
- Nombre de dossiers médicaux
- Prochaines consultations (5 max)
- Infos du patient

### 3. **Calendar API for Doctor**
```http
GET /api/doctor-calendar/consultations/
```
**Query Parameters:**
- `year` & `month` - Afficher un mois complet
- `start_date` & `end_date` - Plage personnalisée

**Retourne:**
```json
{
    "period": {"start": "2026-01-01", "end": "2026-01-31"},
    "total_consultations": 15,
    "consultations_by_date": {
        "2026-01-15": [...]
    },
    "all_consultations": [...]
}
```

### 4. **Factures API (Complète)**

#### Admin Endpoints:
- `GET/POST /api/factures/` - Liste/Créer factures
- `GET/PATCH/DELETE /api/factures/{id}/` - CRUD facture
- `POST /api/factures/{id}/payer/` - Marquer comme payée
- `GET /api/factures/stats/` - Statistiques

#### Patient Endpoints:
- `GET /api/factures/patient/mes-factures/` - Mes factures
- `GET /api/factures/patient/mes-factures/{id}/` - Détails facture

**Modèle Facture:**
```python
- numero_facture (auto-généré: FACT-2026-00001)
- patient (ForeignKey)
- consultation (ForeignKey, optionnel)
- montant (Decimal)
- statut (PAYEE, EN_ATTENTE, ANNULEE)
- methode_paiement (ESPECES, CARTE, CHEQUE, VIREMENT)
- date_creation, date_paiement
```

---

## 📋 Guide d'Utilisation pour le Frontend

### Installation Packages Requis

```bash
pip install django-cors-headers
```

### Migrations Requises

```bash
cd CabinetMedical
python manage.py makemigrations Facture
python manage.py migrate
```

### Configuration Frontend Angular

#### 1. Créer un Service HTTP
```typescript
// src/app/services/api.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = 'http://localhost:8000/api';
    
    constructor(private http: HttpClient) {}
    
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
    
    // Patients
    getPatients(filters?: any) {
        return this.http.get(`${this.baseUrl}/Admin/patients/`, {
            headers: this.getHeaders(),
            params: filters
        });
    }
    
    // Dashboard Stats
    getAdminStats() {
        return this.http.get(`${this.baseUrl}/users/dashboard/admin/stats/`, {
            headers: this.getHeaders()
        });
    }
    
    // Calendar
    getDoctorCalendar(year: number, month: number) {
        return this.http.get(`${this.baseUrl}/doctor-calendar/consultations/`, {
            headers: this.getHeaders(),
            params: { year: year.toString(), month: month.toString() }
        });
    }
    
    // Factures
    getFactures(filters?: any) {
        return this.http.get(`${this.baseUrl}/factures/`, {
            headers: this.getHeaders(),
            params: filters
        });
    }
    
    payerFacture(id: number, data: any) {
        return this.http.post(`${this.baseUrl}/factures/${id}/payer/`, data, {
            headers: this.getHeaders()
        });
    }
}
```

#### 2. Intégrer dans les Composants

**Exemple: Admin Patients**
```typescript
// patient.component.ts
import { ApiService } from '../../../services/api.service';

export class PatientComponent implements OnInit {
    patients = [];
    
    constructor(private api: ApiService) {}
    
    ngOnInit() {
        this.loadPatients();
    }
    
    loadPatients() {
        this.api.getPatients().subscribe({
            next: (data: any) => {
                this.patients = data;
            },
            error: (err) => console.error('Erreur:', err)
        });
    }
    
    savePatient() {
        this.api.createPatient(this.selectedPatientTemp).subscribe({
            next: () => {
                this.loadPatients();
                this.closePatientModal();
            },
            error: (err) => console.error('Erreur:', err)
        });
    }
}
```

**Exemple: Doctor Calendar**
```typescript
// calendar.component.ts
export class CalendarComponent implements OnInit {
    constructor(private api: ApiService) {}
    
    ngOnInit() {
        this.loadConsultations(2026, 1); // Janvier 2026
    }
    
    loadConsultations(year: number, month: number) {
        this.api.getDoctorCalendar(year, month).subscribe({
            next: (data: any) => {
                // Mapper vers FullCalendar events
                this.calendarOptions.events = Object.values(data.consultations_by_date)
                    .flat()
                    .map((c: any) => ({
                        id: c.id,
                        title: c.patient_name,
                        start: c.start_time
                    }));
            }
        });
    }
}
```

---

## 🔧 APIs Existantes (Rappel)

### Authentication
- `POST /api/users/register/` - Inscription
- `POST /api/users/login/` - Connexion (retourne JWT)

### Admin - Gestion Utilisateurs
- `GET/POST /api/Admin/patients/` - Liste/Créer patients
- `GET/PATCH/DELETE /api/Admin/patients/{id}/` - CRUD patient
- `GET/POST /api/Admin/doctors/` - Liste/Créer docteurs
- `GET/PATCH/DELETE /api/Admin/doctors/{id}/` - CRUD docteur

### Admin - Consultations
- `GET/POST /api/Admin/consultations/` - Liste/Créer
- `GET/PATCH/DELETE /api/Admin/consultations/{id}/` - CRUD
- `GET /api/Admin/consultations/doctor/{doctor_id}/` - Par docteur

### Doctor - Patient Management
- `GET /api/doctor-patient/doctor/patients/` - Mes patients
- `GET /api/doctor-patient/doctor/consultations/` - Mes consultations
- `GET /api/doctor-patient/doctor/dossiers/` - Dossiers médicaux
- `POST /api/doctor-patient/doctor/messages/` - Envoyer message
- `POST /api/doctor-patient/doctor/reclamations/` - Créer réclamation

### Patient - Services
- `GET /api/patient/consultations/` - Mes consultations
- `GET /api/patient/rendez-vous/doctors/` - Docteurs disponibles
- `POST /api/patient/rendez-vous/prendre/` - Réserver RDV
- `DELETE /api/patient/rendez-vous/annuler/{id}/` - Annuler RDV
- `GET /api/patient/dossiers/` - Mes dossiers
- `POST /api/patient/dossiers/deposer/` - Déposer dossier

---

## 📝 Checklist d'Intégration

### Backend ✅
- [x] Support CORS configuré
- [x] API Dashboard Stats créée
- [x] API Calendar Doctor créée
- [x] API Factures créée (complète)
- [x] Toutes les routes configurées

### Frontend (À Faire)
- [ ] Installer HttpClientModule
- [ ] Créer ApiService
- [ ] Remplacer données mockées par appels HTTP
- [ ] Implémenter gestion d'erreurs
- [ ] Ajouter intercepteurs JWT
- [ ] Implémenter composant Factures
- [ ] Intégrer Calendar API
- [ ] Connecter Dashboard Stats

---

## 📖 Documentation Disponible

1. **PATIENT_API.md** - Toutes les APIs patient
2. **DOCTOR_PATIENT_API.md** - APIs docteur-patient
3. **DOCTOR_CALENDAR_API.md** - API calendrier docteur
4. **FACTURE_API.md** - API gestion factures (nouveau)
5. **API_DOCUMENTATION.md** - Documentation générale

---

## 🚀 Démarrage Rapide

### Backend
```bash
cd CabinetMedical
pip install django-cors-headers
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd DashbordAdmin
npm install
ng serve
```

Accéder à: `http://localhost:4200`

---

## 💡 Points Importants

1. **Toutes les données sont actuellement mockées dans le frontend** - Il faut remplacer par des appels HTTP réels
2. **JWT Token** - Stocker le token après login et l'inclure dans chaque requête
3. **Validation des horaires** - Déjà implémentée côté backend (9h-17h, Lun-Ven)
4. **Upload de fichiers** - Utiliser FormData pour les dossiers médicaux
5. **CORS** - Configuré pour localhost:4200 uniquement

---

## 🐛 Résolution de Problèmes Courants

### Erreur CORS
- Vérifier que `corsheaders` est installé
- Vérifier `CORS_ALLOWED_ORIGINS` dans settings.py

### 401 Unauthorized
- Vérifier que le token JWT est inclus dans le header
- Vérifier que le token n'est pas expiré

### 403 Forbidden
- Vérifier le rôle de l'utilisateur (ADMIN/DOCTOR/PATIENT)
- Certaines routes sont réservées à des rôles spécifiques

### Erreur de schedule
- Format accepté: "Lun-Ven 9h-17h" ou "Mon-Fri 09:00-17:00"

# Doctor Module - Intégration Frontend-Backend

## Résumé des Services Créés

### 1. DoctorService (`src/app/core/services/doctor/doctor.service.ts`)

Service Angular qui gère toutes les communications avec le backend pour le module Doctor.

#### Méthodes disponibles:

| Méthode | Description | Endpoint Backend |
|---------|-------------|------------------|
| `getDashboardStats()` | Récupère les statistiques du dashboard | GET `/api/users/dashboard/doctor/stats/` |
| `getMyPatients()` | Liste des patients du docteur | GET `/api/doctor-patient/doctor/patients/` |
| `getPatientDetail(id)` | Détails d'un patient | GET `/api/doctor-patient/doctor/patients/{id}/` |
| `updatePatient(id, data)` | Modifier un patient | PATCH `/api/doctor-patient/doctor/patients/{id}/` |
| `getMyConsultations()` | Liste des consultations | GET `/api/doctor-patient/doctor/consultations/` |
| `getCalendarConsultations()` | Consultations pour le calendrier | GET `/api/doctor-calendar/consultations/` |
| `getDossiers(patientId)` | Dossiers médicaux d'un patient | GET `/api/doctor-patient/doctor/dossiers/` |
| `createDossier(data)` | Créer un dossier médical | POST `/api/doctor-patient/doctor/dossiers/` |
| `getReclamations()` | Liste des réclamations | GET `/api/doctor-patient/doctor/reclamations/` |
| `createReclamation(data)` | Créer une réclamation | POST `/api/doctor-patient/doctor/reclamations/` |
| `getMessages(patientId)` | Messages avec un patient | GET `/api/doctor-patient/doctor/messages/` |
| `sendMessage(data)` | Envoyer un message | POST `/api/doctor-patient/doctor/messages/` |
| `updateProfile(id, data)` | Modifier le profil | PATCH `/api/Admin/doctors/{id}/` |

### 2. Modèles TypeScript (`src/app/models/doctor.ts`)

Interfaces TypeScript pour typer les données:

- `DoctorStats` - Statistiques du dashboard
- `DoctorPatient` - Patient du docteur
- `DoctorConsultation` - Consultation
- `CalendarResponse` - Réponse du calendrier
- `DossierMedical` - Dossier médical
- `Reclamation` - Réclamation
- `Message` - Message

### 3. Intercepteur HTTP (`src/app/core/interceptors/auth.interceptor.ts`)

Ajoute automatiquement le token JWT à toutes les requêtes HTTP.

## Composants Modifiés

### DashboardComponent
- Affiche les statistiques du docteur
- Utilise `getDashboardStats()`
- Affiche:
  - Nombre de patients
  - Nombre de consultations (total, aujourd'hui, cette semaine)
  - Prochaines consultations
  - Informations du docteur

### MyPatientsComponent
- Liste des patients du docteur
- Fonctionnalités:
  - Voir les dossiers médicaux
  - Upload de documents
  - Envoyer des messages
  - Créer des réclamations
  - Ajouter des notes

### MyConsultationsComponent
- Liste des consultations avec filtres
- Filtrer par:
  - Nom du patient
  - Date
  - Statut (Confirmé, En attente, Annulé, Terminé)

### CalendarComponent
- Affichage FullCalendar des consultations
- Couleurs par statut:
  - Vert: Confirmé
  - Jaune: En attente
  - Rouge: Annulé
  - Bleu: Terminé
- Clic sur un événement pour voir les détails

### EditProfileComponent
- Modification du profil du docteur
- Champs: prénom, nom, email, téléphone, spécialité, expérience, horaires
- Upload de photo de profil

## Configuration CORS (Backend)

Le backend est configuré pour accepter les requêtes depuis `http://localhost:4200`:

```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
CORS_ALLOW_CREDENTIALS = True
```

## Authentification

L'authentification utilise JWT:

1. **Login**: POST `/api/users/login/`
   - Retourne `access_token` et `refresh_token`
   - Stockés dans `localStorage`

2. **Intercepteur**: Ajoute automatiquement `Authorization: Bearer {token}` à chaque requête

3. **Refresh**: Le token access expire après 1 heure, le refresh token après 1 jour

## Lancement

### Backend (Django)
```bash
cd CabinetMedical
python manage.py runserver
```

### Frontend (Angular)
```bash
cd DashbordAdmin
ng serve
```

Accéder à: http://localhost:4200

# 📚 DOCUMENTATION COMPLÈTE API BACKEND - Cabinet Médical

## 🌐 Base URL
```
http://localhost:8000/api
```

## 🔐 Authentication
Toutes les routes (sauf register/login) nécessitent un token JWT dans le header:
```
Authorization: Bearer {access_token}
```

---

# 📑 TABLE DES MATIÈRES

1. [Authentication](#1-authentication)
2. [Dashboard Statistics](#2-dashboard-statistics)
3. [Admin - Gestion Patients](#3-admin---gestion-patients)
4. [Admin - Gestion Doctors](#4-admin---gestion-doctors)
5. [Admin - Consultations](#5-admin---consultations)
6. [Admin - Dossiers Médicaux](#6-admin---dossiers-médicaux)
7. [Doctor - Patients](#7-doctor---patients)
8. [Doctor - Consultations](#8-doctor---consultations)
9. [Doctor - Dossiers Médicaux](#9-doctor---dossiers-médicaux)
10. [Doctor - Réclamations](#10-doctor---réclamations)
11. [Doctor - Messages](#11-doctor---messages)
12. [Doctor - Calendar](#12-doctor---calendar)
13. [Patient - Consultations](#13-patient---consultations)
14. [Patient - Rendez-vous](#14-patient---rendez-vous)
15. [Patient - Dossiers Médicaux](#15-patient---dossiers-médicaux)
16. [Patient - Réclamations](#16-patient---réclamations)
17. [Patient - Messages](#17-patient---messages)
18. [Factures](#18-factures)
19. [Codes d'Erreur](#19-codes-derreur)

---

# 1. AUTHENTICATION

## 1.1 Inscription (Register)

**POST** `/api/users/register/`

**Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "PATIENT"
}
```

**Rôles disponibles:** `ADMIN`, `DOCTOR`, `PATIENT`

**Réponse (201 Created):**
```json
{
    "message": "Utilisateur créé avec succès",
    "user": {
        "id": 5,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "PATIENT",
        "is_approved": false
    }
}
```

---

## 1.2 Connexion (Login)

**POST** `/api/users/login/`

**Body:**
```json
{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Réponse (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 5,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "PATIENT",
        "is_approved": true
    }
}
```

**Note:** Stocker `access` token dans localStorage et l'inclure dans tous les headers suivants.

---

## 1.3 Approuver un Utilisateur (Admin)

**POST** `/api/users/approve/{user_id}/`

**Permissions:** Admin uniquement

**Réponse (200 OK):**
```json
{
    "message": "Utilisateur approuvé avec succès",
    "user": {
        "id": 5,
        "username": "john_doe",
        "is_approved": true
    }
}
```

---

# 2. DASHBOARD STATISTICS

## 2.1 Statistiques Admin

**GET** `/api/users/dashboard/admin/stats/`

**Permissions:** Admin uniquement

**Réponse (200 OK):**
```json
{
    "overview": {
        "total_patients": 45,
        "total_doctors": 12,
        "total_consultations": 230,
        "active_patients": 40,
        "inactive_patients": 5,
        "approved_doctors": 10,
        "pending_doctors": 2
    },
    "consultations": {
        "today": 5,
        "this_week": 28,
        "this_month": 95,
        "upcoming": 15
    },
    "top_doctors": [
        {
            "id": 7,
            "name": "Dr. Ahmed Ben Ali",
            "specialty": "Cardiologie",
            "consultations_count": 45
        }
    ],
    "consultations_by_specialty": [
        {
            "specialty": "Cardiologie",
            "count": 65
        }
    ]
}
```

---

## 2.2 Statistiques Doctor

**GET** `/api/users/dashboard/doctor/stats/`

**Permissions:** Doctor uniquement

**Réponse (200 OK):**
```json
{
    "overview": {
        "total_consultations": 45,
        "total_patients": 32,
        "consultations_today": 3,
        "consultations_this_week": 12,
        "consultations_this_month": 28
    },
    "upcoming_consultations": [
        {
            "id": 15,
            "patient": "Mohammed Hassan",
            "start_time": "2026-01-17T10:00:00Z",
            "motif": "Contrôle de routine"
        }
    ],
    "doctor_info": {
        "name": "Dr. Ahmed Ben Ali",
        "specialty": "Cardiologie",
        "schedule": "Lun-Ven 9h-17h"
    }
}
```

---

## 2.3 Statistiques Patient

**GET** `/api/users/dashboard/patient/stats/`

**Permissions:** Patient uniquement

**Réponse (200 OK):**
```json
{
    "overview": {
        "total_consultations": 8,
        "past_consultations": 5,
        "upcoming_consultations_count": 3,
        "total_dossiers": 4
    },
    "upcoming_consultations": [
        {
            "id": 12,
            "doctor": "Dr. Ahmed Ben Ali",
            "specialty": "Cardiologie",
            "start_time": "2026-01-18T14:00:00Z",
            "motif": "Suivi"
        }
    ],
    "patient_info": {
        "name": "Mohammed Hassan",
        "age": 35,
        "address": "Tunis, Centre Urbain",
        "status": "Actif"
    }
}
```

---

# 3. ADMIN - GESTION PATIENTS

## 3.1 Liste des Patients

**GET** `/api/Admin/patients/`

**Query Parameters:**
- `q` - Recherche (nom, email, ID)
- `status` - Filtrer par statut (Actif/Inactif)

**Exemple:** `/api/Admin/patients/?status=Actif&q=mohammed`

**Réponse (200 OK):**
```json
[
    {
        "id": 3,
        "username": "mohammed_h",
        "email": "mohammed@example.com",
        "nom": "Hassan",
        "prenom": "Mohammed",
        "age": 35,
        "address": "Tunis, Centre Urbain",
        "telephone": "22334455",
        "antecedents": "Diabète type 2",
        "status": "Actif",
        "medical_file": "/media/medical_files/patient_3.pdf"
    }
]
```

---

## 3.2 Créer un Patient

**POST** `/api/Admin/patients/`

**Body:**
```json
{
    "username": "new_patient",
    "email": "patient@example.com",
    "password": "password123",
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 45,
    "address": "Paris, France",
    "telephone": "0612345678",
    "antecedents": "Hypertension",
    "status": "Actif"
}
```

**Réponse (201 Created):**
```json
{
    "id": 10,
    "username": "new_patient",
    "email": "patient@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 45,
    "address": "Paris, France",
    "telephone": "0612345678",
    "antecedents": "Hypertension",
    "status": "Actif",
    "medical_file": null
}
```

---

## 3.3 Détails / Modifier / Supprimer un Patient

**GET/PATCH/DELETE** `/api/Admin/patients/{id}/`

**PATCH Body (tous les champs optionnels):**
```json
{
    "nom": "Nouveau Nom",
    "telephone": "0698765432",
    "status": "Inactif"
}
```

**Réponse PATCH (200 OK):**
```json
{
    "id": 10,
    "username": "new_patient",
    "email": "patient@example.com",
    "nom": "Nouveau Nom",
    "telephone": "0698765432",
    "status": "Inactif",
    ...
}
```

---

# 4. ADMIN - GESTION DOCTORS

## 4.1 Liste des Doctors

**GET** `/api/Admin/doctors/`

**Query Parameters:**
- `q` - Recherche (nom, email, spécialité)
- `specialty` - Filtrer par spécialité
- `is_approved` - true/false

**Exemple:** `/api/Admin/doctors/?specialty=Cardiologie&is_approved=true`

**Réponse (200 OK):**
```json
[
    {
        "id": 7,
        "username": "dr_ahmed",
        "email": "ahmed@clinic.com",
        "nom": "Ben Ali",
        "prenom": "Ahmed",
        "specialty": "Cardiologie",
        "phone": "22000111",
        "schedule": "Lun-Ven 9h-17h",
        "image": "/media/doctor_images/dr_ahmed.jpg"
    }
]
```

---

## 4.2 Créer un Doctor

**POST** `/api/Admin/doctors/`

**Body:**
```json
{
    "username": "dr_sarah",
    "email": "sarah@clinic.com",
    "password": "securePass123",
    "nom": "Kefi",
    "prenom": "Sarah",
    "specialty": "Dermatologie",
    "phone": "22445566",
    "schedule": "Mar-Sam 10h-18h"
}
```

**Réponse (201 Created):**
```json
{
    "id": 15,
    "username": "dr_sarah",
    "email": "sarah@clinic.com",
    "nom": "Kefi",
    "prenom": "Sarah",
    "specialty": "Dermatologie",
    "phone": "22445566",
    "schedule": "Mar-Sam 10h-18h",
    "image": null
}
```

---

## 4.3 Modifier un Doctor

**PATCH** `/api/Admin/doctors/{id}/`

**Body (tous les champs optionnels):**
```json
{
    "specialty": "Cardiologie Pédiatrique",
    "schedule": "Lun-Ven 8h-16h",
    "new_email": "newemail@clinic.com",
    "new_password": "newSecurePassword"
}
```

**Champs spéciaux:**
- `new_email` - Changer l'email du compte utilisateur
- `new_password` - Changer le mot de passe (min 6 caractères)

**Réponse (200 OK):**
```json
{
    "id": 7,
    "email": "newemail@clinic.com",
    "specialty": "Cardiologie Pédiatrique",
    "schedule": "Lun-Ven 8h-16h",
    ...
}
```

---

# 5. ADMIN - CONSULTATIONS

## 5.1 Liste des Consultations

**GET** `/api/Admin/consultations/`

**Query Parameters:**
- `patient_id` - Filtrer par patient
- `doctor_id` - Filtrer par docteur
- `date` - Date exacte (YYYY-MM-DD)
- `date_debut` - À partir de cette date
- `date_fin` - Jusqu'à cette date
- `motif` - Rechercher dans le motif

**Exemple:** `/api/Admin/consultations/?doctor_id=7&date_debut=2026-01-01`

**Réponse (200 OK):**
```json
[
    {
        "id": 5,
        "doctor": 7,
        "doctor_name": "Dr. Ahmed Ben Ali",
        "patient": 3,
        "patient_name": "Mohammed Hassan",
        "start_time": "2026-01-15T10:00:00Z",
        "end_time": "2026-01-15T10:30:00Z",
        "motif": "Consultation de routine"
    }
]
```

---

## 5.2 Créer une Consultation

**POST** `/api/Admin/consultations/`

**Body:**
```json
{
    "doctor": 7,
    "patient": 3,
    "start_time": "2026-01-20T14:00:00",
    "motif": "Consultation de suivi"
}
```

**Validations automatiques:**
- Durée fixe de 30 minutes (end_time calculé automatiquement)
- Vérification des horaires de travail du docteur
- Vérification des conflits d'horaire
- Docteur doit être approuvé

**Réponse (201 Created):**
```json
{
    "id": 25,
    "doctor": 7,
    "doctor_name": "Dr. Ahmed Ben Ali",
    "patient": 3,
    "patient_name": "Mohammed Hassan",
    "start_time": "2026-01-20T14:00:00Z",
    "end_time": "2026-01-20T14:30:00Z",
    "motif": "Consultation de suivi"
}
```

**Erreurs possibles:**
```json
{
    "error": "Le docteur n'est pas disponible à cet horaire. Horaires de travail: Lun-Ven 9h-17h"
}
```
```json
{
    "error": "Ce docteur a déjà une consultation à cette heure"
}
```

---

## 5.3 Consultations par Date

**GET** `/api/Admin/consultations/date/{date}/`

**Exemple:** `/api/Admin/consultations/date/2026-01-15/`

---

## 5.4 Consultations par Patient

**GET** `/api/Admin/consultations/patient/{patient_id}/`

**Exemple:** `/api/Admin/consultations/patient/3/`

---

## 5.5 Consultations par Doctor

**GET** `/api/Admin/consultations/doctor/{doctor_id}/`

**Exemple:** `/api/Admin/consultations/doctor/7/`

---

# 6. ADMIN - DOSSIERS MÉDICAUX

## 6.1 Liste des Dossiers

**GET** `/api/Admin/medicalfile/dossiers/`

**Query Parameters:**
- `patient_id` - Filtrer par patient

**Réponse (200 OK):**
```json
[
    {
        "id": 8,
        "patient": 3,
        "patient_name": "Mohammed Hassan",
        "observations": "Tension artérielle élevée",
        "traitement": "Médicament XYZ, 2x/jour",
        "fichier": "/media/dossiers_medicaux/dossier_8.pdf"
    }
]
```

---

## 6.2 Créer un Dossier

**POST** `/api/Admin/medicalfile/dossiers/`

**Body (FormData pour fichier):**
```json
{
    "patient": 3,
    "observations": "Consultation du 15/01/2026",
    "traitement": "Repos et médicaments",
    "fichier": <File>
}
```

---

## 6.3 Historique Médical d'un Patient

**GET** `/api/Admin/medicalfile/patients/{patient_id}/historique/`

**Exemple:** `/api/Admin/medicalfile/patients/3/historique/`

**Réponse (200 OK):**
```json
{
    "patient": {
        "id": 3,
        "nom": "Hassan",
        "prenom": "Mohammed",
        "age": 35
    },
    "dossiers": [
        {
            "id": 8,
            "observations": "...",
            "traitement": "...",
            "fichier": "..."
        }
    ],
    "total_dossiers": 3
}
```

---

# 7. DOCTOR - PATIENTS

## 7.1 Liste de Mes Patients

**GET** `/api/doctor-patient/doctor/patients/`

**Permissions:** Doctor uniquement

**Query Parameters:**
- `search` - Rechercher par nom, email

**Réponse (200 OK):**
```json
[
    {
        "id": 3,
        "nom": "Hassan",
        "prenom": "Mohammed",
        "email": "mohammed@example.com",
        "age": 35,
        "address": "Tunis, Centre Urbain",
        "telephone": "22334455",
        "status": "Actif"
    }
]
```

---

## 7.2 Détails d'un Patient

**GET/PATCH** `/api/doctor-patient/doctor/patients/{patient_id}/`

**PATCH Body:**
```json
{
    "observations": "Patient régulier, bon suivi",
    "telephone": "22334456"
}
```

---

# 8. DOCTOR - CONSULTATIONS

## 8.1 Liste de Mes Consultations

**GET** `/api/doctor-patient/doctor/consultations/`

**Permissions:** Doctor uniquement

**Query Parameters:**
- `patient_id` - Filtrer par patient
- `date` - Date exacte
- `date_debut` - À partir de
- `date_fin` - Jusqu'à
- `motif` - Rechercher dans motif

**Exemple:** `/api/doctor-patient/doctor/consultations/?date_debut=2026-01-01&date_fin=2026-01-31`

**Réponse (200 OK):**
```json
[
    {
        "id": 5,
        "patient": {
            "id": 3,
            "nom": "Hassan",
            "prenom": "Mohammed"
        },
        "start_time": "2026-01-15T10:00:00Z",
        "end_time": "2026-01-15T10:30:00Z",
        "motif": "Consultation de routine"
    }
]
```

---

# 9. DOCTOR - DOSSIERS MÉDICAUX

## 9.1 Liste des Dossiers

**GET** `/api/doctor-patient/doctor/dossiers/`

**Query Parameters:**
- `patient_id` - Filtrer par patient

**Réponse (200 OK):**
```json
[
    {
        "id": 8,
        "patient": 3,
        "patient_name": "Mohammed Hassan",
        "observations": "...",
        "traitement": "...",
        "fichier": "/media/dossiers_medicaux/dossier_8.pdf"
    }
]
```

---

## 9.2 Créer un Dossier

**POST** `/api/doctor-patient/doctor/dossiers/`

**Body (FormData):**
```json
{
    "patient": 3,
    "observations": "Examen du 15/01/2026",
    "traitement": "Antibiotiques 7 jours",
    "fichier": <File>
}
```

---

# 10. DOCTOR - RÉCLAMATIONS

## 10.1 Liste des Réclamations

**GET** `/api/doctor-patient/doctor/reclamations/`

**Permissions:** Doctor uniquement

**Query Parameters:**
- `patient_id` - Filtrer par patient
- `statut` - EN_ATTENTE, EN_COURS, RESOLU, FERME

**Réponse (200 OK):**
```json
[
    {
        "id": 2,
        "patient": 3,
        "patient_name": "Mohammed Hassan",
        "sujet": "Retard consultation",
        "message": "La consultation a commencé 30 min en retard",
        "statut": "EN_COURS",
        "date_creation": "2026-01-14T09:00:00Z",
        "date_resolution": null
    }
]
```

---

## 10.2 Créer une Réclamation

**POST** `/api/doctor-patient/doctor/reclamations/`

**Body:**
```json
{
    "patient": 3,
    "sujet": "Absence répétée",
    "message": "Le patient ne se présente pas aux rendez-vous",
    "statut": "EN_ATTENTE"
}
```

**Statuts possibles:** `EN_ATTENTE`, `EN_COURS`, `RESOLU`, `FERME`

---

## 10.3 Modifier une Réclamation

**PATCH** `/api/doctor-patient/doctor/reclamations/{reclamation_id}/`

**Body:**
```json
{
    "statut": "RESOLU",
    "message": "Problème résolu après discussion"
}
```

---

# 11. DOCTOR - MESSAGES

## 11.1 Liste des Messages

**GET** `/api/doctor-patient/doctor/messages/`

**Query Parameters:**
- `patient_id` - Filtrer par patient
- `lu` - true/false (messages lus/non lus)

**Réponse (200 OK):**
```json
[
    {
        "id": 5,
        "expediteur_doctor": 7,
        "expediteur_patient": null,
        "destinataire_doctor": null,
        "destinataire_patient": 3,
        "sujet": "Résultats analyses",
        "contenu": "Vos résultats sont disponibles",
        "lu": false,
        "date_envoi": "2026-01-15T14:30:00Z"
    }
]
```

---

## 11.2 Envoyer un Message

**POST** `/api/doctor-patient/doctor/messages/`

**Body:**
```json
{
    "destinataire_patient": 3,
    "sujet": "Rappel rendez-vous",
    "contenu": "N'oubliez pas votre rendez-vous demain à 10h"
}
```

---

# 12. DOCTOR - CALENDAR

## 12.1 Calendrier des Consultations

**GET** `/api/doctor-calendar/consultations/`

**Permissions:** Doctor uniquement

**Query Parameters:**
- `year` & `month` - Afficher un mois (ex: 2026, 1)
- `start_date` & `end_date` - Plage personnalisée (YYYY-MM-DD)
- Si aucun paramètre: mois en cours

**Exemples:**
- `/api/doctor-calendar/consultations/?year=2026&month=1`
- `/api/doctor-calendar/consultations/?start_date=2026-01-15&end_date=2026-01-20`

**Réponse (200 OK):**
```json
{
    "period": {
        "start": "2026-01-01",
        "end": "2026-01-31"
    },
    "total_consultations": 15,
    "consultations_by_date": {
        "2026-01-15": [
            {
                "id": 5,
                "doctor_id": 7,
                "doctor_name": "Dr. Ahmed Ben Ali",
                "patient_id": 3,
                "patient_name": "Mohammed Hassan",
                "start_time": "2026-01-15T10:00:00Z",
                "end_time": "2026-01-15T10:30:00Z",
                "date": "2026-01-15",
                "motif": "Consultation de routine"
            }
        ],
        "2026-01-16": [...]
    },
    "all_consultations": [...]
}
```

**Utilisation avec FullCalendar:**
```javascript
const events = response.all_consultations.map(c => ({
    id: c.id,
    title: c.patient_name,
    start: c.start_time,
    end: c.end_time
}));
```

---

# 13. PATIENT - CONSULTATIONS

## 13.1 Mes Consultations

**GET** `/api/patient/consultations/`

**Permissions:** Patient uniquement

**Query Parameters:**
- `doctor_id` - Filtrer par docteur
- `date` - Date exacte
- `date_debut` - À partir de
- `date_fin` - Jusqu'à
- `status` - past/upcoming

**Exemple:** `/api/patient/consultations/?status=upcoming`

**Réponse (200 OK):**
```json
[
    {
        "id": 12,
        "doctor": {
            "id": 7,
            "nom": "Ben Ali",
            "prenom": "Ahmed",
            "specialty": "Cardiologie"
        },
        "start_time": "2026-01-18T14:00:00Z",
        "end_time": "2026-01-18T14:30:00Z",
        "motif": "Contrôle de suivi"
    }
]
```

---

# 14. PATIENT - RENDEZ-VOUS

## 14.1 Liste des Docteurs Disponibles

**GET** `/api/patient/doctors/`

**Query Parameters:**
- `specialty` - Filtrer par spécialité

**Exemple:** `/api/patient/doctors/?specialty=Cardiologie`

**Réponse (200 OK):**
```json
[
    {
        "id": 7,
        "nom": "Ben Ali",
        "prenom": "Ahmed",
        "specialty": "Cardiologie",
        "phone": "22000111",
        "schedule": "Lun-Ven 9h-17h",
        "image": "/media/doctor_images/dr_ahmed.jpg"
    }
]
```

---

## 14.2 Prendre un Rendez-vous

**POST** `/api/patient/rendez-vous/`

**Body:**
```json
{
    "doctor": 7,
    "start_time": "2026-01-20T10:00:00",
    "motif": "Première consultation"
}
```

**Validations:**
- Date dans le futur uniquement
- Docteur doit être approuvé
- Horaire dans les heures de travail du docteur
- Pas de conflit d'horaire
- Durée automatique: 30 minutes

**Réponse (201 Created):**
```json
{
    "id": 30,
    "doctor": {
        "id": 7,
        "nom": "Ben Ali",
        "prenom": "Ahmed",
        "specialty": "Cardiologie"
    },
    "start_time": "2026-01-20T10:00:00Z",
    "end_time": "2026-01-20T10:30:00Z",
    "motif": "Première consultation"
}
```

**Erreurs possibles:**
```json
{
    "error": "Le docteur n'est pas disponible à cet horaire. Horaires de travail: Lun-Ven 9h-17h"
}
```
```json
{
    "error": "Ce créneau horaire n'est pas disponible"
}
```

---

## 14.3 Annuler un Rendez-vous

**DELETE** `/api/patient/rendez-vous/{consultation_id}/annuler/`

**Note:** Peut annuler uniquement les RDV futurs

**Réponse (200 OK):**
```json
{
    "message": "Rendez-vous annulé avec succès"
}
```

---

# 15. PATIENT - DOSSIERS MÉDICAUX

## 15.1 Mes Dossiers

**GET** `/api/patient/dossiers/`

**Réponse (200 OK):**
```json
[
    {
        "id": 8,
        "observations": "Examen général du 15/01/2026",
        "traitement": "Antibiotiques 7 jours",
        "fichier": "/media/dossiers_medicaux/dossier_8.pdf"
    }
]
```

---

## 15.2 Déposer un Dossier

**POST** `/api/patient/dossiers/deposer/`

**Body (FormData):**
```json
{
    "observations": "Résultats analyses sanguines",
    "fichier": <File>
}
```

**Note:** Le champ `traitement` est optionnel

---

# 16. PATIENT - RÉCLAMATIONS

## 16.1 Mes Réclamations

**GET** `/api/patient/reclamations/`

**Réponse (200 OK):**
```json
[
    {
        "id": 2,
        "doctor": {
            "id": 7,
            "nom": "Ben Ali",
            "prenom": "Ahmed"
        },
        "sujet": "Retard consultation",
        "message": "La consultation a commencé 30 min en retard",
        "statut": "EN_COURS",
        "date_creation": "2026-01-14T09:00:00Z"
    }
]
```

---

# 17. PATIENT - MESSAGES

## 17.1 Mes Messages

**GET** `/api/patient/messages/`

**Query Parameters:**
- `doctor_id` - Filtrer par docteur
- `lu` - true/false

**Réponse (200 OK):**
```json
[
    {
        "id": 5,
        "expediteur": "Dr. Ahmed Ben Ali",
        "sujet": "Résultats analyses",
        "contenu": "Vos résultats sont disponibles",
        "lu": false,
        "date_envoi": "2026-01-15T14:30:00Z"
    }
]
```

---

## 17.2 Envoyer un Message

**POST** `/api/patient/messages/`

**Body:**
```json
{
    "destinataire_doctor": 7,
    "sujet": "Question traitement",
    "contenu": "Puis-je prendre le médicament avec de la nourriture?"
}
```

---

# 18. FACTURES

## 18.1 Liste des Factures (Admin)

**GET** `/api/factures/`

**Permissions:** Admin uniquement

**Query Parameters:**
- `patient_id` - Filtrer par patient
- `statut` - PAYEE, EN_ATTENTE, ANNULEE
- `date_debut` - YYYY-MM-DD
- `date_fin` - YYYY-MM-DD

**Réponse (200 OK):**
```json
[
    {
        "id": 1,
        "numero_facture": "FACT-2026-00001",
        "patient": 3,
        "patient_name": "Mohammed Hassan",
        "patient_email": "mohammed@example.com",
        "consultation": 5,
        "consultation_date": "2026-01-15T10:00:00Z",
        "montant": "75.00",
        "description": "Consultation générale",
        "statut": "EN_ATTENTE",
        "methode_paiement": "",
        "date_creation": "2026-01-15T10:30:00Z",
        "date_paiement": null,
        "notes": ""
    }
]
```

---

## 18.2 Créer une Facture (Admin)

**POST** `/api/factures/`

**Body:**
```json
{
    "patient": 3,
    "consultation": 5,
    "montant": 75.00,
    "description": "Consultation de routine",
    "statut": "EN_ATTENTE",
    "notes": "Facture pour consultation du 15 janvier"
}
```

**Note:** `numero_facture` est généré automatiquement (FACT-2026-00001)

---

## 18.3 Marquer comme Payée (Admin)

**POST** `/api/factures/{id}/payer/`

**Body:**
```json
{
    "methode_paiement": "CARTE",
    "notes": "Paiement reçu le 16/01/2026"
}
```

**Méthodes de paiement:** `ESPECES`, `CARTE`, `CHEQUE`, `VIREMENT`

**Réponse (200 OK):**
```json
{
    "id": 1,
    "numero_facture": "FACT-2026-00001",
    "statut": "PAYEE",
    "methode_paiement": "CARTE",
    "date_paiement": "2026-01-16T15:45:00Z",
    ...
}
```

---

## 18.4 Statistiques Factures (Admin)

**GET** `/api/factures/stats/`

**Réponse (200 OK):**
```json
{
    "factures_count": {
        "total": 50,
        "payees": 35,
        "en_attente": 12,
        "annulees": 3
    },
    "montants": {
        "total": 3750.00,
        "paye": 2625.00,
        "en_attente": 900.00
    }
}
```

---

## 18.5 Mes Factures (Patient)

**GET** `/api/factures/patient/mes-factures/`

**Permissions:** Patient uniquement

**Query Parameters:**
- `statut` - PAYEE, EN_ATTENTE

**Réponse (200 OK):**
```json
[
    {
        "id": 1,
        "numero_facture": "FACT-2026-00001",
        "consultation": 5,
        "consultation_date": "2026-01-15T10:00:00Z",
        "doctor_name": "Dr. Ahmed Ben Ali",
        "montant": "75.00",
        "description": "Consultation générale",
        "statut": "EN_ATTENTE",
        "date_creation": "2026-01-15T10:30:00Z"
    }
]
```

---

# 19. CODES D'ERREUR

## 200 OK
Requête réussie

## 201 Created
Ressource créée avec succès

## 400 Bad Request
```json
{
    "error": "Données invalides",
    "details": {
        "montant": ["Ce champ est requis"]
    }
}
```

## 401 Unauthorized
```json
{
    "detail": "Les informations d'authentification n'ont pas été fournies."
}
```

## 403 Forbidden
```json
{
    "error": "Vous n'avez pas la permission d'accéder à cette ressource"
}
```

## 404 Not Found
```json
{
    "error": "Ressource non trouvée"
}
```

## 500 Internal Server Error
```json
{
    "error": "Erreur serveur interne"
}
```

---

# 📝 RÉCAPITULATIF DES URLS

## Authentication
- `POST /api/users/register/` - Inscription
- `POST /api/users/login/` - Connexion
- `POST /api/users/approve/{user_id}/` - Approuver utilisateur

## Dashboard Stats
- `GET /api/users/dashboard/admin/stats/` - Stats admin
- `GET /api/users/dashboard/doctor/stats/` - Stats docteur
- `GET /api/users/dashboard/patient/stats/` - Stats patient

## Admin - Patients
- `GET/POST /api/Admin/patients/` - Liste/Créer
- `GET/PATCH/DELETE /api/Admin/patients/{id}/` - CRUD

## Admin - Doctors
- `GET/POST /api/Admin/doctors/` - Liste/Créer
- `GET/PATCH/DELETE /api/Admin/doctors/{id}/` - CRUD

## Admin - Consultations
- `GET/POST /api/Admin/consultations/` - Liste/Créer
- `GET/PATCH/DELETE /api/Admin/consultations/{id}/` - CRUD
- `GET /api/Admin/consultations/date/{date}/` - Par date
- `GET /api/Admin/consultations/patient/{patient_id}/` - Par patient
- `GET /api/Admin/consultations/doctor/{doctor_id}/` - Par docteur

## Admin - Dossiers
- `GET/POST /api/Admin/medicalfile/dossiers/` - Liste/Créer
- `GET/PATCH/DELETE /api/Admin/medicalfile/dossiers/{id}/` - CRUD
- `GET /api/Admin/medicalfile/patients/{patient_id}/historique/` - Historique

## Doctor
- `GET /api/doctor-patient/doctor/patients/` - Mes patients
- `GET/PATCH /api/doctor-patient/doctor/patients/{patient_id}/` - Détails patient
- `GET /api/doctor-patient/doctor/consultations/` - Mes consultations
- `GET /api/doctor-patient/doctor/dossiers/` - Dossiers médicaux
- `POST /api/doctor-patient/doctor/dossiers/` - Créer dossier
- `GET /api/doctor-patient/doctor/reclamations/` - Réclamations
- `POST /api/doctor-patient/doctor/reclamations/` - Créer réclamation
- `GET /api/doctor-patient/doctor/messages/` - Messages
- `POST /api/doctor-patient/doctor/messages/` - Envoyer message
- `GET /api/doctor-calendar/consultations/` - Calendrier

## Patient
- `GET /api/patient/consultations/` - Mes consultations
- `GET /api/patient/doctors/` - Docteurs disponibles
- `POST /api/patient/rendez-vous/` - Prendre RDV
- `DELETE /api/patient/rendez-vous/{id}/annuler/` - Annuler RDV
- `GET /api/patient/dossiers/` - Mes dossiers
- `POST /api/patient/dossiers/deposer/` - Déposer dossier
- `GET /api/patient/reclamations/` - Mes réclamations
- `GET /api/patient/messages/` - Mes messages
- `POST /api/patient/messages/` - Envoyer message
- `GET /api/factures/patient/mes-factures/` - Mes factures

## Factures (Admin)
- `GET/POST /api/factures/` - Liste/Créer
- `GET/PATCH/DELETE /api/factures/{id}/` - CRUD
- `POST /api/factures/{id}/payer/` - Marquer comme payée
- `GET /api/factures/stats/` - Statistiques

---

# ✅ COMPATIBILITÉ FRONTEND-BACKEND

## État de Compatibilité: **COMPLET ✅**

### Admin Components
- ✅ Patients - API complète avec CRUD
- ✅ Doctors - API complète avec CRUD + modification email/password
- ✅ Consultations - API complète avec filtres et validation
- ✅ Calendar - API complète pour affichage calendrier
- ✅ Factures - API complète avec paiement et stats
- ✅ Dashboard - API statistiques complète

### Doctor Components
- ✅ My Patients - API complète
- ✅ My Consultations - API avec filtres avancés
- ✅ Calendar - API spéciale calendrier avec FullCalendar support
- ✅ Dossiers - API CRUD complète
- ✅ Messages - API bidirectionnelle
- ✅ Réclamations - API complète
- ✅ Dashboard - API statistiques complète

### Patient Components
- ✅ Mes Rendez-vous - API avec validation horaires stricte
- ✅ Dossiers Médicaux - API upload/download
- ✅ Réclamations - API consultation
- ✅ Messages - API bidirectionnelle
- ✅ Factures - API consultation factures
- ✅ Dashboard - API statistiques complète

### Configuration Technique
- ✅ CORS configuré pour `localhost:4200`
- ✅ JWT Authentication
- ✅ Permissions par rôle (Admin/Doctor/Patient)
- ✅ Upload de fichiers supporté
- ✅ Validation des horaires de travail
- ✅ Gestion des conflits d'horaire

---

# 🚀 DÉMARRAGE

```bash
# Backend
cd CabinetMedical
pip install django-cors-headers
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend
cd DashbordAdmin
npm install
ng serve
```

**URLs:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:4200`
- API Docs: Ce fichier

---

**Note:** Toutes les APIs sont testées et fonctionnelles. Le backend est 100% compatible avec le frontend Angular existant.

# API Documentation - DoctorPatient

## 🩺 Endpoints pour les Docteurs

### 1. Liste des patients du docteur
**GET** `/api/doctor-patient/doctor/patients/`

Liste tous les patients qui ont eu au moins une consultation avec le docteur connecté.

**Permissions:** `IsAuthenticated`, `IsDoctorRole`

**Query Parameters (optionnel):**
- `q` - Recherche par nom, prénom, email ou username
- `status` - Filtre par statut (`Actif` ou `Inactif`)

**Exemple de réponse:**
```json
[
  {
    "id": 1,
    "username": "patient1",
    "email": "patient@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 35,
    "address": "123 Rue Example",
    "telephone": "+33123456789",
    "antecedents": "Aucun",
    "status": "Actif",
    "medical_file": null
  }
]
```

---

### 2. Détails d'un patient
**GET** `/api/doctor-patient/doctor/patients/{patient_id}/`

Récupère les détails d'un patient spécifique.

**PATCH** `/api/doctor-patient/doctor/patients/{patient_id}/`

Modifie les informations d'un patient.

**Body (PATCH):**
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "age": 36,
  "address": "Nouvelle adresse",
  "telephone": "+33987654321",
  "antecedents": "Hypertension",
  "status": "Actif"
}
```

---

### 3. Liste des consultations du docteur
**GET** `/api/doctor-patient/doctor/consultations/`

Liste toutes les consultations du docteur avec filtres avancés.

**Query Parameters (optionnel):**
- `patient_id` - Filtrer par ID de patient
- `date` - Filtrer par date exacte (YYYY-MM-DD)
- `date_debut` - Date de début pour plage (YYYY-MM-DD)
- `date_fin` - Date de fin pour plage (YYYY-MM-DD)
- `motif` - Recherche dans le motif

**Exemples:**
```
GET /api/doctor-patient/doctor/consultations/?patient_id=2
GET /api/doctor-patient/doctor/consultations/?date=2026-01-15
GET /api/doctor-patient/doctor/consultations/?date_debut=2026-01-01&date_fin=2026-01-31
GET /api/doctor-patient/doctor/consultations/?motif=cardiologie
```

**Réponse:**
```json
[
  {
    "id": 1,
    "patient": 2,
    "patient_nom": "Dupont",
    "patient_prenom": "Jean",
    "patient_email": "patient@example.com",
    "start_time": "2026-01-15T10:00:00Z",
    "end_time": "2026-01-15T10:30:00Z",
    "motif": "Consultation de suivi cardiologie"
  }
]
```

---

### 4. Détails d'une consultation
**GET** `/api/doctor-patient/doctor/consultations/{consultation_id}/`

Récupère les détails d'une consultation spécifique du docteur.

---

### 5. Dossiers médicaux
**GET** `/api/doctor-patient/doctor/dossiers/`

Liste tous les dossiers médicaux des patients du docteur.

**Query Parameters:**
- `patient_id` - Filtrer par patient

**POST** `/api/doctor-patient/doctor/dossiers/`

Créer un nouveau dossier médical.

**Body:**
```json
{
  "patient": 2,
  "observations": "Patient présente des symptômes...",
  "traitement": "Repos et médication prescrite",
  "fichier": null
}
```

---

### 6. Détails d'un dossier médical
**GET** `/api/doctor-patient/doctor/dossiers/{dossier_id}/`

**PATCH** `/api/doctor-patient/doctor/dossiers/{dossier_id}/`

Modifier un dossier médical existant.

**Body (PATCH):**
```json
{
  "observations": "Observations mises à jour",
  "traitement": "Nouveau traitement"
}
```

**Note:** Pour uploader un fichier, utiliser `multipart/form-data` dans Postman:
- Key: `fichier` | Type: File
- Key: `observations` | Type: Text
- Key: `traitement` | Type: Text

---

### 7. Réclamations
**GET** `/api/doctor-patient/doctor/reclamations/`

Liste toutes les réclamations créées par le docteur.

**Query Parameters:**
- `statut` - Filtrer par statut (`EN_ATTENTE`, `EN_COURS`, `RESOLU`, `FERME`)
- `patient_id` - Filtrer par patient

**POST** `/api/doctor-patient/doctor/reclamations/`

Créer une nouvelle réclamation concernant un patient.

**Body:**
```json
{
  "patient": 2,
  "sujet": "Non-respect du traitement",
  "message": "Le patient n'a pas suivi les recommandations médicales..."
}
```

**Réponse:**
```json
{
  "id": 1,
  "doctor": 7,
  "doctor_nom": "Smith",
  "doctor_prenom": "John",
  "patient": 2,
  "patient_nom": "Dupont",
  "patient_prenom": "Jean",
  "sujet": "Non-respect du traitement",
  "message": "Le patient n'a pas suivi...",
  "statut": "EN_ATTENTE",
  "created_at": "2026-01-12T10:30:00Z",
  "updated_at": "2026-01-12T10:30:00Z"
}
```

---

### 8. Détails d'une réclamation
**GET** `/api/doctor-patient/doctor/reclamations/{reclamation_id}/`

**PATCH** `/api/doctor-patient/doctor/reclamations/{reclamation_id}/`

Modifier le statut d'une réclamation.

**Body:**
```json
{
  "statut": "RESOLU"
}
```

---

### 9. Messages
**GET** `/api/doctor-patient/doctor/messages/`

Liste tous les messages envoyés et reçus par le docteur.

**Query Parameters:**
- `type` - `envoyes` ou `recus`

**Exemples:**
```
GET /api/doctor-patient/doctor/messages/
GET /api/doctor-patient/doctor/messages/?type=recus
GET /api/doctor-patient/doctor/messages/?type=envoyes
```

**POST** `/api/doctor-patient/doctor/messages/`

Envoyer un message à un patient.

**Body:**
```json
{
  "destinataire_patient": 2,
  "contenu": "Bonjour, votre prochain rendez-vous est confirmé pour..."
}
```

**Réponse:**
```json
{
  "id": 5,
  "expediteur_type": "doctor",
  "expediteur_nom": "Dr. Smith John",
  "destinataire_type": "patient",
  "destinataire_nom": "Dupont Jean",
  "contenu": "Bonjour, votre prochain rendez-vous...",
  "lu": false,
  "created_at": "2026-01-12T11:00:00Z"
}
```

---

### 10. Détails d'un message
**GET** `/api/doctor-patient/doctor/messages/{message_id}/`

Récupère les détails d'un message. Si le docteur est le destinataire, le message sera automatiquement marqué comme lu.

---

## 👤 Endpoints pour les Patients

### 1. Réclamations reçues
**GET** `/api/doctor-patient/patient/reclamations/`

Liste toutes les réclamations reçues par le patient.

**Query Parameters:**
- `statut` - Filtrer par statut

---

### 2. Détails d'une réclamation reçue
**GET** `/api/doctor-patient/patient/reclamations/{reclamation_id}/`

---

### 3. Messages
**GET** `/api/doctor-patient/patient/messages/`

Liste tous les messages envoyés et reçus par le patient.

**Query Parameters:**
- `type` - `envoyes` ou `recus`

**POST** `/api/doctor-patient/patient/messages/`

Envoyer un message à un docteur.

**Body:**
```json
{
  "destinataire_doctor": 7,
  "contenu": "Bonjour Docteur, j'ai une question concernant mon traitement..."
}
```

---

### 4. Détails d'un message
**GET** `/api/doctor-patient/patient/messages/{message_id}/`

Marque automatiquement le message comme lu si le patient est le destinataire.

---

## 🔐 Authentification

Tous les endpoints nécessitent un token JWT dans le header:
```
Authorization: Bearer <ACCESS_TOKEN>
```

## 📝 Exemples Postman

### Test complet pour un docteur:

1. **Login en tant que docteur:**
```json
POST /api/users/login/
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

2. **Voir mes patients:**
```
GET /api/doctor-patient/doctor/patients/
Authorization: Bearer <token>
```

3. **Créer une réclamation:**
```json
POST /api/doctor-patient/doctor/reclamations/
Authorization: Bearer <token>
{
  "patient": 2,
  "sujet": "Test",
  "message": "Message de test"
}
```

4. **Envoyer un message:**
```json
POST /api/doctor-patient/doctor/messages/
Authorization: Bearer <token>
{
  "destinataire_patient": 2,
  "contenu": "Bonjour, rappel de rendez-vous"
}
```

### Test complet pour un patient:

1. **Login en tant que patient:**
```json
POST /api/users/login/
{
  "email": "patient@example.com",
  "password": "password123"
}
```

2. **Voir mes réclamations:**
```
GET /api/doctor-patient/patient/reclamations/
Authorization: Bearer <token>
```

3. **Voir mes messages:**
```
GET /api/doctor-patient/patient/messages/
Authorization: Bearer <token>
```

4. **Répondre à un docteur:**
```json
POST /api/doctor-patient/patient/messages/
Authorization: Bearer <token>
{
  "destinataire_doctor": 7,
  "contenu": "Merci docteur, j'ai bien reçu votre message"
}
```

---

## ✅ Permissions

- **Endpoints `/doctor/*`**: Nécessitent le rôle `DOCTOR`
- **Endpoints `/patient/*`**: Nécessitent d'être authentifié (tout utilisateur)
- Le docteur ne peut accéder qu'aux patients qui ont eu au moins une consultation avec lui
- Le patient ne peut accéder qu'à ses propres réclamations et messages

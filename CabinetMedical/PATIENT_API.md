# API Documentation - Patient

## 👤 Endpoints pour les Patients

### Base URL: `/api/patient/`

---

## 📅 CONSULTATIONS / RENDEZ-VOUS

### 1. Liste des consultations du patient
**GET** `/api/patient/consultations/`

Liste toutes les consultations (passées et futures) du patient connecté.

**Permissions:** `IsAuthenticated`

**Query Parameters (optionnel):**
- `doctor_id` - Filtrer par ID de docteur
- `date` - Filtrer par date exacte (YYYY-MM-DD)
- `date_debut` - Date de début pour plage (YYYY-MM-DD)
- `date_fin` - Date de fin pour plage (YYYY-MM-DD)
- `status` - `passe` (consultations passées) ou `futur` (consultations à venir)

**Exemples:**
```
GET /api/patient/consultations/
GET /api/patient/consultations/?status=futur
GET /api/patient/consultations/?doctor_id=7
GET /api/patient/consultations/?date=2026-01-15
GET /api/patient/consultations/?date_debut=2026-01-01&date_fin=2026-01-31
```

**Réponse:**
```json
[
  {
    "id": 1,
    "doctor": 7,
    "doctor_nom": "Smith",
    "doctor_prenom": "John",
    "doctor_specialty": "Cardiologie",
    "start_time": "2026-01-15T10:00:00Z",
    "end_time": "2026-01-15T10:30:00Z",
    "motif": "Consultation de suivi"
  }
]
```

---

### 2. Détails d'une consultation
**GET** `/api/patient/consultations/{consultation_id}/`

Récupère les détails d'une consultation spécifique du patient.

---

### 3. Liste des docteurs disponibles
**GET** `/api/patient/doctors/`

Liste tous les docteurs disponibles pour prendre rendez-vous.

**Query Parameters (optionnel):**
- `specialty` - Filtrer par spécialité
- `q` - Recherche par nom, prénom ou spécialité

**Exemples:**
```
GET /api/patient/doctors/
GET /api/patient/doctors/?specialty=Cardiologie
GET /api/patient/doctors/?q=Smith
```

**Réponse:**
```json
[
  {
    "id": 7,
    "username": "dr_smith",
    "nom": "Smith",
    "prenom": "John",
    "specialty": "Cardiologie",
    "phone": "+33123456789",
    "schedule": "Lun-Ven 9h-17h",
    "image": "/media/doctor_images/smith.jpg"
  }
]
```

---

### 4. Prendre un rendez-vous
**POST** `/api/patient/rendez-vous/`

Créer un nouveau rendez-vous avec un docteur.

**Body:**
```json
{
  "doctor": 7,
  "start_time": "2026-01-15T14:00:00",
  "motif": "Consultation de contrôle"
}
```

**Validations automatiques:**
- ✅ Vérifie que la date est dans le futur
- ✅ Vérifie que le créneau horaire n'est pas déjà pris
- ✅ Vérifie que le docteur est approuvé
- ✅ Durée automatique: 30 minutes

**Réponse (201 Created):**
```json
{
  "id": 15,
  "doctor": 7,
  "doctor_nom": "Smith",
  "doctor_prenom": "John",
  "doctor_specialty": "Cardiologie",
  "start_time": "2026-01-15T14:00:00Z",
  "end_time": "2026-01-15T14:30:00Z",
  "motif": "Consultation de contrôle"
}
```

**Erreurs possibles:**
```json
{
  "error": "Ce créneau horaire n'est pas disponible. Veuillez choisir un autre horaire."
}
```

---

### 5. Annuler un rendez-vous
**DELETE** `/api/patient/rendez-vous/{consultation_id}/annuler/`

Annuler un rendez-vous futur.

**Restrictions:**
- ❌ Ne peut pas annuler un rendez-vous passé

**Réponse (200 OK):**
```json
{
  "message": "Rendez-vous annulé avec succès"
}
```

---

## 📋 DOSSIERS MÉDICAUX

### 6. Liste des dossiers médicaux
**GET** `/api/patient/dossiers/`

Liste tous les dossiers médicaux du patient.

**Réponse:**
```json
[
  {
    "id": 3,
    "doctor_nom": "Dr. Smith John",
    "observations": "Patient présente des symptômes...",
    "traitement": "Repos et médication prescrite",
    "fichier": "/media/dossiers_medicaux/dossier_123.pdf",
    "date_derniere_visite": "2026-01-10",
    "created_at": "2026-01-10T15:30:00Z",
    "updated_at": "2026-01-10T15:30:00Z"
  }
]
```

---

### 7. Détails d'un dossier médical
**GET** `/api/patient/dossiers/{dossier_id}/`

Récupère les détails complets d'un dossier médical spécifique.

---

### 8. Déposer un nouveau dossier médical
**POST** `/api/patient/dossiers/deposer/`

Le patient peut déposer un nouveau dossier médical (résultats d'analyses, documents, etc.).

**Body (JSON):**
```json
{
  "observations": "Résultats d'analyses sanguines",
  "traitement": "Vitamines prescrites",
  "fichier": null
}
```

**Body (multipart/form-data pour upload fichier):**
- Key: `observations` | Type: Text | Value: "Résultats d'analyses"
- Key: `traitement` | Type: Text | Value: "Traitement prescrit"
- Key: `fichier` | Type: File | Select: document.pdf

**Réponse (201 Created):**
```json
{
  "id": 8,
  "doctor_nom": "N/A",
  "observations": "Résultats d'analyses sanguines",
  "traitement": "Vitamines prescrites",
  "fichier": "/media/dossiers_medicaux/analyses_456.pdf",
  "date_derniere_visite": "2026-01-12",
  "created_at": "2026-01-12T10:00:00Z",
  "updated_at": "2026-01-12T10:00:00Z"
}
```

---

## 📢 RÉCLAMATIONS

### 9. Liste des réclamations reçues
**GET** `/api/patient/reclamations/`

Liste toutes les réclamations reçues de la part des docteurs.

**Query Parameters (optionnel):**
- `statut` - Filtrer par statut (`EN_ATTENTE`, `EN_COURS`, `RESOLU`, `FERME`)

**Exemples:**
```
GET /api/patient/reclamations/
GET /api/patient/reclamations/?statut=EN_ATTENTE
```

**Réponse:**
```json
[
  {
    "id": 5,
    "doctor": 7,
    "doctor_nom": "Smith",
    "doctor_prenom": "John",
    "doctor_specialty": "Cardiologie",
    "sujet": "Non-respect du traitement",
    "message": "Le patient n'a pas suivi les recommandations...",
    "statut": "EN_ATTENTE",
    "created_at": "2026-01-10T09:00:00Z",
    "updated_at": "2026-01-10T09:00:00Z"
  }
]
```

---

### 10. Détails d'une réclamation
**GET** `/api/patient/reclamations/{reclamation_id}/`

Récupère les détails d'une réclamation spécifique.

---

## 💬 MESSAGES

### 11. Liste des messages
**GET** `/api/patient/messages/`

Liste tous les messages envoyés et reçus par le patient.

**Query Parameters (optionnel):**
- `type` - `envoyes` (messages envoyés) ou `recus` (messages reçus)

**Exemples:**
```
GET /api/patient/messages/
GET /api/patient/messages/?type=recus
GET /api/patient/messages/?type=envoyes
```

**Réponse:**
```json
[
  {
    "id": 12,
    "expediteur_type": "doctor",
    "expediteur_nom": "Dr. Smith John",
    "destinataire_type": "patient",
    "destinataire_nom": "Dupont Jean",
    "contenu": "Bonjour, votre prochain rendez-vous est confirmé...",
    "lu": false,
    "created_at": "2026-01-11T14:00:00Z"
  }
]
```

---

### 12. Envoyer un message à un docteur
**POST** `/api/patient/messages/envoyer/`

Envoyer un nouveau message à un docteur.

**Body:**
```json
{
  "destinataire_doctor": 7,
  "contenu": "Bonjour Docteur, j'ai une question concernant mon traitement..."
}
```

**Réponse (201 Created):**
```json
{
  "id": 15,
  "expediteur_type": "patient",
  "expediteur_nom": "Dupont Jean",
  "destinataire_type": "doctor",
  "destinataire_nom": "Dr. Smith John",
  "contenu": "Bonjour Docteur, j'ai une question...",
  "lu": false,
  "created_at": "2026-01-12T11:30:00Z"
}
```

---

### 13. Détails d'un message
**GET** `/api/patient/messages/{message_id}/`

Récupère les détails d'un message. Si le patient est le destinataire, le message sera automatiquement marqué comme lu.

---

## 🔐 Authentification

Tous les endpoints nécessitent un token JWT dans le header:
```
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 📝 Exemples Postman complets

### Scénario 1: Prendre un rendez-vous

**Étape 1: Login**
```json
POST /api/users/login/
{
  "email": "patient@example.com",
  "password": "password123"
}
```

**Étape 2: Voir les docteurs disponibles**
```
GET /api/patient/doctors/?specialty=Cardiologie
Authorization: Bearer <token>
```

**Étape 3: Prendre rendez-vous**
```json
POST /api/patient/rendez-vous/
Authorization: Bearer <token>
{
  "doctor": 7,
  "start_time": "2026-01-20T10:00:00",
  "motif": "Consultation de contrôle"
}
```

**Étape 4: Voir mes rendez-vous futurs**
```
GET /api/patient/consultations/?status=futur
Authorization: Bearer <token>
```

---

### Scénario 2: Déposer un dossier médical avec fichier

**Dans Postman:**
1. Sélectionner `POST /api/patient/dossiers/deposer/`
2. Authorization → Bearer Token → `<ACCESS_TOKEN>`
3. Body → form-data
   - Key: `observations` | Type: Text | Value: "Résultats analyses"
   - Key: `traitement` | Type: Text | Value: "Vitamine D prescrite"
   - Key: `fichier` | Type: File | Sélectionner le fichier PDF

---

### Scénario 3: Messagerie avec docteur

**Voir mes messages reçus:**
```
GET /api/patient/messages/?type=recus
Authorization: Bearer <token>
```

**Répondre à un docteur:**
```json
POST /api/patient/messages/envoyer/
Authorization: Bearer <token>
{
  "destinataire_doctor": 7,
  "contenu": "Merci docteur pour votre message. Je serai présent au rendez-vous."
}
```

**Lire un message (marqué automatiquement comme lu):**
```
GET /api/patient/messages/15/
Authorization: Bearer <token>
```

---

## ✅ Résumé des fonctionnalités

| Fonctionnalité | Endpoint | Méthode |
|---------------|----------|---------|
| Voir mes consultations | `/api/patient/consultations/` | GET |
| Liste docteurs | `/api/patient/doctors/` | GET |
| Prendre RDV | `/api/patient/rendez-vous/` | POST |
| Annuler RDV | `/api/patient/rendez-vous/{id}/annuler/` | DELETE |
| Mes dossiers médicaux | `/api/patient/dossiers/` | GET |
| Déposer un dossier | `/api/patient/dossiers/deposer/` | POST |
| Réclamations reçues | `/api/patient/reclamations/` | GET |
| Mes messages | `/api/patient/messages/` | GET |
| Envoyer message | `/api/patient/messages/envoyer/` | POST |

---

## 🎯 Filtres disponibles

**Consultations:**
- Par docteur: `?doctor_id=7`
- Par date: `?date=2026-01-15`
- Plage de dates: `?date_debut=2026-01-01&date_fin=2026-01-31`
- Statut: `?status=futur` ou `?status=passe`

**Docteurs:**
- Par spécialité: `?specialty=Cardiologie`
- Recherche: `?q=Smith`

**Réclamations:**
- Par statut: `?statut=EN_ATTENTE`

**Messages:**
- Par type: `?type=recus` ou `?type=envoyes`

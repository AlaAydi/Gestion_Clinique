# API Documentation - Gestion Clinique Médicale

## Base URL
`http://localhost:8000/api`

Toutes les requêtes nécessitent un token d'authentification (sauf register/login):
```
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 1. GESTION DES PATIENTS ET MÉDECINS

### 1.1 Admin - Patients

#### Lister / Créer des patients
**GET/POST** `/Admin/patients/`

**Query params** (GET):
- `q` : recherche par username/email/address
- `status` : filtrer par statut (Actif/Inactif)

**Body** (POST):
```json
{
  "username": "patient1",
  "email": "patient1@example.com",
  "password": "Password123",
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 45,
  "address": "123 Rue Exemple",
  "telephone": "0612345678",
  "antecedents": "Diabète type 2, hypertension",
  "status": "Actif"
}
```

#### Détails / Modifier / Supprimer patient
**GET/PUT/PATCH/DELETE** `/Admin/patients/<id>/`

**Body** (PUT/PATCH):
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 46,
  "address": "Nouvelle adresse",
  "telephone": "0698765432",
  "antecedents": "Diabète, hypertension, asthme",
  "status": "Actif"
}
```

---

### 1.2 Admin - Médecins

#### Lister / Créer des médecins
**GET/POST** `/Admin/doctors/`

**Query params** (GET):
- `q` : recherche par username/email/specialty
- `specialty` : filtrer par spécialité
- `is_approved` : filtrer par approbation (true/false)

**Body** (POST):
```json
{
  "username": "drbrown",
  "email": "brown@clinic.com",
  "password": "DocPass123",
  "nom": "Brown",
  "prenom": "Marie",
  "specialty": "Cardiologie",
  "phone": "0123456789",
  "schedule": "Lun-Ven 9h-17h"
}
```

#### Détails / Modifier / Supprimer médecin
**GET/PUT/PATCH/DELETE** `/Admin/doctors/<id>/`

**Body** (PUT/PATCH):
```json
{
  "nom": "Brown",
  "prenom": "Marie",
  "specialty": "Cardiologie interventionnelle",
  "phone": "0123456789",
  "schedule": "Lun-Jeu 8h-18h"
}
```

---

### 1.3 Recherche avancée
**GET** `/users/recherche/`

**Query params**:
- `type` : patient ou doctor
- `q` : terme de recherche

**Exemple**: `/users/recherche/?type=patient&q=Dupont`

---

## 2. PLANIFICATION DES RENDEZ-VOUS

### 2.1 Lister / Créer consultations
**GET/POST** `/users/consultations/`

**Query params** (GET):
- `date` : filtrer par date (YYYY-MM-DD)
- `patient_id` : filtrer par patient
- `doctor_id` : filtrer par médecin

**Body** (POST) - avec vérification automatique des conflits:
```json
{
  "doctor": 1,
  "patient": 3,
  "start_time": "2026-01-10T14:00:00",
  "motif": "Consultation de suivi cardiologie"
}
```

**Note**: `end_time` calculé automatiquement (+30 min). Vérifie qu'aucun autre RDV du médecin ne chevauche.

---

### 2.2 Détails / Modifier / Supprimer consultation
**GET/PUT/PATCH/DELETE** `/users/consultations/<id>/`

**Body** (PUT/PATCH):
```json
{
  "start_time": "2026-01-10T15:00:00",
  "motif": "Consultation de suivi + ECG"
}
```

---

### 2.3 Consultations d'un jour donné
**GET** `/users/consultations/date/<YYYY-MM-DD>/`

**Exemple**: `/users/consultations/date/2026-01-10/`

Retourne tous les rendez-vous du jour.

---

### 2.4 Consultations d'un patient
**GET** `/users/consultations/patient/<patient_id>/`

Retourne l'historique des consultations d'un patient.

---

## 3. GESTION DES DOSSIERS MÉDICAUX

### 3.1 Lister / Créer dossiers
**GET/POST** `/users/dossiers/`

**Query params** (GET):
- `patient_id` : filtrer par patient

**Body** (POST):
```json
{
  "patient": 3,
  "observations": "Patient présente des signes d'amélioration. TA: 12/8.",
  "traitement": "Continuer Lisinopril 10mg/j. RDV dans 3 mois."
}
```

**Note**: `date_derniere_visite` est automatiquement définie à la date du jour.

---

### 3.2 Détails / Modifier / Supprimer dossier
**GET/PUT/PATCH/DELETE** `/users/dossiers/<id>/`

**Body** (PUT/PATCH):
```json
{
  "observations": "Ajout: patient signale fatigue.",
  "traitement": "Ajustement posologie Lisinopril à 5mg/j"
}
```

---

### 3.3 Historique médical complet d'un patient
**GET** `/users/patients/<patient_id>/historique/`

Retourne:
```json
{
  "patient": {
    "id": 3,
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 45,
    "antecedents": "Diabète type 2, hypertension"
  },
  "historique": [
    {
      "id": 5,
      "observations": "...",
      "traitement": "...",
      "date_derniere_visite": "2026-01-05"
    }
  ]
}
```

---

## 4. RAPPORTS MÉDICAUX

### 4.1 Rapport global de la clinique
**GET** `/users/rapports/clinique/`

**Permissions**: Admin uniquement

Retourne:
```json
{
  "resume": {
    "total_patients": 150,
    "patients_actifs": 142,
    "patients_inactifs": 8,
    "total_medecins": 12,
    "total_consultations": 850,
    "consultations_7_jours": 45,
    "consultations_a_venir": 23
  },
  "specialites_sollicitees": [
    {"specialty": "Cardiologie", "count": 5, "nb_consultations": 120},
    {"specialty": "Pédiatrie", "count": 3, "nb_consultations": 95}
  ],
  "top_medecins": [
    {
      "id": 1,
      "nom": "Brown",
      "prenom": "Marie",
      "specialty": "Cardiologie",
      "nb_consultations": 120
    }
  ]
}
```

---

### 4.2 Statistiques consultations
**GET** `/users/rapports/consultations/`

**Query params**:
- `date_debut` : YYYY-MM-DD
- `date_fin` : YYYY-MM-DD

**Permissions**: Admin uniquement

Retourne:
```json
{
  "total_consultations": 850,
  "consultations_par_jour": [
    {"jour": "Lundi", "count": 145},
    {"jour": "Mardi", "count": 132}
  ],
  "motifs_frequents": [
    {"motif": "Consultation de suivi", "count": 210},
    {"motif": "Première consultation", "count": 95}
  ]
}
```

---

## 5. AUTHENTIFICATION

### 5.1 Inscription
**POST** `/users/register/`

**Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "PATIENT"
}
```

**Note**: Crée automatiquement un profil Patient ou Doctor. Compte en attente d'approbation.

---

### 5.2 Connexion
**POST** `/users/login/`

**Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "refresh": "eyJ0eXAi...",
  "access": "eyJ0eXAi...",
  "role": "PATIENT",
  "email": "newuser@example.com"
}
```

---

### 5.3 Approuver un utilisateur
**GET** `/users/approve/<user_id>/`

**Permissions**: Admin

---

## 6. ADMIN - Gestion des utilisateurs

### 6.1 Lister utilisateurs
**GET** `/Admin/users/`

**Query params**:
- `q` : recherche par username/email/id
- `role` : filtrer par rôle (ADMIN/DOCTOR/PATIENT)

---

### 6.2 Détails / Modifier / Supprimer utilisateur
**GET/PUT/PATCH/DELETE** `/Admin/users/<id>/`

**Body** (PUT/PATCH):
```json
{
  "role": "DOCTOR",
  "is_approved": true
}
```

---

## Configuration JWT Token

Les tokens JWT sont configurés avec:
- **Access token**: valide 1 jour
- **Refresh token**: valide 7 jours

Configuration dans `backend/settings.py`:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

---

## Permissions

- **IsAdminRole**: réservé aux utilisateurs ADMIN
- **IsDoctorRole**: réservé aux médecins
- **IsAdminOrDoctor**: admin OU médecin
- **IsAuthenticated**: tout utilisateur connecté approuvé

---

## Tests rapides (Postman / cURL)

1. **Créer un admin** (via shell):
```bash
python manage.py shell -c "from users.models import User; User.objects.create_superuser('admin', 'admin@clinic.com', 'admin123', role='ADMIN')"
```

2. **Login admin**:
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'
```

3. **Créer un patient** (avec token):
```bash
curl -X POST http://localhost:8000/api/Admin/patients/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"username":"pat1","email":"pat1@test.com","password":"Pass123","nom":"Dupont","prenom":"Jean","age":45,"address":"123 Rue","telephone":"0612345678","status":"Actif"}'
```

4. **Obtenir rapport clinique**:
```bash
curl -X GET http://localhost:8000/api/users/rapports/clinique/ \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## Exportation PDF/Excel (à implémenter)

Pour générer des exports PDF/Excel des rapports, installer:
```bash
pip install reportlab openpyxl
```

Puis créer des vues supplémentaires qui utilisent ces bibliothèques pour générer les fichiers.

---

## Résumé des fonctionnalités implémentées

✅ **1. Gestion patients et médecins**
- Ajouter, modifier, supprimer
- Recherche par nom ou identifiant
- Champs complets: nom, prénom, âge, téléphone, antécédents

✅ **2. Planification rendez-vous**
- Enregistrement avec date, heure, médecin, motif
- Vérification automatique conflits d'horaire
- Affichage par jour ou par patient

✅ **3. Gestion dossiers médicaux**
- Créer/mettre à jour dossiers
- Observations et traitements
- Historique médical complet

✅ **4. Rapports médicaux**
- Rapport global: nb patients, médecins, consultations
- Spécialités sollicitées
- Statistiques consultations
- (Export PDF/Excel à ajouter si besoin)

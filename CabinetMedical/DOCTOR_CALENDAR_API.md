# API Calendrier Docteur

Cette documentation décrit l'API permettant aux docteurs de consulter leurs rendez-vous sous forme de calendrier.

## Endpoint Principal

### GET `/api/doctor-calendar/consultations/`

Récupère les consultations d'un docteur pour une période donnée, organisées pour affichage calendrier.

**Headers requis:**
```
Authorization: Bearer {access_token}
```

**Permissions:**
- L'utilisateur doit être authentifié
- L'utilisateur doit avoir le rôle `DOCTOR`

---

## Paramètres de requête (Query Parameters)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `year` | integer | Non | Année (ex: 2026) |
| `month` | integer | Non | Mois (1-12) |
| `start_date` | date | Non | Date de début (format: YYYY-MM-DD) |
| `end_date` | date | Non | Date de fin (format: YYYY-MM-DD) |

**Notes:**
- Si `start_date` et `end_date` sont fournis, ils ont la priorité sur `year` et `month`
- Si `year` et `month` sont fournis, affiche tout le mois
- Si aucun paramètre n'est fourni, affiche le mois en cours

---

## Exemples d'utilisation

### 1. Récupérer les consultations du mois en cours

```http
GET /api/doctor-calendar/consultations/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 2. Récupérer les consultations pour un mois spécifique

```http
GET /api/doctor-calendar/consultations/?year=2026&month=1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 3. Récupérer les consultations pour une plage de dates

```http
GET /api/doctor-calendar/consultations/?start_date=2026-01-15&end_date=2026-01-20
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## Réponses

### Succès (200 OK)

```json
{
    "period": {
        "start": "2026-01-01",
        "end": "2026-01-31"
    },
    "total_consultations": 5,
    "consultations_by_date": {
        "2026-01-15": [
            {
                "id": 1,
                "doctor_id": 7,
                "doctor_name": "Dr. Ahmed Ben Ali",
                "patient_id": 3,
                "patient_name": "Mohammed Hassan",
                "start_time": "2026-01-15T09:00:00Z",
                "end_time": "2026-01-15T09:30:00Z",
                "date": "2026-01-15",
                "motif": "Consultation de routine"
            },
            {
                "id": 2,
                "doctor_id": 7,
                "doctor_name": "Dr. Ahmed Ben Ali",
                "patient_id": 5,
                "patient_name": "Fatima Zahra",
                "start_time": "2026-01-15T10:00:00Z",
                "end_time": "2026-01-15T10:30:00Z",
                "date": "2026-01-15",
                "motif": "Contrôle de suivi"
            }
        ],
        "2026-01-16": [
            {
                "id": 3,
                "doctor_id": 7,
                "doctor_name": "Dr. Ahmed Ben Ali",
                "patient_id": 8,
                "patient_name": "Omar Khalil",
                "start_time": "2026-01-16T14:00:00Z",
                "end_time": "2026-01-16T14:30:00Z",
                "date": "2026-01-16",
                "motif": "Première consultation"
            }
        ]
    },
    "all_consultations": [
        {
            "id": 1,
            "doctor_id": 7,
            "doctor_name": "Dr. Ahmed Ben Ali",
            "patient_id": 3,
            "patient_name": "Mohammed Hassan",
            "start_time": "2026-01-15T09:00:00Z",
            "end_time": "2026-01-15T09:30:00Z",
            "date": "2026-01-15",
            "motif": "Consultation de routine"
        },
        {
            "id": 2,
            "doctor_id": 7,
            "doctor_name": "Dr. Ahmed Ben Ali",
            "patient_id": 5,
            "patient_name": "Fatima Zahra",
            "start_time": "2026-01-15T10:00:00Z",
            "end_time": "2026-01-15T10:30:00Z",
            "date": "2026-01-15",
            "motif": "Contrôle de suivi"
        },
        {
            "id": 3,
            "doctor_id": 7,
            "doctor_name": "Dr. Ahmed Ben Ali",
            "patient_id": 8,
            "patient_name": "Omar Khalil",
            "start_time": "2026-01-16T14:00:00Z",
            "end_time": "2026-01-16T14:30:00Z",
            "date": "2026-01-16",
            "motif": "Première consultation"
        }
    ]
}
```

**Structure de la réponse:**

- `period`: Période affichée
  - `start`: Date de début de la période
  - `end`: Date de fin de la période
- `total_consultations`: Nombre total de consultations dans la période
- `consultations_by_date`: Consultations organisées par date (facilite l'affichage dans le calendrier)
  - Clé: date au format "YYYY-MM-DD"
  - Valeur: tableau des consultations pour cette date
- `all_consultations`: Toutes les consultations triées par date/heure (liste complète)

**Champs d'une consultation:**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | ID de la consultation |
| `doctor_id` | integer | ID du docteur |
| `doctor_name` | string | Nom complet du docteur |
| `patient_id` | integer | ID du patient |
| `patient_name` | string | Nom complet du patient |
| `start_time` | datetime | Heure de début (ISO 8601) |
| `end_time` | datetime | Heure de fin (ISO 8601) |
| `date` | date | Date de la consultation (YYYY-MM-DD) |
| `motif` | string | Motif de consultation |

---

### Erreurs possibles

#### 403 Forbidden - Utilisateur non autorisé

```json
{
    "error": "Seuls les docteurs peuvent accéder à ce calendrier"
}
```

#### 404 Not Found - Profil docteur non trouvé

```json
{
    "error": "Profil docteur non trouvé"
}
```

#### 400 Bad Request - Paramètres invalides

```json
{
    "error": "Format de date invalide. Utilisez YYYY-MM-DD"
}
```

ou

```json
{
    "error": "Paramètres invalides: Le mois doit être entre 1 et 12"
}
```

---

## Exemples d'utilisation avec Postman

### Configuration de base

1. **Méthode**: GET
2. **URL**: `http://localhost:8000/api/doctor-calendar/consultations/`
3. **Headers**:
   - `Authorization`: `Bearer {votre_token_JWT}`
   - `Content-Type`: `application/json`

### Scénario 1: Vue mensuelle (Janvier 2026)

**URL avec paramètres**:
```
http://localhost:8000/api/doctor-calendar/consultations/?year=2026&month=1
```

**Utilisation dans le frontend**:
- Afficher un calendrier mensuel
- Chaque jour peut afficher le nombre de consultations
- Cliquer sur un jour pour voir les détails des consultations

### Scénario 2: Vue hebdomadaire

**URL avec paramètres**:
```
http://localhost:8000/api/doctor-calendar/consultations/?start_date=2026-01-13&end_date=2026-01-19
```

**Utilisation dans le frontend**:
- Afficher une semaine complète
- Grille horaire avec les consultations

### Scénario 3: Vue journalière

**URL avec paramètres**:
```
http://localhost:8000/api/doctor-calendar/consultations/?start_date=2026-01-16&end_date=2026-01-16
```

**Utilisation dans le frontend**:
- Afficher toutes les consultations d'une journée spécifique
- Planning horaire détaillé

---

## Intégration Frontend

### Exemple avec le calendrier Angular

Pour afficher dans un calendrier comme celui de la photo:

1. **Récupérer le mois actuel**:
```typescript
getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Janvier = 1
  
  this.http.get(`/api/doctor-calendar/consultations/?year=${year}&month=${month}`)
    .subscribe(data => {
      this.calendarData = data.consultations_by_date;
    });
}
```

2. **Afficher les consultations par jour**:
```typescript
getConsultationsForDate(date: string) {
  return this.calendarData[date] || [];
}
```

3. **Afficher un badge avec le nombre de consultations**:
```html
<div *ngFor="let day of daysInMonth">
  <span>{{ day }}</span>
  <span class="badge" *ngIf="getConsultationsForDate(day).length > 0">
    {{ getConsultationsForDate(day).length }}
  </span>
</div>
```

---

## Notes techniques

- **Timezone**: Les dates/heures sont retournées en UTC. Le frontend doit convertir selon le timezone local
- **Performance**: L'API utilise `select_related()` pour optimiser les requêtes à la base de données
- **Tri**: Les consultations sont automatiquement triées par `start_time` (ordre chronologique)
- **Durée**: Toutes les consultations ont une durée fixe de 30 minutes
- **Conflits**: Impossible d'avoir deux consultations qui se chevauchent pour le même docteur

---

## Cas d'usage

### 1. Calendrier mensuel
Utilisez `year` et `month` pour afficher un mois complet dans une grille calendrier.

### 2. Agenda hebdomadaire
Utilisez `start_date` et `end_date` pour afficher une semaine (ex: lundi à dimanche).

### 3. Planning journalier
Utilisez la même date pour `start_date` et `end_date` pour voir les consultations d'un jour.

### 4. Recherche par période
Utilisez `start_date` et `end_date` pour toute plage de dates personnalisée.

---

## Sécurité

- ✅ Authentification requise (JWT token)
- ✅ Vérification du rôle (seulement DOCTOR)
- ✅ Chaque docteur ne voit que ses propres consultations
- ✅ Validation des paramètres d'entrée

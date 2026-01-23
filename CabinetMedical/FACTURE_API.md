# API Factures - Documentation Complète

## Vue d'ensemble

L'API Factures permet la gestion complète des factures pour les consultations médicales. Elle offre des fonctionnalités pour les administrateurs (création, modification, paiement) et les patients (consultation de leurs factures).

---

## Endpoints Administrateur

### 1. Liste et Création de Factures

**GET** `/api/factures/`
- Liste toutes les factures avec filtres

**POST** `/api/factures/`
- Créer une nouvelle facture

**Headers requis:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Permissions:** Admin uniquement

**Query Parameters (GET):**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `patient_id` | integer | Filtrer par ID patient |
| `statut` | string | PAYEE, EN_ATTENTE, ANNULEE |
| `date_debut` | date | Format: YYYY-MM-DD |
| `date_fin` | date | Format: YYYY-MM-DD |

**Exemple GET:**
```http
GET /api/factures/?patient_id=3&statut=EN_ATTENTE
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Réponse GET (200 OK):**
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

**Exemple POST:**
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

**Réponse POST (201 Created):**
```json
{
    "id": 10,
    "numero_facture": "FACT-2026-00010",
    "patient": 3,
    "patient_name": "Mohammed Hassan",
    "patient_email": "mohammed@example.com",
    "consultation": 5,
    "consultation_date": "2026-01-15T10:00:00Z",
    "montant": "75.00",
    "description": "Consultation de routine",
    "statut": "EN_ATTENTE",
    "methode_paiement": "",
    "date_creation": "2026-01-16T14:20:00Z",
    "date_paiement": null,
    "notes": "Facture pour consultation du 15 janvier"
}
```

---

### 2. Détails d'une Facture

**GET/PATCH/PUT/DELETE** `/api/factures/{id}/`

**Exemple PATCH:**
```json
{
    "statut": "ANNULEE",
    "notes": "Consultation annulée par le patient"
}
```

---

### 3. Marquer une Facture comme Payée

**POST** `/api/factures/{id}/payer/`

**Body requis:**
```json
{
    "methode_paiement": "CARTE",
    "notes": "Paiement reçu le 16/01/2026"
}
```

**Méthodes de paiement acceptées:**
- `ESPECES` - Espèces
- `CARTE` - Carte bancaire
- `CHEQUE` - Chèque
- `VIREMENT` - Virement

**Réponse (200 OK):**
```json
{
    "id": 1,
    "numero_facture": "FACT-2026-00001",
    "patient": 3,
    "patient_name": "Mohammed Hassan",
    "montant": "75.00",
    "statut": "PAYEE",
    "methode_paiement": "CARTE",
    "date_creation": "2026-01-15T10:30:00Z",
    "date_paiement": "2026-01-16T15:45:00Z",
    "notes": "Paiement reçu le 16/01/2026"
}
```

---

### 4. Statistiques des Factures

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

## Endpoints Patient

### 1. Liste des Factures du Patient

**GET** `/api/factures/patient/mes-factures/`

**Query Parameters:**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `statut` | string | PAYEE, EN_ATTENTE |

**Exemple:**
```http
GET /api/factures/patient/mes-factures/?statut=EN_ATTENTE
Authorization: Bearer {patient_token}
```

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
        "methode_paiement": "",
        "date_creation": "2026-01-15T10:30:00Z",
        "date_paiement": null
    }
]
```

---

### 2. Détails d'une Facture

**GET** `/api/factures/patient/mes-factures/{id}/`

**Permissions:** Patient peut voir uniquement ses propres factures

---

## Erreurs Communes

### 400 Bad Request
```json
{
    "error": "Cette facture est déjà payée"
}
```

### 403 Forbidden
```json
{
    "error": "Vous n'avez pas la permission d'accéder à cette ressource"
}
```

### 404 Not Found
```json
{
    "error": "Facture non trouvée"
}
```

---

## Workflows Typiques

### Créer et Payer une Facture

1. **Créer la facture après une consultation:**
```http
POST /api/factures/
{
    "patient": 3,
    "consultation": 5,
    "montant": 75.00,
    "description": "Consultation du 15/01/2026"
}
```

2. **Patient consulte sa facture:**
```http
GET /api/factures/patient/mes-factures/
```

3. **Admin marque comme payée:**
```http
POST /api/factures/1/payer/
{
    "methode_paiement": "CARTE"
}
```

---

## Notes Importantes

- Le `numero_facture` est généré automatiquement au format: `FACT-YYYY-NNNNN`
- Une facture ne peut être marquée comme payée qu'une seule fois
- Les patients ne peuvent consulter que leurs propres factures
- Le `statut` peut être: `EN_ATTENTE`, `PAYEE`, ou `ANNULEE`
- Le montant doit être supérieur à 0

---

## Migration Required

Pour utiliser cette API, exécutez:

```bash
cd CabinetMedical
python manage.py makemigrations Facture
python manage.py migrate
```

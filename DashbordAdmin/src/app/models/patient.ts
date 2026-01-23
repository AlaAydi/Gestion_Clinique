// Models for Patient Module - Aligned with Backend API

// ========== BASE PATIENT MODEL ==========
export interface Patient {
  id?: number;
  username: string;
  email: string;
  password?: string;

  nom: string;
  prenom: string;
  age: number;
  address: string;
  telephone: string;
  antecedents: string;

  status: 'Actif' | 'Inactif';
  medical_file?: string | null;
}

// ========== DASHBOARD STATS ==========
export interface PatientStats {
  overview: {
    total_consultations: number;
    past_consultations: number;
    upcoming_consultations_count: number;
    total_dossiers: number;
  };
  upcoming_consultations: PatientUpcomingConsultation[];
  patient_info: PatientInfo;
}

export interface PatientUpcomingConsultation {
  id: number;
  doctor: string;
  specialty: string;
  start_time: string;
  motif: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  address: string;
  status: string;
}

// ========== CONSULTATIONS ==========
export interface PatientConsultation {
  id: number;
  doctor_id: number;
  doctor_nom: string;
  doctor_name?: string; // alias for doctor_nom
  doctor_specialty?: string;
  date: string;
  heure: string;
  start_time: string;
  end_time: string;
  motif: string;
  statut: string;
  prix?: number;
}

export interface CreateRendezVous {
  doctor: number;
  start_time: string;
  end_time?: string;
  motif?: string;
}

// ========== DOCTORS DISPONIBLES ==========
export interface DoctorDisponible {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialty: string;
  specialite?: string; // alias
  schedule: string;
  horaires_travail?: string;
  image?: string;
}

// ========== DOSSIERS MÉDICAUX ==========
export interface PatientDossier {
  id: number;
  titre: string;
  type_document: string;
  description: string;
  observations?: string;
  traitement?: string;
  fichier: string | null;
  date_creation: string;
}

export interface CreatePatientDossier {
  type_document: string;
  description: string;
  observations?: string;
  traitement?: string;
  fichier?: File;
}

// ========== RÉCLAMATIONS ==========
export interface PatientReclamation {
  id: number;
  patient: number;
  doctor: number;
  doctor_nom: string;
  doctor_prenom?: string;
  doctor_specialty?: string;
  sujet: string;
  message: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'FERME';
  created_at: string;
  updated_at: string;
}

export interface CreateReclamation {
  doctor: number;
  sujet: string;
  message: string;
}
// ========== MESSAGES ==========
export interface PatientMessage {
  id: number;
  expediteur_type: 'patient' | 'doctor';
  expediteur_nom: string;
  expediteur_name?: string; // alias
  destinataire_type: 'patient' | 'doctor';
  destinataire_nom: string;
  sujet: string;
  contenu: string;
  lu: boolean;
  statut?: string;
  date_envoi: string;
}

export interface CreatePatientMessage {
  destinataire_doctor: number;
  sujet: string;
  contenu: string;
}

// ========== FACTURES ==========
export interface PatientFacture {
  id: number;
  numero_facture: string;
  patient: number;
  patient_nom?: string;
  consultation?: number;
  consultation_id?: number; // alias
  doctor_name?: string;
  montant: number;
  description: string;
  date_emission: string;
  date_creation?: string; // alias for date_emission
  date_echeance: string;
  statut: 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE';
  date_paiement: string | null;
}

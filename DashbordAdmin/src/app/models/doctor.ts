// Models for Doctor Module - Aligned with Backend API

// ========== DASHBOARD STATS ==========
export interface DoctorStats {
  overview: {
    total_consultations: number;
    total_patients: number;
    consultations_today: number;
    consultations_this_week: number;
    consultations_this_month: number;
  };
  upcoming_consultations: UpcomingConsultation[];
  doctor_info: DoctorInfo;
}

export interface UpcomingConsultation {
  id: number;
  patient: string;
  start_time: string;
  motif: string;
}

export interface DoctorInfo {
  id?: number;
  username?: string;
  email?: string;
  nom: string;
  prenom: string;
  specialty: string;
  phone?: string;
  schedule: string;
  image?: string;
  horaires_travail?: string;
  adresse?: string;
  experience?: number;
}

// ========== PATIENTS ==========
export interface DoctorPatient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  nombre_consultations: number;
  derniere_consultation?: string;
}

// ========== CONSULTATIONS ==========
export interface DoctorConsultation {
  id: number;
  patient_id: number;
  patient_nom: string;
  patient_email?: string;
  patient_telephone?: string;
  date: string;
  heure: string;
  motif: string;
  statut: string;
  notes?: string;
}

// ========== CALENDAR ==========
export interface CalendarResponse {
  doctor_id: number;
  doctor_name: string;
  period: {
    start: string;
    end: string;
  };
  total_consultations: number;
  consultations_by_date: { [date: string]: any[] };
}

export interface CalendarConsultation {
  id: number;
  patient_id: number;
  patient_nom: string;
  patient_email?: string;
  patient_telephone?: string;
  date: string;
  heure: string;
  motif: string;
  statut: string;
}

// ========== DOSSIERS MÉDICAUX ==========
export interface DossierMedical {
  id: number;
  patient: number;
  patient_nom?: string;
  type_document: string;
  description: string;
  fichier: string | null;
  date_creation?: string;
}

export interface CreateDossier {
  patient: number;
  type_document: string;
  description: string;
  fichier?: File;
}

// ========== RÉCLAMATIONS ==========
export interface Reclamation {
  id: number;
  patient: number;
  patient_nom?: string;
  sujet: string;
  description: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'FERME';
  date_creation: string;
  date_resolution: string | null;
}

export interface CreateReclamation {
  patient: number;
  sujet: string;
  description: string;
}

// ========== MESSAGES ==========
export interface Message {
  id: number;
  patient: number;
  patient_nom?: string;
  contenu: string;
  expediteur_type: 'doctor' | 'patient';
  lu: boolean;
  date_envoi: string;
}

export interface CreateMessage {
  patient: number;
  contenu: string;
}

// ========== DOCTOR PROFILE ==========
export interface DoctorProfile {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  specialty: string;
  phone: string;
  schedule: string;
  image: string | null;
}

export interface UpdateDoctorProfile {
  nom?: string;
  prenom?: string;
  specialty?: string;
  phone?: string;
  schedule?: string;
  new_email?: string;
  new_password?: string;
  image?: File;
}

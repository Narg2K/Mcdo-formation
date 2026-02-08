
export enum Role {
  MANAGER = 'manager',
  TRAINER = 'formateur/formatrice',
  EQUIPPIER = 'équipier',
  MCCAFE = 'Mc Café',
  HOTE = 'Hôte d\'accueil'
}

export type SkillLevel = 'Expert' | 'Formé' | 'Intermédiaire' | 'Débutant' | 'Non Formé';

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface DayAvailability {
  day: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: Skill[];
}

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  status: 'Validé' | 'En cours' | 'À faire' | 'Échec';
  dateCompleted?: string;
  score?: number;
}

export interface EmployeeCert {
  name: string;
  dateObtained?: string;
  expiryDate?: string;
  status: 'Complété' | 'À faire' | 'Expiré';
  documentUrl?: string;
  isExternal?: boolean; // Indique si le certificat a été importé manuellement
  externalReference?: string;
  // Champs pour la validation interactive interne
  score?: number;
  observations?: string;
  trainerSignature?: string; // base64 image
  employeeSignature?: string; // base64 image
  evaluationDetails?: Record<string, 'valid' | 'fail' | null>;
}

export interface GlobalCertConfig {
  name: string;
  isMandatory: boolean;
  validityMonths: number;
  templateUrl?: string; // Lien vers le PDF vierge / modèle
}

export interface ContractConfig {
  id: string;
  name: string;
  weeklyHours: number;
}

export interface EventLog {
  id: string;
  date: string;
  type: 'Retard' | 'Discipline' | 'Félicitation' | 'Autre';
  comment: string;
  duration?: number; // Durée en minutes pour les retards
}

export interface TrainingFeedback {
  id: string;
  date: string;
  trainerName: string;
  moduleName: string;
  comment: string;
  rating: number; // 1-5
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  category: 'EQUIPE' | 'SOC' | 'FORMATION' | 'SYSTEM' | 'RETARD';
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'resolved';
  created_at?: string;
}

export interface Employee extends User {
  trainings: TrainingModule[];
  certifications: EmployeeCert[];
  department: string;
  isArchived?: boolean;
  archivedDate?: string;
  archivedReason?: string;
  isDeleted?: boolean;
  deletedDate?: string;
  availability: DayAvailability[];
  entryDate?: string;
  contractEndDate?: string; // Date de fin de contrat
  phoneNumber?: string;
  contractType?: string; // This will link to the name in ContractConfig
  eventLogs?: EventLog[];
  feedbacks?: TrainingFeedback[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  assignedTo?: string; // Employee ID
  deadline: string;
  status: 'Pending' | 'Assigned' | 'Done';
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'Congés' | 'Maladie' | 'RRT';
}

export interface AIPlanningResponse {
  assignments: {
    taskId: string;
    employeeId: string;
    reason: string;
  }[];
}

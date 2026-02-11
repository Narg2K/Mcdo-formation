
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
  // Added optional properties to support external certificates and status notes
  isExternal?: boolean;
  observations?: string;
}

export interface GlobalCertConfig {
  name: string;
  isMandatory: boolean;
  validityMonths: number;
}

export interface ContractConfig {
  id: string;
  name: string;
  weeklyHours: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  category: 'EQUIPE' | 'SOC' | 'FORMATION' | 'SYSTEM' | 'RETARD';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  deadline: string;
  status: 'Unassigned' | 'Assigned';
  assignedTo?: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface AIPlanningResponse {
  assignments: {
    taskId: string;
    employeeId: string;
    reason: string;
  }[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: Skill[];
  trainings: TrainingModule[];
  certifications: EmployeeCert[];
  availability: DayAvailability[];
  entryDate?: string;
  contractEndDate?: string;
  phoneNumber?: string;
  contractType?: string;
  isArchived?: boolean;
  archivedDate?: string;
  archivedReason?: string;
  isDeleted?: boolean;
  deletedDate?: string;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'resolved';
}

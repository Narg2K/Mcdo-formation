
export enum Role {
  MANAGER = 'manager',
  TRAINER = 'formateur/formatrice',
  EQUIPPIER = 'équipier'
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
}

export interface GlobalCertConfig {
  name: string;
  isMandatory: boolean;
  validityMonths: number;
}

export interface Employee extends User {
  trainings: TrainingModule[];
  certifications: EmployeeCert[];
  department: string;
  isArchived?: boolean;
  availability: DayAvailability[];
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

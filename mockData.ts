
import { Role, Employee, DayAvailability, GlobalCertConfig, Task, Vacation } from './types';

export const DEFAULT_AVAILABILITY: DayAvailability[] = [
  { day: 'Lundi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Mardi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Mercredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Jeudi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Vendredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Samedi', isAvailable: false, startTime: '00:00', endTime: '00:00' },
  { day: 'Dimanche', isAvailable: false, startTime: '00:00', endTime: '00:00' },
];

export const DEFAULT_CERTIFICATIONS: GlobalCertConfig[] = [
  { name: 'FRED APP', isMandatory: true, validityMonths: 12 },
  { name: 'HACCP / HYGIÈNE', isMandatory: true, validityMonths: 24 },
  { name: 'SST (SECOURISME)', isMandatory: true, validityMonths: 24 },
  { name: 'SÉCURITÉ INCENDIE', isMandatory: true, validityMonths: 12 }
];

export const DEFAULT_SKILLS = [
  'LIGNE / GARNITURE',
  'BOISSONS / DESSERTS',
  'FRITES',
  'DRIVE / COMMANDE',
  'ACCUEIL / SALLE',
  'LIVRAISON',
  'MAINTENANCE LOURDE'
];

export const MOCK_TRAINING_MODULES: any[] = [];
export const MOCK_EMPLOYEES: Employee[] = [];

// Fix for missing MOCK_TASKS in IntelligentPlanner
export const MOCK_TASKS: Task[] = [
  {
    id: 'TASK-1',
    title: 'Nettoyage Extracteurs',
    description: 'Démontage et dégraissage complet des filtres de hotte en cuisine.',
    requiredSkills: ['MAINTENANCE LOURDE'],
    deadline: '2024-06-15',
    status: 'Unassigned'
  },
  {
    id: 'TASK-2',
    title: 'Inventaire Mensuel Sec',
    description: 'Comptage complet du stock sec et des emballages.',
    requiredSkills: ['MAINTENANCE LOURDE'],
    deadline: '2024-06-20',
    status: 'Unassigned'
  }
];

// Fix for missing MOCK_VACATIONS in VacationCalendar and IntelligentPlanner
export const MOCK_VACATIONS: Vacation[] = [
  {
    id: 'VAC-1',
    employeeId: 'EMP-1',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    type: 'Congés'
  }
];

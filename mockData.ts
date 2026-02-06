
import { Role, Employee, Task, Vacation, DayAvailability } from './types';

const DEFAULT_AVAILABILITY: DayAvailability[] = [
  { day: 'Lundi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Mardi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Mercredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Jeudi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Vendredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
  { day: 'Samedi', isAvailable: true, startTime: '10:00', endTime: '15:00' },
  { day: 'Dimanche', isAvailable: true, startTime: '10:00', endTime: '15:00' },
];

export const MOCK_TRAINING_MODULES = [
  { id: 'm1', title: 'Hygiène Alimentaire (HACCP)', category: 'Sécurité' },
  { id: 'm2', title: 'Sécurité Incendie', category: 'Sécurité' },
  { id: 'm3', title: 'Accueil Client & Hospitalité', category: 'Service' },
  { id: 'm4', title: 'Gestion des Rushs', category: 'Opérations' },
  { id: 'm5', title: 'Maintenance Grill', category: 'Maintenance' },
];

const generateEmployees = (): Employee[] => {
  const employees: Employee[] = [];
  const names = ["Thomas", "Sarah", "Kevin", "Léa", "Nicolas", "Julie", "Maxime", "Chloé", "Antoine", "Emma"];
  const lastNames = ["Legrand", "Benali", "Morel", "Dubois", "Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard"];

  for (let i = 1; i <= 20; i++) {
    const nameIndex = (i - 1) % names.length;
    const lastNameIndex = (i - 1) % lastNames.length;
    const fullName = `${names[nameIndex]} ${lastNames[lastNameIndex]}`;
    
    let role = Role.EQUIPPIER;
    if (i === 1) role = Role.MANAGER;
    else if (i <= 4) role = Role.TRAINER;

    employees.push({
      id: i.toString(),
      name: fullName,
      email: `${names[nameIndex].toLowerCase()}@macdo.io`,
      role: role,
      department: role,
      availability: [...DEFAULT_AVAILABILITY],
      skills: [
        { name: 'ligne', level: i % 3 === 0 ? 'Expert' : 'Formé' },
        { name: 'boisson', level: 'Intermédiaire' }
      ],
      trainings: MOCK_TRAINING_MODULES.map(m => ({
        ...m,
        status: i > 10 ? 'À faire' : (Math.random() > 0.2 ? 'Validé' : 'En cours'),
        dateCompleted: '2024-03-15'
      })),
      certifications: [
        { name: 'Certification HACCP Pro', status: 'Complété', expiryDate: '2025-01-10' }
      ]
    });
  }
  return employees;
};

export const MOCK_EMPLOYEES: Employee[] = generateEmployees();

export const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Inventaire Hebdo', description: 'Comptage stocks secs.', requiredSkills: ['cuison viande'], status: 'Pending', deadline: '2024-06-30' },
  { id: 'task-2', title: 'Maintenance Machine Glace', description: 'Nettoyage Heat Treatment.', requiredSkills: ['glace'], status: 'Pending', deadline: '2024-07-05' }
];

export const MOCK_VACATIONS: Vacation[] = [
  { id: 'v1', employeeId: '2', startDate: '2024-06-25', endDate: '2024-07-05', type: 'Congés' },
  { id: 'v2', employeeId: '5', startDate: '2024-06-28', endDate: '2024-06-30', type: 'Maladie' },
  { id: 'v3', employeeId: '10', startDate: '2024-07-01', endDate: '2024-07-10', type: 'Congés' }
];

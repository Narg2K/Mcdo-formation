
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Task, Vacation, AIPlanningResponse } from "../types";

export const getIntelligentAssignments = async (
  employees: Employee[],
  tasks: Task[],
  vacations: Vacation[]
): Promise<AIPlanningResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    En tant qu'assistant de planification intelligent pour un restaurant McDonald's (Plateforme McFormation), affecte de manière optimale les tâches suivantes.
    
    Critères prioritaires :
    1. COMPÉTENCE : L'employé doit posséder la compétence requise. 
       - Favorise les niveaux "Expert" et "Formé" pour les tâches critiques.
       - Évite d'affecter un "Débutant" seul sur une tâche complexe.
    2. DISPONIBILITÉ : L'employé ne doit pas être en vacances (données fournies).
    3. ÉQUITÉ : Répartis la charge de travail intelligemment sur l'équipe.

    Données :
    Employés (Nom, Rôle, Compétences et Niveaux): ${JSON.stringify(employees.map(e => ({ id: e.id, name: e.name, skills: e.skills })))}
    Tâches: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, requiredSkills: t.requiredSkills, deadline: t.deadline })))}
    Vacances: ${JSON.stringify(vacations)}

    Explique brièvement la raison de chaque affectation en citant le niveau de compétence (ex: "Thomas est Expert sur ce poste").
    Réponds uniquement au format JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assignments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                taskId: { type: Type.STRING },
                employeeId: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["taskId", "employeeId", "reason"]
            }
          }
        },
        required: ["assignments"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as AIPlanningResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return { assignments: [] };
  }
};

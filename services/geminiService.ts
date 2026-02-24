
import { GoogleGenAI, Type } from "@google/genai";
import { Employee, Task, Vacation, AIPlanningResponse } from "../types";

export const getIntelligentAssignments = async (
  employees: Employee[],
  tasks: Task[],
  vacations: Vacation[]
): Promise<AIPlanningResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    En tant qu'assistant de planification pour McDonald's, affecte ces tâches logistiques.
    
    Contraintes :
    1. COMPÉTENCE : L'employé doit être capable (Expert/Formé).
    2. DISPONIBILITÉ : Pas de vacances.
    3. ÉQUITÉ : Charge répartie.

    Données :
    Employés: ${JSON.stringify(employees.map(e => ({ id: e.id, name: e.name, skills: e.skills })))}
    Tâches: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, requiredSkills: t.requiredSkills })))}
    Vacances: ${JSON.stringify(vacations)}

    Réponds uniquement en JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
    const text = response.text || "{}";
    return JSON.parse(text.trim()) as AIPlanningResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return { assignments: [] };
  }
};

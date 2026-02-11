
import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, BrainCircuit, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { Task, AIPlanningResponse, SkillLevel, Employee, ActivityLog } from '../types';
import { getIntelligentAssignments } from '../services/geminiService';
import { MOCK_TASKS, MOCK_VACATIONS } from '../mockData';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  'Expert': 'bg-emerald-100 text-emerald-800',
  'Formé': 'bg-green-100 text-green-700',
  'Intermédiaire': 'bg-amber-100 text-amber-700',
  'Débutant': 'bg-orange-100 text-orange-700',
  'Non Formé': 'bg-red-100 text-red-700',
};

interface IntelligentPlannerProps {
  employees: Employee[];
  onAddActivity: (action: string, details: string, category: ActivityLog['category']) => void;
}

const IntelligentPlanner: React.FC<IntelligentPlannerProps> = ({ employees, onAddActivity }) => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [isPlanning, setIsPlanning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIPlanningResponse | null>(null);

  const handleAIPlan = async () => {
    setIsPlanning(true);
    try {
      const result = await getIntelligentAssignments(employees, tasks, MOCK_VACATIONS);
      setAiSuggestions(result);
      
      const updatedTasks = tasks.map(t => {
        const assignment = result.assignments.find(a => a.taskId === t.id);
        if (assignment) {
          return { ...t, assignedTo: assignment.employeeId, status: 'Assigned' as const };
        }
        return t;
      });
      setTasks(updatedTasks);
      onAddActivity('Planification IA', 'Optimisation des tâches logistiques via Gemini.', 'FORMATION');
    } catch (error) {
      console.error("AI Planning failed", error);
    } finally {
      setIsPlanning(false);
    }
  };

  const getEmployeeName = (id?: string) => {
    return employees.find(e => e.id === id)?.name || 'Non assigné';
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Maintenance & Logistique</h1>
          <p className="text-slate-500 font-medium">Affectation intelligente via Gemini.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleAIPlan}
            disabled={isPlanning}
            className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {isPlanning ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            <span>Optimiser via IA</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-black text-[10px] flex justify-between items-center text-slate-400 uppercase tracking-widest">
              <span>Opérations programmées</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full">{tasks.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {tasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg tracking-tight uppercase">{task.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{task.description}</p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                        task.status === 'Assigned' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}>
                        {task.status === 'Assigned' ? 'Assigné' : 'À Faire'}
                      </div>
                      <div className="mt-4">
                        {task.assignedTo ? (
                          <div className="flex items-center justify-end bg-white px-3 py-1.5 rounded-2xl border border-slate-100">
                             <span className="mr-3 text-[10px] font-black uppercase text-slate-900">{getEmployeeName(task.assignedTo)}</span>
                             <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                                {getEmployeeName(task.assignedTo)[0]}
                             </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">En attente</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-white p-3 rounded-2xl">
                    <Sparkles size={28} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="font-black text-xl tracking-tight uppercase">Moteur IA</h3>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Optimisation Logistique</p>
                </div>
              </div>
              
              {isPlanning ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="animate-spin text-blue-400 mb-6" size={56} strokeWidth={3} />
                  <p className="text-blue-100 text-sm font-black uppercase tracking-widest animate-pulse">Calcul de la meilleure répartition...</p>
                </div>
              ) : aiSuggestions ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {aiSuggestions.assignments.map((a, idx) => (
                    <div key={idx} className="bg-white/10 p-5 rounded-[2rem] border border-white/20 text-sm">
                      <div className="flex items-center text-white font-black mb-3 uppercase tracking-tight">
                        <CheckCircle2 size={18} className="mr-3 text-emerald-400" />
                        {tasks.find(t => t.id === a.taskId)?.title}
                      </div>
                      <p className="text-[11px] text-blue-50 font-black uppercase tracking-widest mb-2">{getEmployeeName(a.employeeId)}</p>
                      <p className="text-[10px] text-blue-200/90 leading-relaxed font-medium italic">"{a.reason}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white/5 rounded-[2.5rem] border-4 border-dashed border-white/10">
                  <BrainCircuit className="mx-auto mb-6 opacity-20" size={64} />
                  <p className="text-blue-100 text-xs font-black uppercase tracking-widest leading-relaxed px-10">
                    Cliquez sur "Optimiser" pour répartir les tâches intelligemment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentPlanner;

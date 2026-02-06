
import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, BrainCircuit, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { MOCK_EMPLOYEES, MOCK_TASKS, MOCK_VACATIONS } from '../mockData';
import { Task, AIPlanningResponse, SkillLevel } from '../types';
import { getIntelligentAssignments } from '../services/geminiService';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  'Expert': 'bg-emerald-100 text-emerald-800',
  'Formé': 'bg-green-100 text-green-700',
  'Intermédiaire': 'bg-amber-100 text-amber-700',
  'Débutant': 'bg-orange-100 text-orange-700',
  'Non Formé': 'bg-red-100 text-red-700',
};

const IntelligentPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [isPlanning, setIsPlanning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIPlanningResponse | null>(null);

  const handleAIPlan = async () => {
    setIsPlanning(true);
    try {
      const result = await getIntelligentAssignments(MOCK_EMPLOYEES, tasks, MOCK_VACATIONS);
      setAiSuggestions(result);
      
      const updatedTasks = tasks.map(t => {
        const assignment = result.assignments.find(a => a.taskId === t.id);
        if (assignment) {
          return { ...t, assignedTo: assignment.employeeId, status: 'Assigned' as const };
        }
        return t;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("AI Planning failed", error);
    } finally {
      setIsPlanning(false);
    }
  };

  const getEmployeeName = (id?: string) => {
    return MOCK_EMPLOYEES.find(e => e.id === id)?.name || 'Non assigné';
  };

  const getEmployeeSkillLevelForTask = (empId: string, skillName: string): SkillLevel | null => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
    const skill = emp?.skills.find(s => s.name === skillName);
    return skill ? skill.level : null;
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Maintenance & Logistique</h1>
          <p className="text-slate-500 font-medium">Pilotage intelligent des livraisons, inventaires et nettoyages lourds.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <span className="flex items-center gap-2"><Plus size={18} /> Nouvelle Tâche</span>
          </button>
          <button 
            onClick={handleAIPlan}
            disabled={isPlanning}
            className="flex items-center space-x-3 px-6 py-3 bg-[#264f36] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1d3c29] disabled:opacity-50 shadow-lg shadow-[#264f36]/20 transition-all active:scale-95"
          >
            {isPlanning ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            <span>Optimiser via IA</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-xl overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-black text-[10px] flex justify-between items-center text-slate-400 uppercase tracking-[0.2em]">
              <span>Opérations programmées</span>
              <span className="bg-[#264f36] text-white px-3 py-1 rounded-full">{tasks.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {tasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg tracking-tight uppercase">{task.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 font-medium">{task.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <Calendar size={14} className="mr-2 text-[#264f36]" /> {task.deadline}
                        </div>
                        <div className="flex gap-2">
                          {task.requiredSkills.map(skillName => (
                            <span key={skillName} className="text-[9px] px-3 py-1 bg-[#264f36]/5 text-[#264f36] rounded-lg font-black uppercase tracking-widest border border-[#264f36]/10">
                              {skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 ${
                        task.status === 'Assigned' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}>
                        {task.status === 'Assigned' ? 'Assigné' : 'À Faire'}
                      </div>
                      <div className="mt-4">
                        {task.assignedTo ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center justify-end bg-white px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                              <span className="mr-3 text-[10px] font-black uppercase tracking-tight text-slate-900">{getEmployeeName(task.assignedTo)}</span>
                              <div className="w-8 h-8 rounded-xl bg-[#264f36] text-white flex items-center justify-center text-xs font-black shadow-lg shadow-[#264f36]/20">
                                {getEmployeeName(task.assignedTo)[0]}
                              </div>
                            </div>
                            <div className="flex gap-1 mt-2">
                                {task.requiredSkills.map(rs => {
                                  const level = getEmployeeSkillLevelForTask(task.assignedTo!, rs);
                                  return level ? (
                                    <span key={rs} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${LEVEL_COLORS[level]}`}>
                                      {level}
                                    </span>
                                  ) : null;
                                })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic opacity-50">En attente</span>
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
          <div className="bg-[#264f36] text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                    <Sparkles size={28} className="text-[#264f36]" />
                </div>
                <div>
                    <h3 className="font-black text-xl tracking-tight uppercase">Moteur IA McFormation</h3>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Optimisation Logistique</p>
                </div>
              </div>
              
              {isPlanning ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <Loader2 className="animate-spin text-emerald-400" size={56} strokeWidth={3} />
                    <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={24} />
                  </div>
                  <p className="text-emerald-100 text-sm font-black uppercase tracking-widest animate-pulse">Calcul de la meilleure répartition...</p>
                  <p className="text-[10px] text-emerald-400/60 mt-2 font-bold italic">Analyse des SOC, des livraisons et des disponibilités...</p>
                </div>
              ) : aiSuggestions ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  <p className="text-[9px] text-emerald-400/70 font-black uppercase tracking-[0.2em] mb-4">Recommandations de l'IA</p>
                  <div className="space-y-4">
                    {aiSuggestions.assignments.map((a, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/20 text-sm hover:bg-white/15 transition-all">
                        <div className="flex items-center text-white font-black mb-3 uppercase tracking-tight">
                          <CheckCircle2 size={18} className="mr-3 text-emerald-400" strokeWidth={3} />
                          {tasks.find(t => t.id === a.taskId)?.title}
                        </div>
                        <div className="flex items-center gap-3 mb-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                                {getEmployeeName(a.employeeId)[0]}
                            </div>
                            <p className="text-[11px] text-emerald-50 font-black uppercase tracking-widest">{getEmployeeName(a.employeeId)}</p>
                        </div>
                        <p className="text-[10px] text-emerald-200/90 leading-relaxed font-medium italic">"{a.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center bg-white/5 rounded-[2.5rem] border-4 border-dashed border-white/10 group-hover:border-white/20 transition-all">
                  <BrainCircuit className="mx-auto mb-6 opacity-20" size={64} />
                  <p className="text-emerald-100 text-xs font-black uppercase tracking-widest leading-relaxed px-10">
                    Optimisez les tâches de maintenance pour ne pas surcharger les rushs de midi et soir.
                  </p>
                  <p className="text-[10px] text-emerald-400/50 mt-4 font-bold uppercase tracking-widest">Prêt pour l'analyse</p>
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

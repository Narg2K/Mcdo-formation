
import React from 'react';
import { GraduationCap, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';

interface ModuleSelectionProps {
  onSelect: (module: 'training' | 'planning') => void;
  userName: string;
}

const ModuleSelection: React.FC<ModuleSelectionProps> = ({ onSelect, userName }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#264f36]/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-4xl w-full text-center mb-16 relative z-10">
        <div className="inline-block bg-[#264f36] p-4 rounded-3xl mb-8 shadow-xl border-4 border-white">
          <span className="text-white text-4xl font-black">M</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Bienvenue sur <span className="text-[#264f36] uppercase">McFormation</span>
        </h1>
        <p className="text-xl text-slate-600 font-medium">
          {userName}, connectez-vous aux outils opérationnels de votre restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10">
        {/* Training Module Card */}
        <button
          onClick={() => onSelect('training')}
          className="group relative bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 hover:border-[#264f36] transition-all duration-500 text-left overflow-hidden flex flex-col h-full hover:-translate-y-2"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-[#264f36]">
            <GraduationCap size={160} />
          </div>
          <div className="bg-[#264f36]/5 text-[#264f36] p-5 rounded-2xl w-fit mb-8 group-hover:bg-[#264f36] group-hover:text-white transition-colors duration-300">
            <GraduationCap size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Parcours Formation</h2>
          <p className="text-slate-500 mb-10 text-lg flex-1 leading-relaxed">
            Validation des SOC, suivi de la polyvalence des équipiers et passage de niveaux (E1, E2, E3).
          </p>
          <div className="flex items-center text-[#264f36] font-black text-lg group-hover:translate-x-2 transition-transform duration-300">
            <span>Ouvrir le suivi SOC</span>
            <ArrowRight size={24} className="ml-3" />
          </div>
        </button>

        {/* Planning Module Card */}
        <button
          onClick={() => onSelect('planning')}
          className="group relative bg-[#1d3c29] p-10 rounded-[3rem] shadow-2xl border-2 border-[#1d3c29] hover:border-emerald-400 transition-all duration-500 text-left overflow-hidden flex flex-col h-full hover:-translate-y-2"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays size={160} className="text-white" />
          </div>
          <div className="bg-[#264f36] text-white p-5 rounded-2xl w-fit mb-8 group-hover:bg-white group-hover:text-[#264f36] transition-colors duration-300 border border-white/20">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Planning Store</h2>
          <p className="text-emerald-100/70 mb-10 text-lg flex-1 leading-relaxed">
            Planification des shifts, gestion des tâches de maintenance et optimisation des postes via IA.
          </p>
          <div className="flex items-center text-emerald-400 font-black text-lg group-hover:translate-x-2 transition-transform duration-300">
            <span>Gérer le planning</span>
            <ArrowRight size={24} className="ml-3" />
          </div>
        </button>
      </div>

      <div className="mt-20 text-slate-400 font-bold tracking-widest uppercase text-sm flex items-center gap-4">
        <div className="h-px w-8 bg-slate-200"></div>
        McDonald's Digital Ops Store • 2024
        <div className="h-px w-8 bg-slate-200"></div>
      </div>
    </div>
  );
};

export default ModuleSelection;


import React, { useState } from 'react';
import { Archive, Search, Eye, X, GraduationCap, CheckCircle, Calendar, Briefcase, UserCircle, MessageSquare, Info, UserPlus, RotateCcw, History, FileText, AlertCircle, AlertTriangle, PenTool, AlertOctagon } from 'lucide-react';
import { Employee, Role } from '../types';
import { ROLE_COLOR_CONFIG } from './EmployeeList';

interface ArchiveListProps {
  archivedEmployees: Employee[];
  onRestore: (id: string) => void;
  onUpdateReason: (id: string, reason: string) => void;
}

const ArchiveList: React.FC<ArchiveListProps> = ({ archivedEmployees, onRestore, onUpdateReason }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArchiveTab, setActiveArchiveTab] = useState<'valid' | 'pending'>('valid');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [completionReason, setCompletionReason] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState<Employee | null>(null);

  const filtered = archivedEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingArchives = filtered.filter(emp => emp.archivedReason?.includes('[AUTO]'));
  const validArchives = filtered.filter(emp => !emp.archivedReason?.includes('[AUTO]'));

  const displayList = activeArchiveTab === 'valid' ? validArchives : pendingArchives;

  const getRoleStyle = (role: Role) => ROLE_COLOR_CONFIG[role] || ROLE_COLOR_CONFIG[Role.EQUIPPIER];

  const handleFinalizeDossier = () => {
    if (showCompletionModal && completionReason.trim()) {
      onUpdateReason(showCompletionModal.id, completionReason);
      setShowCompletionModal(null);
      setCompletionReason('');
    }
  };

  return (
    <div className="space-y-8 animate-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Archives Restaurant</h1>
          <p className="text-slate-500 font-medium">Historique des départs et dossiers de fin de contrat.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Rechercher un dossier..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold outline-none focus:border-[#264f36] transition-all w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
         <button 
           onClick={() => setActiveArchiveTab('valid')}
           className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeArchiveTab === 'valid' ? 'bg-white text-[#264f36] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
         >
            <CheckCircle size={14} /> Dossiers Validés
            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[8px]">{validArchives.length}</span>
         </button>
         <button 
           onClick={() => setActiveArchiveTab('pending')}
           className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeArchiveTab === 'pending' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
         >
            <AlertTriangle size={14} /> À Compléter
            <span className={`px-2 py-0.5 rounded-full text-[8px] ${pendingArchives.length > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>{pendingArchives.length}</span>
         </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employé</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">État du Dossier</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Archivage</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayList.length > 0 ? displayList.map(emp => {
              const rStyle = getRoleStyle(emp.role as Role);
              const isPending = emp.archivedReason?.includes('[AUTO]');
              
              return (
                <tr key={emp.id} className={`group hover:bg-slate-50/50 transition-colors ${isPending ? 'bg-red-50/20' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase border ${rStyle.bg} ${rStyle.text} ${rStyle.border}`}>
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{emp.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${rStyle.text}`}>{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {isPending ? (
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cause Manquante</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Dossier Complet</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-900">{emp.archivedDate || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                        {isPending && (
                          <button 
                            onClick={() => setShowCompletionModal(emp)}
                            className="p-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center gap-2 px-4" 
                          >
                             <PenTool size={16} /> <span className="text-[9px] font-black uppercase">Finaliser</span>
                          </button>
                        )}
                        <button 
                          onClick={() => onRestore(emp.id)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-[#264f36] hover:text-white rounded-xl transition-all shadow-sm border border-emerald-100" 
                          title="Réintégrer"
                        >
                           <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100" 
                        >
                           <Eye size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Archive size={32} className="text-slate-200" />
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucun dossier dans cette section</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Finalize Dossier Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowCompletionModal(null)} />
           <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-red-600 p-8 text-white">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Finaliser le Dossier RH</h3>
                 <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest">{showCompletionModal.name} - Fin de contrat automatique</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertOctagon size={12} /> Motif officiel du départ
                    </label>
                    <textarea 
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 text-sm font-bold text-slate-800 outline-none focus:border-red-500 focus:bg-white transition-all h-32 resize-none"
                      placeholder="Saisissez la raison précise du départ (Démission, Fin de CDD, Rupture conventionnelle...)"
                      value={completionReason}
                      onChange={(e) => setCompletionReason(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => setShowCompletionModal(null)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                    >
                      Annuler
                    </button>
                    <button 
                      disabled={!completionReason.trim()}
                      onClick={handleFinalizeDossier}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30"
                    >
                      Valider le Dossier
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Detail Modal (Popup) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in" 
            onClick={() => setSelectedEmployee(null)} 
          />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-100">
            {/* Modal Header */}
            <div className={`${selectedEmployee.archivedReason?.includes('[AUTO]') ? 'bg-red-600' : 'bg-[#264f36]'} p-8 text-white relative`}>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] border flex items-center justify-center text-2xl font-black ${getRoleStyle(selectedEmployee.role as Role).bg} ${getRoleStyle(selectedEmployee.role as Role).text} ${getRoleStyle(selectedEmployee.role as Role).border}`}>
                  {selectedEmployee.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{selectedEmployee.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getRoleStyle(selectedEmployee.role as Role).bg} ${getRoleStyle(selectedEmployee.role as Role).text} border-white/20`}>{selectedEmployee.role}</span>
                    <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{selectedEmployee.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar max-h-[60vh] space-y-8">
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <History size={16} className="text-amber-500" /> Journal Officiel des Archivages
                    </h3>
                 </div>
                 
                 <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-6 shadow-inner">
                    {selectedEmployee.archivedReason ? (
                      <div className="relative">
                         <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-amber-200/50"></div>
                         <div className="space-y-8">
                            {selectedEmployee.archivedReason.split('----------------------------------').map((block, idx) => (
                               <div key={idx} className="relative pl-8">
                                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm"></div>
                                  <p className="text-[12px] font-bold text-slate-700 leading-relaxed whitespace-pre-line italic">
                                     {block.trim()}
                                  </p>
                               </div>
                            ))}
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-slate-400">
                         <Info size={16} />
                         <p className="text-[10px] font-bold uppercase tracking-widest">Aucun motif détaillé n'a été saisi lors de l'archivage.</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Summary Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm border border-slate-50"><Calendar size={20} /></div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Dernière Sortie</span>
                    <span className="text-sm font-black text-slate-900">{selectedEmployee.archivedDate}</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm border border-slate-50"><Briefcase size={20} /></div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Type Contrat</span>
                    <span className="text-sm font-black text-slate-900">{selectedEmployee.contractType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
              {selectedEmployee.archivedReason?.includes('[AUTO]') && (
                <button 
                  onClick={() => { setShowCompletionModal(selectedEmployee); setSelectedEmployee(null); }}
                  className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95"
                >
                  <PenTool size={18} /> Compléter le dossier
                </button>
              )}
              <button 
                onClick={() => { onRestore(selectedEmployee.id); setSelectedEmployee(null); }}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#264f36] transition-all active:scale-95 group"
              >
                <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" /> Réintégrer l'Équipe
              </button>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-8 py-4 bg-slate-200 text-slate-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveList;

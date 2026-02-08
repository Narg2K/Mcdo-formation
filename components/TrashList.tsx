
import React, { useState } from 'react';
import { Trash2, Search, RotateCcw, XCircle, Info, UserCircle, Briefcase, Calendar, AlertTriangle } from 'lucide-react';
import { Employee, Role } from '../types';
import { ROLE_COLOR_CONFIG } from './EmployeeList';

interface TrashListProps {
  trashEmployees: Employee[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const TrashList: React.FC<TrashListProps> = ({ trashEmployees, onRestore, onPermanentDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filtered = trashEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDaysLeft = (deletedDate?: string) => {
    if (!deletedDate) return 30;
    const date = new Date(deletedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  };

  const getRoleStyle = (role: Role) => ROLE_COLOR_CONFIG[role] || ROLE_COLOR_CONFIG[Role.EQUIPPIER];

  return (
    <div className="space-y-8 animate-in relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Corbeille</h1>
          <p className="text-slate-500 font-medium">Les éléments supprimés sont conservés 30 jours avant suppression définitive.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold outline-none focus:border-red-500 transition-all w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 text-red-700">
         <Info size={20} />
         <p className="text-xs font-bold uppercase tracking-widest">Auto-nettoyage activé : Les dossiers de plus de 30 jours sont effacés automatiquement.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipier</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Suppr.</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Délai Restant</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map(emp => {
              const rStyle = getRoleStyle(emp.role as Role);
              return (
                <tr key={emp.id} className="group hover:bg-red-50/20 transition-colors">
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
                    <span className="text-xs font-bold text-slate-900">{emp.deletedDate}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${calculateDaysLeft(emp.deletedDate) < 5 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                        {calculateDaysLeft(emp.deletedDate)} jours
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onRestore(emp.id)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all shadow-sm border border-emerald-100" 
                          title="Restaurer"
                        >
                           <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={() => onPermanentDelete(emp.id)}
                          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm border border-red-100" 
                          title="Supprimer définitivement"
                        >
                           <XCircle size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Trash2 size={32} className="text-slate-200" />
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">La corbeille est vide</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrashList;

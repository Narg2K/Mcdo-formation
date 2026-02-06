
import React from 'react';
import { Calendar as CalendarIcon, Umbrella, Thermometer, Clock, UserMinus, Plus } from 'lucide-react';
import { MOCK_VACATIONS, MOCK_EMPLOYEES } from '../mockData';

const VacationCalendar: React.FC = () => {
  const getEmployeeName = (id: string) => MOCK_EMPLOYEES.find(e => e.id === id)?.name || 'Inconnu';

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Congés': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Maladie': return 'bg-red-50 text-red-600 border-red-100';
      case 'RRT': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Congés': return <Umbrella size={14} />;
      case 'Maladie': return <Thermometer size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gestion des Absences</h2>
          <p className="text-slate-500 font-medium italic">Suivi des congés et indisponibilités de l'équipe.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#264f36] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg">
          <Plus size={18} /> Poser un congé
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#264f36]" /> Calendrier Mensuel
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div><span className="text-[10px] font-black uppercase text-slate-400">Congés</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div><span className="text-[10px] font-black uppercase text-slate-400">Maladie</span></div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2">{d}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col p-2 relative group hover:border-[#264f36] transition-all cursor-pointer">
                <span className="text-[10px] font-black text-slate-300">{i + 1}</span>
                {i === 24 || i === 25 ? <div className="mt-auto h-1 w-full bg-blue-500 rounded-full"></div> : null}
                {i === 27 ? <div className="mt-auto h-1 w-full bg-red-500 rounded-full"></div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl h-full">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
              <UserMinus size={18} /> Absences en cours
            </h3>
            <div className="space-y-4">
              {MOCK_VACATIONS.map(v => (
                <div key={v.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl group hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                        {getEmployeeName(v.employeeId)[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{getEmployeeName(v.employeeId)}</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase">{v.startDate} au {v.endDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${getTypeStyle(v.type)}`}>
                    {getTypeIcon(v.type)} {v.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationCalendar;


import React from 'react';
import { GraduationCap, CheckCircle, Users, ShieldAlert, BellRing, UserCheck, AlertOctagon, ShieldCheck, FileWarning, ChevronRight, Coffee, HeartHandshake } from 'lucide-react';
import { GlobalCertConfig, Role, Employee } from '../types';

interface DashboardProps {
  employees: Employee[];
  availableCertifications: GlobalCertConfig[];
  availableSkills: string[];
  onNavigateToEmployee: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ employees, availableCertifications, availableSkills, onNavigateToEmployee }) => {
  const mandatoryConfigs = availableCertifications.filter(c => c.isMandatory);
  
  const alertsByEmployee = employees.reduce((acc, emp) => {
    const empAlerts = [];
    for (const globalCert of mandatoryConfigs) {
      const empCert = emp.certifications.find(c => c.name === globalCert.name);
      if (!empCert || empCert.status !== 'Complété') {
        empAlerts.push({ certName: globalCert.name, type: 'MANQUANT', priority: 'HIGH' });
      } else if (empCert.expiryDate) {
        const expiryDate = new Date(empCert.expiryDate.split('/').reverse().join('-'));
        const now = new Date();
        const thirtyDays = new Date(); thirtyDays.setDate(now.getDate() + 30);
        if (expiryDate < now) empAlerts.push({ certName: globalCert.name, type: 'EXPIRÉ', priority: 'HIGH' });
        else if (expiryDate < thirtyDays) empAlerts.push({ certName: globalCert.name, type: 'ÉCHÉANCE', priority: 'MEDIUM' });
      }
    }
    if (empAlerts.length > 0) acc.push({ id: emp.id, name: emp.name, role: emp.role, alerts: empAlerts });
    return acc;
  }, [] as any[]);

  const completedCerts = employees.reduce((acc, emp) => {
    return acc + mandatoryConfigs.filter(mc => emp.certifications.some(c => c.name === mc.name && c.status === 'Complété')).length;
  }, 0);
  
  const totalSlots = employees.length * mandatoryConfigs.length;
  const certCompliance = totalSlots > 0 ? Math.round((completedCerts / totalSlots) * 100) : 100;

  const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center space-x-3 md:space-x-4 transition-all">
      <div className={`${color} p-3 md:p-4 rounded-xl shadow-lg`}>{icon}</div>
      <div>
        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl md:text-3xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Pilotage McFormation</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm italic">Conformité opérationnelle Store #0437.</p>
        </div>
        <div className={`flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl ${certCompliance < 80 ? 'bg-red-600' : 'bg-[#264f36]'} text-white`}>
           <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Conformité Certificats</span>
              <span className="text-xl md:text-2xl font-black">{certCompliance}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={<ShieldCheck size={20} className="text-slate-400" />} label="Managers" value={employees.filter(e => e.role === Role.MANAGER).length} color="bg-white border border-slate-100" />
        <StatCard icon={<GraduationCap size={20} className="text-white" />} label="Formateurs" value={employees.filter(e => e.role === Role.TRAINER).length} color="bg-blue-600" />
        <StatCard icon={<Users size={20} className="text-white" />} label="Équipiers" value={employees.filter(e => e.role === Role.EQUIPPIER).length} color="bg-sky-400" />
        <StatCard icon={<Coffee size={20} className="text-white" />} label="Mc Café" value={employees.filter(e => e.role === Role.MCCAFE).length} color="bg-emerald-500" />
        <StatCard icon={<HeartHandshake size={20} className="text-white" />} label="Accueil" value={employees.filter(e => e.role === Role.HOTE).length} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-6">
              <BellRing className="text-red-500" size={20} /> Alertes prioritaires ({alertsByEmployee.length})
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {alertsByEmployee.map((emp) => (
                <button key={emp.id} onClick={() => onNavigateToEmployee(emp.id)} className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-red-50 transition-all">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-xs text-slate-400">{emp.name[0]}</div>
                    <div className="truncate">
                      <p className="text-[10px] font-black uppercase text-slate-900 truncate">{emp.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{emp.alerts.length} alerte(s)</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
              {alertsByEmployee.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Aucune alerte</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
           <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-6">
             <GraduationCap className="text-[#264f36]" size={20} /> Qualité Opérationnelle
           </h2>
           <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-100">
                   <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Poste</th>
                   <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Formés</th>
                   <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ratio</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {availableSkills.map(skill => {
                   const trained = employees.filter(e => e.skills.some(s => s.name === skill && (s.level === 'Formé' || s.level === 'Expert'))).length;
                   const pct = employees.length > 0 ? Math.round((trained / employees.length) * 100) : 0;
                   return (
                     <tr key={skill}>
                       <td className="py-4 text-[10px] font-black uppercase text-slate-800">{skill}</td>
                       <td className="py-4 text-center font-black text-sm text-[#264f36]">{trained}</td>
                       <td className="py-4">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-[#264f36]" style={{ width: `${pct}%` }}></div>
                          </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

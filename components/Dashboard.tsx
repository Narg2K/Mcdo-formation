
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GraduationCap, CheckCircle, Clock, Award, Users, ShieldAlert, BellRing, UserCheck, AlertOctagon, UserCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../mockData';
import { GlobalCertConfig, Role } from '../types';

interface DashboardProps {
  availableCertifications: GlobalCertConfig[];
  availableSkills: string[];
  onNavigateToEmployee: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ availableCertifications, availableSkills, onNavigateToEmployee }) => {
  const [clickedAlertId, setClickedAlertId] = useState<string | null>(null);

  // Counts by Role
  const managersCount = MOCK_EMPLOYEES.filter(e => e.role === Role.MANAGER).length;
  const trainersCount = MOCK_EMPLOYEES.filter(e => e.role === Role.TRAINER).length;
  const equippiersCount = MOCK_EMPLOYEES.filter(e => e.role === Role.EQUIPPIER).length;

  // 1. Mandatory Certificate Logic
  const mandatoryConfigs = availableCertifications.filter(c => c.isMandatory);
  
  // Grouping alerts by employee for better readability
  const alertsByEmployee = MOCK_EMPLOYEES.reduce((acc, emp) => {
    const empAlerts = [];
    for (const globalCert of mandatoryConfigs) {
      const empCert = emp.certifications.find(c => c.name === globalCert.name);
      
      if (!empCert || empCert.status !== 'Complété') {
        empAlerts.push({ certName: globalCert.name, type: 'MANQUANT', priority: 'HIGH' });
      } else if (empCert.expiryDate) {
        const expiryDate = new Date(empCert.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (expiryDate < new Date()) {
          empAlerts.push({ certName: globalCert.name, type: 'EXPIRÉ', priority: 'HIGH', date: empCert.expiryDate });
        } else if (expiryDate < thirtyDaysFromNow) {
          empAlerts.push({ certName: globalCert.name, type: 'EXPIRATION PROCHE', priority: 'MEDIUM', date: empCert.expiryDate });
        }
      }
    }
    
    if (empAlerts.length > 0) {
      acc.push({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        alerts: empAlerts
      });
    }
    return acc;
  }, [] as any[]);

  // Compliance calculations
  const totalMandatorySlots = MOCK_EMPLOYEES.length * mandatoryConfigs.length;
  let completedMandatoryCerts = 0;
  MOCK_EMPLOYEES.forEach(emp => {
    mandatoryConfigs.forEach(mc => {
      const c = emp.certifications.find(cert => cert.name === mc.name);
      if (c?.status === 'Complété') completedMandatoryCerts++;
    });
  });

  const certComplianceRate = totalMandatorySlots > 0 ? Math.round((completedMandatoryCerts / totalMandatorySlots) * 100) : 100;

  const totalSkillSlots = MOCK_EMPLOYEES.length * availableSkills.length;
  let totalValidatedSkills = 0;
  MOCK_EMPLOYEES.forEach(emp => {
    emp.skills.forEach(skill => {
      if (skill.level === 'Formé' || skill.level === 'Expert') totalValidatedSkills++;
    });
  });

  const skillComplianceRate = totalSkillSlots > 0 ? Math.round((totalValidatedSkills / totalSkillSlots) * 100) : 100;
  const globalCompliance = Math.round((certComplianceRate + skillComplianceRate) / 2);

  const skillGraphData = availableSkills.map(skillName => {
    const trainedCount = MOCK_EMPLOYEES.filter(emp => 
      emp.skills.some(s => s.name === skillName && (s.level === 'Formé' || s.level === 'Expert'))
    ).length;
    return {
      name: skillName,
      'Formés/Experts': trainedCount,
      'Total Équipe': MOCK_EMPLOYEES.length
    };
  });

  const handleAlertClick = (empId: string) => {
    setClickedAlertId(empId);
    // Short delay for the animation to be seen
    setTimeout(() => {
      onNavigateToEmployee(empId);
    }, 300);
  };

  const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Pilotage McFormation</h1>
          <p className="text-slate-500 font-medium italic">Matrice de conformité opérationnelle du restaurant.</p>
        </div>
        <div className={`flex items-center gap-4 px-8 py-4 rounded-[2.5rem] shadow-xl transition-all ${globalCompliance < 80 ? 'bg-red-600 text-white pulse-red' : 'bg-[#264f36] text-white'}`}>
           {globalCompliance < 100 ? <AlertOctagon size={28} /> : <CheckCircle size={28} />}
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Conformité Globale</span>
              <span className="text-2xl font-black">{globalCompliance}%</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<ShieldAlert size={28} />} label="Effectif Managers" value={managersCount} color="bg-slate-900" />
        <StatCard icon={<UserCircle size={28} />} label="Effectif Formateurs" value={trainersCount} color="bg-[#264f36]" />
        <StatCard icon={<Users size={28} />} label="Effectif Équipiers" value={equippiersCount} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts Column - REGROUPED BY EMPLOYEE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <BellRing className="text-red-500 animate-bounce" size={24} /> Actions Requises
              </h2>
              <span className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-black">{alertsByEmployee.length} Équipiers</span>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {alertsByEmployee.length > 0 ? (
                alertsByEmployee.map((empGroup) => (
                  <button 
                    key={empGroup.id} 
                    onClick={() => handleAlertClick(empGroup.id)}
                    className={`w-full text-left p-6 rounded-[2.5rem] border-2 transition-all relative group overflow-hidden ${
                      clickedAlertId === empGroup.id ? 'alert-click-active' : 'bg-slate-50 border-slate-100 hover:border-red-200 hover:bg-red-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-red-500 group-hover:text-white transition-colors">
                          {empGroup.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{empGroup.name}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{empGroup.role}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                    </div>

                    <div className="space-y-2 mt-4">
                      {empGroup.alerts.map((alert: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-white/60 p-3 rounded-2xl border border-slate-200/50">
                          <div className="flex items-center gap-2">
                             {alert.type === 'MANQUANT' ? <AlertOctagon size={14} className="text-red-500" /> : <Clock size={14} className="text-amber-500" />}
                             <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{alert.certName}</span>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${alert.type === 'MANQUANT' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            {alert.type === 'MANQUANT' ? 'Manquant' : 'Expire'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="bg-emerald-50 text-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tout est en règle</p>
                </div>
              )}
            </div>
            
            <p className="mt-8 text-[9px] text-slate-400 font-bold italic text-center px-4 leading-relaxed">
              Cliquez sur un équipier pour accéder directement à son dossier de formation.
            </p>
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-8">
            {/* The Main Graph */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <GraduationCap size={240} />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <GraduationCap className="text-emerald-600" size={24} /> État des Formations par Poste
                    </h2>
                    <p className="text-slate-400 text-xs font-medium">Répartition des effectifs formés vs Capacité du restaurant.</p>
                  </div>
                  <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-4">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Qualité Poste</span>
                    <span className="text-2xl font-black text-emerald-800">{skillComplianceRate}%</span>
                  </div>
                </div>
                
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillGraphData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        fontSize={10} 
                        fontWeight="900" 
                        fontFamily="Inter"
                        tick={{ fill: '#64748b' }}
                        angle={-45} 
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight="900" tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc', radius: 10 }}
                        contentStyle={{ 
                          borderRadius: '1.5rem', 
                          border: 'none', 
                          boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                          padding: '1.5rem',
                          fontFamily: 'Inter',
                          fontWeight: 'bold'
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '30px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      <Bar name="Total Équipe" dataKey="Total Équipe" fill="#ef4444" radius={[10, 10, 10, 10]} barSize={40} />
                      <Bar name="Formés/Experts" dataKey="Formés/Experts" fill="#264f36" radius={[10, 10, 10, 10]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl flex flex-col justify-center border-b-8 border-red-500">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="bg-red-500 p-3 rounded-xl text-white"><ShieldAlert size={24} /></div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Rigueur Certificats</h3>
                   </div>
                   <div className="flex items-end justify-between">
                      <span className="text-5xl font-black tracking-tighter">{certComplianceRate}%</span>
                      <div className="w-1/2 h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                         <div className="h-full bg-red-500 rounded-full" style={{ width: `${certComplianceRate}%` }}></div>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center border-b-8 border-emerald-500">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-500 p-3 rounded-xl text-white"><UserCheck size={24} /></div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Polyvalence Store</h3>
                   </div>
                   <div className="flex items-end justify-between">
                      <span className="text-5xl font-black tracking-tighter text-slate-900">{skillComplianceRate}%</span>
                      <div className="w-1/2 h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                         <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${skillComplianceRate}%` }}></div>
                      </div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

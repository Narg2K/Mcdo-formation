
import React, { useMemo, useEffect } from 'react';
import { X, Printer, ShieldCheck, Download, Activity } from 'lucide-react';
import { Employee, SkillLevel, GlobalCertConfig, Role } from '../types';
import { ROLE_COLOR_CONFIG } from './EmployeeList';

interface ReportsPortalProps {
  type: 'soc' | 'certs';
  employees: Employee[];
  availableSkills: string[];
  availableCertifications: GlobalCertConfig[];
  onClose: () => void;
}

// Couleurs haute visibilité garanties pour l'impression
const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string }> = {
  'Expert': { bg: '#064e3b', text: '#ffffff' },
  'Formé': { bg: '#10b981', text: '#ffffff' },
  'Intermédiaire': { bg: '#f59e0b', text: '#ffffff' },
  'Débutant': { bg: '#f97316', text: '#ffffff' },
  'Non Formé': { bg: '#ef4444', text: '#ffffff' },
};

const CERT_COLORS: Record<string, { bg: string; text: string }> = {
  'Complété': { bg: '#10b981', text: '#ffffff' },
  'À faire': { bg: '#f59e0b', text: '#ffffff' },
  'Expiré': { bg: '#ef4444', text: '#ffffff' },
  'Manquant': { bg: '#64748b', text: '#ffffff' },
};

// Map pure hex colors for print roles
const ROLE_PRINT_COLORS: Record<string, { bg: string, text: string }> = {
  [Role.MANAGER]: { bg: '#ffffff', text: '#000000' },
  [Role.TRAINER]: { bg: '#2563eb', text: '#ffffff' },
  [Role.EQUIPPIER]: { bg: '#38bdf8', text: '#ffffff' },
  [Role.MCCAFE]: { bg: '#10b981', text: '#ffffff' },
  [Role.HOTE]: { bg: '#ef4444', text: '#ffffff' },
};

const formatHeaderName = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.length <= 10) return upper;
  
  const dict: Record<string, string> = {
    'MAINTENANCE': 'MAINT.',
    'LIVRAISON': 'LIVR.',
    'NETTOYAGE': 'NETT.',
    'BOISSON': 'BOIS.',
    'CUISON': 'CUIS.',
    'VIANDE': 'V.',
    'HOSPITALITÉ': 'HOSP.',
    'COMMANDE': 'CMD',
  };

  let formatted = upper;
  Object.entries(dict).forEach(([full, short]) => {
    formatted = formatted.replace(full, short);
  });

  return formatted.length > 12 ? formatted.substring(0, 10) + '..' : formatted;
};

const ReportsPortal: React.FC<ReportsPortalProps> = ({ type, employees, availableSkills, availableCertifications, onClose }) => {
  
  const originalTitle = document.title;

  const handleAction = (action: 'print' | 'install') => {
    const fileName = type === 'soc' ? `MATRICE_POSTE_${new Date().toLocaleDateString('fr-FR')}` : `REGISTRE_CERTIFS_${new Date().toLocaleDateString('fr-FR')}`;
    document.title = fileName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto report-wrapper">
      {/* Control Bar */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 no-print shadow-xl z-[210]">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-emerald-500 w-3 h-3 rounded-full animate-ping absolute inset-0"></div>
                <div className="bg-emerald-600 w-3 h-3 rounded-full relative"></div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#264f36] flex items-center gap-2">
                  <Activity size={12} /> Statut : Live Sync
                </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Rapport de direction prêt</p>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handleAction('install')}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg hover:bg-black transition-all active:scale-95 group"
            title="Enregistrer en PDF"
          >
            <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Installer PDF
          </button>
          <button 
            onClick={() => handleAction('print')}
            className="flex items-center gap-3 px-6 py-3 bg-[#264f36] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg hover:bg-emerald-900 transition-all active:scale-95"
            title="Imprimer"
          >
            <Printer size={16} /> Imprimer Matrix
          </button>
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Printable Document Area */}
      <div className="p-8 md:p-16 max-w-[29.7cm] mx-auto bg-white min-h-screen printable-content">
        {/* Document Header */}
        <div className="flex justify-between items-end mb-10 border-b-4 border-slate-900 pb-8">
          <div className="flex items-center gap-5">
             <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
               <ShieldCheck size={32} />
             </div>
             <div>
                <h1 className="text-slate-900 text-3xl font-black uppercase tracking-tighter leading-none">McDonald's Cannes</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Outil de gestion de restaurant #0437</p>
             </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
              {type === 'soc' ? 'Matrice de Poste' : 'Registre de Conformité Légale'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Édité le : {today}</p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="w-full mb-12">
          <table className="w-full border-collapse border-2 border-slate-900 table-fixed">
            <thead>
              <tr className="h-44">
                <th className="bg-slate-900 text-white p-4 text-[11px] font-black uppercase border border-slate-900 text-left w-[180px] align-middle">
                  Nom & Rôle
                </th>
                {type === 'soc' ? (
                  availableSkills.map(skill => (
                    <th className="bg-slate-50 border border-slate-900 p-0 relative min-w-[35px] max-w-[50px]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="transform -rotate-90 whitespace-nowrap text-[9px] font-black uppercase tracking-tighter text-slate-700">
                          {formatHeaderName(skill)}
                        </span>
                      </div>
                    </th>
                  ))
                ) : (
                  availableCertifications.filter(c => c.isMandatory).map(cert => (
                    <th key={cert.name} className="bg-slate-50 border border-slate-900 p-2 text-[9px] font-black uppercase leading-tight text-slate-700">
                      {cert.name}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const rPrint = ROLE_PRINT_COLORS[emp.role] || ROLE_PRINT_COLORS[Role.EQUIPPIER];
                return (
                  <tr key={emp.id} className="h-10 page-break-inside-avoid">
                    <td className="bg-white border-2 border-slate-900 p-0 overflow-hidden">
                      <div className="flex h-full">
                         <div className="w-2 print-color-exact" style={{ backgroundColor: rPrint.bg }}></div>
                         <div className="flex-1 p-2 flex flex-col justify-center truncate">
                            <span className="text-[11px] font-black uppercase text-slate-900 truncate">{emp.name}</span>
                            <span className="text-[7px] font-bold uppercase opacity-60" style={{ color: rPrint.bg === '#ffffff' ? '#64748b' : rPrint.bg }}>{emp.role}</span>
                         </div>
                      </div>
                    </td>
                    {type === 'soc' ? (
                      availableSkills.map(skillName => {
                        const skill = emp.skills.find(s => s.name.toUpperCase() === skillName.toUpperCase());
                        const level = skill?.level || 'Non Formé';
                        const styles = LEVEL_COLORS[level];
                        return (
                          <td 
                            key={skillName} 
                            className="border border-slate-900 text-center p-0.5 print-color-exact"
                            style={{ backgroundColor: styles.bg }}
                          >
                            <span className="text-[8px] font-black leading-none block uppercase" style={{ color: styles.text }}>
                              {level === 'Non Formé' ? 'NF' : level[0]}
                            </span>
                          </td>
                        );
                      })
                    ) : (
                      availableCertifications.filter(c => c.isMandatory).map(mandatoryCert => {
                        const empCert = emp.certifications.find(c => c.name === mandatoryCert.name);
                        const status = empCert?.status || 'Manquant';
                        const styles = CERT_COLORS[status];
                        return (
                          <td 
                            key={mandatoryCert.name} 
                            className="border border-slate-900 text-center p-1 print-color-exact"
                            style={{ backgroundColor: styles.bg }}
                          >
                            <span className="text-[9px] font-black uppercase leading-none" style={{ color: styles.text }}>
                              {status === 'Complété' ? 'OK' : status}
                            </span>
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-12 page-break-avoid border-t-2 border-slate-100 pt-10">
          <h3 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6 text-center">Légende des Niveaux & Rôles</h3>
          
          <div className="flex flex-col gap-8 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100 shadow-inner">
             {/* Levels Legend */}
             <div className="flex flex-wrap gap-8 justify-center">
                {Object.entries(LEVEL_COLORS).map(([label, styles]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-md print-color-exact" style={{ backgroundColor: styles.bg }}>
                      <span className="text-[8px] font-black" style={{ color: styles.text }}>{label === 'Non Formé' ? 'NF' : label[0]}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{label}</span>
                  </div>
                ))}
             </div>

             {/* Roles Legend - New Addition */}
             <div className="flex flex-wrap gap-6 justify-center border-t border-slate-200 pt-6">
                {Object.entries(ROLE_PRINT_COLORS).map(([role, styles]) => (
                  <div key={role} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm print-color-exact" style={{ backgroundColor: styles.bg }}></div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{role}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="mt-20 text-[9px] text-slate-300 font-bold uppercase text-center pt-6 border-t border-slate-50 italic tracking-widest">
          Système McDonald's Cannes • Store #0437 • Document d'Audit Opérationnel
        </div>
      </div>

      <style>{`
        @media print {
          @page { 
            size: landscape; 
            margin: 1cm; 
          }
          body { 
            background: white !important; 
          }
          .report-wrapper {
            position: static !important;
            overflow: visible !important;
          }
          .no-print { 
            display: none !important; 
          }
          .printable-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .page-break-inside-avoid { 
            page-break-inside: avoid; 
          }
          table { 
            width: 100% !important; 
            table-layout: fixed !important; 
            border-collapse: collapse !important;
            border: 2px solid #000 !important;
          }
          th, td { 
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print-color-exact {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPortal;

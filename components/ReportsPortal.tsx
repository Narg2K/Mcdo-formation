
import React, { useState } from 'react';
import { X, Printer, Download, Loader2, FileText, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Employee, SkillLevel, GlobalCertConfig, Role } from '../types';

interface ReportsPortalProps {
  type: 'soc' | 'certs';
  employees: Employee[];
  availableSkills: string[];
  availableCertifications: GlobalCertConfig[];
  onClose: () => void;
}

const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string }> = {
  'Expert': { bg: '#264f36', text: '#ffffff' },
  'Formé': { bg: '#10b981', text: '#ffffff' },
  'Intermédiaire': { bg: '#ffbc0d', text: '#000000' }, // Or McD avec texte noir pour contraste
  'Débutant': { bg: '#fdba74', text: '#92400e' },
  'Non Formé': { bg: '#f1f5f9', text: '#94a3b8' },
};

const CERT_COLORS: Record<string, { bg: string; text: string }> = {
  'Complété': { bg: '#264f36', text: '#ffffff' },
  'À faire': { bg: '#ffbc0d', text: '#000000' },
  'Expiré': { bg: '#ef4444', text: '#ffffff' },
  'Manquant': { bg: '#f1f5f9', text: '#cbd5e1' },
};

const ROLE_INDICATORS: Record<string, string> = {
  [Role.MANAGER]: '#0f172a',
  [Role.TRAINER]: '#2563eb',
  [Role.EQUIPPIER]: '#38bdf8',
  [Role.MCCAFE]: '#10b981',
  [Role.HOTE]: '#ef4444',
};

const formatHeaderName = (name: string) => {
  const upper = name.toUpperCase();
  const dict: Record<string, string> = {
    'MAINTENANCE': 'MAINT.', 'LIVRAISON': 'LIVR.', 'NETTOYAGE': 'NETT.',
    'BOISSON': 'BOIS.', 'CUISON': 'CUIS.', 'VIANDE': 'V.', 'COMMANDE': 'CMD'
  };
  let formatted = upper;
  Object.entries(dict).forEach(([f, s]) => { formatted = formatted.replace(f, s); });
  return formatted;
};

const ReportsPortal: React.FC<ReportsPortalProps> = ({ type, employees, availableSkills, availableCertifications, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const today = new Date().toLocaleDateString('fr-FR');

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('report-document-a4');
    
    // @ts-ignore
    const jspdfLib = window.jspdf;
    // @ts-ignore
    const html2canvasLib = window.html2canvas;

    if (!element || !jspdfLib || !html2canvasLib) {
      console.error("Librairies PDF manquantes ou élément non trouvé");
      alert("Erreur technique : Librairies de génération non prêtes. Veuillez réessayer ou utiliser 'Imprimer'.");
      setIsGenerating(false);
      return;
    }

    try {
      const canvas = await html2canvasLib(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jspdfLib.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const displayWidth = pdfWidth - (margin * 2);
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const displayHeight = displayWidth / ratio;

      pdf.addImage(imgData, 'JPEG', margin, margin, displayWidth, displayHeight);
      pdf.save(`MCFO_${type.toUpperCase()}_${today.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      alert("Une erreur est survenue lors de la création du PDF. L'option 'Imprimer' reste disponible.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-100 overflow-y-auto font-sans">
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6 no-print z-[610] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <ChevronLeft size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#264f36] p-2.5 rounded-xl text-white shadow-lg">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-tighter text-slate-900 leading-none">Console d'Exportation</h2>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Format A4 Portrait • Store #0437</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#264f36] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGenerating ? "Génération..." : "Télécharger PDF"}
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={16} /> Imprimer
          </button>

          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="py-12 flex flex-col items-center no-print bg-slate-200/40 min-h-screen">
        <div 
          id="report-document-a4" 
          className="bg-white shadow-2xl overflow-hidden"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            padding: '15mm 20mm',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}
        >
          <div className="flex justify-between items-end mb-10 border-b-2 border-slate-900 pb-6 w-full">
            <div className="flex items-center gap-4">
               <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" alt="M" className="w-12 h-12 object-contain" />
               <div className="flex flex-col">
                  <h1 className="text-slate-900 text-xl font-black uppercase tracking-tighter leading-none mb-1">McFormation</h1>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-80">Store Operations Report #0437</p>
               </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <h2 className="text-base font-black uppercase text-slate-900 tracking-tight leading-none mb-2">
                {type === 'soc' ? 'Matrice de Polyvalence' : 'Registre des Certificats'}
              </h2>
              <div className="bg-slate-900 text-white px-2 py-1 rounded-md">
                <p className="text-[8px] font-normal uppercase tracking-widest leading-none">Émis le {today}</p>
              </div>
            </div>
          </div>

          <div className="w-full flex-1">
            <table className="w-full border-collapse border border-slate-300 table-fixed">
              <thead>
                <tr className="h-32">
                  <th className="bg-slate-900 text-white p-3 text-[9px] font-black uppercase border border-slate-900 text-left w-[130px] align-middle">
                    Employé
                  </th>
                  {type === 'soc' ? (
                    availableSkills.map(skill => (
                      <th key={skill} className="bg-slate-50 border border-slate-300 p-0 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="transform -rotate-90 whitespace-nowrap text-[7px] font-black uppercase tracking-tighter text-slate-800">
                            {formatHeaderName(skill)}
                          </span>
                        </div>
                      </th>
                    ))
                  ) : (
                    availableCertifications.filter(c => c.isMandatory).map(cert => (
                      <th key={cert.name} className="bg-slate-50 border border-slate-300 p-1 text-[7px] font-black uppercase leading-tight text-slate-800 text-center align-middle">
                        {cert.name}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="h-8 page-break-inside-avoid">
                    <td className="bg-white border border-slate-300 p-0 overflow-hidden">
                      <div className="flex h-full items-center">
                         <div className="w-1.5 self-stretch" style={{ backgroundColor: ROLE_INDICATORS[emp.role] || '#64748b' }}></div>
                         <div className="flex-1 px-3 flex flex-col justify-center truncate">
                            <span className="text-[9px] font-black uppercase text-slate-900 truncate leading-none mb-0.5">{emp.name}</span>
                            <span className="text-[6px] font-bold uppercase text-slate-400 truncate tracking-widest">{emp.role}</span>
                         </div>
                      </div>
                    </td>
                    {type === 'soc' ? (
                      availableSkills.map(skillName => {
                        const skill = emp.skills.find(s => s.name.toUpperCase() === skillName.toUpperCase());
                        const level = skill?.level || 'Non Formé';
                        const styles = LEVEL_COLORS[level];
                        const char = level === 'Non Formé' ? '-' : level[0].toUpperCase();
                        return (
                          <td key={skillName} className="border border-slate-300 text-center p-0" style={{ backgroundColor: styles.bg }}>
                            <span className="text-[7px] font-black leading-none block uppercase" style={{ color: styles.text }}>
                              {char}
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
                          <td key={mandatoryCert.name} className="border border-slate-300 text-center p-0" style={{ backgroundColor: styles.bg }}>
                            <span className="text-[7px] font-black uppercase leading-none" style={{ color: styles.text }}>
                              {status === 'Complété' ? 'V' : '-'}
                            </span>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-start">
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
                {Object.entries(LEVEL_COLORS).map(([lvl, styles]) => (
                  <div key={lvl} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: styles.bg, border: '1px solid #e2e8f0' }}></div>
                    <span className="text-[7px] font-black uppercase text-slate-500">{lvl}</span>
                  </div>
                ))}
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Document généré par McFormation Console</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; margin: 0 !important; }
          .no-print { display: none !important; }
          #report-document-a4 {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          table { width: 100% !important; border: 1pt solid #cbd5e1 !important; }
          th, td { border: 0.5pt solid #cbd5e1 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default ReportsPortal;

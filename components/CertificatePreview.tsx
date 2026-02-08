
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Printer, ShieldCheck, Award, CheckCircle2, User, 
  Calendar, Edit3, ClipboardCheck, Eraser, Save, Download, Check, XCircle,
  RotateCcw, Info, PenTool, FileText, Star
} from 'lucide-react';
import { Employee, EmployeeCert } from '../types';

interface CertificatePreviewProps {
  employee: Employee;
  cert: EmployeeCert;
  validityMonths?: number;
  onClose: () => void;
  onSave?: (updatedCert: EmployeeCert) => void;
}

const SignaturePad: React.FC<{ 
  onSave: (data: string) => void, 
  label: string, 
  defaultValue?: string,
  readOnly?: boolean 
}> = ({ onSave, label, defaultValue, readOnly }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        if (defaultValue && defaultValue.startsWith('data:image')) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = defaultValue;
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [defaultValue]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (readOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL());
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSave('');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
        {!readOnly && (
          <button onClick={clear} className="text-slate-300 hover:text-red-500 transition-colors no-print">
            <Eraser size={14} />
          </button>
        )}
      </div>
      <div className={`relative border-2 ${readOnly ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 bg-slate-50/30'} rounded-2xl overflow-hidden h-32 ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}>
        <canvas ref={canvasRef} width={400} height={128} className="w-full h-full" onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} />
      </div>
    </div>
  );
};

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ employee, cert, validityMonths = 12, onClose, onSave }) => {
  const isCompleted = cert.status === 'Complété';
  const [evaluation, setEvaluation] = useState<Record<string, 'valid' | 'fail' | null>>(
    cert.evaluationDetails || {
      'Respect des procédures': null,
      'Hygiène et Sécurité': null,
      'Rapidité et Efficacité': null,
      'Qualité du Produit': null
    }
  );
  
  const [observations, setObservations] = useState<string>(cert.observations || '');
  const [trainerSig, setTrainerSig] = useState<string>(cert.trainerSignature || '');
  const [employeeSig, setEmployeeSig] = useState<string>(cert.employeeSignature || '');
  const [isEditing, setIsEditing] = useState(!isCompleted);

  const handleFinalSave = () => {
    if (!onSave) return;
    
    const obtainedDate = new Date();
    let expiryDateString: string | undefined = undefined;
    
    // Si validityMonths est > 0, on calcule une date d'expiration
    if (validityMonths && validityMonths > 0) {
      const expiryDate = new Date();
      expiryDate.setMonth(obtainedDate.getMonth() + validityMonths);
      expiryDateString = expiryDate.toLocaleDateString('fr-FR');
    }
    
    const updatedCert: EmployeeCert = {
      ...cert,
      status: 'Complété',
      dateObtained: obtainedDate.toLocaleDateString('fr-FR'),
      expiryDate: expiryDateString,
      observations,
      trainerSignature: trainerSig,
      employeeSignature: employeeSig,
      evaluationDetails: evaluation
    };
    
    onSave(updatedCert);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="fixed top-6 right-6 flex gap-3 no-print z-[310]">
        {isEditing ? (
          <button 
            onClick={handleFinalSave}
            disabled={!trainerSig || !employeeSig}
            className="flex items-center gap-2 px-6 py-3 bg-[#264f36] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            <Save size={18} /> Valider & Signer Numériquement
          </button>
        ) : (
          <button 
             onClick={() => window.print()}
             className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
          >
            <Printer size={18} /> Imprimer Copie
          </button>
        )}
        <button onClick={onClose} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all"><X size={18} /> Fermer</button>
      </div>

      <div className="bg-white w-full max-w-[21cm] p-12 relative shadow-2xl rounded-[2rem] overflow-y-auto max-h-[90vh] custom-scrollbar printable-cert">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#264f36] rounded-xl text-white">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Validation Opérationnelle</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">McFormation • Validation Numérique Restaurant</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase">Équipier : <span className="text-slate-900">{employee.name}</span></p>
            <p className="text-xs font-black uppercase text-[#264f36]">{cert.name}</p>
          </div>
        </div>

        <div className="space-y-8 mb-12">
           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-emerald-500" /> Grille d'Observation SOC
              </h3>
              <div className="space-y-3">
                {Object.keys(evaluation).map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{item}</span>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => setEvaluation(p => ({...p, [item]: 'valid'}))} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${evaluation[item] === 'valid' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}><Check size={16}/></button>
                          <button onClick={() => setEvaluation(p => ({...p, [item]: 'fail'}))} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${evaluation[item] === 'fail' ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-300'}`}><XCircle size={16}/></button>
                        </>
                      ) : (
                        <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase ${evaluation[item] === 'valid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {evaluation[item] === 'valid' ? 'Validé' : 'À revoir'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Observations & Feedback</label>
              {isEditing ? (
                <textarea 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-medium outline-none focus:border-[#264f36] transition-all h-32 resize-none"
                  placeholder="Points forts et axes d'amélioration..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
              ) : (
                <div className="p-5 bg-slate-50 rounded-3xl italic text-slate-600 border border-slate-100 min-h-[100px]">
                  {observations || "Aucune observation particulière."}
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-12 pt-12 border-t-2 border-slate-900">
              <SignaturePad label="Visa du Formateur / Direction" onSave={setTrainerSig} defaultValue={trainerSig} readOnly={!isEditing} />
              <SignaturePad label="Visa de l'Équipier" onSave={setEmployeeSig} defaultValue={employeeSig} readOnly={!isEditing} />
           </div>
        </div>

        <div className="mt-8 text-center bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
           <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Attestation de conformité numérique</p>
           <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.2em] italic">
             {validityMonths && validityMonths > 0 
               ? "Ce document numérique fait foi de certification opérationnelle avec renouvellement périodique."
               : "Ce document numérique fait foi de validation de formation interne acquise définitivement."}
           </p>
        </div>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-cert { padding: 0 !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CertificatePreview;

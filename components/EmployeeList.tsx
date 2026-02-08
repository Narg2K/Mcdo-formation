
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Award, ChevronLeft, ChevronRight, UserPlus, X, 
  CheckSquare, Check, ShieldAlert, Save, Plus, Trash2, Archive,
  ShieldCheck, Users, Timer, Activity, GraduationCap, AlertOctagon, Star, ExternalLink,
  FileText, PenTool, CheckCircle2, Mail, Copy, CheckCircle as CheckIcon, PlusCircle, FileUp, RotateCcw,
  Phone, Settings2, Briefcase, Undo2
} from 'lucide-react';
import { Employee, Role, GlobalCertConfig, SkillLevel, TrainingModule, ContractConfig, EmployeeCert, EventLog, ActivityLog, TrainingFeedback } from '../types';
import ReportsPortal from './ReportsPortal';
import TrashList from './TrashList';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onArchiveEmployee: (id: string, reason: string) => void;
  onDeleteEmployee: (id: string) => void;
  trashEmployees: Employee[];
  onRestoreEmployee: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  availableSkills: string[];
  availableCertifications: GlobalCertConfig[];
  availableContracts: ContractConfig[];
  initialSelectedId?: string | null;
  onClearSelection?: () => void;
  onAddActivity: (action: string, details: string, category: ActivityLog['category']) => void;
}

const SKILL_LEVELS: SkillLevel[] = ['Non Formé', 'Débutant', 'Intermédiaire', 'Formé', 'Expert'];

const LEVEL_CONFIG: Record<SkillLevel, { text: string; bg: string; bar: string; progress: number }> = {
  'Expert': { text: 'text-emerald-900', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', progress: 100 },
  'Formé': { text: 'text-green-700', bg: 'bg-green-500/10', bar: 'bg-green-500', progress: 75 },
  'Intermédiaire': { text: 'text-amber-700', bg: 'bg-amber-500/10', bar: 'bg-amber-500', progress: 50 },
  'Débutant': { text: 'text-orange-700', bg: 'bg-orange-500/10', bar: 'bg-orange-500', progress: 25 },
  'Non Formé': { text: 'text-red-700', bg: 'bg-red-500/10', bar: 'bg-slate-200', progress: 5 },
};

export const ROLE_COLOR_CONFIG: Record<string, { bg: string, text: string, border: string }> = {
  [Role.MANAGER]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900' },
  [Role.TRAINER]: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  [Role.EQUIPPIER]: { bg: 'bg-sky-400', text: 'text-white', border: 'border-sky-500' },
  [Role.MCCAFE]: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  [Role.HOTE]: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
};

const formatPhone = (val: string) => {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').substring(0, 10);
  const parts = [];
  for (let i = 0; i < digits.length; i += 2) {
    parts.push(digits.substring(i, i + 2));
  }
  return parts.join(' ');
};

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, setEmployees, onArchiveEmployee, onDeleteEmployee, 
  trashEmployees, onRestoreEmployee, onPermanentDelete,
  availableSkills, availableCertifications, availableContracts, initialSelectedId, onClearSelection, onAddActivity 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]); 
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Employee | null>(null);
  const [fullScreenReport, setFullScreenReport] = useState<'none' | 'soc' | 'certs'>('none');
  const [isTrashView, setIsTrashView] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [newTrainingToAdd, setNewTrainingToAdd] = useState('');
  const [newLateness, setNewLateness] = useState({ date: new Date().toISOString().split('T')[0], comment: '', duration: 5 });
  const [copyStatus, setCopyStatus] = useState<'none' | 'email' | 'phone'>('none');
  
  const currentSkills = isEditing && editData ? editData.skills : (selectedEmployee?.skills || []);
  const missingSkills = availableSkills.filter(as => !currentSkills.some(s => s.name === as));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetCertName, setTargetCertName] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      const emp = employees.find(e => e.id === initialSelectedId);
      if (emp) {
        setSelectedEmployee(emp);
        setIsEditing(false);
        setIsTrashView(false);
        if (onClearSelection) onClearSelection();
      }
    }
  }, [initialSelectedId, employees]);

  const toggleRoleFilter = (role: Role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus('none'), 2000);
  };

  const handleRecruit = () => {
    const newEmp: Employee = {
      id: `EMP-${Date.now()}`,
      name: 'NOUVEL ÉQUIPIER',
      email: '',
      role: Role.EQUIPPIER,
      department: 'Opérations',
      skills: availableSkills.map(s => ({ name: s, level: 'Non Formé' as SkillLevel })),
      trainings: [],
      certifications: [],
      availability: [],
      entryDate: new Date().toISOString().split('T')[0],
      phoneNumber: '',
      contractType: availableContracts[0]?.name || 'CDI 35H',
      eventLogs: [],
      feedbacks: [],
      isArchived: false,
      isDeleted: false
    };
    
    setEmployees(prev => [newEmp, ...prev]);
    setSelectedEmployee(newEmp);
    setEditData(newEmp);
    setIsEditing(true);
    setIsTrashView(false);
    onAddActivity('Recrutement', `Nouvelle fiche créée pour ${newEmp.name}.`, 'EQUIPE');
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(emp.role as Role);
    return matchesSearch && matchesRole;
  });

  const saveEdit = () => {
    if (editData) {
      setEmployees(employees.map(emp => emp.id === editData.id ? editData : emp));
      setSelectedEmployee(editData);
      setIsEditing(false);
      onAddActivity('Mise à jour Dossier', `Informations de ${editData.name} synchronisées.`, 'EQUIPE');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleQuickArchive = () => {
    if (selectedEmployee && archiveReason.trim()) {
      onArchiveEmployee(selectedEmployee.id, archiveReason);
      setSelectedEmployee(null);
      setShowArchiveConfirm(false);
      setArchiveReason('');
    }
  };

  const handleDeleteClick = () => {
    if (!selectedEmployee) return;
    if (window.confirm(`Êtes-vous sûr de vouloir envoyer le dossier de ${selectedEmployee.name} à la corbeille ?`)) {
      onDeleteEmployee(selectedEmployee.id);
      setSelectedEmployee(null);
    }
  };

  const addLatenessEntry = () => {
    if (editData && newLateness.comment) {
      const newLog: EventLog = {
        id: `LAT-${Date.now()}`,
        date: newLateness.date,
        type: 'Retard',
        comment: newLateness.comment,
        duration: newLateness.duration
      };
      setEditData({ ...editData, eventLogs: [...(editData.eventLogs || []), newLog] });
      setNewLateness({ ...newLateness, comment: '' });
      onAddActivity('Retard Ajouté', `${editData.name} : +${newLateness.duration}m.`, 'RETARD');
    }
  };

  const calculateTotalLateness = (emp: Employee) => {
    return (emp.eventLogs || [])
      .filter(l => l.type === 'Retard')
      .reduce((acc, l) => acc + (l.duration || 0), 0);
  };

  const handleLevelCycle = (skillName: string, currentLevel: SkillLevel) => {
    if (!isEditing || !editData) return;
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const nextIndex = (currentIndex + 1) % SKILL_LEVELS.length;
    const nextLevel = SKILL_LEVELS[nextIndex];
    const updatedSkills = editData.skills.map(s => s.name === skillName ? { ...s, level: nextLevel } : s);
    setEditData({ ...editData, skills: updatedSkills });
  };

  const triggerFileUpload = (certName: string) => {
    setTargetCertName(certName);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetCertName || !selectedEmployee) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const today = new Date();
      const globalConfig = availableCertifications.find(ac => ac.name === targetCertName);
      const validityMonths = globalConfig?.validityMonths || 12;
      const expiryDate = new Date();
      expiryDate.setMonth(today.getMonth() + validityMonths);

      const updatedCert: EmployeeCert = {
        name: targetCertName,
        status: 'Complété',
        dateObtained: today.toLocaleDateString('fr-FR'),
        expiryDate: expiryDate.toLocaleDateString('fr-FR'),
        documentUrl: base64,
        isExternal: true
      };

      const updateEmployeeCerts = (emp: Employee) => {
        const certs = [...emp.certifications];
        const idx = certs.findIndex(c => c.name === targetCertName);
        if (idx >= 0) certs[idx] = updatedCert;
        else certs.push(updatedCert);
        return { ...emp, certifications: certs };
      };

      if (isEditing && editData) setEditData(updateEmployeeCerts(editData));
      else {
        const updatedEmployees = employees.map(emp => emp.id === selectedEmployee.id ? updateEmployeeCerts(emp) : emp);
        setEmployees(updatedEmployees);
        setSelectedEmployee(updatedEmployees.find(e => e.id === selectedEmployee.id) || null);
      }
      onAddActivity('Document Enregistré', `${selectedEmployee.name} : ${targetCertName} importé.`, 'FORMATION');
      setTargetCertName(null);
    };
    reader.readAsDataURL(file);
  };

  const openDocument = (url?: string) => {
    if (!url) return;
    const win = window.open();
    if (win) win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  };

  const calculateRemainingMonths = (expiryDate?: string) => {
    if (!expiryDate) return null;
    try {
      const parts = expiryDate.split('/');
      const expiry = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const now = new Date();
      return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    } catch(e) { return null; }
  };

  const handleAddMissingSkill = (skillName: string) => {
    if (!isEditing || !editData) return;
    setEditData({ ...editData, skills: [...editData.skills, { name: skillName, level: 'Non Formé' }] });
    onAddActivity('Ajout Poste', `${editData.name} : Poste "${skillName}" ajouté.`, 'SOC');
  };

  const getFullMandatoryCertsOnly = (emp: Employee) => {
    const mandatoryConfigs = availableCertifications.filter(c => c.isMandatory);
    return mandatoryConfigs.map(mc => {
      const existing = emp.certifications.find(c => c.name === mc.name);
      return existing || { name: mc.name, status: 'À faire' as const };
    });
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in pb-20 relative">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />

      {fullScreenReport !== 'none' && (
        <ReportsPortal type={fullScreenReport as 'soc' | 'certs'} employees={filteredEmployees} availableSkills={availableSkills} availableCertifications={availableCertifications} onClose={() => setFullScreenReport('none')} />
      )}

      {/* Confirmation Archivage */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowArchiveConfirm(false)} />
           <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-amber-600 p-6 text-white text-center">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Archiver le Dossier RH</h3>
                 <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest">{selectedEmployee?.name}</p>
              </div>
              <div className="p-6 space-y-6">
                 <textarea autoFocus className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 outline-none focus:border-amber-500 h-32 resize-none" placeholder="Motif officiel (Démission, Fin de CDD...)" value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} />
                 <div className="flex gap-3">
                    <button onClick={() => setShowArchiveConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Annuler</button>
                    <button disabled={!archiveReason.trim()} onClick={handleQuickArchive} className="flex-1 py-4 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30">Confirmer</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header Mobile & Desktop */}
      <div className="flex flex-col gap-4 px-2 no-print">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Dossiers Équipe</h1>
          <div className="flex flex-wrap items-center gap-2">
             <button onClick={() => setIsTrashView(!isTrashView)} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase transition-all ${isTrashView ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200 shadow-sm'}`}>Corbeille</button>
             <button onClick={() => setFullScreenReport('soc')} className="hidden sm:block px-4 py-2 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase shadow-sm">Postes</button>
             <button onClick={() => setFullScreenReport('certs')} className="hidden sm:block px-4 py-2 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase shadow-sm">Certifs</button>
             <button onClick={handleRecruit} className="flex items-center gap-2 px-6 py-2 bg-[#264f36] text-white rounded-full text-[9px] font-black uppercase shadow-lg">
                <UserPlus size={14} /> Recruter
             </button>
          </div>
        </div>

        {!isTrashView && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
            <div className="relative shrink-0">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
               <input type="text" placeholder="Chercher..." className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold outline-none focus:border-[#264f36] w-32 md:w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {Object.values(Role).map(role => (
               <button key={role} onClick={() => toggleRoleFilter(role)} className={`shrink-0 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${selectedRoles.includes(role) ? 'bg-[#264f36] text-white border-[#264f36] shadow-md' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>
                  {role}
               </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {isTrashView ? (
          <div className="w-full"><TrashList trashEmployees={trashEmployees} onRestore={(id) => { onRestoreEmployee(id); setIsTrashView(false); }} onPermanentDelete={onPermanentDelete} /></div>
        ) : (
          <>
            <aside className={`lg:w-[280px] w-full flex flex-col gap-2 no-print ${selectedEmployee ? 'hidden lg:flex' : 'flex'}`}>
              <div className="overflow-y-auto max-h-[70vh] custom-scrollbar pr-1">
                {filteredEmployees.map(emp => (
                  <button key={emp.id} onClick={() => { setSelectedEmployee(emp); setIsEditing(false); }} className={`w-full text-left p-4 rounded-2xl border transition-all mb-2 flex items-center justify-between ${selectedEmployee?.id === emp.id ? 'bg-[#264f36] text-white border-[#264f36] shadow-lg' : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'}`}>
                    <div className="truncate">
                        <p className="text-xs font-black uppercase leading-tight">{emp.name}</p>
                        <p className="text-[8px] uppercase opacity-60 font-bold">{emp.role}</p>
                    </div>
                    <ChevronRight size={14} className={selectedEmployee?.id === emp.id ? 'opacity-100' : 'opacity-30'} />
                  </button>
                ))}
                {filteredEmployees.length === 0 && <p className="text-center text-[10px] font-black text-slate-300 uppercase py-10">Aucun résultat</p>}
              </div>
            </aside>

            <section className={`flex-1 min-w-0 w-full ${selectedEmployee ? 'block' : 'hidden lg:block'}`}>
              {selectedEmployee ? (
                <div className="space-y-6">
                  <button onClick={() => setSelectedEmployee(null)} className="lg:hidden flex items-center gap-2 text-[10px] font-black text-[#264f36] uppercase tracking-widest mb-2">
                    <ChevronLeft size={16} /> Retour à la liste
                  </button>

                  <div className={`rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl ${calculateTotalLateness(isEditing ? editData! : selectedEmployee) > 60 ? 'bg-red-800' : 'bg-[#264f36]'} text-white transition-all`}>
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-white/10 border border-white/20 flex items-center justify-center text-2xl md:text-3xl font-black shrink-0">
                       {(isEditing ? editData?.name : selectedEmployee.name)?.[0] || '?'}
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                       <div className="flex flex-col lg:flex-row justify-between items-center sm:items-start gap-4">
                          <div className="space-y-3 flex-1 w-full">
                             {isEditing ? (
                                <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xl font-black uppercase w-full outline-none focus:bg-white/20" value={editData?.name} onChange={e => setEditData({...editData!, name: e.target.value})} />
                             ) : <h2 className="text-2xl font-black uppercase tracking-tight truncate leading-none">{selectedEmployee.name}</h2>}
                             
                             <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                                {isEditing ? (
                                  <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none text-white" value={editData?.role} onChange={e => setEditData({...editData!, role: e.target.value as Role})}>
                                     {Object.values(Role).map(r => <option key={r} value={r} className="text-slate-900">{r}</option>)}
                                  </select>
                                ) : <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest">{selectedEmployee.role}</span>}
                             </div>

                             <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                                {isEditing ? (
                                  <div className="flex flex-col gap-2 w-full">
                                    <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none" placeholder="Email..." value={editData?.email} onChange={e => setEditData({...editData!, email: e.target.value})} />
                                    <input className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none" placeholder="Téléphone..." value={editData?.phoneNumber} onChange={e => setEditData({...editData!, phoneNumber: formatPhone(e.target.value)})} />
                                  </div>
                                ) : (
                                  <>
                                    <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold" onClick={() => handleCopy(selectedEmployee.phoneNumber || '', 'phone')}>
                                      <Phone size={10} className="opacity-50" /> {selectedEmployee.phoneNumber ? formatPhone(selectedEmployee.phoneNumber) : 'Tel non renseigné'}
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold" onClick={() => handleCopy(selectedEmployee.email || '', 'email')}>
                                      <Mail size={10} className="opacity-50" /> <span className="truncate max-w-[120px]">{selectedEmployee.email || 'Email non renseigné'}</span>
                                    </button>
                                  </>
                                )}
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                             {isEditing ? (
                               <>
                                 <button onClick={saveEdit} className="px-4 py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[9px] shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                                    <Save size={14}/> Sauver
                                 </button>
                                 <button onClick={cancelEdit} className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-black uppercase text-[9px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                                    <Undo2 size={14}/> Annuler
                                 </button>
                               </>
                             ) : (
                               <>
                                 <button onClick={() => { setEditData({...selectedEmployee}); setIsEditing(true); }} className="col-span-2 sm:col-span-1 px-4 py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[9px] shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                                    <Settings2 size={14}/> Éditer
                                 </button>
                                 <button onClick={() => setShowArchiveConfirm(true)} className="px-4 py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg flex items-center justify-center gap-2 hover:bg-amber-700 transition-all">
                                    <Archive size={14}/> Archiver
                                 </button>
                                 <button onClick={handleDeleteClick} className="px-4 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                                    <Trash2 size={14}/> Supprimer
                                 </button>
                               </>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Contrat', val: isEditing ? (
                          <select className="bg-transparent font-black text-slate-900 outline-none w-full" value={editData?.contractType} onChange={e => setEditData({...editData!, contractType: e.target.value})}>
                            {availableContracts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : selectedEmployee.contractType || '-', icon: <Briefcase size={14}/> },
                        { label: 'Entrée', val: isEditing ? <input type="date" className="bg-transparent font-black text-slate-900 w-full outline-none" value={editData?.entryDate} onChange={e => setEditData({...editData!, entryDate: e.target.value})} /> : selectedEmployee.entryDate || '-', icon: <Check size={14}/> },
                        { label: 'Fin Contrat', val: isEditing ? <input type="date" className="bg-transparent font-black text-slate-900 w-full outline-none" value={editData?.contractEndDate || ''} onChange={e => setEditData({...editData!, contractEndDate: e.target.value})} /> : selectedEmployee.contractEndDate || 'Indéterminé', icon: <Timer size={14}/> },
                        { label: 'Polyvalence', val: `${Math.round((currentSkills.filter(s => s.level !== 'Non Formé').length / availableSkills.length) * 100)}%`, icon: <Activity size={14}/> }
                      ].map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1 overflow-hidden">
                           <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">{item.icon} {item.label}</span>
                           <div className="text-[11px] font-black text-slate-900 truncate">{item.val}</div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg"><CheckSquare size={20} /></div>
                          <div>
                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Matrice de Poste</h3>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Niveaux de polyvalence restaurant</p>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                         {currentSkills.map((skill, idx) => {
                           const conf = LEVEL_CONFIG[skill.level];
                           return (
                             <div key={idx} className="relative group">
                               <button onClick={() => handleLevelCycle(skill.name, skill.level)} disabled={!isEditing} className={`w-full p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${isEditing ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent shadow-inner'}`}>
                                  <span className="text-[9px] font-black uppercase text-center text-slate-900 leading-tight h-6 flex items-center justify-center">{skill.name}</span>
                                  <span className={`text-[7px] font-black px-2 py-0.5 rounded-full ${conf.bg} ${conf.text}`}>{skill.level}</span>
                                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${conf.bar}`} style={{ width: `${conf.progress}%` }}></div></div>
                               </button>
                             </div>
                           );
                         })}

                         {isEditing && missingSkills.length > 0 && (
                            <div className="relative">
                               <select className="w-full h-full min-h-[80px] p-4 border-2 border-dashed border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-400 outline-none hover:border-[#264f36] bg-slate-50/30 cursor-pointer appearance-none" value="" onChange={(e) => e.target.value && handleAddMissingSkill(e.target.value)}>
                                  <option value="" disabled></option>
                                  {missingSkills.map(ms => <option key={ms} value={ms} className="text-slate-900">{ms}</option>)}
                               </select>
                               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <PlusCircle size={20} className="text-slate-300" />
                               </div>
                            </div>
                         )}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} className="text-red-500" /> Certificats (PC)</h3>
                        <div className="space-y-2">
                            {getFullMandatoryCertsOnly(isEditing ? editData! : selectedEmployee).map(c => {
                              const monthsLeft = calculateRemainingMonths(c.expiryDate);
                              const hasFile = !!c.documentUrl;
                              return (
                                <div key={c.name} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 truncate">
                                        <div className={`p-1.5 rounded-lg ${hasFile ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}><ShieldAlert size={14} /></div>
                                        <div className="flex flex-col truncate">
                                          <span className="text-[10px] font-black uppercase text-slate-900 truncate">{c.name}</span>
                                          {hasFile && <span className="text-[8px] font-bold text-slate-400">Valide jusqu'au {c.expiryDate}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {hasFile && <button onClick={() => openDocument(c.documentUrl)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><FileText size={12}/></button>}
                                        <button onClick={() => triggerFileUpload(c.name)} className={`p-1.5 rounded-lg ${hasFile ? 'bg-slate-200 text-slate-500' : 'bg-[#264f36] text-white shadow-sm'}`}>
                                          {hasFile ? <RotateCcw size={12}/> : <FileUp size={12}/>}
                                        </button>
                                    </div>
                                </div>
                              );
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14} className="text-[#264f36]" /> McDo Internes</h3>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                           {(isEditing ? editData!.trainings : selectedEmployee.trainings).map((t, idx) => (
                                <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center gap-3 ${t.status === 'Validé' ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                                   <div className="flex items-center gap-3 truncate">
                                      {isEditing ? (
                                         <button onClick={() => {
                                             const newT = [...editData!.trainings];
                                             newT[idx] = { ...newT[idx], status: t.status === 'Validé' ? 'À faire' : 'Validé' };
                                             setEditData({ ...editData!, trainings: newT });
                                           }} className={`p-1.5 rounded-lg border ${t.status === 'Validé' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300'}`}>
                                            <CheckIcon size={12} />
                                         </button>
                                      ) : <div className={`p-1.5 rounded-lg ${t.status === 'Validé' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}><CheckIcon size={12}/></div>}
                                      <span className="text-[10px] font-black uppercase text-slate-800 truncate">{t.title}</span>
                                   </div>
                                   {isEditing && <button onClick={() => setEditData({...editData!, trainings: editData!.trainings.filter((_, i) => i !== idx)})} className="text-slate-300 hover:text-red-600 shrink-0"><Trash2 size={12}/></button>}
                                </div>
                           ))}
                           {isEditing && (
                              <div className="flex gap-2 pt-2">
                                 <select className="flex-1 text-[9px] font-black uppercase bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none" value={newTrainingToAdd} onChange={e => setNewTrainingToAdd(e.target.value)}>
                                    <option value="">+ Module</option>
                                    {availableCertifications.filter(c => !c.isMandatory).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                 </select>
                                 <button onClick={() => {
                                    if(newTrainingToAdd) {
                                      const newT: TrainingModule = { id: Date.now().toString(), title: newTrainingToAdd, category: 'Interne', status: 'Validé', dateCompleted: new Date().toLocaleDateString('fr-FR') };
                                      setEditData({...editData!, trainings: [...editData!.trainings, newT]});
                                      setNewTrainingToAdd('');
                                      onAddActivity('Formation', `${editData!.name} : ${newTrainingToAdd}.`, 'FORMATION');
                                    }
                                 }} className="p-2 bg-[#264f36] text-white rounded-lg"><Plus size={14}/></button>
                              </div>
                           )}
                        </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Timer size={14} className="text-red-600" /> Registre des Retards</h3>
                        <span className="text-lg font-black text-red-600">{calculateTotalLateness(isEditing ? editData! : selectedEmployee)} min</span>
                     </div>
                     {isEditing && (
                       <div className="p-4 bg-red-50 rounded-xl space-y-3 border border-red-100">
                          <div className="grid grid-cols-2 gap-2">
                             <input type="date" className="bg-white border border-red-200 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase" value={newLateness.date} onChange={e => setNewLateness({...newLateness, date: e.target.value})} />
                             <input type="number" className="w-full bg-white border border-red-200 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase" value={newLateness.duration} onChange={e => setNewLateness({...newLateness, duration: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="flex gap-2">
                             <input placeholder="Commentaire..." className="flex-1 bg-white border border-red-200 rounded-lg px-3 py-1.5 text-[10px] font-bold" value={newLateness.comment} onChange={e => setNewLateness({...newLateness, comment: e.target.value})} />
                             <button onClick={addLatenessEntry} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Ok</button>
                          </div>
                       </div>
                     )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="bg-slate-50 p-6 rounded-full mb-4"><Users size={48} className="text-slate-200" /></div>
                  <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Dossier Équipe</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Sélectionnez un employé pour visualiser ses documents et sa matrice.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;

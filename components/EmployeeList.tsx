
import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, UserPlus, Save, Trash2, Archive,
  GraduationCap, Mail, Phone, Settings2, Undo2, 
  Download, UserCircle, Clock, Calendar, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, Trash, Plus, Briefcase, Tag,
  Upload, Eye, AlertTriangle, FileDown, FileUp
} from 'lucide-react';
import { Employee, Role, GlobalCertConfig, SkillLevel, ContractConfig, ActivityLog, Skill, EmployeeCert } from '../types';
import ReportsPortal from './ReportsPortal';
import TrashList from './TrashList';

const SKILL_LEVELS: SkillLevel[] = ['Non Formé', 'Débutant', 'Intermédiaire', 'Formé', 'Expert'];

const LEVEL_CONFIG: Record<SkillLevel, { text: string; bg: string; bar: string; progress: number }> = {
  'Expert': { text: 'text-emerald-900', bg: 'bg-[#264f36]/10', bar: 'bg-[#264f36]', progress: 100 },
  'Formé': { text: 'text-emerald-700', bg: 'bg-[#10b981]/10', bar: 'bg-[#10b981]', progress: 75 },
  'Intermédiaire': { text: 'text-amber-700', bg: 'bg-[#ffbc0d]/10', bar: 'bg-[#ffbc0d]', progress: 50 },
  'Débutant': { text: 'text-orange-700', bg: 'bg-[#fdba74]/10', bar: 'bg-[#fdba74]', progress: 25 },
  'Non Formé': { text: 'text-slate-400', bg: 'bg-slate-100', bar: 'bg-slate-200', progress: 5 },
};

const formatPhone = (value: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').substring(0, 10);
  const groups = digits.match(/.{1,2}/g);
  return groups ? groups.join(' ') : digits;
};

const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
};

const checkIsExpired = (expiryDate?: string) => {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  const now = new Date();
  return exp < now;
};

export const ROLE_COLOR_CONFIG: Record<string, { bg: string, text: string, border: string }> = {
  [Role.MANAGER]: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-900' },
  [Role.TRAINER]: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  [Role.EQUIPPIER]: { bg: 'bg-sky-400', text: 'text-white', border: 'border-sky-500' },
  [Role.MCCAFE]: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  [Role.HOTE]: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
};

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onUpdateEmployee?: (emp: Employee) => void;
  onArchiveEmployee: (id: string, reason: string) => void;
  onDeleteEmployee: (id: string) => void;
  trashEmployees: Employee[];
  onRestoreEmployee: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  availableSkills: string[];
  availableCertifications: GlobalCertConfig[];
  availableContracts: ContractConfig[];
  initialSelectedId?: string | null;
  onClearSelection?: () => void;
  onAddActivity: (action: string, details: string, category: ActivityLog['category']) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, setEmployees, onUpdateEmployee, onArchiveEmployee, onDeleteEmployee, 
  trashEmployees, onRestoreEmployee, onPermanentDelete, onEmptyTrash,
  availableSkills, availableCertifications, availableContracts, initialSelectedId, onClearSelection, onAddActivity 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Employee | null>(null);
  const [isTrashView, setIsTrashView] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [fullScreenReport, setFullScreenReport] = useState<'none' | 'soc' | 'certs'>('none');
  const [mobileView, setMobileView] = useState<'list' | 'profile'>('list');
  
  // Modal for Legal Doc Upload
  const [uploadCertModal, setUploadCertModal] = useState<{certName: string, isMandatory: boolean} | null>(null);
  const [tempCertDate, setTempCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempCertFile, setTempCertFile] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      const emp = employees.find(e => e.id === initialSelectedId);
      if (emp) { 
        setSelectedEmployee(emp); 
        setIsEditing(false); 
        setIsTrashView(false); 
        setMobileView('profile');
        if (onClearSelection) onClearSelection(); 
      }
    }
  }, [initialSelectedId, employees, onClearSelection]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditing(false);
    setMobileView('profile');
  };

  const getMergedSkills = (empSkills: Skill[] = []) => {
    return availableSkills.map(skillName => {
      const existing = empSkills.find(s => s.name === skillName);
      return existing || { name: skillName, level: 'Non Formé' as SkillLevel };
    });
  };

  const handleLevelCycle = (skillName: string, currentLevel: SkillLevel) => {
    if (!isEditing || !editData) return;
    const currentIndex = SKILL_LEVELS.indexOf(currentLevel);
    const nextIndex = (currentIndex + 1) % SKILL_LEVELS.length;
    const nextLevel = SKILL_LEVELS[nextIndex];
    const empSkills = [...(editData.skills || [])];
    const skillIdx = empSkills.findIndex(s => s.name === skillName);
    if (skillIdx >= 0) empSkills[skillIdx] = { ...empSkills[skillIdx], level: nextLevel };
    else empSkills.push({ name: skillName, level: nextLevel });
    setEditData({ ...editData, skills: empSkills });
  };

  const handleCertToggle = (certName: string, isMandatory: boolean) => {
    if (isMandatory) {
      // Mandatory certs can now be modified anytime (even without edit mode)
      setUploadCertModal({ certName, isMandatory });
      setTempCertDate(new Date().toISOString().split('T')[0]);
      setTempCertFile(null);
      setTempFileName(null);
    } else {
      // Internal trainings still require edit mode to avoid accidental clicks
      if (!isEditing || !editData) return;
      const certs = [...(editData.certifications || [])];
      const idx = certs.findIndex(c => c.name === certName);
      if (idx >= 0) {
        certs[idx] = { ...certs[idx], status: certs[idx].status === 'Complété' ? 'À faire' : 'Complété' };
      } else {
        certs.push({ name: certName, status: 'Complété' });
      }
      setEditData({ ...editData, certifications: certs });
    }
  };

  const finalizeCertUpload = () => {
    if (!selectedEmployee || !uploadCertModal) return;
    
    const globalConfig = availableCertifications.find(c => c.name === uploadCertModal.certName);
    const validityMonths = globalConfig?.validityMonths || 12;
    
    const obtainedDate = new Date(tempCertDate);
    const expiryDate = new Date(obtainedDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    const newCert: EmployeeCert = {
      name: uploadCertModal.certName,
      status: 'Complété',
      dateObtained: tempCertDate,
      expiryDate: expiryDate.toISOString().split('T')[0],
      documentUrl: tempCertFile || undefined
    };

    if (isEditing && editData) {
      // If we are in edit mode, update the temporary edit buffer
      const certs = [...(editData.certifications || [])];
      const idx = certs.findIndex(c => c.name === uploadCertModal.certName);
      if (idx >= 0) certs[idx] = newCert;
      else certs.push(newCert);
      setEditData({ ...editData, certifications: certs });
    } else {
      // If we are NOT in edit mode, update and save immediately
      const certs = [...(selectedEmployee.certifications || [])];
      const idx = certs.findIndex(c => c.name === uploadCertModal.certName);
      if (idx >= 0) certs[idx] = newCert;
      else certs.push(newCert);
      
      const updatedEmp = { ...selectedEmployee, certifications: certs };
      setSelectedEmployee(updatedEmp);
      if (onUpdateEmployee) onUpdateEmployee(updatedEmp);
      onAddActivity('Update Document', `Nouveau document ${uploadCertModal.certName} ajouté pour ${selectedEmployee.name}.`, 'SOC');
    }

    setUploadCertModal(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setTempCertFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = () => {
    if (editData) {
      if (onUpdateEmployee) onUpdateEmployee(editData);
      setSelectedEmployee(editData);
      setIsEditing(false);
      onAddActivity('Mise à jour Dossier', `Fiche de ${editData.name} mise à jour.`, 'EQUIPE');
    }
  };

  const handleRecruit = () => {
    const newEmp: Employee = {
      id: `EMP-${Date.now()}`,
      name: 'NOUVEL ÉQUIPIER',
      email: '',
      role: Role.EQUIPPIER,
      skills: availableSkills.map(s => ({ name: s, level: 'Non Formé' as SkillLevel })),
      trainings: [],
      certifications: [],
      availability: [],
      entryDate: new Date().toISOString().split('T')[0],
      phoneNumber: '',
      contractType: availableContracts[0]?.name || 'CDI 35H',
      isArchived: false,
      isDeleted: false
    };
    setEmployees(prev => [newEmp, ...prev]);
    setSelectedEmployee(newEmp);
    setEditData(newEmp);
    setIsEditing(true);
    setMobileView('profile');
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 animate-in text-slate-900 overflow-hidden">
      {fullScreenReport !== 'none' && (
        <ReportsPortal type={fullScreenReport as any} employees={filteredEmployees} availableSkills={availableSkills} availableCertifications={availableCertifications} onClose={() => setFullScreenReport('none')} />
      )}

      {/* HEADER RESPONSIVE */}
      {!isTrashView && (
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className={`${mobileView === 'profile' ? 'hidden sm:block' : 'block'}`}>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Équipe Active</h1>
            <p className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{employees.length} Actifs • Restaurant #0437</p>
          </div>
          
          <div className={`grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 ${mobileView === 'profile' ? 'hidden sm:grid' : 'grid'}`}>
            <button onClick={() => setFullScreenReport('soc')} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2.5 sm:px-5 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all">
              <Download size={16} className="text-blue-600" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">SOC</span>
            </button>
            <button onClick={() => setIsTrashView(true)} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl sm:rounded-2xl shadow-sm relative">
              <Trash size={16} />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">Corbeille</span>
              {trashEmployees.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white">{trashEmployees.length}</span>}
            </button>
            <button onClick={handleRecruit} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-3 py-2.5 sm:px-8 sm:py-4 bg-[#264f36] text-white rounded-xl sm:rounded-[1.25rem] shadow-xl hover:bg-slate-900 transition-all">
              <Plus size={18} />
              <span className="text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-center">Nouveau</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-row gap-8 overflow-hidden relative">
        {isTrashView ? (
          <TrashList trashEmployees={trashEmployees} onRestore={onRestoreEmployee} onPermanentDelete={onPermanentDelete} onEmptyTrash={onEmptyTrash} onBack={() => setIsTrashView(false)} />
        ) : (
          <>
            <aside className={`w-full lg:w-[300px] flex flex-col gap-4 shrink-0 overflow-hidden ${mobileView === 'profile' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Chercher un équipier..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[11px] font-bold outline-none focus:border-[#264f36] shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {filteredEmployees.map(emp => (
                  <button key={emp.id} onClick={() => handleSelectEmployee(emp)} className={`w-full p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between group ${selectedEmployee?.id === emp.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-1.5 h-6 rounded-full shrink-0 ${ROLE_COLOR_CONFIG[emp.role]?.bg || 'bg-slate-200'}`} />
                      <p className="text-xs font-black uppercase truncate">{emp.name}</p>
                    </div>
                    <ChevronRight size={14} className={selectedEmployee?.id === emp.id ? 'text-emerald-400' : 'text-slate-200'} />
                  </button>
                ))}
              </div>
            </aside>

            <section className={`flex-1 overflow-y-auto custom-scrollbar lg:pr-2 pb-20 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
              {selectedEmployee ? (
                <div className="space-y-6 sm:space-y-8 animate-in">
                  
                  <button onClick={() => setMobileView('list')} className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 shadow-sm active:scale-95">
                    <ChevronLeft size={18} /> Retour à l'équipe
                  </button>

                  {/* BOX NOM */}
                  <div className={`rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl transition-all relative overflow-hidden text-white ${ROLE_COLOR_CONFIG[isEditing ? editData?.role || selectedEmployee.role : selectedEmployee.role]?.bg || 'bg-[#264f36]'}`}>
                    <div className="relative z-10 flex flex-col gap-6 sm:gap-10">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto sm:mx-0 rounded-2xl sm:rounded-[2.5rem] bg-white/10 border border-white/20 flex items-center justify-center text-3xl sm:text-5xl font-black shrink-0 shadow-lg backdrop-blur-md">
                            {(isEditing ? editData?.name : selectedEmployee.name)?.[0] || '?'}
                          </div>
                          
                          <div className="flex-1 space-y-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                            {isEditing ? (
                              <div className="w-full space-y-2">
                                <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xl font-black uppercase w-full outline-none focus:bg-white/20 transition-all text-center sm:text-left" value={editData?.name} onChange={e => setEditData(prev => prev ? {...prev, name: e.target.value} : null)} placeholder="NOM COMPLET" />
                                <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:bg-white/20" value={editData?.role} onChange={e => setEditData(prev => prev ? {...prev, role: e.target.value as Role} : null)}>
                                  {Object.values(Role).map(r => <option key={r} value={r} className="text-slate-900">{r}</option>)}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{selectedEmployee.name}</h2>
                                <p className="text-[10px] sm:text-xs font-bold opacity-70 uppercase tracking-[0.2em] mt-2">{selectedEmployee.role}</p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
                              <div className="flex items-center gap-3 bg-white/10 border border-white/20 pl-2 pr-4 py-1.5 rounded-xl backdrop-blur-md">
                                <div className="p-1.5 bg-white/20 rounded-lg"><Mail size={14} /></div>
                                {isEditing ? (
                                  <input className="bg-transparent border-none text-[10px] font-black uppercase outline-none w-[120px]" value={editData?.email} onChange={e => setEditData(prev => prev ? {...prev, email: e.target.value} : null)} placeholder="EMAIL" />
                                ) : (
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">{selectedEmployee.email || 'N/A'}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 bg-white/10 border border-white/20 pl-2 pr-4 py-1.5 rounded-xl backdrop-blur-md">
                                <div className="p-1.5 bg-white/20 rounded-lg"><Phone size={14} /></div>
                                {isEditing ? (
                                  <input className="bg-transparent border-none text-[10px] font-black uppercase outline-none w-[100px]" value={formatPhone(editData?.phoneNumber || '')} onChange={e => setEditData(prev => prev ? {...prev, phoneNumber: e.target.value.replace(/\D/g, '')} : null)} placeholder="TÉLÉPHONE" />
                                ) : (
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">{formatPhone(selectedEmployee.phoneNumber || '') || 'N/A'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 shrink-0 sm:min-w-[160px]">
                          {isEditing ? (
                            <>
                              <button onClick={saveEdit} className="col-span-2 px-6 py-4 bg-white text-slate-900 rounded-xl sm:rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"><Save size={18}/> Sauver</button>
                              <button onClick={() => setIsEditing(false)} className="col-span-2 px-6 py-4 bg-white/10 text-white border border-white/20 rounded-xl sm:rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all"><Undo2 size={18}/> Annuler</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditData({...selectedEmployee}); setIsEditing(true); }} className="col-span-2 px-6 py-4 bg-white text-slate-900 rounded-xl sm:rounded-[1.25rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"><Settings2 size={18}/> Éditer</button>
                              <div className="col-span-2 flex sm:flex-col gap-2">
                                <button onClick={() => setShowArchiveConfirm(true)} className="flex-1 px-4 py-3 sm:py-3.5 bg-white/20 border border-white/20 rounded-xl sm:rounded-[1.125rem] flex items-center justify-center gap-2 hover:bg-white/30 transition-all">
                                  <Archive size={18} />
                                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Archiver</span>
                                </button>
                                <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 px-4 py-3 sm:py-3.5 bg-red-600 border border-red-500 rounded-xl sm:rounded-[1.125rem] flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                                  <Trash2 size={18} />
                                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Supprimer</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 sm:pt-8 border-t border-white/10 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white/10 rounded-lg"><Calendar size={16} /></div>
                          <div>
                            <p className="text-[6px] sm:text-[8px] font-black uppercase opacity-50 tracking-widest">Entrée</p>
                            {isEditing ? (
                              <input type="date" className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none focus:bg-white/20" value={formatDateForInput(editData?.entryDate)} onChange={e => setEditData(prev => prev ? {...prev, entryDate: e.target.value} : null)} />
                            ) : (
                              <p className="text-[10px] sm:text-sm font-black uppercase">{selectedEmployee.entryDate || '-'}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <div className="text-right flex flex-col items-end">
                            <p className="text-[6px] sm:text-[8px] font-black uppercase opacity-50 tracking-widest">Fin Contrat</p>
                            {isEditing ? (
                              <input type="date" className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none focus:bg-white/20" value={formatDateForInput(editData?.contractEndDate)} onChange={e => setEditData(prev => prev ? {...prev, contractEndDate: e.target.value} : null)} />
                            ) : (
                              <p className="text-[10px] sm:text-sm font-black uppercase">{selectedEmployee.contractEndDate || 'CDI'}</p>
                            )}
                          </div>
                          <div className="p-2 bg-white/10 rounded-lg"><Clock size={16} /></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION CONTRAT DÉTAILLÉE */}
                  <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-4 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Briefcase size={20} />
                      </div>
                      <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest">Détails du Contrat</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Type de Contrat</p>
                        {isEditing ? (
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black uppercase outline-none focus:border-emerald-500" value={editData?.contractType} onChange={e => setEditData(prev => prev ? {...prev, contractType: e.target.value} : null)}>
                            {availableContracts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        ) : (
                          <p className="text-xs sm:text-sm font-black uppercase text-slate-900">{selectedEmployee.contractType || 'CDI 35H'}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume Horaire</p>
                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900">
                          {availableContracts.find(c => c.name === (isEditing ? editData?.contractType : selectedEmployee.contractType))?.weeklyHours || 35}H / Semaine
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Statut Contrat</p>
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase">Actif</span>
                      </div>
                    </div>
                  </div>

                  {/* CERTIFICATIONS & FORMATIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                         <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck size={18} className="text-red-500" /> Légaux
                         </h3>
                      </div>
                      <div className="space-y-3">
                        {availableCertifications.filter(c => c.isMandatory).map(certConfig => {
                          const currentCert = (isEditing ? editData?.certifications : selectedEmployee.certifications)?.find(c => c.name === certConfig.name);
                          const isExpired = currentCert && checkIsExpired(currentCert.expiryDate);
                          const isDone = currentCert?.status === 'Complété' && !isExpired;
                          
                          return (
                            <div key={certConfig.name} onClick={() => handleCertToggle(certConfig.name, true)} className={`p-4 rounded-xl border transition-all cursor-pointer ${isDone ? 'bg-emerald-50 border-emerald-100 shadow-sm' : isExpired ? 'bg-red-50 border-red-200 pulse-red' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100 hover:bg-slate-100'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-black uppercase ${isDone ? 'text-emerald-700' : isExpired ? 'text-red-700' : 'text-slate-400'}`}>
                                    {certConfig.name}
                                  </span>
                                  {currentCert?.documentUrl && (
                                    <span className="text-[7px] font-black text-blue-600 uppercase mt-1 flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                                      📄 Document Joint
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {currentCert?.documentUrl && (
                                    <a 
                                      href={currentCert.documentUrl} 
                                      download={`McFO_Certif_${selectedEmployee.name.replace(/\s/g, '_')}_${certConfig.name}.pdf`}
                                      onClick={(e) => e.stopPropagation()} 
                                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 shadow-sm hover:scale-105 transition-all"
                                      title="Voir/Télécharger le document"
                                    >
                                      <Eye size={14} />
                                    </a>
                                  )}
                                  {isDone ? <CheckCircle2 size={18} className="text-emerald-500" /> : isExpired ? <AlertTriangle size={18} className="text-red-500" /> : <AlertCircle size={18} className="text-slate-300" />}
                                </div>
                              </div>
                              {currentCert?.expiryDate && (
                                <p className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isExpired ? 'text-red-600' : 'text-slate-400'}`}>
                                  {isExpired ? <AlertTriangle size={10} /> : <Calendar size={10} />}
                                  {isExpired ? 'Expiré' : 'Expire le'} : {new Date(currentCert.expiryDate).toLocaleDateString()}
                                  {isExpired && <span className="text-red-900 ml-1 font-black"> - CLIQUEZ POUR RENOUVELER</span>}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                         <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <GraduationCap size={18} className="text-[#264f36]" /> McDo
                         </h3>
                      </div>
                      <div className="space-y-3">
                        {availableCertifications.filter(c => !c.isMandatory).map(training => {
                          const isDone = (isEditing ? editData?.certifications : selectedEmployee.certifications)?.some(c => c.name === training.name && c.status === 'Complété');
                          return (
                            <div key={training.name} onClick={() => handleCertToggle(training.name, false)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:bg-slate-50' : ''} ${isDone ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                              <span className={`text-[10px] font-black uppercase ${isDone ? 'text-blue-700' : 'text-slate-400'}`}>{training.name}</span>
                              {isDone ? <CheckCircle2 size={18} className="text-blue-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* POLYVALENCE SOC */}
                  <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                       <h3 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <FileText size={18} className="text-emerald-600" /> Polyvalence SOC
                       </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(isEditing ? getMergedSkills(editData?.skills) : getMergedSkills(selectedEmployee.skills)).map(skill => {
                        const config = LEVEL_CONFIG[skill.level];
                        return (
                          <div key={skill.name} onClick={() => isEditing && handleLevelCycle(skill.name, skill.level)} className={`p-5 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:border-emerald-500 shadow-sm' : 'border-slate-50'}`}>
                             <div className="flex justify-between items-start mb-3">
                                <h4 className="text-[10px] font-black uppercase text-slate-800 truncate pr-2">{skill.name}</h4>
                                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                                  {skill.level}
                                </div>
                             </div>
                             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-700 ${config.bar}`} style={{ width: `${config.progress}%` }}></div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-sm text-center">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-6">
                    <UserCircle size={60} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Sélectionnez un profil</h3>
                  <p className="text-slate-400 text-xs mt-3 font-medium max-w-sm">Gérez les dossiers de formation de votre équipe.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* MODAL UPLOAD CERTIFICAT LÉGAL */}
      {uploadCertModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setUploadCertModal(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
             <div className="flex items-center gap-4 text-emerald-600 border-b border-slate-100 pb-4">
                <ShieldCheck size={24} />
                <h3 className="text-lg font-black uppercase tracking-tighter">Valider {uploadCertModal.certName}</h3>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date d'obtention</label>
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-emerald-500" value={tempCertDate} onChange={e => setTempCertDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document (PDF/JPG)</label>
                  <div className="relative group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="application/pdf,image/*" />
                    <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${tempCertFile ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'bg-slate-50 border-slate-200 group-hover:border-emerald-400'}`}>
                       {tempCertFile ? (
                         <div className="text-center">
                            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                            <p className="text-[10px] font-black uppercase mt-3 text-emerald-700">{tempFileName}</p>
                            <p className="text-[8px] font-bold text-emerald-500 uppercase mt-1">Fichier prêt pour l'upload</p>
                         </div>
                       ) : (
                         <div className="text-center">
                            <FileUp size={32} className="text-slate-300 mx-auto" />
                            <p className="text-[10px] font-black uppercase mt-4 text-slate-500">Cliquer pour choisir un fichier</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">PDF ou IMAGE uniquement</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
             </div>
             <div className="flex gap-4 pt-4">
                <button onClick={() => setUploadCertModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Annuler</button>
                <button 
                  onClick={finalizeCertUpload} 
                  disabled={!tempCertFile}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all"
                >
                  Valider & Calculer Expiration
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODALS ARCHIVE / DELETE */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowArchiveConfirm(false)} />
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 text-center animate-in zoom-in-95">
              <Archive size={40} className="mx-auto text-amber-500" />
              <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Archiver le dossier ?</h3>
              <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] font-bold text-slate-800 outline-none h-24 resize-none" placeholder="Raison (ex: Fin de contrat)..." value={archiveReason} onChange={e => setArchiveReason(e.target.value)} />
              <div className="flex gap-4">
                <button onClick={() => setShowArchiveConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Annuler</button>
                <button onClick={() => { if(selectedEmployee) onArchiveEmployee(selectedEmployee.id, archiveReason); setShowArchiveConfirm(false); setSelectedEmployee(null); setMobileView('list'); }} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Confirmer</button>
              </div>
           </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-red-950/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)} />
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center space-y-8 animate-in zoom-in-95">
              <Trash2 size={40} className="mx-auto text-red-600" />
              <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Supprimer ?</h3>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Annuler</button>
                <button onClick={() => { if(selectedEmployee) onDeleteEmployee(selectedEmployee.id); setShowDeleteConfirm(false); setSelectedEmployee(null); setMobileView('list'); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Supprimer</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;

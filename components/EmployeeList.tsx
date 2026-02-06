
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Award, ChevronRight, Users, UserPlus, X, Edit2, 
  CheckCircle2, BookOpen, CheckSquare, Clock, FileText, 
  Upload, ShieldAlert, FileSearch, Save, Plus, Trash2, Calendar, LayoutGrid, List as ListIcon, 
  FileCheck, ShieldCheck, ClipboardList, Settings2
} from 'lucide-react';
import { MOCK_EMPLOYEES } from '../mockData';
import { Employee, Role, GlobalCertConfig, SkillLevel, Skill, DayAvailability } from '../types';

interface EmployeeListProps {
  availableSkills: string[];
  availableCertifications: GlobalCertConfig[];
  initialSelectedId?: string | null;
  onClearSelection?: () => void;
}

const LEVEL_CONFIG: Record<SkillLevel, { text: string; bg: string; progress: number; gradient: string }> = {
  'Expert': { text: 'text-emerald-900', bg: 'bg-emerald-500/5', progress: 100, gradient: 'from-emerald-400 to-emerald-600' },
  'Formé': { text: 'text-green-700', bg: 'bg-green-500/5', progress: 75, gradient: 'from-green-400 to-green-500' },
  'Intermédiaire': { text: 'text-amber-700', bg: 'bg-amber-500/5', progress: 50, gradient: 'from-amber-400 to-orange-400' },
  'Débutant': { text: 'text-orange-700', bg: 'bg-orange-500/5', progress: 25, gradient: 'from-orange-400 to-orange-500' },
  'Non Formé': { text: 'text-red-700', bg: 'bg-red-500/5', progress: 0, gradient: 'from-slate-200 to-slate-300' },
};

const EmployeeList: React.FC<EmployeeListProps> = ({ availableSkills, availableCertifications, initialSelectedId, onClearSelection }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [editData, setEditData] = useState<Employee | null>(null);

  useEffect(() => {
    if (initialSelectedId) {
      const emp = employees.find(e => e.id === initialSelectedId);
      if (emp) {
        setSelectedEmployee(emp);
        if (onClearSelection) onClearSelection();
      }
    }
  }, [initialSelectedId, employees, onClearSelection]);

  const getPolyvalenceScore = (emp: Employee) => {
    if (availableSkills.length === 0) return 0;
    const trainedCount = emp.skills.filter(s => s.level === 'Formé' || s.level === 'Expert').length;
    return Math.round((trainedCount / availableSkills.length) * 100);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (certName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedEmployee) {
        alert(`Document "${file.name}" lié à ${certName}`);
        const updated = employees.map(emp => {
          if (emp.id === selectedEmployee.id) {
            const certs = emp.certifications.map(c => c.name === certName ? { ...c, documentUrl: file.name } : c);
            return { ...emp, certifications: certs };
          }
          return emp;
        });
        setEmployees(updated);
        setSelectedEmployee(updated.find(e => e.id === selectedEmployee.id) || null);
      }
    };
    input.click();
  };

  const startEdit = () => {
    setEditData({ ...selectedEmployee! });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editData) {
      const updated = employees.map(emp => emp.id === editData.id ? editData : emp);
      setEmployees(updated);
      setSelectedEmployee(editData);
      setIsEditing(false);
    }
  };

  const addRecruit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role: fd.get('role') as Role,
      department: fd.get('role') as string,
      skills: availableSkills.map(s => ({ name: s, level: 'Non Formé' })),
      trainings: [],
      certifications: availableCertifications.map(c => ({ name: c.name, status: 'À faire' })),
      availability: [
        { day: 'Lundi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Mardi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Mercredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Jeudi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Vendredi', isAvailable: true, startTime: '08:00', endTime: '17:00' },
      ],
    };
    setEmployees([newEmp, ...employees]);
    setSelectedEmployee(newEmp);
    setIsRecruiting(false);
  };

  const handleLevelChange = (skillName: string, level: SkillLevel) => {
    if (editData) {
      const updatedSkills = editData.skills.map(s => s.name === skillName ? { ...s, level } : s);
      setEditData({ ...editData, skills: updatedSkills });
    }
  };

  const handleTimeChange = (day: string, type: 'startTime' | 'endTime', value: string) => {
    if (editData) {
      const updatedAvail = editData.availability.map(a => a.day === day ? { ...a, [type]: value } : a);
      setEditData({ ...editData, availability: updatedAvail });
    }
  };

  return (
    <div className="space-y-8 animate-in pb-20 relative">
      {/* Recruiting Modal */}
      {isRecruiting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <form onSubmit={addRecruit} className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl border border-slate-100 animate-in">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Nouveau Recrutement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Nom Complet</label>
                <input name="name" required placeholder="Ex: Jean Martin" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#264f36]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Email</label>
                <input name="email" type="email" required placeholder="jean@macdo.io" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#264f36]" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Fonction initiale</label>
                <select name="role" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#264f36]">
                  <option value={Role.EQUIPPIER}>Équipier</option>
                  <option value={Role.TRAINER}>Formateur</option>
                  <option value={Role.MANAGER}>Manager</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsRecruiting(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">Annuler</button>
              <button type="submit" className="flex-1 py-4 bg-[#264f36] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#264f36]/20">Confirmer</button>
            </div>
          </form>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Gestion du Personnel</h1>
          <p className="text-slate-500 font-medium italic mt-1">Dossiers individuels et suivi des qualifications.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="relative group mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Trouver un équipier..." className="w-48 pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <button onClick={() => setIsRecruiting(true)} className="flex items-center gap-3 pl-2 pr-6 py-3 bg-emerald-50 text-[#264f36] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#264f36] hover:text-white transition-all">
              <UserPlus size={16} /> Recruter
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* Sidebar List */}
        <aside className="lg:w-[320px] w-full flex flex-col h-[calc(100vh-160px)] sticky top-6">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {filteredEmployees.map(emp => (
              <button 
                key={emp.id} 
                onClick={() => { setSelectedEmployee(emp); setIsEditing(false); }} 
                className={`w-full text-left p-4 rounded-[1.8rem] flex items-center justify-between transition-all mb-3 border-2 ${
                  selectedEmployee?.id === emp.id ? 'bg-[#264f36] border-[#264f36] text-white shadow-xl' : 'bg-white border-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4 truncate">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedEmployee?.id === emp.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                    {emp.name[0]}
                  </div>
                  <div className="truncate">
                    <h4 className="font-black text-sm truncate leading-tight">{emp.name}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{emp.role}</span>
                  </div>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Detail */}
        <section className="flex-1 min-w-0">
          {selectedEmployee ? (
            <div className="space-y-8 animate-in">
              {/* Header Profile */}
              <div className="bg-[#264f36] rounded-[3.5rem] p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
                <div className="w-32 h-32 rounded-[3rem] bg-white/20 border-4 border-white/20 flex items-center justify-center text-5xl font-black text-white shrink-0">
                  {selectedEmployee.name[0]}
                </div>
                <div className="flex-1 text-white z-10 w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-4xl font-black uppercase mb-2">{selectedEmployee.name}</h2>
                      <div className="flex flex-wrap gap-4">
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/10">{selectedEmployee.role}</span>
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/10">{selectedEmployee.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={isEditing ? saveEdit : startEdit}
                      className="flex items-center gap-3 px-6 py-4 bg-white text-[#264f36] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
                    >
                      {isEditing ? <Save size={18} /> : <Settings2 size={18} />}
                      {isEditing ? 'Sauvegarder' : 'Options de modification'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Horaires et Dispos */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Clock size={18} className="text-[#264f36]" /> Planning des Disponibilités
                  </h3>
                  <div className="space-y-3">
                    {(isEditing ? editData!.availability : selectedEmployee.availability).map(avail => (
                      <div key={avail.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-4">
                        <span className="text-[11px] font-black uppercase text-slate-700 w-24">{avail.day}</span>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                           {isEditing ? (
                             <div className="flex items-center gap-2">
                               <input 
                                 type="time" 
                                 className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold" 
                                 value={avail.startTime} 
                                 onChange={e => handleTimeChange(avail.day, 'startTime', e.target.value)} 
                               />
                               <span className="text-slate-300 font-bold">-</span>
                               <input 
                                 type="time" 
                                 className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold" 
                                 value={avail.endTime} 
                                 onChange={e => handleTimeChange(avail.day, 'endTime', e.target.value)} 
                               />
                             </div>
                           ) : (
                             <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-100">
                               <span className="text-[10px] font-black text-slate-900">{avail.startTime} - {avail.endTime}</span>
                             </div>
                           )}
                           <div className={`w-3 h-3 rounded-full ${avail.isAvailable ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dossier Certificats - MANDATORY IS PROTECTED */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Award size={18} className="text-[#264f36]" /> Certifications & Diplômes
                  </h3>
                  <div className="space-y-6">
                    {/* Obligatoires - Verrouillés */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                         <ShieldCheck size={14} /> Certificats Réglementaires (Lecture seule)
                      </p>
                      {selectedEmployee.certifications.filter(c => availableCertifications.find(gc => gc.name === c.name)?.isMandatory).map(c => (
                        <div key={c.name} className="p-4 bg-red-50/30 border border-red-100 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center"><ShieldAlert size={14} /></div>
                             <p className="text-[10px] font-black uppercase text-slate-900">{c.name}</p>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => alert(`Rapport réglementaire pour ${c.name}`)} title="Compte rendu" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500"><FileCheck size={14}/></button>
                             <button onClick={() => handleFileUpload(c.name)} title="Uploader PDF" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#264f36]"><Upload size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Autres Certificats - Modifiables */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Award size={14} /> Qualifications Additionnelles
                      </p>
                      {selectedEmployee.certifications.filter(c => !availableCertifications.find(gc => gc.name === c.name)?.isMandatory).map(c => (
                        <div key={c.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase text-slate-900">{c.name}</p>
                          <div className="flex gap-2">
                             <button onClick={() => handleFileUpload(c.name)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#264f36]"><Upload size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Postes Formés / Socle Opérationnel */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                      <CheckSquare size={18} className="text-[#264f36]" /> Postes & Socle Opérationnel
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(isEditing ? editData!.skills : selectedEmployee.skills).map(skill => {
                      const conf = LEVEL_CONFIG[skill.level];
                      return (
                        <div key={skill.name} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[11px] font-black uppercase text-slate-900">{skill.name}</h4>
                            {!isEditing && (skill.level === 'Formé' || skill.level === 'Expert') && (
                              <button onClick={() => alert(`Compte rendu de poste : ${skill.name}`)} title="Compte rendu du poste" className="opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-500 transition-all shadow-sm">
                                <ClipboardList size={14} />
                              </button>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <select 
                              className="w-full bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase px-2 py-1.5 outline-none focus:border-[#264f36]"
                              value={skill.level}
                              onChange={e => handleLevelChange(skill.name, e.target.value as SkillLevel)}
                            >
                              {Object.keys(LEVEL_CONFIG).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          ) : (
                            <>
                              <div className={`text-[8px] font-black uppercase p-2 rounded-lg ${conf.bg} ${conf.text} mb-3 inline-block`}>{skill.level}</div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full">
                                <div className={`h-full bg-gradient-to-r ${conf.gradient} rounded-full`} style={{ width: `${conf.progress}%` }} />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 text-center bg-white rounded-[4rem] border border-slate-100 min-h-[600px] shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                <Users size={40} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Aucun équipier sélectionné</h3>
              <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">Choisissez un profil dans la liste latérale.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeList;

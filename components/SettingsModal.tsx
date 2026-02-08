
import React, { useState, useEffect } from 'react';
import { 
  User, Save, Plus, X, Award, CheckCircle, Settings as SettingsIcon, 
  ListChecks, ShieldAlert, Trash2, Edit3, Minus, Briefcase, GraduationCap,
  Check, LayoutGrid, FileText, Smartphone, CheckCircle2
} from 'lucide-react';
import { GlobalCertConfig, ContractConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateUser: (data: { firstName: string; lastName: string }) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  certifications: GlobalCertConfig[];
  setCertifications: (certs: GlobalCertConfig[]) => void;
  contracts: ContractConfig[];
  setContracts: (contracts: ContractConfig[]) => void;
  showReferentials?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, user, onUpdateUser, skills, setSkills, certifications, setCertifications, contracts, setContracts,
  showReferentials = false
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'referentials'>('profile');
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '' });
  
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState<GlobalCertConfig>({ name: '', isMandatory: true, validityMonths: 12 });
  const [newTraining, setNewTraining] = useState<GlobalCertConfig>({ name: '', isMandatory: false, validityMonths: 0 });
  const [newContract, setNewContract] = useState<Omit<ContractConfig, 'id'>>({ name: '', weeklyHours: 35 });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEditValue, setTempEditValue] = useState<any>(null);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({ 
        firstName: user.firstName || '', 
        lastName: user.lastName || '', 
        email: user.email || '' 
      });
    }
  }, [user, isOpen]);

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ firstName: profileData.firstName, lastName: profileData.lastName });
    triggerSuccess();
  };

  // --- ACTIONS POSTES ---
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.toUpperCase())) {
      setSkills([...skills, newSkill.toUpperCase()]);
      setNewSkill('');
      triggerSuccess();
    }
  };
  const startEditSkill = (skill: string) => {
    setEditingId(`skill-${skill}`);
    setTempEditValue(skill);
  };
  const saveEditSkill = (oldSkill: string) => {
    if (tempEditValue && tempEditValue.trim() && !skills.includes(tempEditValue.toUpperCase())) {
      setSkills(skills.map(s => s === oldSkill ? tempEditValue.toUpperCase() : s));
      setEditingId(null);
      triggerSuccess();
    }
  };

  // --- ACTIONS CONTRATS ---
  const addContract = () => {
    if (newContract.name.trim()) {
      setContracts([...contracts, { id: `CT-${Date.now()}`, ...newContract }]);
      setNewContract({ name: '', weeklyHours: 35 });
      triggerSuccess();
    }
  };
  const startEditContract = (c: ContractConfig) => {
    setEditingId(`contract-${c.id}`);
    setTempEditValue({ ...c });
  };
  const saveEditContract = (id: string) => {
    setContracts(contracts.map(c => c.id === id ? tempEditValue : c));
    setEditingId(null);
    triggerSuccess();
  };

  // --- ACTIONS CERTIFS / FORMATIONS ---
  const addCertConfig = (config: GlobalCertConfig) => {
    if (config.name.trim() && !certifications.find(c => c.name === config.name.toUpperCase())) {
      setCertifications([...certifications, { ...config, name: config.name.toUpperCase() }]);
      if (config.isMandatory) setNewCert({ name: '', isMandatory: true, validityMonths: 12 });
      else setNewTraining({ name: '', isMandatory: false, validityMonths: 0 });
      triggerSuccess();
    }
  };
  const startEditCert = (c: GlobalCertConfig) => {
    setEditingId(`cert-${c.name}`);
    setTempEditValue({ ...c });
  };
  const saveEditCert = (oldName: string) => {
    setCertifications(certifications.map(c => c.name === oldName ? { ...tempEditValue, name: tempEditValue.name.toUpperCase() } : c));
    setEditingId(null);
    triggerSuccess();
  };

  const CompactNumberPicker = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => (
    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden h-9">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="px-2 hover:bg-slate-200 text-slate-500 border-r border-slate-200 h-full transition-colors"><Minus size={14} /></button>
      <div className="px-3 flex flex-col items-center justify-center min-w-[45px]">
        <span className="text-xs font-bold text-slate-900 leading-tight">{value}</span>
        <span className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      </div>
      <button type="button" onClick={() => onChange(value + 1)} className="px-2 hover:bg-slate-200 text-slate-500 border-l border-slate-200 h-full transition-colors"><Plus size={14} /></button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-[#264f36] w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg shadow-[#264f36]/20">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Réglages du Restaurant</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration des référentiels</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-64 border-r border-slate-50 bg-slate-50/30 p-6 flex flex-col gap-3 shrink-0">
            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${activeTab === 'profile' ? 'bg-[#264f36] text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>
              <User size={18} /> Profil
            </button>
            {showReferentials && (
              <button onClick={() => setActiveTab('referentials')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${activeTab === 'referentials' ? 'bg-[#264f36] text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>
                <ListChecks size={18} /> Référentiels Restaurant
              </button>
            )}
          </aside>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
            {saveSuccess && (
              <div className="fixed top-8 right-8 z-[110] bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-in slide-in-from-right-4">
                <CheckCircle size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Enregistré</span>
              </div>
            )}

            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileSave} className="space-y-8 max-w-xl animate-in">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                      <input type="text" className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#264f36] focus:bg-white text-sm font-bold" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                      <input type="text" className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#264f36] focus:bg-white text-sm font-bold" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" readOnly className="w-full h-12 px-5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400" value={profileData.email} />
                  </div>
                </div>
                <button type="submit" className="flex items-center justify-center gap-3 px-8 py-4 bg-[#264f36] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
                  <Save size={18} /> Mettre à jour le profil
                </button>
              </form>
            ) : (
              <div className="space-y-16 animate-in">
                
                {/* SECTION POSTES (SKILLS) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"><LayoutGrid size={20} /></div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Gestion des Postes (SOC)</h3>
                  </div>
                  <div className="flex gap-4 max-w-xl">
                    <input 
                      type="text" 
                      placeholder="NOM DU POSTE" 
                      className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-blue-500 focus:bg-white transition-all"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                    />
                    <button onClick={addSkill} className="px-6 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all text-[10px] font-black uppercase tracking-widest">
                      <Plus size={18} /> Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {skills.map(skill => (
                      <div key={skill} className={`bg-white border rounded-xl flex items-center gap-3 group transition-all p-2 ${editingId === `skill-${skill}` ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'}`}>
                        {editingId === `skill-${skill}` ? (
                          <div className="flex items-center gap-2 w-full max-w-[200px] overflow-hidden">
                            <input className="flex-1 min-w-0 text-[10px] font-black uppercase outline-none bg-slate-50 px-2 py-1.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-100" value={tempEditValue} onChange={e => setTempEditValue(e.target.value)} autoFocus />
                            <button onClick={() => saveEditSkill(skill)} className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-sm hover:bg-emerald-600 flex-shrink-0"><Check size={14}/></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 flex-shrink-0"><X size={14}/></button>
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight pl-2">{skill}</span>
                            <div className="flex gap-1">
                              <button onClick={() => startEditSkill(skill)} className="text-slate-300 hover:text-blue-500"><Edit3 size={14} /></button>
                              <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION CONTRATS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100"><Briefcase size={20} /></div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Types de Contrats</h3>
                  </div>
                  <div className="flex gap-4 max-w-2xl items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom du contrat</label>
                      <input 
                        type="text" 
                        placeholder="CDI 35H, CDD 24H..." 
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        value={newContract.name}
                        onChange={e => setNewContract({...newContract, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Heures Hebdo</label>
                      <CompactNumberPicker value={newContract.weeklyHours} label="HEURES" onChange={(v) => setNewContract({...newContract, weeklyHours: v})} />
                    </div>
                    <button onClick={addContract} className="h-11 px-6 bg-emerald-600 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all text-[10px] font-black uppercase tracking-widest">
                      <Plus size={18} /> Ajouter
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {contracts.map(contract => (
                      <div key={contract.id} className={`bg-white border p-4 rounded-2xl flex items-center justify-between group transition-all min-h-[100px] ${editingId === `contract-${contract.id}` ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
                        {editingId === `contract-${contract.id}` ? (
                          <div className="space-y-3 w-full">
                            <input className="w-full bg-slate-50 border border-emerald-200 rounded-lg px-3 py-2 text-[10px] font-black uppercase focus:ring-2 focus:ring-emerald-100 outline-none" value={tempEditValue.name} onChange={e => setTempEditValue({...tempEditValue, name: e.target.value})} />
                            <div className="flex items-center justify-between gap-2">
                              <CompactNumberPicker value={tempEditValue.weeklyHours} label="HEURES" onChange={v => setTempEditValue({...tempEditValue, weeklyHours: v})} />
                              <button onClick={() => saveEditContract(contract.id)} className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-700 flex-shrink-0 transition-colors"><Check size={18}/></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{contract.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{contract.weeklyHours}H / semaine</p>
                            </div>
                            <div className="flex gap-1 ml-2 flex-shrink-0">
                              <button onClick={() => startEditContract(contract)} className="text-slate-300 hover:text-blue-500 p-1"><Edit3 size={16} /></button>
                              <button onClick={() => setContracts(contracts.filter(c => c.id !== contract.id))} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION CERTIFICATS OBLIGATOIRES */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100"><ShieldAlert size={20} /></div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Certificats Obligatoires</h3>
                  </div>
                  <div className="flex gap-4 max-w-2xl items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom du certificat</label>
                      <input 
                        type="text" 
                        placeholder="HACCP, SST..." 
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-red-500 focus:bg-white transition-all"
                        value={newCert.name}
                        onChange={e => setNewCert({...newCert, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Validité (Mois)</label>
                      <CompactNumberPicker value={newCert.validityMonths} label="MOIS" onChange={(v) => setNewCert({...newCert, validityMonths: v})} />
                    </div>
                    <button onClick={() => addCertConfig(newCert)} className="h-11 px-6 bg-red-600 text-white rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all text-[10px] font-black uppercase tracking-widest">
                      <Plus size={18} /> Ajouter
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certifications.filter(c => c.isMandatory).map(cert => (
                      <div key={cert.name} className={`bg-white border p-5 rounded-2xl flex flex-col gap-4 group transition-all min-h-[120px] ${editingId === `cert-${cert.name}` ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200'}`}>
                        {editingId === `cert-${cert.name}` ? (
                          <div className="space-y-4 w-full">
                            <input className="w-full bg-slate-50 border border-red-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-red-100" value={tempEditValue.name} onChange={e => setTempEditValue({...tempEditValue, name: e.target.value})} />
                            <div className="flex items-center justify-between gap-2">
                              <CompactNumberPicker value={tempEditValue.validityMonths} label="MOIS" onChange={v => setTempEditValue({...tempEditValue, validityMonths: v})} />
                              <button onClick={() => saveEditCert(cert.name)} className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-700 flex-shrink-0 transition-all"><Check size={20}/></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight flex-1 mr-4 truncate">{cert.name}</h4>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => startEditCert(cert)} className="text-slate-300 hover:text-blue-500"><Edit3 size={16} /></button>
                                <button onClick={() => setCertifications(certifications.filter(c => c.name !== cert.name))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Validité: {cert.validityMonths} mois</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION FORMATIONS INTERNES (Sans Validité) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#264f36]/10 text-[#264f36] rounded-lg border border-[#264f36]/20"><GraduationCap size={20} /></div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Formations McDo Internes</h3>
                  </div>
                  <div className="flex gap-4 max-w-xl">
                    <input 
                      type="text" 
                      placeholder="NOM DU MODULE (EX: HOSPITALITÉ...)" 
                      className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-[#264f36] focus:bg-white transition-all"
                      value={newTraining.name}
                      onChange={e => setNewTraining({...newTraining, name: e.target.value})}
                    />
                    <button onClick={() => addCertConfig(newTraining)} className="h-11 px-6 bg-[#264f36] text-white rounded-xl flex items-center gap-2 hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest">
                      <Plus size={18} /> Ajouter
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certifications.filter(c => !c.isMandatory).map(training => (
                      <div key={training.name} className={`bg-white border p-5 rounded-2xl flex flex-col gap-4 group transition-all min-h-[100px] justify-center overflow-hidden ${editingId === `cert-${training.name}` ? 'border-[#264f36] ring-4 ring-[#264f36]/10' : 'border-slate-200'}`}>
                        {editingId === `cert-${training.name}` ? (
                          <div className="flex items-center gap-2 w-full">
                             <input className="flex-1 min-w-0 bg-slate-50 border border-[#264f36]/20 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-[#264f36]/10" value={tempEditValue.name} onChange={e => setTempEditValue({...tempEditValue, name: e.target.value})} autoFocus />
                             <button onClick={() => saveEditCert(training.name)} className="w-11 h-11 bg-[#264f36] text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-900 transition-all flex-shrink-0"><Check size={20} strokeWidth={3} /></button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight flex-1 mr-4 truncate">{training.name}</h4>
                            <div className="flex gap-1 flex-shrink-0">
                               <button onClick={() => startEditCert(training)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16} /></button>
                               <button onClick={() => setCertifications(certifications.filter(c => c.name !== training.name))} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

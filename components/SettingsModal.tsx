
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Plus, X, Award, CheckCircle, Settings as SettingsIcon, Briefcase, ListChecks, ChevronRight, Clock, ShieldAlert, Trash2, Edit3, CalendarClock, Minus, Sparkles } from 'lucide-react';
import { GlobalCertConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  setUser: (user: any) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  certifications: GlobalCertConfig[];
  setCertifications: (certs: GlobalCertConfig[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  setUser, 
  skills, 
  setSkills, 
  certifications, 
  setCertifications 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'referentials'>('profile');
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState({ name: '', isMandatory: false, validityMonths: 12 });
  const [editingCertName, setEditingCertName] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<GlobalCertConfig | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user, isOpen]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ ...user, ...profileData });
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const addCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCert.name && !certifications.find(c => c.name === newCert.name)) {
      setCertifications([...certifications, { ...newCert }]);
      setNewCert({ name: '', isMandatory: false, validityMonths: 12 });
    }
  };

  const startEditing = (cert: GlobalCertConfig) => {
    setEditingCertName(cert.name);
    setEditFormData({ ...cert });
  };

  const saveEdit = () => {
    if (editFormData && editingCertName) {
      setCertifications(certifications.map(c => 
        c.name === editingCertName ? { ...editFormData } : c
      ));
      setEditingCertName(null);
      setEditFormData(null);
      triggerSuccess();
    }
  };

  const ValiditySelector = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    const presets = [6, 12, 24, 36];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 bg-slate-50 p-1.5 border-2 border-slate-100 rounded-[1.2rem]">
          <button 
            type="button" 
            onClick={() => onChange(Math.max(1, value - 1))}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-100 hover:border-[#264f36] hover:text-[#264f36] rounded-xl transition-all active:scale-95 text-slate-400"
          >
            <Minus size={16} strokeWidth={3} />
          </button>
          <div className="flex flex-col items-center min-w-[50px]">
            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Mois</span>
          </div>
          <button 
            type="button" 
            onClick={() => onChange(value + 1)}
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-100 hover:border-[#264f36] hover:text-[#264f36] rounded-xl transition-all active:scale-95 text-slate-400"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
        <div className="flex gap-1.5">
          {presets.map(p => (
            <button 
              key={p} 
              type="button" 
              onClick={() => onChange(p)}
              className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${value === p ? 'bg-[#264f36] text-white shadow-md' : 'bg-transparent border-2 border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              {p < 12 ? `${p}M` : `${p/12}An`}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-400">
        
        {/* Header - More compact */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-[#264f36] w-12 h-12 flex items-center justify-center rounded-[1rem] shadow-xl shadow-[#264f36]/10">
              <SettingsIcon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Réglages McFormation</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Store Manager Central</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation - Narrower */}
          <aside className="w-64 border-r border-slate-100 bg-slate-50/20 p-6 flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[10px] tracking-wider uppercase border-2 ${activeTab === 'profile' ? 'bg-white border-[#264f36] text-[#264f36] shadow-md' : 'bg-transparent border-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
            >
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-all ${activeTab === 'profile' ? 'bg-[#264f36] text-white' : 'bg-slate-200 text-slate-400'}`}>
                <User size={16} />
              </div>
              <span className="flex-1 text-left">Profil Manager</span>
            </button>
            <button 
              onClick={() => setActiveTab('referentials')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[10px] tracking-wider uppercase border-2 ${activeTab === 'referentials' ? 'bg-white border-[#264f36] text-[#264f36] shadow-md' : 'bg-transparent border-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
            >
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-all ${activeTab === 'referentials' ? 'bg-[#264f36] text-white' : 'bg-slate-200 text-slate-400'}`}>
                <ListChecks size={16} />
              </div>
              <span className="flex-1 text-left">Référentiels</span>
            </button>

            <div className="mt-auto p-4 bg-white/50 rounded-2xl border border-slate-100 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Version McFormation 3.2.0 Stable</p>
            </div>
          </aside>

          {/* Main Content Area - Optimized density */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
            {saveSuccess && (
              <div className="mb-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <div className="bg-emerald-500 w-8 h-8 flex items-center justify-center rounded-full text-white shadow-md shrink-0">
                  <CheckCircle size={14} strokeWidth={3} />
                </div>
                <p className="font-black text-[9px] uppercase tracking-widest">Configuration mise à jour avec succès</p>
              </div>
            )}

            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileSave} className="space-y-8 max-w-xl animate-in fade-in duration-400">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-[#264f36] rounded-xl border border-slate-100">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Compte Administrateur</h3>
                    <p className="text-[10px] font-bold text-slate-400 italic">Identifiants de gestion store.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Nom du Manager</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#264f36] focus:bg-white text-xs font-black transition-all" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Email Professionnel</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#264f36] focus:bg-white text-xs font-black transition-all" 
                      value={profileData.email} 
                      onChange={e => setProfileData({...profileData, email: e.target.value})} 
                    />
                  </div>
                </div>
                <button type="submit" className="flex items-center justify-center gap-3 px-8 py-4 bg-[#264f36] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1d3c29] transition-all shadow-lg shadow-[#264f36]/10 active:scale-95 group">
                  <Save size={16} /> 
                  Sauvegarder les modifications
                </button>
              </form>
            ) : (
              <div className="animate-in fade-in duration-400 space-y-12">
                {/* Zones de Travail */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Postes Opérationnels</h3>
                      <p className="text-[10px] font-bold text-slate-400 italic">Catalogue des zones de travail du restaurant.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={addSkill} className="flex gap-3 max-w-lg bg-slate-50 p-2 rounded-[1.5rem] border-2 border-slate-100 items-center">
                    <div className="flex-1 relative group">
                      <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#264f36] transition-colors" size={16} strokeWidth={3} />
                      <input 
                        type="text" 
                        placeholder="Nouveau poste..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-xl outline-none focus:border-[#264f36] text-[11px] font-black transition-all" 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)} 
                      />
                    </div>
                    <button type="submit" className="w-11 h-11 bg-[#264f36] text-white rounded-xl flex items-center justify-center hover:bg-[#1d3c29] transition-all active:scale-90 shrink-0">
                      <CheckCircle size={22} />
                    </button>
                  </form>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map(s => (
                      <div key={s} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[#264f36] text-[10px] font-black uppercase hover:border-[#264f36]/30 transition-all">
                        {s}
                        <button onClick={() => setSkills(skills.filter(i => i !== s))} className="text-slate-200 hover:text-red-500 transition-colors">
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Certifications Store */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Référentiel Diplômes</h3>
                      <p className="text-[10px] font-bold text-slate-400 italic">Certificats de sécurité et d'expertise.</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Titre</label>
                        <input 
                          type="text" 
                          placeholder="ex: Sécurité Niveau 2" 
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-black outline-none focus:border-[#264f36]" 
                          value={newCert.name} 
                          onChange={e => setNewCert({...newCert, name: e.target.value})} 
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100">
                        <button 
                          type="button"
                          onClick={() => setNewCert({...newCert, isMandatory: !newCert.isMandatory})}
                          className={`w-10 h-5 rounded-full transition-all relative ${newCert.isMandatory ? 'bg-[#264f36]' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newCert.isMandatory ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                        <span className="text-[9px] font-black text-slate-600 uppercase">Obligatoire</span>
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Recyclage</label>
                      <ValiditySelector value={newCert.validityMonths} onChange={(v) => setNewCert({...newCert, validityMonths: v})} />
                    </div>

                    <div className="lg:col-span-3 h-full flex items-end">
                      <button 
                        onClick={addCert} 
                        className="w-full h-12 bg-[#264f36] text-white font-black rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-[#1d3c29] transition-all shadow-md active:scale-95"
                      >
                        <Plus size={16} /> AJOUTER
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {certifications.map(c => (
                      <div key={c.name} className={`p-4 bg-white border rounded-2xl transition-all ${editingCertName === c.name ? 'border-[#264f36] ring-4 ring-[#264f36]/5' : 'border-slate-100 hover:border-slate-200'}`}>
                        {editingCertName === c.name ? (
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase"
                              value={editFormData?.name}
                              onChange={e => setEditFormData(prev => prev ? {...prev, name: e.target.value} : null)}
                            />
                            <ValiditySelector 
                              value={editFormData?.validityMonths || 0} 
                              onChange={(v) => setEditFormData(prev => prev ? {...prev, validityMonths: v} : null)} 
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setEditingCertName(null)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[9px] uppercase">Annuler</button>
                              <button onClick={saveEdit} className="flex-1 py-2 bg-[#264f36] text-white rounded-lg font-black text-[9px] uppercase">OK</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 ${c.isMandatory ? 'bg-[#264f36] text-white' : 'bg-slate-50 text-slate-300'}`}>
                                <Award size={20} />
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-black text-slate-900 uppercase text-[10px] leading-tight">{c.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-black text-slate-400 uppercase">{c.validityMonths} mois</span>
                                  {c.isMandatory && <span className="text-[7px] font-black text-[#264f36] uppercase bg-[#264f36]/5 px-1.5 py-0.5 rounded">Requis</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => startEditing(c)} className="p-2 text-slate-300 hover:text-[#264f36] hover:bg-slate-50 rounded-lg transition-all">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => setCertifications(certifications.filter(i => i.name !== c.name))} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

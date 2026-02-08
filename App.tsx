
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import ArchiveList from './components/ArchiveList';
import ActivityFeed from './components/ActivityFeed';
import ModuleSelection, { ModuleType } from './components/ModuleSelection';
import SettingsModal from './components/SettingsModal';
import SupportModal from './components/SupportModal';
import IntelligentPlanner from './components/IntelligentPlanner';
import { Mail, LockKeyhole, Loader2, AlertCircle, CheckCircle2, UserPlus, ArrowLeft, Send, KeyRound, User as UserIcon, ShieldCheck, RefreshCw } from 'lucide-react';
import { Role, GlobalCertConfig, ContractConfig, Employee, ActivityLog } from './types';
import { apiService, supabase } from './services/apiService';
import { DEFAULT_CERTIFICATIONS, DEFAULT_SKILLS } from './mockData';

type AuthView = 'login' | 'signup' | 'forgot' | 'update_password';

const formatToTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => {
    return word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
  }).join(' ');
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showSlowLoadWarning, setShowSlowLoadWarning] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupRole, setSignupRole] = useState('Directeur');

  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ id: string; firstName: string; lastName: string; email: string; role: any } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [archivedEmployees, setArchivedEmployees] = useState<Employee[]>([]);
  const [trashEmployees, setTrashEmployees] = useState<Employee[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [availableSkills, setAvailableSkills] = useState<string[]>(DEFAULT_SKILLS);
  const [availableCertifications, setAvailableCertifications] = useState<GlobalCertConfig[]>(DEFAULT_CERTIFICATIONS);
  const [availableContracts, setAvailableContracts] = useState<ContractConfig[]>([
    { id: 'CT-DEFAULT-1', name: 'CDI 35H', weeklyHours: 35 },
    { id: 'CT-DEFAULT-2', name: 'CDI 24H', weeklyHours: 24 }
  ]);

  // --- LOGIQUE AUTO-ARCHIVAGE ---
  useEffect(() => {
    if (employees.length > 0 && isAuthenticated) {
      const today = new Date();
      const toArchive: Employee[] = [];
      const stillActive: Employee[] = [];

      employees.forEach(emp => {
        if (emp.contractEndDate) {
          const endDate = new Date(emp.contractEndDate);
          if (endDate < today) {
            toArchive.push({
              ...emp,
              isArchived: true,
              archivedDate: today.toLocaleDateString('fr-FR'),
              archivedReason: `[AUTO] Fin de contrat atteinte le ${emp.contractEndDate}`
            });
          } else {
            stillActive.push(emp);
          }
        } else {
          stillActive.push(emp);
        }
      });

      if (toArchive.length > 0) {
        setEmployees(stillActive);
        setArchivedEmployees(prev => [...toArchive, ...prev]);
        apiService.saveEmployees(toArchive);
        toArchive.forEach(emp => {
          addActivityLog('Auto-Archivage', `${emp.name} archivé automatiquement (fin de contrat).`, 'EQUIPE');
        });
      }
    }
  }, [employees, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDataLoading) setShowSlowLoadWarning(true);
    }, 7000);

    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await (supabase.auth as any).getSession();
        
        if (sessionError || !session) {
          if (sessionError) {
            console.warn("Session error detected, cleaning up...");
            await (supabase.auth as any).signOut();
          }
          setIsAuthenticated(false);
        } else {
          const { data: profile } = await apiService.getUserProfile(session.user.id);
          setIsAuthenticated(true);
          setUser({
            id: session.user.id,
            firstName: formatToTitleCase(profile?.first_name || session.user.user_metadata?.first_name || 'Utilisateur'),
            lastName: formatToTitleCase(profile?.last_name || session.user.user_metadata?.last_name || ''),
            email: session.user.email || '',
            role: profile?.role || session.user.user_metadata?.role || 'Directeur'
          });
        }
      } catch (err) {
        console.error("Critical checkSession failure:", err);
        localStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setIsDataLoading(false);
        clearTimeout(timer);
      }
    };

    checkSession();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await apiService.getUserProfile(session.user.id);
        setIsAuthenticated(true);
        setUser({
          id: session.user.id,
          firstName: formatToTitleCase(profile?.first_name || session.user.user_metadata?.first_name || 'Utilisateur'),
          lastName: formatToTitleCase(profile?.last_name || session.user.user_metadata?.last_name || ''),
          email: session.user.email || '',
          role: profile?.role || session.user.user_metadata?.role || 'Directeur'
        });
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        setSelectedModule(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const [emps, archs, trash, logs, settings] = await Promise.all([
          apiService.getEmployees('active'),
          apiService.getEmployees('archived'),
          apiService.getEmployees('deleted'),
          apiService.getLogs(),
          apiService.getSettings()
        ]);

        setEmployees(emps || []);
        setArchivedEmployees(archs || []);
        setTrashEmployees(trash || []);
        setActivityLogs(logs || []);
        
        if (settings.skills?.length > 0) setAvailableSkills(settings.skills);
        if (settings.certs?.length > 0) setAvailableCertifications(settings.certs);
        if (settings.contracts?.length > 0) setAvailableContracts(settings.contracts);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      }
    };

    loadAllData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isDataLoading && isAuthenticated) {
      apiService.saveEmployees([...employees, ...archivedEmployees]);
    }
  }, [employees, archivedEmployees, isAuthenticated, isDataLoading]);

  const addActivityLog = async (action: string, details: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user ? `${user.firstName} ${user.lastName}` : 'Admin',
      action,
      details,
      category
    };
    await apiService.addLog(newLog);
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateUser = async (updatedData: { firstName: string; lastName: string }) => {
    if (!user) return;
    const formattedFirstName = formatToTitleCase(updatedData.firstName);
    const formattedLastName = formatToTitleCase(updatedData.lastName);
    setUser({ ...user, firstName: formattedFirstName, lastName: formattedLastName });
    try {
      await apiService.updateUserProfile(user.id, {
        first_name: formattedFirstName,
        last_name: formattedLastName
      });
      addActivityLog('Mise à jour Profil', `Nom/Prénom modifiés pour ${formattedFirstName} ${formattedLastName}.`, 'SYSTEM');
    } catch (e) {
      console.error("Échec sauvegarde profil:", e);
    }
  };

  const handleArchiveEmployee = async (id: string, reason: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const archivedEmp = {
      ...emp,
      isArchived: true,
      archivedDate: new Date().toLocaleDateString('fr-FR'),
      archivedReason: reason
    };
    setEmployees(prev => prev.filter(e => e.id !== id));
    setArchivedEmployees(prev => [archivedEmp, ...prev]);
    await apiService.saveEmployees([archivedEmp]);
    addActivityLog('Archivage', `${emp.name} déplacé vers les archives.`, 'EQUIPE');
  };

  const handleDeleteEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const deletedEmp = { 
      ...emp, 
      isDeleted: true, 
      deletedDate: new Date().toLocaleDateString('fr-FR') 
    };
    setEmployees(prev => prev.filter(e => e.id !== id));
    setTrashEmployees(prev => [deletedEmp, ...prev]);
    await apiService.saveEmployees([deletedEmp]);
    addActivityLog('Suppression', `${emp.name} mis à la corbeille.`, 'EQUIPE');
  };

  const handleRestoreEmployee = async (id: string) => {
    const emp = trashEmployees.find(e => e.id === id);
    if (!emp) return;
    const restoredEmp = { 
      ...emp, 
      isDeleted: false, 
      deletedDate: undefined 
    };
    setTrashEmployees(prev => prev.filter(e => e.id !== id));
    setEmployees(prev => [restoredEmp, ...prev]);
    await apiService.saveEmployees([restoredEmp]);
    addActivityLog('Restauration', `${emp.name} restauré depuis la corbeille.`, 'EQUIPE');
  };

  const handlePermanentDelete = async (id: string) => {
    setTrashEmployees(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) console.error("Erreur suppression définitive:", error);
    addActivityLog('Destruction', `Dossier ${id} supprimé définitivement.`, 'EQUIPE');
  };

  const handleRestoreFromArchive = async (id: string) => {
    const emp = archivedEmployees.find(e => e.id === id);
    if (!emp) return;
    const restoredEmp: Employee = { 
      ...emp, 
      isArchived: false, 
      archivedDate: undefined,
      contractEndDate: undefined // Réinitialisation automatique en "Indéterminé" lors de la restauration
    };
    setArchivedEmployees(prev => prev.filter(e => e.id !== id));
    setEmployees(prev => [restoredEmp, ...prev]);
    await apiService.saveEmployees([restoredEmp]);
    addActivityLog('Réintégration', `${emp.name} réintégré. Fin de contrat remise à "Indéterminé".`, 'EQUIPE');
  };

  const handleUpdateArchiveReason = async (id: string, reason: string) => {
    const updated = archivedEmployees.map(emp => emp.id === id ? { ...emp, archivedReason: reason } : emp);
    setArchivedEmployees(updated);
    const target = updated.find(e => e.id === id);
    if (target) await apiService.saveEmployees([target]);
    addActivityLog('Mise à jour Archive', `Motif archivage mis à jour pour ${id}.`, 'EQUIPE');
  };

  const handleLogout = async () => {
    await apiService.signOut();
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedModule(null);
    setActiveTab('dashboard');
  };

  if (isDataLoading && !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white p-10 text-center">
        <Loader2 className="animate-spin text-[#264f36] mb-4" size={48} />
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Vérification de session...</h2>
        {showSlowLoadWarning && (
          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[9px] font-black text-red-500 uppercase mb-4 flex items-center justify-center gap-2">
              <AlertCircle size={14} /> La connexion prend plus de temps que prévu
            </p>
            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#264f36] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
              <RefreshCw size={14} /> Rafraîchir
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#264f36]"></div>
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 animate-in">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-[#264f36] p-4 rounded-[1.5rem] shadow-2xl mb-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" alt="McDonald's" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              {authView === 'login' ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Console gestion de tache</p>
          </div>

          {authError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold">{authError}</div>}
          {authSuccess && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-bold">{authSuccess}</div>}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setAuthLoading(true);
            setAuthError(null);
            try {
              if (authView === 'login') {
                const { error } = await apiService.signIn(email, password);
                if (error) throw error;
              } else {
                const { error } = await apiService.signUp(email, password, formatToTitleCase(firstName), formatToTitleCase(lastName), signupRole);
                if (error) throw error;
                setAuthSuccess("Compte créé !");
                setAuthView('login');
              }
            } catch (err: any) {
              setAuthError(err.message);
            } finally {
              setAuthLoading(false);
            }
          }} className="space-y-4">
            {authView === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Prénom" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  <input type="text" placeholder="Nom" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold appearance-none" value={signupRole} onChange={e => setSignupRole(e.target.value)}>
                  <option value="Directeur">Directeur</option>
                  <option value="Manager">Manager</option>
                  <option value="Formateur">Formateur</option>
                </select>
              </>
            )}
            <input type="email" placeholder="votre@email.com" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="••••••••" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" disabled={authLoading} className="w-full py-5 bg-[#264f36] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 transition-all">
              {authLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : authView === 'login' ? 'Se Connecter' : 'Créer un compte'}
            </button>
          </form>
          <button onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')} className="w-full mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#264f36]">
            {authView === 'login' ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedModule === null ? (
        <ModuleSelection 
          user={user!} 
          onSelect={setSelectedModule} 
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
        />
      ) : (
        <Layout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user!} 
          onLogout={handleLogout}
          module={selectedModule === 'training' ? 'training' : 'planning'}
          onSwitchModule={() => setSelectedModule(null)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
        >
          {selectedModule === 'training' ? (
            activeTab === 'dashboard' ? (
              <Dashboard 
                employees={employees} 
                availableCertifications={availableCertifications} 
                availableSkills={availableSkills} 
                onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} 
              />
            ) : activeTab === 'employees' ? (
              <EmployeeList 
                employees={employees} 
                setEmployees={setEmployees} 
                onArchiveEmployee={handleArchiveEmployee} 
                onDeleteEmployee={handleDeleteEmployee}
                trashEmployees={trashEmployees} 
                onRestoreEmployee={handleRestoreEmployee} 
                onPermanentDelete={handlePermanentDelete}
                availableSkills={availableSkills} 
                availableCertifications={availableCertifications} 
                availableContracts={availableContracts} 
                initialSelectedId={selectedEmployeeId} 
                onClearSelection={() => setSelectedEmployeeId(null)} 
                onAddActivity={addActivityLog}
              />
            ) : activeTab === 'logs' ? (
              <ActivityFeed logs={activityLogs} />
            ) : (
              <ArchiveList 
                archivedEmployees={archivedEmployees} 
                onRestore={handleRestoreFromArchive} 
                onUpdateReason={handleUpdateArchiveReason} 
              />
            )
          ) : (
            <IntelligentPlanner />
          )}
        </Layout>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        user={user} 
        onUpdateUser={handleUpdateUser}
        skills={availableSkills} 
        setSkills={(s) => { setAvailableSkills(s); apiService.saveSettings('mcfo_skills', s); }} 
        certifications={availableCertifications} 
        setCertifications={(c) => { setAvailableCertifications(c); apiService.saveSettings('mcfo_certs', c); }}
        contracts={availableContracts} 
        setContracts={(ct) => { setAvailableContracts(ct); apiService.saveSettings('mcfo_contracts', ct); }} 
        showReferentials={selectedModule === 'training'}
      />

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} user={user!} />
    </>
  );
};

export default App;

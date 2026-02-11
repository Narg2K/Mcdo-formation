
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import ArchiveList from './components/ArchiveList';
import ActivityFeed from './components/ActivityFeed';
import ModuleSelection, { ModuleType } from './components/ModuleSelection';
import SettingsModal from './components/SettingsModal';
import SupportModal from './components/SupportModal';
import IntelligentPlanner from './components/IntelligentPlanner';
import { Loader2, UserCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Role, GlobalCertConfig, ContractConfig, Employee, ActivityLog } from './types';
import { apiService, supabase } from './services/apiService';
import { DEFAULT_CERTIFICATIONS, DEFAULT_SKILLS } from './mockData';

const formatToTitleCase = (str: string) => {
  if (!str) return '';
  return str.trim().toLowerCase().split(/\s+/).map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedSignupRole, setSelectedSignupRole] = useState('Directeur');
  const [showPassword, setShowPassword] = useState(false);

  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
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
    { id: 'CT-1', name: 'CDI 35H', weeklyHours: 35 },
    { id: 'CT-2', name: 'CDI 24H', weeklyHours: 24 }
  ]);

  // Initialisation de l'utilisateur
  const initializeUser = async (userId: string, userEmail: string) => {
    try {
      const { data: profile } = await apiService.getUserProfile(userId);
      const userData = {
        id: userId,
        firstName: formatToTitleCase(profile?.first_name || 'Utilisateur'),
        lastName: formatToTitleCase(profile?.last_name || ''),
        email: userEmail,
        role: profile?.role || 'Directeur'
      };
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      console.error("Erreur profile:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await initializeUser(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        if (mounted) setIsDataLoading(false);
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, []);

  const loadAllData = async () => {
    if (!isAuthenticated || !user) return;
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
      if (settings?.skills?.length) setAvailableSkills(settings.skills);
      if (settings?.certs?.length) setAvailableCertifications(settings.certs);
      if (settings?.contracts?.length) setAvailableContracts(settings.contracts);
    } catch (error) {
      console.error("Loading error:", error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [isAuthenticated, activeTab, user]);

  const addActivityLog = async (action: string, details: string, category: ActivityLog['category']) => {
    if (!user) return;
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      user: `${user.firstName} ${user.lastName}`,
      action, details, category
    };
    try {
      await apiService.addLog(newLog);
      setActivityLogs(prev => [newLog, ...prev]);
    } catch (e) { console.error("Log error:", e); }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    await apiService.saveEmployees([updatedEmp]);
  };

  const handleArchiveEmployee = async (id: string, reason: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const archivedEmp = { ...emp, isArchived: true, isDeleted: false, archivedDate: new Date().toLocaleDateString('fr-FR'), archivedReason: reason };
    await apiService.saveEmployees([archivedEmp]);
    setEmployees(prev => prev.filter(e => e.id !== id));
    setArchivedEmployees(prev => [archivedEmp, ...prev]);
    setSelectedEmployeeId(null);
    addActivityLog('Archivage', `${emp.name} archivé.`, 'EQUIPE');
  };

  const handleDeleteEmployee = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const deletedEmp = { ...emp, isDeleted: true, isArchived: false, deletedDate: new Date().toLocaleDateString('fr-FR') };
    await apiService.saveEmployees([deletedEmp]);
    setEmployees(prev => prev.filter(e => e.id !== id));
    setTrashEmployees(prev => [deletedEmp, ...prev]);
    setSelectedEmployeeId(null);
    addActivityLog('Suppression', `${emp.name} mis à la corbeille.`, 'EQUIPE');
  };

  const handleRestoreEmployee = async (id: string) => {
    const emp = trashEmployees.find(e => e.id === id);
    if (!emp) return;
    const restoredEmp = { ...emp, isDeleted: false, deletedDate: undefined };
    await apiService.saveEmployees([restoredEmp]);
    setTrashEmployees(prev => prev.filter(e => e.id !== id));
    setEmployees(prev => [restoredEmp, ...prev]);
    addActivityLog('Restauration', `${emp.name} restauré.`, 'EQUIPE');
  };

  const handlePermanentDelete = async (id: string) => {
    await apiService.permanentDeleteEmployee(id);
    setTrashEmployees(prev => prev.filter(e => e.id !== id));
    addActivityLog('Destruction', `Dossier ${id} supprimé définitivement.`, 'EQUIPE');
  };

  const handleEmptyTrash = async () => {
    await apiService.emptyTrash();
    setTrashEmployees([]);
    addActivityLog('Corbeille', "Corbeille vidée.", 'EQUIPE');
  };

  const handleRestoreFromArchive = async (id: string) => {
    const emp = archivedEmployees.find(e => e.id === id);
    if (!emp) return;
    const restoredEmp = { ...emp, isArchived: false, archivedDate: undefined };
    await apiService.saveEmployees([restoredEmp]);
    setArchivedEmployees(prev => prev.filter(e => e.id !== id));
    setEmployees(prev => [restoredEmp, ...prev]);
    addActivityLog('Réintégration', `${emp.name} réintégré.`, 'EQUIPE');
  };

  const handleLogout = async () => {
    await apiService.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedModule(null);
  };

  if (isDataLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#264f36] mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Démarrage McFormation...</p>
      </div>
    );
  }

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-8">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center">
        <div className="bg-[#264f36] w-20 h-20 mx-auto p-4 rounded-3xl shadow-xl mb-8 flex items-center justify-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" alt="McDo" className="w-12 h-12 object-contain" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8 leading-none">
          {authView === 'login' ? 'Connexion' : 'Inscription'}
        </h1>
        
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (authLoading) return;
          setAuthLoading(true);
          setAuthError(null);
          try {
            if (authView === 'login') {
              const { data, error } = await apiService.signIn(email, password);
              if (error) throw error;
              if (data?.user) {
                await initializeUser(data.user.id, data.user.email || '');
              }
            } else {
              const { error } = await apiService.signUp(email, password, firstName, lastName, selectedSignupRole);
              if (error) throw error;
              setAuthView('login');
              alert("Succès ! Vous pouvez maintenant vous connecter.");
            }
          } catch (err: any) { setAuthError(err.message || "Erreur d'authentification."); }
          finally { setAuthLoading(false); }
        }}>
          {authView === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Prénom" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-[#264f36]" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <input placeholder="Nom" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-[#264f36]" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-[#264f36] appearance-none cursor-pointer"
                  value={selectedSignupRole}
                  onChange={e => setSelectedSignupRole(e.target.value)}
                >
                  <option value="Directeur">Directeur / Franchise</option>
                  <option value="Admin">Administrateur Système</option>
                  <option value="Manager">Manager de restaurant</option>
                </select>
              </div>
            </>
          )}
          <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-[#264f36]" value={email} onChange={e => setEmail(e.target.value)} required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-[#264f36] pr-12" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#264f36] transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button disabled={authLoading} type="submit" className="w-full py-4 bg-[#264f36] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
            {authLoading ? <Loader2 className="animate-spin" size={20} /> : 'Valider'}
          </button>
          {authError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><AlertCircle size={14}/> {authError}</div>}
        </form>
        <button onClick={() => { setAuthView(authView === 'login' ? 'signup' : 'login'); setAuthError(null); }} className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#264f36] transition-colors">
          {authView === 'login' ? "Nouvel accès ? Créer un compte" : "Déjà membre ? Se connecter"}
        </button>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    if (selectedModule === 'planning') {
      return <IntelligentPlanner employees={employees} onAddActivity={addActivityLog} />;
    }
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard employees={employees} availableCertifications={availableCertifications} availableSkills={availableSkills} onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} />;
      case 'employees':
        return <EmployeeList employees={employees} setEmployees={setEmployees} onUpdateEmployee={handleUpdateEmployee} onArchiveEmployee={handleArchiveEmployee} onDeleteEmployee={handleDeleteEmployee} trashEmployees={trashEmployees} onRestoreEmployee={handleRestoreEmployee} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash} availableSkills={availableSkills} availableCertifications={availableCertifications} availableContracts={availableContracts} initialSelectedId={selectedEmployeeId} onClearSelection={() => setSelectedEmployeeId(null)} onAddActivity={addActivityLog} />;
      case 'logs':
        return <ActivityFeed logs={activityLogs} />;
      case 'archive':
        return <ArchiveList archivedEmployees={archivedEmployees} onRestore={handleRestoreFromArchive} onUpdateReason={(id, r) => {
          const emp = archivedEmployees.find(e => e.id === id);
          if (emp) apiService.saveEmployees([{...emp, archivedReason: r}]);
        }} />;
      default:
        return null;
    }
  };

  return (
    <>
      {selectedModule === null ? (
        <ModuleSelection user={user} onSelect={(m) => setSelectedModule(m)} onLogout={handleLogout} onOpenSettings={() => setIsSettingsOpen(true)} onOpenSupport={() => setIsSupportOpen(true)} />
      ) : (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} onOpenSettings={() => setIsSettingsOpen(true)} onOpenSupport={() => setIsSupportOpen(true)} onResetModule={() => setSelectedModule(null)}>
          {renderModuleContent()}
        </Layout>
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} onUpdateUser={() => {}} skills={availableSkills} setSkills={setAvailableSkills} certifications={availableCertifications} setCertifications={setAvailableCertifications} contracts={availableContracts} setContracts={setAvailableContracts} showReferentials={selectedModule === 'training'} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} user={user} />
    </>
  );
};

export default App;

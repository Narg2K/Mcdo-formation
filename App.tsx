
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import IntelligentPlanner from './components/IntelligentPlanner';
import VacationCalendar from './components/VacationCalendar';
import ModuleSelection from './components/ModuleSelection';
import SettingsModal from './components/SettingsModal';
import { LogIn, Mail, Eye, Sparkles, UserCircle } from 'lucide-react';
import { Role, GlobalCertConfig } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedModule, setSelectedModule] = useState<'training' | 'planning' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ name: string; email: string; role: Role } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [availableSkills, setAvailableSkills] = useState([
    'boisson', 'verif', 'OAT', 'frite', 'ligne', 'cuison viande', 
    'cuison fris', 'mccafe', 'glace', 'run', 'livraison', 'nettoyage'
  ]);
  
  const [availableCertifications, setAvailableCertifications] = useState<GlobalCertConfig[]>([
    { name: 'Certification HACCP Pro', isMandatory: true, validityMonths: 12 },
    { name: 'Manager Certifié McDo', isMandatory: true, validityMonths: 24 },
    { name: 'Expert Hospitalité', isMandatory: false, validityMonths: 6 },
    { name: 'Agent de Maintenance Certifié', isMandatory: true, validityMonths: 12 }
  ]);

  useEffect(() => {
    if (selectedModule === 'planning') {
      setActiveTab('planning');
    } else if (selectedModule === 'training') {
      setActiveTab('dashboard');
    }
  }, [selectedModule]);

  const handleLogin = (e: React.FormEvent, role: Role) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setUser({
      name: role === Role.MANAGER ? 'Directeur Store #452' : 'Employé Modèle',
      email: role === Role.MANAGER ? 'manager@macdo.io' : 'employee@macdo.io',
      role: role
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard availableCertifications={availableCertifications} availableSkills={availableSkills} onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} />;
      case 'planning':
        return <IntelligentPlanner />;
      case 'vacations':
        return <VacationCalendar />;
      case 'employees':
        return <EmployeeList availableSkills={availableSkills} availableCertifications={availableCertifications} initialSelectedId={selectedEmployeeId} onClearSelection={() => setSelectedEmployeeId(null)} />;
      default:
        return <Dashboard availableCertifications={availableCertifications} availableSkills={availableSkills} onNavigateToEmployee={(id) => { setSelectedEmployeeId(id); setActiveTab('employees'); }} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 animate-in">
          <div className="flex items-center gap-4 mb-12">
            <div className="bg-[#264f36] p-4 rounded-2xl text-white shadow-xl shadow-[#264f36]/20">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#264f36] uppercase tracking-tighter">McFormation</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">SaaS de Pilotage Opérationnel</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Accédez à votre espace</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={(e) => handleLogin(e, Role.MANAGER)} className="p-6 border-2 border-[#264f36] bg-[#264f36] text-white rounded-3xl hover:bg-slate-900 hover:border-slate-900 transition-all text-left group">
                  <UserCircle className="mb-4" size={32} />
                  <p className="text-lg font-black leading-tight">Accès Manager</p>
                  <p className="text-[10px] uppercase font-bold text-white/60">Gestion globale</p>
               </button>
               <button onClick={(e) => handleLogin(e, Role.EQUIPPIER)} className="p-6 border-2 border-slate-100 bg-white text-slate-900 rounded-3xl hover:border-[#264f36] transition-all text-left group">
                  <UserCircle className="mb-4 text-slate-300 group-hover:text-[#264f36]" size={32} />
                  <p className="text-lg font-black leading-tight">Accès Équipier</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Suivi personnel</p>
               </button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">McFormation Premium © 2025</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedModule === null) {
    return <ModuleSelection onSelect={setSelectedModule} userName={user?.name || 'Utilisateur'} />;
  }

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={() => { setIsAuthenticated(false); setSelectedModule(null); }}
        module={selectedModule}
        onSwitchModule={() => setSelectedModule(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      >
        {renderContent()}
      </Layout>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        setUser={setUser}
        skills={availableSkills}
        setSkills={setAvailableSkills}
        certifications={availableCertifications}
        setCertifications={setAvailableCertifications}
      />
    </>
  );
};

export default App;


import React, { useState } from 'react';
import { LayoutDashboard, GraduationCap, Users, LogOut, Bell, Grid2X2, Settings as SettingsIcon, Archive, Menu, X, Activity, HelpCircle, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { firstName: string; lastName: string; role: string };
  onLogout: () => void;
  module: 'training' | 'planning';
  onSwitchModule: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout, module, onSwitchModule, onOpenSettings, onOpenSupport }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Bord', icon: <LayoutDashboard size={20} /> },
    { id: 'employees', label: 'Équipe', icon: <Users size={20} /> },
    { id: 'archive', label: 'Archives', icon: <Archive size={20} /> },
    { id: 'logs', label: 'Activités', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-[#264f36] text-white flex flex-col hidden lg:flex border-r border-[#1d3c29] shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
            < GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight italic">McFormation</span>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-white text-[#264f36] shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <button
            onClick={onSwitchModule}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <Grid2X2 size={18} />
            <span>Changer d'Outil</span>
          </button>

          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold border-2 border-emerald-400 overflow-hidden shrink-0">
               {user?.firstName?.[0] || '?'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate leading-none mb-1">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] text-emerald-400 truncate uppercase font-black tracking-widest">{user?.role || 'Rôle'}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button onClick={onOpenSettings} className="w-full flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <SettingsIcon size={18} />
              <span className="text-sm font-bold">Réglages</span>
            </button>
            <button onClick={onOpenSupport} className="w-full flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <HelpCircle size={18} />
              <span className="text-sm font-bold">Support</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-bold">Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden h-16 bg-[#264f36] text-white flex items-center justify-between px-4 z-[100] shrink-0 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
            <GraduationCap size={18} className="text-emerald-400" />
          </div>
          <span className="font-black uppercase tracking-tighter text-sm italic">McFormation</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu Mobile Tiroir */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-[#264f36] flex flex-col pt-20 p-6 animate-in slide-in-from-top-4 duration-300">
           <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-white text-[#264f36] shadow-xl' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-lg font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
              
              <div className="pt-8 space-y-4">
                 <div className="h-px bg-white/10 w-full mb-4"></div>
                 <button onClick={() => { onSwitchModule(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest">
                    <Grid2X2 size={20} /> Changer de module
                 </button>
                 <button onClick={() => { onOpenSettings(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest">
                    <SettingsIcon size={20} /> Réglages Restaurant
                 </button>
                 <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-black uppercase text-xs tracking-widest">
                    <LogOut size={20} /> Déconnexion
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session active : </span>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">En ligne</span>
          </div>
          {/* Nom de l'utilisateur retiré d'ici */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative custom-scrollbar bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

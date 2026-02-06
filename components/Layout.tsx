
import React from 'react';
import { LayoutDashboard, GraduationCap, CalendarDays, Users, LogOut, Bell, Grid2X2, Settings as SettingsIcon, CalendarRange } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  module: 'training' | 'planning';
  onSwitchModule: () => void;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout, module, onSwitchModule, onOpenSettings }) => {
  const menuItems = module === 'training' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'employees', label: 'Suivi Équipe', icon: <Users size={20} /> },
      ]
    : [
        { id: 'planning', label: 'Planification', icon: <CalendarDays size={20} /> },
        { id: 'vacations', label: 'Absences', icon: <CalendarRange size={20} /> },
        { id: 'employees', label: 'Équipiers', icon: <Users size={20} /> },
      ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#264f36] text-white flex flex-col hidden md:flex border-r border-[#1d3c29]">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
            {module === 'training' ? <GraduationCap size={24} /> : <CalendarDays size={24} />}
          </div>
          <span className="text-xl font-bold tracking-tight">McFormation</span>
        </div>

        <div className="px-6 py-2">
          <div className="bg-white/10 rounded-lg px-3 py-1.5 inline-block border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {module === 'training' ? 'Formation McDo' : 'Planning Store'}
            </span>
          </div>
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

        {/* Action Buttons at the Bottom */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <button
            onClick={onSwitchModule}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all font-black text-xs uppercase tracking-widest"
          >
            <Grid2X2 size={18} />
            <span>Changer d'Outil</span>
          </button>

          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold border-2 border-emerald-400">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-emerald-400 truncate uppercase font-bold">{user?.role}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <button 
              onClick={onOpenSettings}
              className="w-full flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <SettingsIcon size={18} />
              <span className="text-sm font-bold">Réglages</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-bold">Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shadow-sm z-30">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-[#264f36] relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#264f36] rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">Status Restaurant</span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">OPÉRATIONNEL</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

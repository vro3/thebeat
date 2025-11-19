
import React from 'react';
import { LayoutDashboard, Users, Search, Terminal, FileSpreadsheet, ClipboardList, Network, Activity } from 'lucide-react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.HEADHUNTER, label: 'Radar', icon: Users },
    { id: View.SEO_VULTURE, label: 'SEO', icon: Search },
    { id: View.SOCIAL_LISTENER, label: 'Social', icon: Network },
    { id: View.POST_SHOW, label: 'Ops', icon: ClipboardList },
    { id: View.GOOGLE_SHEET, label: 'Data', icon: FileSpreadsheet },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 md:px-8 mb-6 flex justify-center">
      <div className="h-12 glass-panel rounded-full flex items-center px-4 shadow-2xl shadow-black/50 border border-white/10 backdrop-blur-xl bg-slate-950/80">
        
        {/* Logo Section - Minimal */}
        <div className="flex items-center gap-2 cursor-pointer group mr-8" onClick={() => onViewChange(View.DASHBOARD)}>
          <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]">
            <Activity className="text-slate-950 w-4 h-4" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">VRCG<span className="text-emerald-500">.BEAT</span></h1>
          </div>
        </div>

        {/* Navigation Items - Compact Pill Style */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // @ts-ignore
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                // @ts-ignore
                onClick={() => onViewChange(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Navbar;


import React from 'react';
import { LayoutDashboard, Users, Building2, Search, Radio, Terminal, FileSpreadsheet, ClipboardList, Archive } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  
  const growthItems = [
    { id: View.HEADHUNTER, label: 'Headhunter (Sales)', icon: Users },
    { id: View.VENUE_SPY, label: 'Venue Research', icon: Building2 },
    { id: View.SEO_VULTURE, label: 'SEO Vulture', icon: Search },
    { id: View.SOCIAL_LISTENER, label: 'Social Sentinel', icon: Radio },
  ];

  const opsItems = [
    { id: View.POST_SHOW, label: 'Post-Show Architect', icon: ClipboardList },
    { id: View.GOOGLE_SHEET, label: 'Master Sheet', icon: FileSpreadsheet },
  ];

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-slate-900 text-brand-blue border border-slate-800 shadow-inner' 
            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-blue' : 'text-slate-500 group-hover:text-white'}`} />
        <span className="font-medium text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => onViewChange(View.DASHBOARD)}>
        <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <Terminal className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">GREY OPS</h1>
          <p className="text-slate-500 text-xs uppercase tracking-wider">VRCG Intel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        
        <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 px-2">Growth Engines</h3>
            <div className="space-y-1">
                {growthItems.map(renderItem)}
            </div>
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 px-2">Mission Control</h3>
            <div className="space-y-1">
                {opsItems.map(renderItem)}
            </div>
        </div>

      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
            onClick={() => onViewChange(View.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentView === View.DASHBOARD ? 'text-brand-blue bg-slate-900' : 'text-slate-400 hover:text-white'}`}
        >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Overview</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Headhunter from './components/Headhunter';
import SeoVulture from './components/SeoVulture';
import SocialListener from './components/SocialListener';
import GoogleSheetView from './components/GoogleSheetView';
import PostShowOps from './components/PostShowOps';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.HEADHUNTER:
        return <Headhunter />;
      case View.SEO_VULTURE:
        return <SeoVulture onNavigate={(view) => setCurrentView(view)} />;
      case View.SOCIAL_LISTENER:
        return <SocialListener />;
      case View.GOOGLE_SHEET:
        return <GoogleSheetView />;
      case View.POST_SHOW:
        return <PostShowOps />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/50 text-slate-200 font-sans selection:bg-brand-blue selection:text-white flex flex-col">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;

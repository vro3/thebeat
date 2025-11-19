
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Link, RefreshCw, Download, Users, Linkedin, Radar, Layers } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Lead, SeoCluster, BacklinkTarget, ScrapedEvent } from '../types';
import { exportToCsv } from '../utils/csv';

type Tab = 'EVENTS' | 'LEADS' | 'SEO' | 'BACKLINKS' | 'EXTERNAL_SHEET';

const GoogleSheetView: React.FC = () => {
  // View State
  const [activeTab, setActiveTab] = useState<Tab>('EVENTS');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Data State (Auto-Imported)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [seo, setSeo] = useState<SeoCluster[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkTarget[]>([]);
  const [events, setEvents] = useState<ScrapedEvent[]>([]);

  // Load data on mount (Auto-Import Logic)
  useEffect(() => {
    const refreshData = () => {
        setLeads(storageService.getLeads());
        setSeo(storageService.getSeoClusters());
        setBacklinks(storageService.getBacklinks());
        setEvents(storageService.getEvents());
    };

    refreshData();
    
    // Listen for local storage changes to keep in sync
    window.addEventListener('storage', refreshData);
    
    const savedUrl = localStorage.getItem('vrcg_master_sheet_url');
    if (savedUrl) setSheetUrl(savedUrl);

    return () => window.removeEventListener('storage', refreshData);
  }, []);

  const handleSaveUrl = (e: React.FormEvent, url: string) => {
    e.preventDefault();
    localStorage.setItem('vrcg_master_sheet_url', url);
    setSheetUrl(url);
    setIsConfiguring(false);
  };

  const handleExportCurrentView = () => {
      switch(activeTab) {
          case 'LEADS': exportToCsv('master_leads_export', leads); break;
          case 'SEO': exportToCsv('master_seo_export', seo); break;
          case 'BACKLINKS': exportToCsv('master_backlinks_export', backlinks); break;
          case 'EVENTS': exportToCsv('master_events_export', events); break;
      }
  };

  // Render Helper for Tables
  const renderTable = () => {
    if (activeTab === 'EVENTS') {
        return (
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs sticky top-0">
                    <tr>
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Host</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {events.map(e => (
                        <tr key={e.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 text-white font-medium">{e.eventName}</td>
                            <td className="px-6 py-4">{e.hostCompany}</td>
                            <td className="px-6 py-4 font-mono text-xs">{e.eventDate}</td>
                            <td className="px-6 py-4 font-mono text-xs">{e.attendees.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    e.score >= 8 ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-800'
                                }`}>
                                    {e.score}/10
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    if (activeTab === 'LEADS') {
        return (
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs sticky top-0">
                    <tr>
                        <th className="px-6 py-4">Agency / Contact</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Specialization</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">GA4 Visits</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {leads.map(l => {
                         const isLinkedIn = l.source === 'LinkedIn';
                         const isRadar = l.source === 'Event Radar';
                         return (
                            <tr key={l.id} className="hover:bg-slate-800/30">
                                <td className="px-6 py-4">
                                    <div className={`font-medium text-white ${isLinkedIn ? 'italic text-blue-100' : ''}`}>{l.company}</div>
                                    <div className="text-xs text-slate-500">{l.name} â€¢ {l.role}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                                        isLinkedIn ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                        isRadar ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                        {isLinkedIn && <Linkedin className="w-3 h-3" />}
                                        {l.source}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs">{l.specialization}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${l.status === 'Contacted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>{l.status}</span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{l.websiteVisits}</td>
                            </tr>
                         )
                    })}
                </tbody>
            </table>
        );
    }
    if (activeTab === 'SEO') {
        return (
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs sticky top-0">
                    <tr>
                        <th className="px-6 py-4">Keyword</th>
                        <th className="px-6 py-4">Volume</th>
                        <th className="px-6 py-4">KD</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {seo.map(s => (
                        <tr key={s.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 text-white">{s.keyword}</td>
                            <td className="px-6 py-4">{s.volume}</td>
                            <td className="px-6 py-4">{s.difficulty}</td>
                            <td className="px-6 py-4">{s.contentType}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${s.aiOutline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {s.aiOutline ? 'Ready' : 'Planned'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radar className="w-6 h-6 text-emerald-500" />
            Master Intelligence Database
          </h2>
          <p className="text-slate-400 mt-1">Centralized Data Lake. Auto-imports from all Agents.</p>
        </div>
        <div className="flex items-center gap-3">
            {activeTab !== 'EXTERNAL_SHEET' && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                    Auto-Sync Active
                </div>
            )}
            <button 
                onClick={handleExportCurrentView}
                disabled={activeTab === 'EXTERNAL_SHEET'}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download className="w-4 h-4 text-emerald-500" />
                Export CSV
            </button>
        </div>
      </div>

      {/* View Toggles */}
      <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
                onClick={() => setActiveTab('EVENTS')}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'EVENTS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Radar className="w-3 h-3" /> Event Radar <span className="bg-slate-700 text-slate-300 px-1.5 rounded text-[10px]">{events.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('LEADS')}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'LEADS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Users className="w-3 h-3" /> Agency Intel <span className="bg-slate-700 text-slate-300 px-1.5 rounded text-[10px]">{leads.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('SEO')}
                className={`px-4 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'SEO' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Layers className="w-3 h-3" /> SEO Assets <span className="bg-slate-700 text-slate-300 px-1.5 rounded text-[10px]">{seo.length}</span>
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('EXTERNAL_SHEET')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${activeTab === 'EXTERNAL_SHEET' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-transparent border-transparent text-slate-500 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> View External G-Sheet
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative flex flex-col">
        
        {activeTab === 'EXTERNAL_SHEET' ? (
             // External Sheet Logic
            sheetUrl ? (
                <>
                    <iframe 
                        src={sheetUrl} 
                        className="w-full h-full border-0 bg-white"
                        title="Master Sheet"
                    />
                    <div className="absolute bottom-4 right-4">
                        <button 
                            onClick={() => setIsConfiguring(true)}
                            className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded shadow border border-slate-700 text-xs hover:bg-slate-800"
                        >
                            Change URL
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <FileSpreadsheet className="w-16 h-16 text-slate-700 mb-4" />
                    <h3 className="text-white font-bold text-lg">No External Sheet Connected</h3>
                    <p className="text-slate-500 text-sm max-w-md text-center mt-2 mb-6">
                        You can embed a live Google Sheet here to view external data alongside your internal intelligence.
                    </p>
                    <button 
                        onClick={() => setIsConfiguring(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Connect Google Sheet
                    </button>
                </div>
            )
        ) : (
            // Internal Data Logic
            <div className="flex-1 overflow-auto custom-scrollbar">
                {renderTable()}
                {/* Empty States */}
                {activeTab === 'LEADS' && leads.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">No leads found. Use Agency Intelligence to add data.</div>
                )}
            </div>
        )}

        {/* Configuration Modal */}
        {isConfiguring && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl max-w-lg w-full shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 text-white">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                            <Link className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Connect Google Sheet</h3>
                            <p className="text-slate-400 text-sm">Embed your external spreadsheet.</p>
                        </div>
                    </div>
                    <form onSubmit={(e) => {
                        // @ts-ignore
                        handleSaveUrl(e, e.target.elements.url.value)
                    }}>
                        <div className="mb-4">
                            <label className="block text-xs uppercase text-slate-500 mb-1">Embed URL (Publish to Web)</label>
                            <input 
                                name="url"
                                defaultValue={sheetUrl}
                                type="url" 
                                placeholder="https://docs.google.com/spreadsheets/..."
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors">
                                Save URL
                            </button>
                            <button 
                                type="button"
                                onClick={() => setIsConfiguring(false)}
                                className="px-4 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSheetView;

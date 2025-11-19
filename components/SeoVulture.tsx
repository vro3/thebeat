
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Layers, ChevronRight, Feather, Loader2, FileSpreadsheet, ArrowRight, Link, CheckSquare, Mail, CheckCircle, ExternalLink, Copy, PenTool, Layout, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SeoCluster, View, BacklinkTarget, AuditTask, ContentType, RankMetric } from '../types';
import { generateSeoOutline, generateBacklinkPitch, generateFullContentDraft } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { exportToCsv } from '../utils/csv';

interface SeoVultureProps {
    onNavigate?: (view: View) => void;
}

type Tab = 'STRATEGY' | 'BACKLINKS' | 'AUDIT' | 'RANK_TRACKER' | 'CONTENT_STUDIO';

const SeoVulture: React.FC<SeoVultureProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('STRATEGY');
  
  // Content Strategy State
  const [clusters, setClusters] = useState<SeoCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);

  // Backlink State
  const [backlinks, setBacklinks] = useState<BacklinkTarget[]>([]);
  const [newBacklink, setNewBacklink] = useState({ source: '', type: 'Directory', contact: '' });
  const [pitchingId, setPitchingId] = useState<string | null>(null);

  // Audit State
  const [audits, setAudits] = useState<AuditTask[]>([]);

  // Rank State
  const [rankMetrics, setRankMetrics] = useState<RankMetric[]>([]);
  const [newRank, setNewRank] = useState({ keyword: '', position: 0 });

  useEffect(() => {
    setClusters(storageService.getSeoClusters());
    setBacklinks(storageService.getBacklinks());
    setAudits(storageService.getAudits());
    setRankMetrics(storageService.getRankMetrics());
  }, []);

  // Persistence Effects
  useEffect(() => { if (clusters.length > 0) storageService.saveSeoClusters(clusters); }, [clusters]);
  useEffect(() => { if (backlinks.length > 0) storageService.saveBacklinks(backlinks); }, [backlinks]);
  useEffect(() => { if (audits.length > 0) storageService.saveAudits(audits); }, [audits]);
  useEffect(() => { if (rankMetrics.length > 0) storageService.saveRankMetrics(rankMetrics); }, [rankMetrics]);

  // --- Handlers: Strategy ---
  const handleGenerateOutline = async (cluster: SeoCluster) => {
    setGeneratingId(cluster.id);
    const outline = await generateSeoOutline(cluster.keyword, cluster.paaQuestions, cluster.contentType);
    setClusters(prev => prev.map(c => c.id === cluster.id ? { ...c, aiOutline: outline, status: 'Drafting' } : c));
    setGeneratingId(null);
  };

  const handleGenerateFullDraft = async (cluster: SeoCluster) => {
      if (!cluster.aiOutline) return;
      setDraftingId(cluster.id);
      const draft = await generateFullContentDraft(cluster.keyword, cluster.aiOutline, cluster.contentType);
      setClusters(prev => prev.map(c => c.id === cluster.id ? { ...c, fullDraft: draft, status: 'Published' } : c));
      setDraftingId(null);
  };

  const handleContentTypeChange = (id: string, type: ContentType) => {
      setClusters(prev => prev.map(c => c.id === id ? { ...c, contentType: type, aiOutline: undefined } : c));
  };

  const handlePromoteToCampaign = (e: React.MouseEvent, cluster: SeoCluster) => {
    e.stopPropagation();
    const context = `Pitching expertise related to "${cluster.keyword}". Focus on our "${cluster.contentType}" content assets. Key topics: ${cluster.paaQuestions.join(', ')}.`;
    storageService.saveCampaignContext(context);
    if (onNavigate) onNavigate(View.HEADHUNTER);
  };

  // --- Handlers: Backlinks ---
  const handleAddBacklink = (e: React.FormEvent) => {
      e.preventDefault();
      const target: BacklinkTarget = {
          id: Date.now().toString(),
          sourceName: newBacklink.source,
          url: `https://${newBacklink.source.toLowerCase().replace(/\s/g, '')}.com`,
          type: newBacklink.type as any,
          contactName: newBacklink.contact,
          status: 'Identify',
          dateAdded: new Date().toISOString().split('T')[0]
      };
      setBacklinks([target, ...backlinks]);
      setNewBacklink({ source: '', type: 'Directory', contact: '' });
  };

  const handleGeneratePitch = async (target: BacklinkTarget) => {
      setPitchingId(target.id);
      const pitch = await generateBacklinkPitch(target.sourceName, target.type, target.contactName);
      setBacklinks(prev => prev.map(b => b.id === target.id ? { ...b, aiPitch: pitch, status: 'Pitched' } : b));
      setPitchingId(null);
  };

  // --- Handlers: Rank ---
  const handleAddRank = (e: React.FormEvent) => {
      e.preventDefault();
      const metric: RankMetric = {
          keyword: newRank.keyword,
          position: newRank.position,
          change: 0,
          lastChecked: new Date().toISOString().split('T')[0]
      };
      setRankMetrics([metric, ...rankMetrics]);
      setNewRank({ keyword: '', position: 0 });
  };

  // --- Handlers: Audits ---
  const toggleAudit = (id: string) => {
      setAudits(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  // --- Export ---
  const handleExport = () => {
    if (activeTab === 'STRATEGY') exportToCsv('seo_strategy', clusters);
    else if (activeTab === 'BACKLINKS') exportToCsv('backlink_tracker', backlinks);
    else if (activeTab === 'RANK_TRACKER') exportToCsv('rank_tracker', rankMetrics);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-500" />
            SEO Vulture
          </h2>
          <p className="text-slate-400 mt-1">Operational SEO: Strategy, Link Building & Audits.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export
            </button>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('STRATEGY')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'STRATEGY' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Content Strategy
          </button>
          <button onClick={() => setActiveTab('CONTENT_STUDIO')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'CONTENT_STUDIO' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Content Studio (AI)
          </button>
          <button onClick={() => setActiveTab('RANK_TRACKER')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'RANK_TRACKER' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Rank Tracker (Step 1)
          </button>
          <button onClick={() => setActiveTab('BACKLINKS')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BACKLINKS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Link Builder CRM
          </button>
          <button onClick={() => setActiveTab('AUDIT')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'AUDIT' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Quarterly Audits
          </button>
      </div>

      {/* TAB: STRATEGY */}
      {activeTab === 'STRATEGY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Chart */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-white font-semibold mb-4">Keyword Opportunity Volume</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clusters} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="keyword" type="category" width={150} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} />
                                <Bar dataKey="volume" barSize={20} radius={[0, 4, 4, 0]}>
                                    {clusters.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* List */}
                <div className="grid gap-4">
                    {clusters.map((cluster) => (
                        <div key={cluster.id} className={`bg-slate-900 p-5 rounded-xl border transition-all group ${selectedClusterId === cluster.id ? 'border-emerald-500 bg-slate-800/50' : 'border-slate-800 hover:border-slate-600'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-bold text-white">{cluster.keyword}</h4>
                                    <div className="flex gap-3 mt-2 text-xs items-center">
                                        <span className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">Vol: {cluster.volume}</span>
                                        <span className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">KD: {cluster.difficulty}</span>
                                        <select 
                                            value={cluster.contentType}
                                            onChange={(e) => handleContentTypeChange(cluster.id, e.target.value as ContentType)}
                                            className="bg-slate-950 text-emerald-400 border border-emerald-500/30 text-xs rounded px-2 py-1 outline-none"
                                        >
                                            <option value="Educational">Educational</option>
                                            <option value="Behind-the-Scenes">Behind-the-Scenes</option>
                                            <option value="Case Study">Case Study</option>
                                            <option value="Landing Page">Landing Page</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {onNavigate && (
                                        <button onClick={(e) => handlePromoteToCampaign(e, cluster)} className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded border border-emerald-500/30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Use in Outreach <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Helper Text */}
            <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
                 <h3 className="text-white font-bold mb-4">Strategy Guide</h3>
                 <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Map high-volume keywords.</li>
                     <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Assign content types (Case Study, Blog, etc).</li>
                     <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Go to "Content Studio" to generate assets.</li>
                 </ul>
            </div>
        </div>
      )}

      {/* TAB: CONTENT STUDIO (NEW) */}
      {activeTab === 'CONTENT_STUDIO' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white">Pipeline</div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {clusters.map(c => (
                          <div key={c.id} onClick={() => setSelectedClusterId(c.id)} className={`p-3 rounded cursor-pointer border ${selectedClusterId === c.id ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                              <div className="text-sm font-medium text-white">{c.keyword}</div>
                              <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                  <span>{c.contentType}</span>
                                  <span className={c.fullDraft ? 'text-emerald-400' : c.aiOutline ? 'text-amber-400' : 'text-slate-600'}>
                                      {c.fullDraft ? 'Published' : c.aiOutline ? 'Drafting' : 'Ideation'}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
                  {selectedClusterId ? (
                      <>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                             <h3 className="text-white font-bold flex items-center gap-2">
                                 <PenTool className="w-4 h-4 text-emerald-500" />
                                 {clusters.find(c => c.id === selectedClusterId)?.contentType} Generator
                             </h3>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => handleGenerateOutline(clusters.find(c => c.id === selectedClusterId)!)}
                                    disabled={generatingId === selectedClusterId}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
                                >
                                    {generatingId === selectedClusterId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layout className="w-3 h-3" />} Outline
                                </button>
                                <button 
                                    onClick={() => handleGenerateFullDraft(clusters.find(c => c.id === selectedClusterId)!)}
                                    disabled={!clusters.find(c => c.id === selectedClusterId)?.aiOutline || draftingId === selectedClusterId}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded flex items-center gap-1 disabled:opacity-50"
                                >
                                    {draftingId === selectedClusterId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Feather className="w-3 h-3" />} Full Draft
                                </button>
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {clusters.find(c => c.id === selectedClusterId)?.fullDraft || clusters.find(c => c.id === selectedClusterId)?.aiOutline || "Select 'Generate Outline' to begin content production..."}
                        </div>
                      </>
                  ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500">Select a topic from the pipeline.</div>
                  )}
              </div>
          </div>
      )}

      {/* TAB: RANK TRACKER (NEW) */}
      {activeTab === 'RANK_TRACKER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
                          <tr>
                              <th className="px-6 py-4">Keyword</th>
                              <th className="px-6 py-4">Position</th>
                              <th className="px-6 py-4">Change</th>
                              <th className="px-6 py-4">Last Checked</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {rankMetrics.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                  <td className="px-6 py-4 text-white">{r.keyword}</td>
                                  <td className="px-6 py-4 font-mono">{r.position}</td>
                                  <td className={`px-6 py-4 font-mono ${r.change > 0 ? 'text-emerald-400' : r.change < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                                      {r.change > 0 ? '+' : ''}{r.change}
                                  </td>
                                  <td className="px-6 py-4">{r.lastChecked}</td>
                              </tr>
                          ))}
                      </tbody>
                    </table>
               </div>
               <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Log Ranking</h3>
                   <form onSubmit={handleAddRank} className="space-y-4">
                       <div><label className="text-xs text-slate-500">Keyword</label><input required value={newRank.keyword} onChange={e => setNewRank({...newRank, keyword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                       <div><label className="text-xs text-slate-500">Current Position</label><input type="number" required value={newRank.position} onChange={e => setNewRank({...newRank, position: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                       <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold">Update Log</button>
                   </form>
               </div>
          </div>
      )}

      {/* TAB: BACKLINKS */}
      {activeTab === 'BACKLINKS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-400">
                          <thead className="bg-slate-950 text-slate-200 uppercase font-medium text-xs">
                              <tr>
                                  <th className="px-6 py-4">Source</th>
                                  <th className="px-6 py-4">Type</th>
                                  <th className="px-6 py-4">Contact</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Action</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {backlinks.map(b => (
                                  <React.Fragment key={b.id}>
                                    <tr className="hover:bg-slate-800/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{b.sourceName}</div>
                                            <a href={b.url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                                                {b.url} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded border ${
                                                b.type === 'Directory' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                b.type === 'Partner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>{b.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-white">{b.contactName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-mono ${b.status === 'Pitched' ? 'text-amber-400' : b.status === 'Link Live' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleGeneratePitch(b)}
                                                disabled={pitchingId === b.id}
                                                className="text-brand-blue hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                {pitchingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                                {b.aiPitch ? 'Re-Draft' : 'Write Pitch'}
                                            </button>
                                        </td>
                                    </tr>
                                    {b.aiPitch && (
                                        <tr className="bg-slate-950/50">
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="bg-slate-900 border border-slate-800 rounded p-4 relative">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-mono text-brand-blue">AI OUTREACH DRAFT</span>
                                                        <button 
                                                            onClick={() => navigator.clipboard.writeText(b.aiPitch!)}
                                                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-white"
                                                        >
                                                            <Copy className="w-3 h-3" /> Copy
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{b.aiPitch}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                  </React.Fragment>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className="lg:col-span-1">
                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Link className="w-5 h-5 text-emerald-500" />
                          Add Link Target
                      </h3>
                      <form onSubmit={handleAddBacklink} className="space-y-4">
                          <div>
                              <label className="block text-xs text-slate-500 mb-1">Website / Source</label>
                              <input 
                                  required
                                  value={newBacklink.source}
                                  onChange={e => setNewBacklink({...newBacklink, source: e.target.value})}
                                  placeholder="e.g. EventsConnect"
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-slate-500 mb-1">Target Type</label>
                              <select 
                                  value={newBacklink.type}
                                  onChange={e => setNewBacklink({...newBacklink, type: e.target.value})}
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                              >
                                  <option value="Directory">Industry Directory</option>
                                  <option value="Partner">Partner/Venue</option>
                                  <option value="Client">Client Backlink</option>
                                  <option value="PR">Press/Media</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs text-slate-500 mb-1">Contact Person</label>
                              <input 
                                  required
                                  value={newBacklink.contact}
                                  onChange={e => setNewBacklink({...newBacklink, contact: e.target.value})}
                                  placeholder="e.g. Editor or Marketing Director"
                                  className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                              />
                          </div>
                          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded font-medium transition-colors">
                              Add to Pipeline
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {/* TAB: AUDITS */}
      {activeTab === 'AUDIT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['Technical', 'Content', 'Backlinks'].map(category => (
                  <div key={category} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">{category} Audit</h3>
                      <div className="space-y-3">
                          {audits.filter(a => a.category === category).map(task => (
                              <div 
                                  key={task.id} 
                                  onClick={() => toggleAudit(task.id)}
                                  className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-all ${
                                      task.completed ? 'bg-emerald-500/10' : 'bg-slate-950 hover:bg-slate-800'
                                  }`}
                              >
                                  <div className={`mt-0.5 ${task.completed ? 'text-emerald-500' : 'text-slate-500'}`}>
                                      {task.completed ? <CheckCircle className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                                  </div>
                                  <p className={`text-sm ${task.completed ? 'text-emerald-200 line-through' : 'text-slate-300'}`}>
                                      {task.task}
                                  </p>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      )}

    </div>
  );
};

export default SeoVulture;
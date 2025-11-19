
import React, { useState, useEffect } from 'react';
import { Search, Mail, Loader2, UserPlus, Sparkles, Copy, Check, Zap, Lightbulb, Database, Radar, Globe2, ShieldCheck, EyeOff, Calendar, Building, X, PenTool, ArrowUpRight, Filter } from 'lucide-react';
import { Lead, Partner, NurtureSequence, LeadSource, ScrapedEvent, DiscoveredAgency, ScraperSource } from '../types';
import { generateOutreachEmail, simulateEventScraping, generateEventPitch, runAgencyDiscovery } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { exportToCsv } from '../utils/csv';
import { checkFortune500 } from '../utils/companyData';

type Tab = 'RADAR' | 'DISCOVERY' | 'INTELLIGENCE' | 'PARTNERS' | 'NURTURE';

const Headhunter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('RADAR');
  
  // --- DISCOVERY STATE ---
  const [discoveryParams, setDiscoveryParams] = useState({ location: '', type: 'Experiential', size: 'Mid-Market' });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredAgencies, setDiscoveredAgencies] = useState<DiscoveredAgency[]>([]);

  // --- RADAR STATE ---
  const [radarParams, setRadarParams] = useState<{ city: string, source: ScraperSource }>({ city: 'Nashville, TN', source: 'Convention Center' });
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([]);
  const [researchEvent, setResearchEvent] = useState<ScrapedEvent | null>(null); 
  const [researchNotes, setResearchNotes] = useState(''); 

  // --- CRM STATE ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaignContext, setCampaignContext] = useState('');
  
  const [newLead, setNewLead] = useState<Partial<Lead>>({
      name: '',
      company: '',
      role: '',
      email: '',
      source: 'Directory',
      specialization: '',
      status: 'Research',
      qualityScore: 5,
      location: '',
      agencySize: 'Mid-Market'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ready' | 'FollowUp'>('All');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- PARTNER / NURTURE STATE ---
  const [partners, setPartners] = useState<Partner[]>([]);

  // Load Data
  useEffect(() => {
    setLeads(storageService.getLeads());
    setPartners(storageService.getPartners());
    setDiscoveredAgencies(storageService.getDiscoveredAgencies());
    
    const allEvents = storageService.getEvents();
    const today = new Date().toISOString().split('T')[0];
    const validEvents = allEvents.filter(e => e.eventDate >= today && e.status !== 'Ignored');
    setScrapedEvents(validEvents);
    
    setCampaignContext(storageService.getCampaignContext());
  }, []);

  // Save Data Effects
  useEffect(() => { if (leads.length > 0) storageService.saveLeads(leads); }, [leads]);
  useEffect(() => { if (partners.length > 0) storageService.savePartners(partners); }, [partners]);
  useEffect(() => { if (scrapedEvents.length > 0) storageService.saveEvents(scrapedEvents); }, [scrapedEvents]);
  useEffect(() => { if (discoveredAgencies.length > 0) storageService.saveDiscoveredAgencies(discoveredAgencies); }, [discoveredAgencies]);

  const handleSaveContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setCampaignContext(newVal);
    storageService.saveCampaignContext(newVal);
  };

  const handleRunDiscovery = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsDiscovering(true);
      const results = await runAgencyDiscovery(discoveryParams.location, discoveryParams.type, discoveryParams.size);
      
      const newAgencies: DiscoveredAgency[] = results.map((a, idx) => ({
          id: `disc-${Date.now()}-${idx}`,
          name: a.name || 'Unknown Agency',
          website: a.website || '',
          location: a.location || discoveryParams.location,
          specialization: a.specialization || '',
          size: (a.size as any) || discoveryParams.size,
          fitScore: a.fitScore || 5,
          fitReason: a.fitReason || '',
          contacts: a.contacts || [],
          status: 'Unverified',
          tier: (a.fitScore || 5) >= 8 ? 'Tier 1' : (a.fitScore || 5) >= 5 ? 'Tier 2' : 'Tier 3'
      }));

      setDiscoveredAgencies([...newAgencies, ...discoveredAgencies]);
      setIsDiscovering(false);
  };

  const handlePromoteDiscovery = (agency: DiscoveredAgency, type: 'Lead' | 'Partner') => {
      if (type === 'Lead') {
          const contact = agency.contacts[0] || { name: 'Unknown', title: 'Event Manager', email: '' };
          const lead: Lead = {
              id: Date.now().toString(),
              name: contact.name,
              role: contact.title,
              company: agency.name,
              location: agency.location,
              agencySize: agency.size,
              email: contact.email,
              source: 'Agency Discovery',
              specialization: agency.specialization,
              websiteVisits: 0,
              status: 'Research',
              qualityScore: agency.fitScore,
              notes: `Tier: ${agency.tier}. Fit Reason: ${agency.fitReason}`
          };
          setLeads([lead, ...leads]);
      } else {
          const partner: Partner = {
              id: Date.now().toString(),
              name: agency.name,
              type: 'Agency',
              contact: agency.contacts[0]?.name || 'TBD',
              email: agency.contacts[0]?.email || '',
              status: 'Identify',
              dealStructure: '10% Commission',
              notes: agency.fitReason,
              fitScore: agency.fitScore
          };
          setPartners([partner, ...partners]);
      }
      setDiscoveredAgencies(prev => prev.map(a => a.id === agency.id ? { ...a, status: 'Promoted' } : a));
  };

  const handleDiscardDiscovery = (id: string) => {
      setDiscoveredAgencies(prev => prev.map(a => a.id === id ? { ...a, status: 'Discarded' } : a));
  };

  const calculateEventScore = (event: Partial<ScrapedEvent>): { score: number, breakdown: string[], isFortune500: boolean } => {
    let score = 0;
    const breakdown: string[] = [];
    const isFortune500 = checkFortune500(event.hostCompany || '');
    if (isFortune500) { score += 40; breakdown.push("Fortune 500"); }

    if (event.eventDate) {
        const monthsOut = (new Date(event.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsOut < 2) { score = Math.min(score, 50); breakdown.push("Too Soon"); }
        else if (monthsOut >= 3 && monthsOut <= 6) { score += 30; breakdown.push("Perfect Lead Time"); }
        else if (monthsOut > 6) { score += 15; breakdown.push("Early Bird"); }
    }

    if ((event.attendees || 0) >= 2000) { score += 20; breakdown.push("Size > 2000"); }
    else if ((event.attendees || 0) >= 500) { score += 10; breakdown.push("Size > 500"); }

    return { score: Math.max(0, Math.min(100, score)), breakdown, isFortune500 };
  };

  const handleRadarScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    const rawEvents = await simulateEventScraping(radarParams.city, radarParams.source);
    
    const processedEvents: ScrapedEvent[] = rawEvents.map((ev, idx) => {
        const { score, breakdown, isFortune500 } = calculateEventScore(ev);
        let priority: 'High' | 'Medium' | 'Low' = 'Low';
        if (score >= 70) priority = 'High';
        else if (score >= 50) priority = 'Medium';

        const leadTimeMonths = ev.eventDate ? Math.round((new Date(ev.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) : 0;

        return {
            id: `evt-${Date.now()}-${idx}`,
            eventName: ev.eventName || 'Unknown Event',
            hostCompany: ev.hostCompany || 'Unknown Host',
            eventDate: ev.eventDate || '',
            leadTimeMonths,
            location: ev.location || radarParams.city,
            attendees: ev.attendees || 0,
            sourceUrl: ev.sourceUrl || '',
            sourceType: radarParams.source,
            description: ev.description || '',
            isFortune500,
            eventType: ev.eventType || 'Conference',
            score,
            priority,
            scoreBreakdown: breakdown,
            status: 'Raw'
        };
    });

    setScrapedEvents(prev => {
        const existingNames = new Set(prev.map(e => e.eventName));
        const uniqueNew = processedEvents.filter(e => !existingNames.has(e.eventName));
        return [...uniqueNew, ...prev];
    });
    setIsScraping(false);
  };

  const openResearchModal = (event: ScrapedEvent) => {
      setResearchEvent(event);
      setResearchNotes('');
  };

  const handlePromoteEvent = (event: ScrapedEvent, notes: string) => {
    const newLeadFromEvent: Lead = {
        id: `lead-${Date.now()}`,
        name: 'Unknown Decision Maker',
        role: 'Event Director',
        company: event.hostCompany,
        email: '',
        source: 'Event Radar',
        specialization: event.eventType,
        websiteVisits: 0,
        status: 'Research',
        notes: `Targeting ${event.eventName} (${event.eventDate}). ${event.attendees} attendees. Score: ${event.score}/100. Source: ${event.sourceType}.\n\nUser Notes: ${notes}`,
        relatedEventId: event.id,
        qualityScore: Math.round(event.score / 10),
        location: event.location
    };
    setLeads([newLeadFromEvent, ...leads]);
    setScrapedEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: 'Promoted' } : e));
    setResearchEvent(null);
    setActiveTab('INTELLIGENCE');
  };

  const handleIgnoreEvent = (id: string) => {
      setScrapedEvents(prev => prev.filter(e => e.id !== id)); 
  };

  const handleManualAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const lead: Lead = {
          id: Date.now().toString(),
          name: newLead.name!,
          company: newLead.company!,
          role: newLead.role!,
          email: newLead.email!,
          source: newLead.source as LeadSource,
          specialization: newLead.specialization || 'General',
          status: 'Research',
          websiteVisits: 0,
          notes: '',
          qualityScore: newLead.qualityScore,
          location: newLead.location,
          agencySize: newLead.agencySize as any
      };
      setLeads([lead, ...leads]);
      setNewLead({ name: '', company: '', role: '', email: '', source: 'Directory', specialization: '', status: 'Research', qualityScore: 5, location: '', agencySize: 'Mid-Market' });
      setShowAddForm(false);
  };

  const handleGenerateDraft = async (id: string) => {
    setProcessingId(id);
    const lead = leads.find(l => l.id === id);
    if (lead) {
      let draft = '';
      if (lead.relatedEventId) {
          const event = scrapedEvents.find(e => e.id === lead.relatedEventId);
          if (event) {
              draft = await generateEventPitch(lead.name, event.eventName, event.hostCompany, event.eventDate, event.attendees, event.location || '');
          } else {
              draft = await generateOutreachEmail(lead.name, lead.company, lead.notes || lead.specialization, campaignContext);
          }
      } else {
          const specificContext = `${campaignContext}. Agency specializes in ${lead.specialization}. ${lead.location ? `They are based in ${lead.location}.` : ''} ${lead.agencySize ? `Size: ${lead.agencySize}.` : ''}`;
          draft = await generateOutreachEmail(lead.name, lead.company, lead.notes || lead.specialization, specificContext);
      }
      setLeads(prev => prev.map(l => l.id === id ? { ...l, aiDraft: draft, status: 'Ready to Contact' } : l));
    }
    setProcessingId(null);
  };

  const handleMarkContacted = (id: string) => {
      setLeads(prev => prev.map(l => l.id === id ? { 
          ...l, 
          status: 'Contacted', 
          lastOutreachDate: new Date().toISOString().split('T')[0],
          nextFollowUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      } : l));
  };
  
  const getFilteredLeads = () => {
      if (filterStatus === 'Ready') return leads.filter(l => l.status === 'Ready to Contact');
      if (filterStatus === 'FollowUp') return leads.filter(l => l.status === 'Contacted');
      return leads;
  };

  const renderRadarBucket = (priority: 'High' | 'Medium' | 'Low', colorClass: string) => {
      // Filter out IGNORED, but keep PROMOTED for history visibility
      const events = scrapedEvents
        .filter(e => e.priority === priority && e.status !== 'Ignored')
        .sort((a, b) => (a.status === 'Promoted' === (b.status === 'Promoted')) ? 0 : a.status === 'Promoted' ? 1 : -1);

      if (events.length === 0) return null;

      return (
          <div className="mb-6">
              <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">{priority} Priority Targets ({events.length})</h4>
              </div>
              
              {/* High Efficiency List View */}
              <div className="space-y-1">
                  {events.map(event => {
                      const isPromoted = event.status === 'Promoted';
                      return (
                        <div key={event.id} className={`group flex items-center justify-between p-2 rounded border transition-all ${
                            isPromoted 
                            ? 'bg-emerald-900/10 border-emerald-500/10 opacity-60' 
                            : 'hover:bg-white/5 border-transparent hover:border-white/5'
                        }`}>
                            
                            {/* Left: Event Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`text-sm font-bold w-8 text-center ${isPromoted ? 'text-emerald-500' : colorClass}`}>{event.score}</div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h5 className={`font-bold text-xs truncate ${isPromoted ? 'text-emerald-400 line-through' : 'text-white'}`}>{event.eventName}</h5>
                                        {event.isFortune500 && <ShieldCheck className="w-3 h-3 text-purple-400" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2 truncate">
                                        <span className="text-slate-300">{event.hostCompany}</span>
                                        <span>â€¢</span>
                                        <span>{event.eventDate}</span>
                                        <span>â€¢</span>
                                        <span>{event.attendees.toLocaleString()} pax</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    {isPromoted ? (
                                        <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 cursor-default">
                                            <Check className="w-3 h-3" /> IN CRM
                                        </span>
                                    ) : (
                                        <>
                                            <button onClick={() => handleIgnoreEvent(event.id)} className="p-1.5 hover:text-rose-400 text-slate-500" title="Dismiss"><EyeOff className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => openResearchModal(event)} className="p-1.5 hover:text-blue-400 text-slate-500" title="Intel Brief"><Search className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handlePromoteEvent(event, 'Quick Add')} className="p-1.5 hover:text-emerald-400 text-slate-500" title="Add to Pipeline"><UserPlus className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      )
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Compact Sub-Nav */}
      <div className="flex justify-center mb-4">
          <div className="glass-panel rounded-full p-1 flex gap-1 shadow-lg">
              {[
                  { id: 'RADAR', label: 'Radar', icon: Radar },
                  { id: 'DISCOVERY', label: 'Agency Recon', icon: Globe2 },
                  { id: 'INTELLIGENCE', label: 'Active CRM', icon: Database },
                  { id: 'PARTNERS', label: 'Partners', icon: arrowUpRight => <ArrowUpRight className="w-3.5 h-3.5" /> },
              ].map((tab) => {
                  // @ts-ignore
                  const Icon = tab.icon;
                  return (
                    <button 
                        key={tab.id}
                        // @ts-ignore
                        onClick={() => setActiveTab(tab.id)} 
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${
                            activeTab === tab.id 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {/* @ts-ignore */}
                        <Icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                  )
              })}
          </div>
      </div>

      {/* TAB: RADAR */}
      {activeTab === 'RADAR' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Scanner Controls */}
              <div className="glass-panel p-3 rounded-lg border border-white/10 flex items-center gap-3">
                   <div className="flex-1 flex gap-2">
                      <select 
                          value={radarParams.city}
                          onChange={e => setRadarParams({...radarParams, city: e.target.value})}
                          className="bg-black/30 border-white/10 text-white text-xs rounded px-2 py-1.5 focus:outline-none"
                      >
                          <option value="Nashville, TN">Nashville (MCC)</option>
                          <option value="Las Vegas, NV">Las Vegas (LVCC)</option>
                          <option value="Chicago, IL">Chicago (McCormick)</option>
                      </select>
                      <select 
                           value={radarParams.source}
                           onChange={e => setRadarParams({...radarParams, source: e.target.value as ScraperSource})}
                           className="bg-black/30 border-white/10 text-white text-xs rounded px-2 py-1.5 focus:outline-none"
                       >
                           <option value="Convention Center">Convention Ctr</option>
                           <option value="Google News">Press Release</option>
                       </select>
                   </div>
                  <button 
                    disabled={isScraping}
                    onClick={handleRadarScan}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Scan
                  </button>
              </div>

              {/* Dense Results List */}
              <div className="glass-panel p-4 rounded-xl min-h-[400px]">
                  {renderRadarBucket('High', 'text-emerald-400')}
                  {renderRadarBucket('Medium', 'text-amber-400')}
                  {renderRadarBucket('Low', 'text-slate-500')}
                  
                  {scrapedEvents.length === 0 && !isScraping && (
                      <div className="text-center py-20 text-slate-600 text-xs">
                          Radar Passive. Initiate Scan.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* RESEARCH MODAL */}
      {researchEvent && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-sm font-bold text-white">{researchEvent.eventName}</h3>
                    <button onClick={() => setResearchEvent(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                    <div className="text-xs text-slate-300 leading-relaxed">{researchEvent.description}</div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tactical Notes</h4>
                        <textarea 
                            value={researchNotes}
                            onChange={(e) => setResearchNotes(e.target.value)}
                            className="w-full h-20 tech-input rounded p-2 text-xs bg-black/20 resize-none"
                            placeholder="Add specific context..."
                        />
                    </div>
                    <button 
                        onClick={() => handlePromoteEvent(researchEvent, researchNotes)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-3 h-3" /> Add to Pipeline
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TAB: DISCOVERY */}
      {activeTab === 'DISCOVERY' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="glass-panel p-4 rounded-xl border border-white/10">
                  <form onSubmit={handleRunDiscovery} className="flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                          <input required value={discoveryParams.location} onChange={e => setDiscoveryParams({...discoveryParams, location: e.target.value})} placeholder="Nashville, TN" className="w-full tech-input rounded p-2 text-xs bg-black/20" />
                          <input required value={discoveryParams.type} onChange={e => setDiscoveryParams({...discoveryParams, type: e.target.value})} placeholder="Experiential" className="w-full tech-input rounded p-2 text-xs bg-black/20" />
                          <select value={discoveryParams.size} onChange={e => setDiscoveryParams({...discoveryParams, size: e.target.value})} className="w-full tech-input rounded p-2 text-xs bg-black/20">
                              <option value="Boutique">Boutique</option>
                              <option value="Mid-Market">Mid-Market</option>
                              <option value="Global">Global</option>
                          </select>
                      </div>
                      <button disabled={isDiscovering} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-50">
                          {isDiscovering ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run Agents'}
                      </button>
                  </form>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                 {discoveredAgencies.filter(a => a.status === 'Unverified').map(agency => (
                     <div key={agency.id} className="glass-card rounded-lg p-4 flex items-center justify-between group">
                         <div>
                             <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white">{agency.name}</h4>
                                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 rounded">{agency.tier}</span>
                             </div>
                             <p className="text-xs text-slate-400 mt-0.5">{agency.fitReason}</p>
                         </div>
                         <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handlePromoteDiscovery(agency, 'Lead')} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-[10px] font-bold">LEAD</button>
                             <button onClick={() => handleDiscardDiscovery(agency.id)} className="bg-slate-800 text-slate-400 px-2 py-1 rounded"><X className="w-3 h-3" /></button>
                         </div>
                     </div>
                 ))}
              </div>
          </div>
      )}

      {/* TAB: INTELLIGENCE (CRM) */}
      {activeTab === 'INTELLIGENCE' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div className="flex gap-1">
                    {['All', 'Ready', 'FollowUp'].map(status => (
                        <button 
                            key={status}
                            // @ts-ignore
                            onClick={() => setFilterStatus(status)} 
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${filterStatus === status ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1"><Database className="w-3 h-3" /> Manual Entry</button>
            </div>

            {showAddForm && (
                <form onSubmit={handleManualAdd} className="glass-panel p-4 rounded-lg grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                    <input required value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} className="tech-input rounded p-2 text-xs" placeholder="Agency Name" />
                    <input required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="tech-input rounded p-2 text-xs" placeholder="Contact Name" />
                    <input required value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="tech-input rounded p-2 text-xs" placeholder="Email" />
                    <button className="bg-emerald-600 text-white rounded p-2 text-xs font-bold">Save</button>
                </form>
            )}

            <div className="space-y-2">
                {getFilteredLeads().map((lead) => {
                    const isLost = lead.status === 'Lost';
                    return (
                        <div key={lead.id} className={`glass-card p-3 rounded-lg group ${isLost ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {lead.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{lead.company}</h4>
                                        <div className="text-[10px] text-slate-400">{lead.name} â€¢ {lead.role}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                        lead.status === 'Ready to Contact' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                    }`}>{lead.status}</span>
                                    
                                    {!isLost && (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleGenerateDraft(lead.id)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20" disabled={processingId === lead.id}>
                                                {processingId === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            </button>
                                            <button onClick={() => handleMarkContacted(lead.id)} className="p-1.5 bg-white/5 text-slate-400 rounded hover:text-emerald-400"><Check className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {lead.aiDraft && (
                                <div className="mt-3 bg-black/30 rounded p-3 border border-white/5 relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-blue-400">DRAFT</span>
                                        <button onClick={() => { navigator.clipboard.writeText(lead.aiDraft!); setCopiedId(lead.id); setTimeout(() => setCopiedId(null), 2000); }} className="text-[9px] text-slate-400 hover:text-white flex gap-1"><Copy className="w-3 h-3" /> {copiedId === lead.id ? 'Copied' : 'Copy'}</button>
                                    </div>
                                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{lead.aiDraft}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
      )}
    </div>
  );
};

export default Headhunter;

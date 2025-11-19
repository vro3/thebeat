
import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, Save, Loader2, ArrowRight, Users, FileText, PenTool, BookOpen } from 'lucide-react';
import { Lead, PostShowReport, Proposal } from '../types';
import { storageService } from '../services/storageService';
import { analyzePostShowNotes, generateProposalOutline } from '../services/geminiService';

type Tab = 'POST_SHOW' | 'PROPOSAL' | 'GOSPEL';

const PostShowOps: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('POST_SHOW');
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Post Show Form
  const [venueName, setVenueName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [showName, setShowName] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PostShowReport | null>(null);

  // Proposal Form
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProp, setNewProp] = useState({ client: '', event: '', budget: '', audience: 0 });
  const [isGeneratingProp, setIsGeneratingProp] = useState(false);

  useEffect(() => {
    setLeads(storageService.getLeads());
    setProposals(storageService.getProposals());
  }, []);

  useEffect(() => { if (proposals.length > 0) storageService.saveProposals(proposals); }, [proposals]);

  const handleAnalyze = async () => {
    if (!venueName || !selectedClient || !rawNotes) return;
    
    setIsAnalyzing(true);
    
    const clientName = leads.find(l => l.id === selectedClient)?.name || 'Unknown Client';

    const analysis = await analyzePostShowNotes(rawNotes, venueName, clientName);

    const report: PostShowReport = {
        id: Date.now().toString(),
        showName,
        venueId: venueName, // Storing name directly as we don't have a DB anymore
        clientId: selectedClient,
        date: new Date().toISOString().split('T')[0],
        rawNotes,
        aiAnalysis: analysis
    };

    setAnalysisResult(report);
    setIsAnalyzing(false);
  };

  const handleCommit = () => {
    if (analysisResult) {
        storageService.savePostShowReport(analysisResult);
        setAnalysisResult(null);
        setRawNotes('');
        setShowName('');
        setVenueName('');
        alert("Post-show intelligence committed to Infrastructure.");
    }
  };

  const handleGenerateProposal = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsGeneratingProp(true);
      const outline = await generateProposalOutline(newProp.client, newProp.event, newProp.budget, newProp.audience);
      
      const proposal: Proposal = {
          id: Date.now().toString(),
          clientName: newProp.client,
          eventName: newProp.event,
          budget: newProp.budget,
          audienceSize: newProp.audience,
          status: 'Drafting',
          dateCreated: new Date().toISOString().split('T')[0],
          aiOutline: outline
      };

      setProposals([proposal, ...proposals]);
      setNewProp({ client: '', event: '', budget: '', audience: 0 });
      setIsGeneratingProp(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" />
            Operations Center
          </h2>
          <p className="text-slate-400 mt-1">Standard Operating Procedures, Proposals & Post-Mortems.</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-800 mb-6">
          <button onClick={() => setActiveTab('POST_SHOW')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'POST_SHOW' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <CheckCircle className="w-4 h-4" /> Post-Show Report
          </button>
          <button onClick={() => setActiveTab('PROPOSAL')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PROPOSAL' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <PenTool className="w-4 h-4" /> Proposal Generator
          </button>
          <button onClick={() => setActiveTab('GOSPEL')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'GOSPEL' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <BookOpen className="w-4 h-4" /> Gospel (SOPs)
          </button>
      </div>

      {/* TAB: POST SHOW */}
      {activeTab === 'POST_SHOW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Column */}
            <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-1">Show Name</label>
                            <input 
                                value={showName}
                                onChange={(e) => setShowName(e.target.value)}
                                placeholder="e.g. Oracle CloudWorld Opening"
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Venue / Location</label>
                                <input 
                                    value={venueName}
                                    onChange={(e) => setVenueName(e.target.value)}
                                    placeholder="e.g. Gaylord Opryland"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-1">Client</label>
                                <select 
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded p-2.5 focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Select Client...</option>
                                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">Raw Field Notes</h3>
                    <textarea 
                        value={rawNotes}
                        onChange={(e) => setRawNotes(e.target.value)}
                        placeholder="Paste your brain dump here: 'Load-in was tight but we adapted with smaller cases. Client loved the high energy. Notes for next time: bring extra 3-phase adapters...'"
                        className="w-full h-64 bg-slate-950 border border-slate-800 text-white rounded-lg p-4 focus:border-emerald-500 outline-none leading-relaxed"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !rawNotes || !venueName}
                        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Run Post-Mortem Agent
                    </button>
                </div>
            </div>

            {/* Output Column */}
            <div className="space-y-6">
                {analysisResult ? (
                    <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-in slide-in-from-right-4">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Save className="w-5 h-5 text-emerald-500" />
                            Intelligence Extracted
                        </h3>

                        <div className="space-y-6">
                            
                            {/* Venue notes are now just part of the record, not a database update */}
                            
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h4 className="text-blue-500 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Users className="w-3 h-3" /> Client CRM Update</h4>
                                <p className="text-slate-300 text-sm">{analysisResult.aiAnalysis.clientInsights}</p>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h4 className="text-purple-500 text-xs font-bold uppercase mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> Case Study Draft</h4>
                                <p className="text-slate-300 text-sm italic">"{analysisResult.aiAnalysis.caseStudyDraft}"</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button onClick={handleCommit} className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                                Commit Updates <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 p-8">
                        <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-center">Waiting for field notes...</p>
                        <p className="text-xs text-center mt-2 max-w-xs">The AI will extract client preferences and draft a case study automatically.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* TAB: PROPOSAL GENERATOR */}
      {activeTab === 'PROPOSAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><PenTool className="w-5 h-5 text-blue-500" /> Proposal Inputs</h3>
                  <form onSubmit={handleGenerateProposal} className="space-y-4">
                      <div><label className="text-xs text-slate-500">Client Name</label><input required value={newProp.client} onChange={e => setNewProp({...newProp, client: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <div><label className="text-xs text-slate-500">Event Name</label><input required value={newProp.event} onChange={e => setNewProp({...newProp, event: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <div><label className="text-xs text-slate-500">Budget Range</label><input required placeholder="$50k - $75k" value={newProp.budget} onChange={e => setNewProp({...newProp, budget: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <div><label className="text-xs text-slate-500">Audience Size</label><input type="number" required value={newProp.audience} onChange={e => setNewProp({...newProp, audience: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <button disabled={isGeneratingProp} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold flex justify-center">
                           {isGeneratingProp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate "Gospel" Outline'}
                      </button>
                  </form>
              </div>
              <div className="lg:col-span-2 space-y-4">
                  {proposals.map(prop => (
                      <div key={prop.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                          <h3 className="text-white font-bold">{prop.eventName} for {prop.clientName}</h3>
                          <p className="text-xs text-slate-500 mt-1">Budget: {prop.budget} â€¢ {prop.audienceSize} Pax</p>
                          <div className="mt-4 bg-slate-950 p-4 rounded border border-slate-800 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                              {prop.aiOutline}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* TAB: GOSPEL (SOPs) */}
      {activeTab === 'GOSPEL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
              <h1 className="text-3xl font-bold text-white mb-2">The Gospel IV</h1>
              <p className="text-slate-400 mb-8">Operating Procedures for Zero-Failure Entertainment.</p>
              
              <div className="prose prose-invert max-w-none">
                  <h3>1. The 15-Minute Rule</h3>
                  <p>If a client emails, we acknowledge within 15 minutes during business hours. Speed implies reliability.</p>

                  <h3>2. The "No-Surprise" Site Survey</h3>
                  <p>We never book a major show without visual confirmation of loading docks and power. If we can't visit, we get photos. No assumptions.</p>

                  <h3>3. Redundancy is Policy</h3>
                  <p>Every critical cable has a spare. Every show computer has a hot backup. We do not fail because of hardware.</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default PostShowOps;

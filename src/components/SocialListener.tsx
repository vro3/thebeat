
import React, { useState, useEffect } from 'react';
import { Radio, MessageCircle, Share2, ThumbsUp, AlertTriangle, Twitter, Linkedin, Loader2, FileSpreadsheet, Network, Swords, Target } from 'lucide-react';
import { SocialMention, Competitor } from '../types';
import { generateSocialReply, analyzeCompetitor } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { exportToCsv } from '../utils/csv';

type Tab = 'SOCIAL' | 'COMPETITORS';

const SocialListener: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('SOCIAL');
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);

  // Competitor State
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ name: '', focus: '' });
  const [analyzingCompId, setAnalyzingCompId] = useState<string | null>(null);

  useEffect(() => {
    setMentions(storageService.getSocialMentions());
    setCompetitors(storageService.getCompetitors());
  }, []);

  useEffect(() => { if (mentions.length > 0) storageService.saveSocialMentions(mentions); }, [mentions]);
  useEffect(() => { if (competitors.length > 0) storageService.saveCompetitors(competitors); }, [competitors]);

  const handleGenerateReply = async (id: string) => {
    setReplyingId(id);
    const mention = mentions.find(m => m.id === id);
    if (mention) {
      const reply = await generateSocialReply(mention.content);
      setMentions(prev => prev.map(m => 
        m.id === id ? { ...m, aiReply: reply } : m
      ));
    }
    setReplyingId(null);
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
      e.preventDefault();
      const compId = Date.now().toString();
      setAnalyzingCompId(compId); // Show loading
      
      // Initial add
      const comp: Competitor = {
          id: compId,
          name: newCompetitor.name,
          focus: newCompetitor.focus,
          strengths: 'Analyzing...',
          weaknesses: 'Analyzing...',
          lastSeenWinning: 'Unknown'
      };
      setCompetitors([comp, ...competitors]);
      setNewCompetitor({ name: '', focus: '' });

      // Run Analysis
      const analysis = await analyzeCompetitor(comp.name, comp.focus);
      setCompetitors(prev => prev.map(c => c.id === compId ? { ...c, ...analysis } : c));
      setAnalyzingCompId(null);
  };

  const handleExport = () => {
    if (activeTab === 'SOCIAL') exportToCsv('market_pulse_social', mentions);
    if (activeTab === 'COMPETITORS') exportToCsv('market_pulse_competitors', competitors);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-500" />
            Market Pulse
          </h2>
          <p className="text-slate-400 mt-1">Competitive Intelligence & Brand Monitoring.</p>
        </div>
        <button 
          onClick={handleExport}
          className="ml-2 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Export
        </button>
      </div>

      <div className="flex border-b border-slate-800 mb-6">
          <button onClick={() => setActiveTab('SOCIAL')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'SOCIAL' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <Radio className="w-4 h-4" /> Social Listening
          </button>
          <button onClick={() => setActiveTab('COMPETITORS')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'COMPETITORS' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              <Swords className="w-4 h-4" /> Competitor Watch
          </button>
      </div>

      {activeTab === 'SOCIAL' && (
        <div className="grid gap-4">
            {mentions.map((mention) => (
            <div key={mention.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mention.platform === 'Twitter' ? 'bg-sky-500/10 text-sky-500' : 
                        mention.platform === 'LinkedIn' ? 'bg-blue-700/10 text-blue-700' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                        {mention.platform === 'Twitter' ? <Twitter className="w-5 h-5" /> : <Linkedin className="w-5 h-5" />}
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">{mention.user}</h4>
                        <p className="text-slate-500 text-xs">{mention.platform} â€¢ {mention.timestamp}</p>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${
                    mention.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    mention.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                    {mention.sentiment} Intent
                </span>
                </div>

                <p className="mt-4 text-slate-300 text-sm leading-relaxed">"{mention.content}"</p>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-4">
                    <button 
                        onClick={() => handleGenerateReply(mention.id)}
                        disabled={!!mention.aiReply || replyingId === mention.id}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {replyingId === mention.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                        {mention.aiReply ? 'Draft Generated' : 'Draft Helpful Reply'}
                    </button>
                </div>

                {mention.aiReply && (
                    <div className="mt-4 bg-slate-950 rounded-lg p-4 border border-slate-800 border-l-4 border-l-purple-500 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-purple-500 uppercase">Suggested Reply</span>
                            <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors">
                                Copy & Open {mention.platform}
                            </button>
                        </div>
                        <p className="text-slate-300 text-sm italic">{mention.aiReply}</p>
                    </div>
                )}
            </div>
            ))}
        </div>
      )}

      {activeTab === 'COMPETITORS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" /> Add Competitor</h3>
                  <form onSubmit={handleAddCompetitor} className="space-y-4">
                      <div><label className="text-xs text-slate-500">Competitor Name</label><input required value={newCompetitor.name} onChange={e => setNewCompetitor({...newCompetitor, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <div><label className="text-xs text-slate-500">Market Focus</label><input required placeholder="e.g. Weddings, Cheap AV, High End" value={newCompetitor.focus} onChange={e => setNewCompetitor({...newCompetitor, focus: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" /></div>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold flex justify-center">
                           {analyzingCompId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze & Track'}
                      </button>
                  </form>
              </div>
              <div className="lg:col-span-2 space-y-4">
                  {competitors.map(comp => (
                      <div key={comp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                                  <span className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 mt-1 inline-block">{comp.focus}</span>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-slate-950 p-3 rounded border border-slate-800/50">
                                  <span className="text-emerald-500 font-bold text-xs uppercase">Strengths</span>
                                  <p className="text-slate-300 mt-1">{comp.strengths}</p>
                              </div>
                              <div className="bg-slate-950 p-3 rounded border border-slate-800/50">
                                  <span className="text-rose-500 font-bold text-xs uppercase">Weaknesses</span>
                                  <p className="text-slate-300 mt-1">{comp.weaknesses}</p>
                              </div>
                              <div className="col-span-2 bg-purple-500/10 p-3 rounded border border-purple-500/20">
                                  <span className="text-purple-400 font-bold text-xs uppercase">VRCG Opportunity</span>
                                  <p className="text-slate-200 mt-1">{comp.aiAnalysis ? (JSON.parse(JSON.stringify(comp)).opportunity) : "Analysis pending..."}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default SocialListener;

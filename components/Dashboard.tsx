
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AgentStat } from '../types';
import { Activity, Database, Zap, Rocket, FileText, Download, MessageSquare, Radar, Terminal } from 'lucide-react';
import { storageService } from '../services/storageService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AgentStat[]>([]);
  const [roi, setRoi] = useState({ hoursSaved: 0, moneySaved: 0 });
  const [showProgress, setShowProgress] = useState(0);
  
  useEffect(() => {
    const roiData = storageService.calculateRoi();
    setRoi({ hoursSaved: roiData.hoursSaved, moneySaved: roiData.moneySaved });
    setShowProgress(storageService.getShowPageProgress());

    const leads = storageService.getLeads();
    const events = storageService.getEvents();
    const seo = storageService.getSeoClusters();

    // Metrics
    const followUpsDue = leads.filter(l => {
        if (l.status !== 'Contacted' || !l.lastOutreachDate) return false;
        const daysSince = (Date.now() - new Date(l.lastOutreachDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= 14;
    }).length;
    
    const highValueEvents = events.filter(e => e.score >= 8).length;
    const responseRate = 24; // Simulated

    setStats([
        { name: 'Radar Detected', value: events.length, change: `+${highValueEvents} High Priority`, trend: 'up' },
        { name: 'Active Targets', value: leads.length, change: `${followUpsDue} Pending`, trend: followUpsDue > 0 ? 'down' : 'neutral' },
        { name: 'Content Assets', value: seo.length, change: `${seo.filter(s => s.aiOutline).length} Ready`, trend: 'up' },
        { name: 'Reply Rate', value: responseRate, change: '+2.4% this week', trend: 'neutral' },
    ]);
  }, []);

  const handleGenerateReport = () => {
    alert("Monthly Executive Report (PDF) generated.");
  };

  const activityData = [
    { day: 'M', leads: 2, content: 4 },
    { day: 'T', leads: 5, content: 8 },
    { day: 'W', leads: 1, content: 12 },
    { day: 'T', leads: 0, content: 10 },
    { day: 'F', leads: 8, content: 15 },
    { day: 'S', leads: 0, content: 4 },
    { day: 'S', leads: 0, content: 2 },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* COMPACT TOP BAR */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">System Status: Online</h2>
        </div>
        
        <div className="flex items-center gap-2">
             {/* Micro Efficiency Badge */}
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-mono text-slate-300"><span className="text-white font-bold">{roi.hoursSaved}h</span> Saved</span>
                <span className="text-[10px] text-slate-600">|</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">${roi.moneySaved.toLocaleString()}</span>
             </div>

             {/* Micro Report Button */}
             <button 
                onClick={handleGenerateReport}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
                title="Generate Monthly Report"
             >
                <Download className="w-3.5 h-3.5" />
             </button>
        </div>
      </div>

      {/* COMPACT STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-lg p-3 flex items-center justify-between group">
            <div>
                <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">{stat.name}</div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-none">{stat.value}</h3>
                    <span className="text-[9px] text-slate-400">{stat.change}</span>
                </div>
            </div>
            <div className={`p-1.5 rounded ${
                index === 0 ? 'text-emerald-400 bg-emerald-500/10' : 
                index === 1 ? 'text-blue-400 bg-blue-500/10' : 
                index === 2 ? 'text-amber-400 bg-amber-500/10' : 
                'text-purple-400 bg-purple-500/10'
            }`}>
                {index === 0 && <Radar className="w-4 h-4" />}
                {index === 1 && <Database className="w-4 h-4" />}
                {index === 2 && <FileText className="w-4 h-4" />}
                {index === 3 && <MessageSquare className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>

      {/* DENSE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT: COMPACT CHART */}
        <div className="lg:col-span-2 glass-panel rounded-lg p-4 flex flex-col h-[240px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Ops Velocity
            </h3>
          </div>
          <div className="flex-1 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '10px', borderRadius: '4px', padding: '4px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="content" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: COMPACT LOGS */}
        <div className="glass-panel rounded-lg p-4 h-[240px] flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Live Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {[
                { time: '10:42', msg: 'Radar: Fortune 500 Event detected', type: 'success' },
                { time: '10:15', msg: 'CRM: Lead S. Jenkins added', type: 'info' },
                { time: '09:30', msg: 'Alert: 3 Follow-ups due', type: 'warning' },
                { time: '08:45', msg: 'SEO: 3 Articles drafted', type: 'success' },
                ].map((log, i) => (
                <div key={i} className="flex gap-2 items-start text-[10px] border-b border-slate-800/50 pb-1 last:border-0">
                    <span className="font-mono text-slate-600 whitespace-nowrap">{log.time}</span>
                    <span className={`font-medium truncate ${
                        log.type === 'success' ? 'text-emerald-400' : 
                        log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                    }`}>{log.msg}</span>
                </div>
                ))}
            </div>
             
             {/* Micro Progress Bar */}
             <div className="mt-2 pt-2 border-t border-slate-800">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-slate-500 font-bold">DEPLOYMENT</span>
                    <span className="text-[9px] font-mono text-emerald-400">{Math.round((showProgress/12)*100)}%</span>
                 </div>
                 <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${(showProgress/12)*100}%`}}></div>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

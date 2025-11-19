
import { Lead, Venue, SeoCluster, SocialMention, BacklinkTarget, AuditTask, PostShowReport, Partner, NurtureSequence, RankMetric, ScrapedEvent, Competitor, Proposal, DiscoveredAgency } from '../types';

// Keys for Local Storage (Updated to use "thebeat_" prefix)
const KEYS = {
  LEADS: 'thebeat_leads',
  EVENTS: 'thebeat_events',
  PARTNERS: 'thebeat_partners',
  DISCOVERY: 'thebeat_discovery',
  NURTURE: 'thebeat_nurture',
  VENUES: 'thebeat_venues',
  SEO: 'thebeat_seo',
  RANK_METRICS: 'thebeat_ranks',
  BACKLINKS: 'thebeat_backlinks',
  AUDITS: 'thebeat_audits',
  SOCIAL: 'thebeat_social',
  COMPETITORS: 'thebeat_competitors',
  PROPOSALS: 'thebeat_proposals',
  CAMPAIGN_CONTEXT: 'thebeat_campaign_context',
  POST_SHOW_REPORTS: 'thebeat_post_show',
  SHOW_PAGE_PROGRESS: 'thebeat_show_progress'
};

// Default/Initial Data
const DEFAULTS = {
  LEADS: [
    { 
        id: '1', 
        name: 'Sarah Jenkins', 
        role: 'VP of Events', 
        company: 'George P. Johnson', 
        location: 'Nashville, TN',
        agencySize: 'Global',
        email: 's.jenkins@gpj.com', 
        source: 'LinkedIn', 
        specialization: 'Experiential Marketing',
        websiteVisits: 3,
        lastVisitDate: '2023-10-24',
        status: 'Research',
        notes: 'Found on Sales Nav. Handles automotive clients.',
        qualityScore: 8
    },
    { 
        id: '2', 
        name: 'Marcus Chen', 
        role: 'Director of Production', 
        company: 'Freeman', 
        location: 'Las Vegas, NV',
        agencySize: 'Global',
        email: 'm.chen@freeman.com', 
        source: 'Directory', 
        specialization: 'General Session / AV',
        websiteVisits: 0,
        status: 'Ready to Contact',
        notes: 'Listed on BizBash top 50.',
        qualityScore: 9
    },
  ] as Lead[],
  EVENTS: [
    {
        id: '1',
        eventName: 'Global Innovation Summit 2025',
        hostCompany: 'Oracle',
        eventDate: '2025-09-15',
        location: 'Las Vegas, NV',
        attendees: 5000,
        sourceUrl: 'https://oracle.com/events',
        description: 'Annual developer and partner conference focusing on cloud infrastructure.',
        isFortune500: true,
        eventType: 'Conference',
        score: 90,
        scoreBreakdown: ['Fortune 500 (+40)', 'Lead Time > 6mo (+30)', 'Size > 2000 (+20)'],
        status: 'Raw',
        priority: 'High',
        leadTimeMonths: 9,
        sourceType: 'Convention Center'
    }
  ] as ScrapedEvent[],
  PARTNERS: [
    { 
        id: '1', 
        name: 'Hello! Destination Management', 
        type: 'DMC', 
        contact: 'Regional Director', 
        email: 'info@hello.com', 
        status: 'Active Partner', 
        dealStructure: '10% Commission', 
        notes: 'Key player in Nashville & Orlando.',
        roi: { leadsSent: 12, dealsClosed: 3, totalValue: 45000 },
        fitScore: 9,
        winRate: 25
    },
    { 
        id: '2', 
        name: 'Freeman', 
        type: 'AV Company', 
        contact: 'Account Exec', 
        email: 'sales@freeman.com', 
        status: 'Identify', 
        dealStructure: 'Reciprocal', 
        notes: 'Target for large trade show referrals.',
        roi: { leadsSent: 0, dealsClosed: 0, totalValue: 0 },
        fitScore: 8,
        winRate: 0
    }
  ] as Partner[],
  DISCOVERY: [] as DiscoveredAgency[],
  COMPETITORS: [
      {
          id: '1',
          name: 'Generic Ent Co.',
          focus: 'Budget / Weddings',
          strengths: 'Low price, high availability',
          weaknesses: 'Technical failures, generic costumes',
          lastSeenWinning: 'Small Local Gala'
      },
      {
          id: '2',
          name: 'Cirque-Style Agency X',
          focus: 'High-End Visuals',
          strengths: 'Great costumes, large cast',
          weaknesses: 'Rigid requirements, hard to work with AV',
          lastSeenWinning: 'Tech Conference Opener'
      }
  ] as Competitor[],
  PROPOSALS: [] as Proposal[],
  NURTURE: [] as NurtureSequence[],
  VENUES: [
    { id: '1', name: 'Gaylord Opryland', location: 'Nashville, TN', ceilingHeight: '24ft - 40ft', powerSpecs: '400A 3-Phase', loadingDoor: '12ft x 14ft', lastScraped: '2023-10-01' },
  ] as Venue[],
  SEO: [
    {
      id: '1',
      keyword: 'Corporate Entertainment Nashville',
      volume: 1200,
      difficulty: 45,
      contentType: 'Educational',
      paaQuestions: ['How much does a corporate band cost?', 'Best entertainment ideas for awards gala', 'Unique event venues'],
      status: 'Ideation'
    }
  ] as SeoCluster[],
  RANK_METRICS: [
    { keyword: 'Corporate Entertainment Nashville', position: 12, change: 2, lastChecked: '2023-10-25' },
  ] as RankMetric[],
  BACKLINKS: [
    { id: '1', sourceName: 'EventsConnect.com', url: 'https://eventsconnect.com', type: 'Directory', contactName: 'Editor', status: 'Identify', dateAdded: '2025-11-17' },
  ] as BacklinkTarget[],
  AUDITS: [
    { id: '1', category: 'Technical', task: 'Crawl site with Screaming Frog (check errors)', completed: false },
    { id: '2', category: 'Technical', task: 'Verify all show pages indexed (Search Console)', completed: true },
  ] as AuditTask[],
  SOCIAL: [
    {
        id: '1',
        platform: 'Twitter',
        user: '@EventPlannerPro',
        content: 'Planning a huge tech conference in Nashville for Q3. Ideas?',
        sentiment: 'Neutral',
        timestamp: '10m ago'
    }
  ] as SocialMention[],
  CAMPAIGN_CONTEXT: "General outreach for TheBeat's high-end corporate event production capabilities.",
  POST_SHOW_REPORTS: [] as PostShowReport[],
  SHOW_PAGE_PROGRESS: 1 
};

// Generic Getter/Setter
const getItems = <T>(key: string, defaults: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaults;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaults;
  }
};

const saveItems = <T>(key: string, items: T) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Specific Accessors
export const storageService = {
  getLeads: () => getItems<Lead[]>(KEYS.LEADS, DEFAULTS.LEADS),
  saveLeads: (items: Lead[]) => saveItems(KEYS.LEADS, items),

  getEvents: () => getItems<ScrapedEvent[]>(KEYS.EVENTS, DEFAULTS.EVENTS),
  saveEvents: (items: ScrapedEvent[]) => saveItems(KEYS.EVENTS, items),

  getPartners: () => getItems<Partner[]>(KEYS.PARTNERS, DEFAULTS.PARTNERS),
  savePartners: (items: Partner[]) => saveItems(KEYS.PARTNERS, items),

  getDiscoveredAgencies: () => getItems<DiscoveredAgency[]>(KEYS.DISCOVERY, DEFAULTS.DISCOVERY),
  saveDiscoveredAgencies: (items: DiscoveredAgency[]) => saveItems(KEYS.DISCOVERY, items),

  getCompetitors: () => getItems<Competitor[]>(KEYS.COMPETITORS, DEFAULTS.COMPETITORS),
  saveCompetitors: (items: Competitor[]) => saveItems(KEYS.COMPETITORS, items),

  getProposals: () => getItems<Proposal[]>(KEYS.PROPOSALS, DEFAULTS.PROPOSALS),
  saveProposals: (items: Proposal[]) => saveItems(KEYS.PROPOSALS, items),

  getNurtureSequences: () => getItems<NurtureSequence[]>(KEYS.NURTURE, DEFAULTS.NURTURE),
  saveNurtureSequences: (items: NurtureSequence[]) => saveItems(KEYS.NURTURE, items),

  getVenues: () => getItems<Venue[]>(KEYS.VENUES, DEFAULTS.VENUES),
  saveVenues: (items: Venue[]) => saveItems(KEYS.VENUES, items),

  getSeoClusters: () => getItems<SeoCluster[]>(KEYS.SEO, DEFAULTS.SEO),
  saveSeoClusters: (items: SeoCluster[]) => saveItems(KEYS.SEO, items),

  getRankMetrics: () => getItems<RankMetric[]>(KEYS.RANK_METRICS, DEFAULTS.RANK_METRICS),
  saveRankMetrics: (items: RankMetric[]) => saveItems(KEYS.RANK_METRICS, items),

  getBacklinks: () => getItems<BacklinkTarget[]>(KEYS.BACKLINKS, DEFAULTS.BACKLINKS),
  saveBacklinks: (items: BacklinkTarget[]) => saveItems(KEYS.BACKLINKS, items),

  getAudits: () => getItems<AuditTask[]>(KEYS.AUDITS, DEFAULTS.AUDITS),
  saveAudits: (items: AuditTask[]) => saveItems(KEYS.AUDITS, items),

  getSocialMentions: () => getItems<SocialMention[]>(KEYS.SOCIAL, DEFAULTS.SOCIAL),
  saveSocialMentions: (items: SocialMention[]) => saveItems(KEYS.SOCIAL, items),

  getPostShowReports: () => getItems<PostShowReport[]>(KEYS.POST_SHOW_REPORTS, DEFAULTS.POST_SHOW_REPORTS),
  
  savePostShowReport: (report: PostShowReport) => {
    const reports = getItems<PostShowReport[]>(KEYS.POST_SHOW_REPORTS, DEFAULTS.POST_SHOW_REPORTS);
    saveItems(KEYS.POST_SHOW_REPORTS, [report, ...reports]);

    if (report.aiAnalysis.venueUpdates) {
        const venues = getItems<Venue[]>(KEYS.VENUES, DEFAULTS.VENUES);
        const updatedVenues = venues.map(v => v.id === report.venueId ? { ...v, notes: (v.notes ? v.notes + '\n' : '') + `[Post-Show Update]: ${report.aiAnalysis.venueUpdates}` } : v);
        saveItems(KEYS.VENUES, updatedVenues);
    }

    if (report.aiAnalysis.clientInsights) {
        const leads = getItems<Lead[]>(KEYS.LEADS, DEFAULTS.LEADS);
        const updatedLeads = leads.map(l => l.id === report.clientId ? { ...l, notes: (l.notes ? l.notes + '\n' : '') + `[Post-Show Insight]: ${report.aiAnalysis.clientInsights}`, status: 'Client' } : l);
        saveItems(KEYS.LEADS, updatedLeads);
    }
  },

  getCampaignContext: () => {
    return localStorage.getItem(KEYS.CAMPAIGN_CONTEXT) || DEFAULTS.CAMPAIGN_CONTEXT;
  },
  saveCampaignContext: (context: string) => {
    localStorage.setItem(KEYS.CAMPAIGN_CONTEXT, context);
  },

  getShowPageProgress: () => parseInt(localStorage.getItem(KEYS.SHOW_PAGE_PROGRESS) || String(DEFAULTS.SHOW_PAGE_PROGRESS)),
  saveShowPageProgress: (count: number) => localStorage.setItem(KEYS.SHOW_PAGE_PROGRESS, String(count)),

  // ROI Calculator
  calculateRoi: () => {
    const leads = getItems<Lead[]>(KEYS.LEADS, DEFAULTS.LEADS);
    const venues = getItems<Venue[]>(KEYS.VENUES, DEFAULTS.VENUES);
    const seo = getItems<SeoCluster[]>(KEYS.SEO, DEFAULTS.SEO);
    const social = getItems<SocialMention[]>(KEYS.SOCIAL, DEFAULTS.SOCIAL);
    const backlinks = getItems<BacklinkTarget[]>(KEYS.BACKLINKS, DEFAULTS.BACKLINKS);
    const reports = getItems<PostShowReport[]>(KEYS.POST_SHOW_REPORTS, DEFAULTS.POST_SHOW_REPORTS);
    const events = getItems<ScrapedEvent[]>(KEYS.EVENTS, DEFAULTS.EVENTS);
    const proposals = getItems<Proposal[]>(KEYS.PROPOSALS, DEFAULTS.PROPOSALS);

    const TIME_PER_EMAIL = 15; 
    const TIME_PER_VENUE_RESEARCH = 20;
    const TIME_PER_BLOG_OUTLINE = 45; 
    const TIME_PER_SOCIAL_REPLY = 5; 
    const TIME_PER_BACKLINK_PITCH = 20;
    const TIME_PER_POST_SHOW_ANALYSIS = 60; 
    const TIME_PER_EVENT_FIND = 30;
    const TIME_PER_PROPOSAL_DRAFT = 90;
    const HOURLY_RATE = 150; 

    const emailsDrafted = leads.filter(l => l.aiDraft).length;
    const venuesScraped = venues.length;
    const outlinesGenerated = seo.filter(s => s.aiOutline).length;
    const repliesDrafted = social.filter(s => s.aiReply).length;
    const backlinksPitched = backlinks.filter(b => b.aiPitch).length;
    const reportsAnalyzed = reports.length;
    const eventsFound = events.length;
    const proposalsDrafted = proposals.length;

    const totalMinutesSaved = 
      (emailsDrafted * TIME_PER_EMAIL) + 
      (venuesScraped * TIME_PER_VENUE_RESEARCH) + 
      (outlinesGenerated * TIME_PER_BLOG_OUTLINE) + 
      (repliesDrafted * TIME_PER_SOCIAL_REPLY) +
      (backlinksPitched * TIME_PER_BACKLINK_PITCH) +
      (reportsAnalyzed * TIME_PER_POST_SHOW_ANALYSIS) +
      (eventsFound * TIME_PER_EVENT_FIND) +
      (proposalsDrafted * TIME_PER_PROPOSAL_DRAFT);

    const hoursSaved = Math.round(totalMinutesSaved / 60);
    const moneySaved = Math.round((totalMinutesSaved / 60) * HOURLY_RATE);

    return {
      hoursSaved,
      moneySaved,
      emailsDrafted,
      venuesScraped,
      outlinesGenerated
    };
  }
};

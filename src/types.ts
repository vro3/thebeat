export enum View {
    DASHBOARD = 'DASHBOARD',
    HEADHUNTER = 'HEADHUNTER',
    VENUE_SPY = 'VENUE_SPY',
    SEO_VULTURE = 'SEO_VULTURE',
    SOCIAL_LISTENER = 'SOCIAL_LISTENER',
    GOOGLE_SHEET = 'GOOGLE_SHEET',
    POST_SHOW = 'POST_SHOW'
  }
  
  export type LeadSource = 'LinkedIn' | 'Directory' | 'Website' | 'Referral' | 'Event Radar' | 'Agency Discovery';
  export type ScraperSource = 'Convention Center' | 'Google News' | 'Eventbrite' | 'Manual';

  export interface ScrapedEvent {
    id: string;
    eventName: string;
    hostCompany: string;
    eventDate: string;
    leadTimeMonths: number;
    location: string;
    attendees: number;
    sourceUrl: string;
    sourceType: ScraperSource;
    description: string;
    isFortune500: boolean;
    eventType: 'Conference' | 'Gala' | 'Product Launch' | 'Trade Show' | 'Consumer' | 'General Session';
    score: number;
    priority: 'High' | 'Medium' | 'Low';
    scoreBreakdown: string[];
    status: 'Raw' | 'Qualified' | 'Disqualified' | 'Promoted' | 'Ignored';
    aiAnalysis?: string;
  }

  export interface Lead {
    id: string;
    name: string;
    role: string;
    company: string;
    location?: string;
    agencySize?: 'Boutique' | 'Mid-Market' | 'Global';
    email: string;
    source: LeadSource;
    specialization: string;
    websiteVisits: number;
    lastVisitDate?: string;
    status: 'Research' | 'Ready to Contact' | 'Contacted' | 'Replied' | 'Client' | 'Lost';
    lossReason?: 'Price' | 'Competitor' | 'Ghosted' | 'Timing' | 'Capabilities';
    lastOutreachDate?: string;
    nextFollowUpDate?: string;
    recentNews?: string; 
    aiDraft?: string;
    notes?: string;
    relatedEventId?: string;
    qualityScore?: number;
  }

  export interface DiscoveredContact {
      name: string;
      title: string;
      email: string;
      confidence: number;
  }

  export interface DiscoveredAgency {
      id: string;
      name: string;
      website: string;
      location: string;
      specialization: string;
      size: 'Boutique' | 'Mid-Market' | 'Global';
      fitScore: number;
      fitReason: string;
      contacts: DiscoveredContact[];
      status: 'Unverified' | 'Verified' | 'Discarded' | 'Promoted';
      tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  }

  export interface Partner {
    id: string;
    name: string;
    type: 'Agency' | 'DMC' | 'AV Company';
    contact: string;
    email: string;
    status: 'Identify' | 'Outreach' | 'Active Partner';
    dealStructure: '10% Commission' | 'Flat Fee' | 'Reciprocal';
    notes: string;
    roi?: {
        leadsSent: number;
        dealsClosed: number;
        totalValue: number;
    };
    fitScore?: number;
    winRate?: number;
  }

  export interface Competitor {
      id: string;
      name: string;
      focus: string;
      strengths: string;
      weaknesses: string;
      lastSeenWinning: string;
      aiAnalysis?: string;
  }

  export interface Proposal {
      id: string;
      clientName: string;
      eventName: string;
      budget: string;
      audienceSize: number;
      status: 'Drafting' | 'Sent' | 'Won' | 'Lost';
      aiOutline?: string;
      dateCreated: string;
  }

  export interface NurtureSequence {
    id: string;
    name: string;
    targetAudience: string;
    emails: {
        day: number;
        subject: string;
        body: string;
    }[];
  }
  
  export interface Venue {
    id: string;
    name: string;
    location: string;
    ceilingHeight: string;
    powerSpecs: string;
    loadingDoor: string;
    lastScraped: string;
    notes?: string;
  }
  
  export type ContentType = 'Educational' | 'Behind-the-Scenes' | 'Case Study' | 'Landing Page';

  export interface SeoCluster {
    id: string;
    keyword: string;
    volume: number;
    difficulty: number;
    contentType: ContentType;
    paaQuestions: string[];
    aiOutline?: string;
    fullDraft?: string;
    status: 'Ideation' | 'Drafting' | 'Published';
  }

  export interface RankMetric {
    keyword: string;
    position: number;
    change: number;
    lastChecked: string;
  }

  export interface BacklinkTarget {
    id: string;
    sourceName: string;
    url: string;
    type: 'Directory' | 'Client' | 'Partner' | 'PR';
    contactName: string;
    status: 'Identify' | 'Pitched' | 'Link Live';
    aiPitch?: string;
    dateAdded: string;
  }

  export interface AuditTask {
    id: string;
    category: 'Technical' | 'Content' | 'Keywords' | 'Backlinks';
    task: string;
    completed: boolean;
  }
  
  export interface SocialMention {
    id: string;
    platform: 'Twitter' | 'LinkedIn' | 'Reddit';
    user: string;
    content: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    timestamp: string;
    aiReply?: string;
  }
  
  export interface AgentStat {
    name: string;
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  }

  export interface PostShowReport {
    id: string;
    showName: string;
    venueId: string;
    clientId: string;
    date: string;
    rawNotes: string;
    aiAnalysis: {
        venueUpdates: string;
        clientInsights: string;
        caseStudyDraft: string;
    };
  }

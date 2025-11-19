import OpenAI from "openai";
import { ContentType, Lead, Venue, ScrapedEvent, DiscoveredAgency } from "../types";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const client = new OpenAI({ apiKey: API_KEY });

// --- PIPELINE INTELLIGENCE (LAYER 1 & 2: RADAR) ---

export const simulateEventScraping = async (city: string, sourceType: string): Promise<Partial<ScrapedEvent>[]> => {
    if (!API_KEY) return [];

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Act as a Python Web Scraper interacting with the ${sourceType} for ${city}.
                
                SIMULATION CONTEXT:
                You have just downloaded the raw HTML from the convention center calendar or news site.
                Your job is to parse this raw data and extract 5 REALISTIC corporate event opportunities.
                
                TARGETS:
                - Fortune 500 Annual Meetings
                - Major Tech Conferences
                - Large Corporate Galas
                
                OUTPUT REQUIREMENTS (JSON Array):
                For each event found in the "HTML", return:
                - "eventName": (e.g. AWS re:Invent, Oracle OpenWorld)
                - "hostCompany": The organizing entity
                - "eventDate": A future date (YYYY-MM-DD). Mix of 1 month out, 3 months out, and 6 months out.
                - "location": ${city}
                - "attendees": Estimated count (integer)
                - "sourceUrl": A mock URL
                - "description": 1 sentence about the event purpose.
                - "eventType": One of ['Conference', 'Gala', 'Product Launch', 'Trade Show', 'General Session']
                - "isFortune500": boolean (True if host is major corp)
                
                Return ONLY valid JSON array, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        // Parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Scraper Simulation Error:", error);
        return [];
    }
};

// --- AGENCY DISCOVERY (TIER 1-3 SIMULATION) ---
export const runAgencyDiscovery = async (
    location: string, 
    type: string, 
    size: string
): Promise<Partial<DiscoveredAgency>[]> => {
    if (!API_KEY) return [];

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 1500,
            messages: [{
                role: "user",
                content: `Act as a high-end agency "Headhunter" bot.
                Task: Find and Enrich potential agency partners for TheBeat (High-end Entertainment Production).
                
                Search Parameters:
                - Location: ${location}
                - Agency Type: ${type}
                - Agency Size: ${size}

                Generate 5 REALISTIC agencies that fit this profile. 
                SIMULATE the data enrichment process (finding decision makers).

                Return a JSON array where each object contains:
                - "name": Agency Name
                - "website": Mock website (agencyname.com)
                - "location": Specific city/state
                - "specialization": Short description of what they do
                - "size": '${size}'
                - "fitScore": Integer 1-10 based on how well they fit high-end corporate entertainment.
                - "fitReason": 1 sentence explaining the score.
                - "contacts": An array of 2 discovered contacts, each with:
                    - "name": Full Name
                    - "title": Job Title (e.g., VP of Events, Creative Director, Head of Production)
                    - "email": Email address (mock)
                    - "confidence": Integer 80-99
                
                Return ONLY valid JSON array, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Agency Discovery Error:", error);
        return [];
    }
};

export const generateEventPitch = async (
  recipientName: string, 
  eventName: string, 
  hostCompany: string,
  eventDate: string,
  attendees: number,
  venue: string
): Promise<string> => {
  if (!API_KEY) return "Error: API Key missing.";

  try {
    const message = await client.messages.create({
      model: "gpt-4o",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Write a specific B2B email from Vince (TheBeat) to ${recipientName}.
        
        CONTEXT:
        I noticed ${hostCompany} is producing ${eventName} (Approx ${attendees} attendees) on ${eventDate} at ${venue || 'a major venue'}.
        
        TEMPLATE TO FOLLOW (Do not deviate strictly, but keep the structure):
        "Hi [Name],
        
        I noticed [Host Company] is producing [Event Name] (announced [date], [size] attendees) at [Venue].
        
        We've done similar-scale work for Dell, HP, and Google—and we specialize in the exact moment you need: [INSERT DYNAMIC MOMENT TYPE based on event type, e.g. high energy opener or gala entry].
        
        Zero technical failures across 28 years.
        
        Worth a 15-minute call?
        
        Vince"`
      }]
    });

    return message.content[0].type === 'text' ? message.content[0].text : "Could not generate draft.";
  } catch (error) {
    console.error("OpenAI Event Pitch Error:", error);
    return "Error generating outreach email.";
  }
};

export const generateOutreachEmail = async (
  name: string, 
  company: string, 
  notes: string,
  context?: string
): Promise<string> => {
  if (!API_KEY) return "Error: API Key missing.";

  try {
    const message = await client.messages.create({
      model: "gpt-4o",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are an elite B2B copywriter for TheBeat (High-end event production).
        Write a personal, research-based email to ${name} at ${company}.
        
        Intelligence gathered:
        - Notes/Specialization: "${notes}"
        - Context/Signals: "${context || ''}" (If this mentions site visits, acknowledge it subtly like 'Noticed some interest from your team')
        
        Goal: Start a conversation about partnering on their next activation.
        Tone: Professional, non-salesy, peer-to-peer.
        Length: Under 75 words.
        Format: Plain text only. No subject line.`
      }]
    });

    return message.content[0].type === 'text' ? message.content[0].text : "Could not generate draft.";
  } catch (error) {
    console.error("OpenAI Headhunter Error:", error);
    return "Error generating outreach email.";
  }
};

export const generateNurtureSequence = async (audience: string, goal: string): Promise<{ day: number, subject: string, body: string }[]> => {
    if (!API_KEY) return [];

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 1500,
            messages: [{
                role: "user",
                content: `Create a 5-email nurture sequence for TheBeat (High-end event production).
                Target Audience: ${audience}
                Goal: ${goal}

                Structure:
                Email 1 (Day 0): Value add / differentiation.
                Email 2 (Day 3): Case Study / Social Proof.
                Email 3 (Day 7): Educational content.
                Email 4 (Day 14): Soft pitch / Process.
                Email 5 (Day 21): Final CTA.

                Return JSON array with keys: "day", "subject", "body".
                Return ONLY valid JSON array, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Nurture Error:", error);
        return [];
    }
};

// --- VENUE RESEARCH SERVICES ---

export const batchResearchVenues = async (city: string): Promise<Partial<Venue>[]> => {
    if (!API_KEY) return [];

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `List 5 major corporate event venues (Hotels or Convention Centers) in ${city}.
                For each venue, provide estimated technical specifications based on general knowledge of large ballrooms.

                Return a JSON array of objects. Each object must have:
                - "name": Venue Name
                - "location": ${city}
                - "ceilingHeight": Estimated ceiling height (e.g., "20ft - 30ft")
                - "powerSpecs": Estimated power availability (e.g., "Standard 200A 3-phase")
                - "loadingDoor": Estimated loading details (e.g., "Standard Dock", "Freight Elevator only")
                
                Return ONLY valid JSON array, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Venue Research Error:", error);
        return [];
    }
};

// --- SEO SERVICES ---

export const generateSeoOutline = async (keyword: string, questions: string[], contentType: ContentType): Promise<string> => {
  if (!API_KEY) return "Error: API Key missing.";

  try {
    let typeInstructions = "";
    if (contentType === 'Educational') {
        typeInstructions = "Format: Guide/How-To. Focus: Industry insights, actionable tips for planners.";
    } else if (contentType === 'Behind-the-Scenes') {
        typeInstructions = "Format: Process Breakdown. Focus: Setup process, technical challenges solved, performer prep.";
    } else if (contentType === 'Case Study') {
        typeInstructions = "Format: Problem/Solution. Focus: Client challenge, TheBeat solution, measurable outcome. Structure: 'The Challenge', 'The Solution', 'The Results'.";
    } else if (contentType === 'Landing Page') {
        typeInstructions = "Format: Sales Landing Page. Focus: Trust signals, Authority, clear CTA. Include sections for 'Client Logos', 'Testimonials', 'Capabilities'.";
    }

    const message = await client.messages.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `Create a detailed content outline for TheBeat targeting the keyword: "${keyword}".
        Content Type: ${contentType}
        ${typeInstructions}
        
        Specifically answer these "People Also Ask" questions: ${questions.join(', ')}.
        Structure it with H2 and H3 tags. Make it authoritative for corporate event planners.`
      }]
    });

    return message.content[0].type === 'text' ? message.content[0].text : "Could not generate outline.";
  } catch (error) {
    console.error("OpenAI SEO Error:", error);
    return "Error generating content strategy.";
  }
};

export const generateFullContentDraft = async (keyword: string, outline: string, contentType: ContentType): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: `Write a full content draft based on this outline.
                Keyword: ${keyword}
                Type: ${contentType}
                
                Outline:
                ${outline}

                Tone: High-end, professional, authoritative, "Grey Ops" aesthetic. 
                Length: ~800 words.
                Format: Markdown.`
            }]
        });

        return message.content[0].type === 'text' ? message.content[0].text : "Could not generate full draft.";
    } catch (error) {
        console.error("OpenAI Content Draft Error:", error);
        return "Error generating content draft.";
    }
};

export const generateBacklinkPitch = async (sourceName: string, type: string, contactName: string): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
  
    try {
      const message = await client.messages.create({
        model: "gpt-4o",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Write a link-building outreach email for TheBeat.
          Recipient: ${contactName} at ${sourceName}.
          Type: ${type} (Directory, Client, Partner, or PR).
          
          Use this structure:
          1. Compliment specific to their brand/content.
          2. Mention TheBeat specializes in high-impact entertainment for Fortune 500s (Dell, HP, Google).
          3. Ask for the link/feature (Guest post, directory listing, or case study).
          4. Offer value in return (Share to network, feature them).
          
          Keep it under 150 words. Professional but warm tone.`
        }]
      });
  
      return message.content[0].type === 'text' ? message.content[0].text : "Could not generate pitch.";
    } catch (error) {
      console.error("OpenAI Backlink Error:", error);
      return "Error generating backlink pitch.";
    }
  };

// --- SOCIAL / COMPETITOR SERVICES ---

export const generateSocialReply = async (postContent: string): Promise<string> => {
  if (!API_KEY) return "Error: API Key missing.";

  try {
    const message = await client.messages.create({
      model: "gpt-4o",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `You are a helpful brand ambassador for TheBeat.
        Draft a helpful, non-salesy comment reply to this social media post: "${postContent}".
        Mention a specific venue or tip relevant to Nashville if applicable.
        Keep it under 280 characters.`
      }]
    });

    return message.content[0].type === 'text' ? message.content[0].text : "Could not generate reply.";
  } catch (error) {
    console.error("OpenAI Social Error:", error);
    return "Error generating reply.";
  }
};

export const analyzeCompetitor = async (competitorName: string, focus: string): Promise<{ strengths: string, weaknesses: string, opportunity: string }> => {
    if (!API_KEY) return { strengths: "N/A", weaknesses: "N/A", opportunity: "N/A" };

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 600,
            messages: [{
                role: "user",
                content: `Analyze the event entertainment competitor: "${competitorName}".
                Their Focus: "${focus}".

                Provide a quick SWOT analysis as JSON:
                {
                  "strengths": "What they likely do well.",
                  "weaknesses": "Where they likely fail (technical, rigidity, generic).",
                  "opportunity": "How TheBeat (High-end, custom, technical perfection) can win against them."
                }
                
                Return ONLY valid JSON object, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON object found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Competitor Error:", error);
        return { strengths: "Error", weaknesses: "Error", opportunity: "Error" };
    }
};

// --- OPS SERVICES (PROPOSALS & REPORTS) ---

export const analyzePostShowNotes = async (notes: string, venueName: string, clientName: string): Promise<{ venueUpdates: string, clientInsights: string, caseStudyDraft: string }> => {
    if (!API_KEY) return { venueUpdates: '', clientInsights: '', caseStudyDraft: '' };

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Analyze these post-show notes from a TheBeat event.
                Venue: ${venueName}
                Client: ${clientName}
                Notes: "${notes}"

                Extract three things as JSON:
                {
                  "venueUpdates": "Any technical constraints or realities found about the venue (e.g. door sizes, power issues, load-in details).",
                  "clientInsights": "What the client liked/disliked, specific preferences for future sales.",
                  "caseStudyDraft": "A short 3-sentence marketing blurb summarizing the success of the event for a Case Study."
                }
                
                Return ONLY valid JSON object, no markdown or extra text.`
            }]
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        if (!text) throw new Error("No response text");
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON object found in response");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("OpenAI Post-Show Error:", error);
        return { 
            venueUpdates: "Could not extract data.", 
            clientInsights: "Could not extract data.", 
            caseStudyDraft: "Could not generate draft." 
        };
    }
};

export const generateProposalOutline = async (clientName: string, eventName: string, budget: string, audience: number): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";

    try {
        const message = await client.messages.create({
            model: "gpt-4o",
            max_tokens: 1200,
            messages: [{
                role: "user",
                content: `Create a winning proposal outline for TheBeat (High-end Corporate Entertainment).
                Client: ${clientName}
                Event: ${eventName}
                Budget Range: ${budget}
                Audience: ${audience} pax

                Philosophy: "Zero Technical Failures", "Production Integration", "Seamless Execution".

                Structure:
                1. The Vision (High energy opener or sophisticated ambient).
                2. The "TheBeat Difference" (Why us vs. generic booking agencies).
                3. Technical Logistics (How we handle the specific constraints of ${audience} pax).
                4. Investment Options (Good, Better, Best - aligned with ${budget}).

                Format: Markdown.`
            }]
        });

        return message.content[0].type === 'text' ? message.content[0].text : "Could not generate proposal.";
    } catch (error) {
        console.error("OpenAI Proposal Error:", error);
        return "Error generating proposal.";
    }
};
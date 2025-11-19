import OpenAI from "openai";
import { ContentType, ScrapedEvent, DiscoveredAgency, Venue } from "../types";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

const client = new OpenAI({ apiKey: API_KEY });

// --- PIPELINE INTELLIGENCE (LAYER 1 & 2: RADAR) ---

export const simulateEventScraping = async (city: string, sourceType: string): Promise<Partial<ScrapedEvent>[]> => {
    if (!API_KEY) return [];
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Act as a Web Scraper for ${sourceType} in ${city}. Extract 5 REALISTIC corporate events. Return ONLY a valid JSON array with: eventName, hostCompany, eventDate (YYYY-MM-DD), location, attendees (number), sourceUrl, description, eventType, isFortune500 (boolean). No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("Event Scraping Error:", error);
        return [];
    }
};

export const runAgencyDiscovery = async (location: string, type: string, size: string): Promise<Partial<DiscoveredAgency>[]> => {
    if (!API_KEY) return [];
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1500,
            messages: [{
                role: "user",
                content: `Find 5 agencies in ${location}, type: ${type}, size: ${size}. Return ONLY JSON array with: name, website, location, specialization, size, fitScore (1-10), fitReason, contacts (array of {name, title, email, confidence}). No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("Agency Discovery Error:", error);
        return [];
    }
};

export const generateEventPitch = async (recipientName: string, eventName: string, hostCompany: string, eventDate: string, attendees: number, venue: string): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 400,
            messages: [{
                role: "user",
                content: `Write a short B2B email to ${recipientName} about ${hostCompany}'s ${eventName} (${eventDate}, ${attendees} attendees). Professional tone. Max 75 words.`
            }]
        });
        return response.choices[0].message.content || "Could not generate draft.";
    } catch (error) {
        console.error("Event Pitch Error:", error);
        return "Error generating outreach email.";
    }
};

export const generateOutreachEmail = async (name: string, company: string, notes: string, context?: string): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 300,
            messages: [{
                role: "user",
                content: `Write a personal B2B email to ${name} at ${company}. Notes: ${notes}. Context: ${context || 'General outreach'}. Professional, non-salesy. Max 75 words. Plain text only.`
            }]
        });
        return response.choices[0].message.content || "Could not generate draft.";
    } catch (error) {
        console.error("Outreach Email Error:", error);
        return "Error generating outreach email.";
    }
};

export const generateNurtureSequence = async (audience: string, goal: string): Promise<{ day: number, subject: string, body: string }[]> => {
    if (!API_KEY) return [];
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1500,
            messages: [{
                role: "user",
                content: `Create a 5-email nurture sequence for ${audience}. Goal: ${goal}. Return ONLY JSON array with: day, subject, body. No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("Nurture Sequence Error:", error);
        return [];
    }
};

export const batchResearchVenues = async (city: string): Promise<Partial<Venue>[]> => {
    if (!API_KEY) return [];
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `List 5 major event venues in ${city}. Return ONLY JSON array with: name, location, ceilingHeight, powerSpecs, loadingDoor. No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("Venue Research Error:", error);
        return [];
    }
};

export const generateSeoOutline = async (keyword: string, questions: string[], contentType: ContentType): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Create an outline for "${keyword}" (${contentType}). Answer: ${questions.join(', ')}. Use H2/H3 tags. Professional tone.`
            }]
        });
        return response.choices[0].message.content || "Could not generate outline.";
    } catch (error) {
        console.error("SEO Outline Error:", error);
        return "Error generating content strategy.";
    }
};

export const generateFullContentDraft = async (keyword: string, outline: string, contentType: ContentType): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 2000,
            messages: [{
                role: "user",
                content: `Write full content (~800 words) for "${keyword}" (${contentType}). Outline: ${outline}. Professional, authoritative tone. Markdown format.`
            }]
        });
        return response.choices[0].message.content || "Could not generate full draft.";
    } catch (error) {
        console.error("Content Draft Error:", error);
        return "Error generating content draft.";
    }
};

export const generateBacklinkPitch = async (sourceName: string, type: string, contactName: string): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 400,
            messages: [{
                role: "user",
                content: `Write a link-building email to ${contactName} at ${sourceName} (${type}). Professional, warm tone. Max 150 words.`
            }]
        });
        return response.choices[0].message.content || "Could not generate pitch.";
    } catch (error) {
        console.error("Backlink Pitch Error:", error);
        return "Error generating backlink pitch.";
    }
};

export const generateSocialReply = async (postContent: string): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 200,
            messages: [{
                role: "user",
                content: `Write a helpful social media reply to: "${postContent}". Professional, helpful, non-salesy. Max 280 characters.`
            }]
        });
        return response.choices[0].message.content || "Could not generate reply.";
    } catch (error) {
        console.error("Social Reply Error:", error);
        return "Error generating reply.";
    }
};

export const analyzeCompetitor = async (competitorName: string, focus: string): Promise<{ strengths: string, weaknesses: string, opportunity: string }> => {
    if (!API_KEY) return { strengths: "N/A", weaknesses: "N/A", opportunity: "N/A" };
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 600,
            messages: [{
                role: "user",
                content: `Analyze competitor "${competitorName}" (${focus}). Return ONLY JSON: {strengths, weaknesses, opportunity}. No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { strengths: "Error", weaknesses: "Error", opportunity: "Error" };
    } catch (error) {
        console.error("Competitor Analysis Error:", error);
        return { strengths: "Error", weaknesses: "Error", opportunity: "Error" };
    }
};

export const analyzePostShowNotes = async (notes: string, venueName: string, clientName: string): Promise<{ venueUpdates: string, clientInsights: string, caseStudyDraft: string }> => {
    if (!API_KEY) return { venueUpdates: '', clientInsights: '', caseStudyDraft: '' };
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Analyze post-show notes. Venue: ${venueName}, Client: ${clientName}. Notes: ${notes}. Return ONLY JSON: {venueUpdates, clientInsights, caseStudyDraft}. No markdown.`
            }]
        });
        const text = response.choices[0].message.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { venueUpdates: '', clientInsights: '', caseStudyDraft: '' };
    } catch (error) {
        console.error("Post-Show Analysis Error:", error);
        return { venueUpdates: '', clientInsights: '', caseStudyDraft: '' };
    }
};

export const generateProposalOutline = async (clientName: string, eventName: string, budget: string, audience: number): Promise<string> => {
    if (!API_KEY) return "Error: API Key missing.";
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 1200,
            messages: [{
                role: "user",
                content: `Create proposal outline for ${clientName}'s ${eventName} (${budget}, ${audience} pax). Include: Vision, Why Us, Logistics, Investment Options. Markdown format.`
            }]
        });
        return response.choices[0].message.content || "Could not generate proposal.";
    } catch (error) {
        console.error("Proposal Error:", error);
        return "Error generating proposal.";
    }
};

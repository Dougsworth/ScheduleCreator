import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category routing - rule-based mapping
class CategoryRouter {
  static routeCategory(industry: string, focus: string[] = []): string {
    const focusLower = focus.map(f => f.toLowerCase());
    const industryLower = industry.toLowerCase();
    
    if (industryLower === 'marketing') {
      if (focusLower.some(f => f.includes('digital'))) {
        return 'DigitalMarketing';
      }
      if (focusLower.some(f => f.includes('content'))) {
        return 'ContentMarketing';
      }
      if (focusLower.some(f => f.includes('social'))) {
        return 'SocialMedia';
      }
      if (focusLower.some(f => f.includes('seo'))) {
        return 'DigitalMarketing';
      }
      return 'DigitalMarketing';
    }
    
    if (industryLower === 'technology' || industryLower === 'tech') {
      if (focusLower.some(f => f.includes('software') || f.includes('development'))) {
        return 'WebDevelopment';
      }
      if (focusLower.some(f => f.includes('data'))) {
        return 'DataScience';
      }
      if (focusLower.some(f => f.includes('product'))) {
        return 'ProductManagement';
      }
      if (focusLower.some(f => f.includes('devops'))) {
        return 'DevOps';
      }
      return 'WebDevelopment';
    }
    
    if (industryLower === 'sales') {
      return 'Sales';
    }
    
    if (industryLower === 'finance') {
      return 'Finance';
    }
    
    return 'General';
  }
}

// Session scoring and matching logic
class SessionMatcher {
  static scoreSession(session: any, userProfile: any): number {
    const tagOverlap = this.calculateTagOverlap(session.tags || [], userProfile.focus || []);
    const categoryMatch = this.calculateCategoryMatch(session, userProfile);
    const timeFit = this.calculateTimeFit(session, userProfile.timePref);
    const freshness = this.calculateFreshness(session);
    const availability = this.calculateAvailability(session);
    
    if (tagOverlap === 0 && categoryMatch === 0) {
      return 0;
    }
    
    const score = (
      5.0 * Math.max(tagOverlap, categoryMatch) +
      2.0 * timeFit +
      0.3 * freshness +
      0.2 * availability
    );
    
    return Math.round(score * 100) / 100;
  }
  
  static calculateTagOverlap(sessionTags: string[], userFocus: string[]): number {
    if (!sessionTags.length || !userFocus.length) return 0;
    
    const userFocusLower = new Set(userFocus.map(f => f.toLowerCase().trim()));
    let exactMatches = 0;
    let partialMatches = 0;
    
    sessionTags.forEach(tag => {
      const tagLower = tag.toLowerCase().trim();
      
      if (userFocusLower.has(tagLower)) {
        exactMatches++;
      } else {
        userFocus.forEach(focus => {
          const focusLower = focus.toLowerCase().trim();
          if (tagLower.includes(focusLower) || focusLower.includes(tagLower)) {
            partialMatches++;
          }
        });
      }
    });
    
    const score = (exactMatches * 1.0 + partialMatches * 0.3) / Math.max(1, userFocus.length);
    return Math.min(1.0, score);
  }
  
  static calculateCategoryMatch(session: any, userProfile: any): number {
    if (!userProfile.industry) return 0;
    
    const industryLower = userProfile.industry.toLowerCase();
    const sessionCategory = (session.category || '').toLowerCase();
    const sessionSubcategory = (session.subcategory || '').toLowerCase();
    
    const categoryMappings: Record<string, string[]> = {
      'marketing': ['digitalmarketing', 'contentmarketing', 'socialmedia', 'emailmarketing'],
      'tech': ['webdevelopment', 'datascience', 'devops', 'productmanagement'],
      'technology': ['webdevelopment', 'datascience', 'devops', 'productmanagement'],
      'sales': ['sales'],
      'finance': ['finance']
    };
    
    const expectedCategories = categoryMappings[industryLower] || [];
    
    if (expectedCategories.includes(sessionCategory)) {
      return 1.0;
    }
    
    if (userProfile.focus) {
      for (const focus of userProfile.focus) {
        const focusLower = focus.toLowerCase().trim();
        if (sessionSubcategory.includes(focusLower) || focusLower.includes(sessionSubcategory)) {
          return 0.7;
        }
      }
    }
    
    return 0;
  }
  
  static calculateTimeFit(session: any, timePref: any): number {
    if (!timePref) return 1.0;
    
    const sessionStart = this.parseSessionDateTime(session.date, session.time);
    const sessionEnd = new Date(sessionStart.getTime() + (this.parseDuration(session.duration) * 60 * 60 * 1000));
    
    const prefStart = new Date(timePref.start);
    const prefEnd = new Date(timePref.end);
    
    if (sessionStart >= prefStart && sessionEnd <= prefEnd) {
      return 1.0;
    }
    
    if (sessionEnd > prefStart && sessionStart < prefEnd) {
      return 0.5;
    }
    
    return 0.0;
  }
  
  static calculateFreshness(session: any): number {
    const sessionStart = this.parseSessionDateTime(session.date, session.time);
    const hour = sessionStart.getHours();
    
    if (hour >= 9 && hour <= 20) {
      return 1.0 - ((hour - 9) / 11);
    }
    return 0.0;
  }
  
  static calculateAvailability(session: any): number {
    if (!session.capacity || !session.enrolled) return 1.0;
    return (session.capacity - session.enrolled) / session.capacity;
  }
  
  static parseSessionDateTime(dateString: string, timeString: string): Date {
    const date = new Date(dateString);
    const hour = this.parseTime(timeString);
    date.setHours(hour, 0, 0, 0);
    return date;
  }
  
  static parseDuration(durationString: string): number {
    if (!durationString) return 2;
    const match = durationString.match(/(\d+\.?\d*)\s*hours?/i);
    return match ? parseFloat(match[1]) : 2;
  }
  
  static parseTime(timeString: string): number {
    if (!timeString) return 10;
    const match = timeString.match(/(\d+):?(\d*)\s*(AM|PM)/i);
    if (!match) return 10;

    let hour = parseInt(match[1]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour;
  }
}

// Session arrangement logic
class SessionArranger {
  static arrangeGreedy(sessions: any[], avoidGaps: boolean = true): any[] {
    const nonConflicting = this.removeConflicts(sessions);
    
    if (avoidGaps) {
      nonConflicting.sort((a, b) => {
        const aStart = SessionMatcher.parseSessionDateTime(a.date, a.time);
        const bStart = SessionMatcher.parseSessionDateTime(b.date, b.time);
        return aStart.getTime() - bStart.getTime();
      });
      
      return this.minimizeGaps(nonConflicting);
    }
    
    return nonConflicting;
  }
  
  static removeConflicts(sessions: any[]): any[] {
    const sorted = sessions.sort((a, b) => b.score - a.score);
    const chosen: any[] = [];
    
    for (const session of sorted) {
      const hasConflict = chosen.some(existing => this.sessionsOverlap(session, existing));
      if (!hasConflict) {
        chosen.push(session);
      }
    }
    
    return chosen;
  }
  
  static sessionsOverlap(sessionA: any, sessionB: any): boolean {
    const startA = SessionMatcher.parseSessionDateTime(sessionA.date, sessionA.time);
    const endA = new Date(startA.getTime() + (SessionMatcher.parseDuration(sessionA.duration) * 60 * 60 * 1000));
    
    const startB = SessionMatcher.parseSessionDateTime(sessionB.date, sessionB.time);
    const endB = new Date(startB.getTime() + (SessionMatcher.parseDuration(sessionB.duration) * 60 * 60 * 1000));
    
    return !(endA <= startB || endB <= startA);
  }
  
  static minimizeGaps(sessions: any[]): any[] {
    if (sessions.length <= 1) return sessions;
    
    const result = [sessions[0]];
    
    for (let i = 1; i < sessions.length; i++) {
      const prev = result[result.length - 1];
      const current = sessions[i];
      
      const prevEnd = new Date(SessionMatcher.parseSessionDateTime(prev.date, prev.time).getTime() + 
        (SessionMatcher.parseDuration(prev.duration) * 60 * 60 * 1000));
      const currentStart = SessionMatcher.parseSessionDateTime(current.date, current.time);
      
      const gapMinutes = (currentStart.getTime() - prevEnd.getTime()) / (1000 * 60);
      
      if (gapMinutes <= 90) {
        result.push(current);
      }
    }
    
    return result;
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { 
      industry, 
      focus = [], 
      timePref, 
      avoidGaps = true, 
      topK = 8, 
      useLLM = false 
    } = await req.json();
    
    if (!industry) {
      return new Response(
        JSON.stringify({ error: 'Industry is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const category = CategoryRouter.routeCategory(industry, focus);
    
    let query = supabase
      .from('sessions')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0]);
    
    if (category !== 'General') {
      query = query.eq('category', category);
    }
    
    if (timePref && timePref.start && timePref.end) {
      const startDate = new Date(timePref.start).toISOString().split('T')[0];
      const endDate = new Date(timePref.end);
      endDate.setDate(endDate.getDate() + 7);
      const endDateStr = endDate.toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDateStr);
    }
    
    const { data: sessions, error } = await query;
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!sessions || sessions.length === 0) {
      const { data: allSessions, error: broadError } = await supabase
        .from('sessions')
        .select('*')
        .gte('date', '2025-01-01');
      
      if (!broadError && allSessions && allSessions.length > 0) {
        sessions.push(...allSessions.slice(0, topK));
      }
    }
    
    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({
          requestId: generateUUID(),
          category: category || 'General',
          items: [],
          metadata: {
            total_analyzed: 0,
            top_candidates: 0,
            final_count: 0,
            category_used: category || 'General',
            llm_optimized: false,
            message: 'No sessions available. Please populate the database with session data.'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const availableSessions = sessions.filter(session => 
      !session.capacity || session.enrolled < session.capacity
    );
    
    const scoredSessions = availableSessions.map(session => ({
      ...session,
      score: SessionMatcher.scoreSession(session, { industry, focus, timePref })
    }));
    
    const relevantSessions = scoredSessions.filter(session => session.score > 0.5);
    
    const topSessions = relevantSessions
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(topK * 2, 16));
    
    const arranged = SessionArranger.arrangeGreedy(topSessions, avoidGaps);
    let finalRecommendations = arranged.slice(0, topK);
    
    if (finalRecommendations.length < Math.min(topK, topSessions.length / 2)) {
      finalRecommendations = topSessions.slice(0, topK);
    }
    
    const requestId = generateUUID();
    
    const response = {
      requestId,
      category,
      items: finalRecommendations.map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        start: SessionMatcher.parseSessionDateTime(session.date, session.time).toISOString(),
        end: new Date(SessionMatcher.parseSessionDateTime(session.date, session.time).getTime() + 
          (SessionMatcher.parseDuration(session.duration) * 60 * 60 * 1000)).toISOString(),
        room: session.location,
        instructor: session.instructor,
        score: session.score,
        tags: session.tags
      })),
      metadata: {
        total_analyzed: availableSessions.length,
        top_candidates: topSessions.length,
        final_count: finalRecommendations.length,
        category_used: category,
        llm_optimized: false
      }
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
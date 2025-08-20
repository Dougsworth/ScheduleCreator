const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// OpenAI client (optional for edge functions)
let openai;
try {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI not available in edge environment');
}

// Category routing - rule-based mapping
class CategoryRouter {
  static routeCategory(industry, focus = []) {
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
  static scoreSession(session, userProfile) {
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
  
  static calculateTagOverlap(sessionTags, userFocus) {
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
  
  static calculateCategoryMatch(session, userProfile) {
    if (!userProfile.industry) return 0;
    
    const industryLower = userProfile.industry.toLowerCase();
    const sessionCategory = (session.category || '').toLowerCase();
    const sessionSubcategory = (session.subcategory || '').toLowerCase();
    
    const categoryMappings = {
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
  
  static calculateTimeFit(session, timePref) {
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
  
  static calculateFreshness(session) {
    const sessionStart = this.parseSessionDateTime(session.date, session.time);
    const hour = sessionStart.getHours();
    
    if (hour >= 9 && hour <= 20) {
      return 1.0 - ((hour - 9) / 11);
    }
    return 0.0;
  }
  
  static calculateAvailability(session) {
    if (!session.capacity || !session.enrolled) return 1.0;
    return (session.capacity - session.enrolled) / session.capacity;
  }
  
  static parseSessionDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const hour = this.parseTime(timeString);
    date.setHours(hour, 0, 0, 0);
    return date;
  }
  
  static parseDuration(durationString) {
    if (!durationString) return 2;
    const match = durationString.match(/(\d+\.?\d*)\s*hours?/i);
    return match ? parseFloat(match[1]) : 2;
  }
  
  static parseTime(timeString) {
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
  static arrangeGreedy(sessions, avoidGaps = true) {
    const nonConflicting = this.removeConflicts(sessions);
    
    if (avoidGaps) {
      nonConflicting.sort((a, b) => {
        const aStart = SessionMatcher.parseSessionDateTime(a.date, a.time);
        const bStart = SessionMatcher.parseSessionDateTime(b.date, b.time);
        return aStart - bStart;
      });
      
      return this.minimizeGaps(nonConflicting);
    }
    
    return nonConflicting;
  }
  
  static removeConflicts(sessions) {
    const sorted = sessions.sort((a, b) => b.score - a.score);
    const chosen = [];
    
    for (const session of sorted) {
      const hasConflict = chosen.some(existing => this.sessionsOverlap(session, existing));
      if (!hasConflict) {
        chosen.push(session);
      }
    }
    
    return chosen;
  }
  
  static sessionsOverlap(sessionA, sessionB) {
    const startA = SessionMatcher.parseSessionDateTime(sessionA.date, sessionA.time);
    const endA = new Date(startA.getTime() + (SessionMatcher.parseDuration(sessionA.duration) * 60 * 60 * 1000));
    
    const startB = SessionMatcher.parseSessionDateTime(sessionB.date, sessionB.time);
    const endB = new Date(startB.getTime() + (SessionMatcher.parseDuration(sessionB.duration) * 60 * 60 * 1000));
    
    return !(endA <= startB || endB <= startA);
  }
  
  static minimizeGaps(sessions) {
    if (sessions.length <= 1) return sessions;
    
    const result = [sessions[0]];
    
    for (let i = 1; i < sessions.length; i++) {
      const prev = result[result.length - 1];
      const current = sessions[i];
      
      const prevEnd = new Date(SessionMatcher.parseSessionDateTime(prev.date, prev.time).getTime() + 
        (SessionMatcher.parseDuration(prev.duration) * 60 * 60 * 1000));
      const currentStart = SessionMatcher.parseSessionDateTime(current.date, current.time);
      
      const gapMinutes = (currentStart - prevEnd) / (1000 * 60);
      
      if (gapMinutes <= 90) {
        result.push(current);
      }
    }
    
    return result;
  }
}

// Calendar generation
class CalendarGenerator {
  static generateICS(sessions, userDetails = {}) {
    const events = sessions.map(session => {
      const startDate = SessionMatcher.parseSessionDateTime(session.date, session.time);
      const endDate = new Date(startDate.getTime() + (SessionMatcher.parseDuration(session.duration) * 60 * 60 * 1000));
      
      return {
        start: startDate,
        end: endDate,
        title: session.title,
        description: this.buildDescription(session),
        location: session.location || 'Online Session',
        organizer: session.instructor || 'Conference Organizer'
      };
    });
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SessionBooking//Enhanced//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    events.forEach((event, index) => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:session-${index}-${Date.now()}@sessionbooking.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(event.start)}`,
        `DTEND:${formatDate(event.end)}`,
        `SUMMARY:${this.escapeICSText(event.title)}`,
        `DESCRIPTION:${this.escapeICSText(event.description)}`,
        `LOCATION:${this.escapeICSText(event.location)}`,
        `ORGANIZER:CN=${this.escapeICSText(event.organizer)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Session starts in 15 minutes',
        'END:VALARM',
        'END:VEVENT'
      );
    });
    
    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
  }
  
  static buildDescription(session) {
    let description = session.description || '';
    if (session.instructor) {
      description += `\\n\\nInstructor: ${session.instructor}`;
    }
    if (session.tags && session.tags.length > 0) {
      description += `\\n\\nTags: ${session.tags.join(', ')}`;
    }
    if (session.capacity && session.enrolled !== undefined) {
      description += `\\n\\nCapacity: ${session.enrolled}/${session.capacity} enrolled`;
    }
    return description;
  }
  
  static escapeICSText(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }
}

// API Routes
app.post('/api/recommendations', async (req, res) => {
  try {
    const { 
      industry, 
      focus = [], 
      timePref, 
      avoidGaps = true, 
      topK = 8, 
      useLLM = false 
    } = req.body;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
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
      return res.status(500).json({ error: 'Failed to fetch sessions' });
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
      return res.json({
        requestId: uuidv4(),
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
      });
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
    
    const requestId = uuidv4();
    
    res.json({
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
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/book', async (req, res) => {
  try {
    const { requestId, sessionIds, userDetails = {} } = req.body;
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: 'Session IDs are required' });
    }
    
    const { data: sessions, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .in('id', sessionIds);
    
    if (fetchError) {
      return res.status(500).json({ error: 'Database error: ' + fetchError.message });
    }
    
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ error: 'Sessions not found' });
    }
    
    const conflicts = [];
    const unavailable = [];
    
    sessions.forEach(session => {
      if (session.enrolled >= session.capacity) {
        unavailable.push(session.id);
      }
    });
    
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (SessionArranger.sessionsOverlap(sessions[i], sessions[j])) {
          conflicts.push([sessions[i].id, sessions[j].id]);
        }
      }
    }
    
    if (unavailable.length > 0) {
      return res.status(400).json({ 
        error: 'Some sessions are no longer available',
        unavailable_sessions: unavailable 
      });
    }
    
    if (conflicts.length > 0) {
      return res.status(400).json({ 
        error: 'Selected sessions have time conflicts',
        conflicts 
      });
    }
    
    const bookingId = uuidv4();
    const bookingData = sessionIds.map(sessionId => ({
      id: uuidv4(),
      session_id: sessionId,
      booking_group_id: bookingId,
      user_details: userDetails,
      status: 'confirmed',
      booked_at: new Date().toISOString()
    }));
    
    const { data: insertResult, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData);
    
    if (bookingError) {
      return res.status(500).json({ error: 'Failed to create booking: ' + bookingError.message });
    }
    
    await Promise.all(sessions.map(session =>
      supabase
        .from('sessions')
        .update({ enrolled: session.enrolled + 1 })
        .eq('id', session.id)
    ));
    
    const calendarContent = CalendarGenerator.generateICS(sessions, userDetails);
    
    res.json({
      bookingId,
      sessionIds,
      status: 'confirmed',
      icsUrl: `/api/ics/${bookingId}`,
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        start: SessionMatcher.parseSessionDateTime(s.date, s.time).toISOString(),
        end: new Date(SessionMatcher.parseSessionDateTime(s.date, s.time).getTime() + 
          (SessionMatcher.parseDuration(s.duration) * 60 * 60 * 1000)).toISOString()
      }))
    });
    
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ics/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        sessions (*)
      `)
      .eq('booking_group_id', bookingId);
    
    if (error || !bookings || bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const sessions = bookings.map(b => b.sessions);
    const calendarContent = CalendarGenerator.generateICS(sessions, bookings[0].user_details);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="schedule-${bookingId}.ics"`);
    res.send(calendarContent);
    
  } catch (error) {
    console.error('ICS generation error:', error);
    res.status(500).json({ error: 'Failed to generate calendar file' });
  }
});

app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        sessions (
          id, title, description, date, time, duration, instructor, category, subcategory, location
        )
      `)
      .eq('user_details->user_id', userId)
      .order('booked_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.json({ bookings });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

app.get('/api/debug/sessions', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: error.message,
        supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      });
    }
    
    res.json({ 
      success: true,
      sessionCount: sessions?.length || 0,
      sampleSessions: sessions || [],
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Unexpected error', 
      message: err.message 
    });
  }
});

module.exports = app;
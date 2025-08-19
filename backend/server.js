const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
}

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      // Default to DigitalMarketing for marketing industry
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
      // Default to WebDevelopment for tech industry
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

// Enhanced session scoring with strict user preference matching
class SessionMatcher {
  static scoreSession(session, userProfile) {
    const tagOverlap = this.calculateTagOverlap(session.tags || [], userProfile.focus || []);
    const categoryMatch = this.calculateCategoryMatch(session, userProfile);
    const timeFit = this.calculateTimeFit(session, userProfile.timePref);
    const freshness = this.calculateFreshness(session);
    const availability = this.calculateAvailability(session);
    
    // Strict filtering: if no tag overlap AND no category match, return 0
    if (tagOverlap === 0 && categoryMatch === 0) {
      return 0;
    }
    
    // Enhanced weighted scoring with stricter requirements
    const score = (
      5.0 * Math.max(tagOverlap, categoryMatch) +  // Primary relevance is critical
      2.0 * timeFit +         // Time preference is important
      0.3 * freshness +       // Earlier sessions slightly preferred
      0.2 * availability      // Availability is least important
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
      
      // Check for exact matches first (higher weight)
      if (userFocusLower.has(tagLower)) {
        exactMatches++;
      } else {
        // Check for partial matches (lower weight)
        userFocus.forEach(focus => {
          const focusLower = focus.toLowerCase().trim();
          if (tagLower.includes(focusLower) || focusLower.includes(tagLower)) {
            partialMatches++;
          }
        });
      }
    });
    
    // Prioritize exact matches heavily
    const score = (exactMatches * 1.0 + partialMatches * 0.3) / Math.max(1, userFocus.length);
    return Math.min(1.0, score);
  }
  
  static calculateCategoryMatch(session, userProfile) {
    if (!userProfile.industry) return 0;
    
    const industryLower = userProfile.industry.toLowerCase();
    const sessionCategory = (session.category || '').toLowerCase();
    const sessionSubcategory = (session.subcategory || '').toLowerCase();
    
    // Direct category matches
    const categoryMappings = {
      'marketing': ['digitalmarketing', 'contentmarketing', 'socialmedia', 'emailmarketing'],
      'tech': ['webdevelopment', 'datascience', 'devops', 'productmanagement'],
      'technology': ['webdevelopment', 'datascience', 'devops', 'productmanagement'],
      'sales': ['sales'],
      'finance': ['finance']
    };
    
    const expectedCategories = categoryMappings[industryLower] || [];
    
    if (expectedCategories.includes(sessionCategory)) {
      return 1.0; // Perfect category match
    }
    
    // Check if focus areas match subcategories
    if (userProfile.focus) {
      for (const focus of userProfile.focus) {
        const focusLower = focus.toLowerCase().trim();
        if (sessionSubcategory.includes(focusLower) || focusLower.includes(sessionSubcategory)) {
          return 0.7; // Good subcategory match
        }
      }
    }
    
    return 0;
  }
  
  static calculateTimeFit(session, timePref) {
    if (!timePref) return 1.0; // If no preference, all times are equal
    
    const sessionStart = this.parseSessionDateTime(session.date, session.time);
    const sessionEnd = new Date(sessionStart.getTime() + (this.parseDuration(session.duration) * 60 * 60 * 1000));
    
    const prefStart = new Date(timePref.start);
    const prefEnd = new Date(timePref.end);
    
    // Perfect fit - session fully within preferred time
    if (sessionStart >= prefStart && sessionEnd <= prefEnd) {
      return 1.0;
    }
    
    // Partial overlap
    if (sessionEnd > prefStart && sessionStart < prefEnd) {
      return 0.5;
    }
    
    // No overlap
    return 0.0;
  }
  
  static calculateFreshness(session) {
    const sessionStart = this.parseSessionDateTime(session.date, session.time);
    const hour = sessionStart.getHours();
    
    // Prefer morning sessions: 9AM = 1.0, gradually decrease to 8PM = 0.0
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
    if (!timeString) return 10; // Default to 10 AM
    const match = timeString.match(/(\d+):?(\d*)\s*(AM|PM)/i);
    if (!match) return 10;

    let hour = parseInt(match[1]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour;
  }
}

// Greedy arrangement system to minimize gaps and conflicts
class SessionArranger {
  static arrangeGreedy(sessions, avoidGaps = true) {
    // First pass: remove overlapping sessions, keeping highest scored ones
    const nonConflicting = this.removeConflicts(sessions);
    
    // Second pass: arrange chronologically if avoiding gaps
    if (avoidGaps) {
      nonConflicting.sort((a, b) => {
        const aStart = SessionMatcher.parseSessionDateTime(a.date, a.time);
        const bStart = SessionMatcher.parseSessionDateTime(b.date, b.time);
        return aStart - bStart;
      });
      
      // Filter out sessions that create large gaps (> 90 minutes)
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
      
      // Only include if gap is reasonable (≤ 90 minutes)
      if (gapMinutes <= 90) {
        result.push(current);
      }
    }
    
    return result;
  }
}

// LLM-powered session optimization
class LLMOptimizer {
  static async optimizeSchedule(sessions, userProfile) {
    if (!openai || sessions.length <= 1) {
      return sessions; // Fall back to original order if no OpenAI or too few sessions
    }
    
    try {
      // Create abstracted session data (no personal info)
      const abstractedSessions = sessions.map(session => ({
        id: session.id,
        start_time: SessionMatcher.parseSessionDateTime(session.date, session.time).toISOString(),
        duration_hours: SessionMatcher.parseDuration(session.duration),
        score: session.score,
        category: session.category || 'General'
      }));
      
      const prompt = `You are a strict schedule optimizer focused on user preference matching. Your primary goal is to ensure sessions EXACTLY match what the user requested.

Sessions (JSON):
${JSON.stringify(abstractedSessions, null, 2)}

User Requirements (MUST BE STRICTLY FOLLOWED):
- Industry: ${userProfile.industry || 'General'}
- Focus areas: ${userProfile.focus?.join(', ') || 'None specified'}

CRITICAL OPTIMIZATION RULES (in order of priority):
1. RELEVANCE FIRST: Only sessions with score >= 4.0 should be prioritized
2. EXACT MATCH: Sessions must directly relate to user's industry and focus areas
3. LEARNING PROGRESSION: Order from foundational to advanced concepts
4. TIME EFFICIENCY: Minimize gaps between sessions (prefer <= 90 minutes)
5. SCORE PRIORITY: Higher scored sessions should come first when relevance is equal

FILTERING REQUIREMENTS:
- If a session doesn't match the user's industry/focus, it should be deprioritized
- Sessions with scores < 2.0 should be placed last or excluded
- Group related sessions together for better learning flow

Return ONLY a JSON array of session IDs in the optimized order that STRICTLY follows user preferences: [1, 3, 2, 5]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      });
      
      const responseText = completion.choices[0].message.content.trim();
      
      // Extract JSON array from response
      const jsonMatch = responseText.match(/\[[\d,\s]+\]/);
      if (!jsonMatch) {
        console.warn('LLM did not return valid JSON array, using original order');
        return sessions;
      }
      
      const optimizedOrder = JSON.parse(jsonMatch[0]);
      
      // Reorder sessions based on LLM response
      const orderedSessions = [];
      const sessionMap = new Map(sessions.map(s => [s.id, s]));
      
      for (const id of optimizedOrder) {
        if (sessionMap.has(id)) {
          orderedSessions.push(sessionMap.get(id));
          sessionMap.delete(id);
        }
      }
      
      // Add any remaining sessions that weren't in the LLM response
      orderedSessions.push(...sessionMap.values());
      
      return orderedSessions;
      
    } catch (error) {
      console.error('LLM optimization failed:', error);
      return sessions; // Fall back to original order
    }
  }
}

// Enhanced calendar generator
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

// Enhanced recommendations endpoint
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
    
    console.log('Received recommendation request:', { industry, focus, timePref, avoidGaps, topK, useLLM });
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
    }
    
    // Route to appropriate category
    const category = CategoryRouter.routeCategory(industry, focus);
    console.log('Mapped to category:', category);
    
    // Build query filters
    let query = supabase
      .from('sessions')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0]);
    
    // Filter by category if not General
    if (category !== 'General') {
      query = query.eq('category', category);
    }
    
    // Add time filtering if specified - use a broader date range
    if (timePref && timePref.start && timePref.end) {
      const startDate = new Date(timePref.start).toISOString().split('T')[0];
      const endDate = new Date(timePref.end);
      // Add 7 days to end date to capture more sessions
      endDate.setDate(endDate.getDate() + 7);
      const endDateStr = endDate.toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDateStr);
      console.log('Applied time filter:', { startDate, endDateStr });
    }
    
    console.log('Executing Supabase query...');
    const { data: sessions, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    
    console.log(`Found ${sessions?.length || 0} sessions from database`);
    
    // If no sessions found, let's try a broader query without category filter
    if (!sessions || sessions.length === 0) {
      console.log('No sessions found, trying broader query...');
      const { data: allSessions, error: broadError } = await supabase
        .from('sessions')
        .select('*')
        .gte('date', '2025-01-01'); // Use a more permissive date
      
      if (broadError) {
        console.error('Broad query error:', broadError);
      } else {
        console.log(`Broad query found ${allSessions?.length || 0} total sessions`);
        // Use the broader results if available
        if (allSessions && allSessions.length > 0) {
          sessions.push(...allSessions.slice(0, topK));
        }
      }
    }
    
    // If still no sessions found, return appropriate response
    if (!sessions || sessions.length === 0) {
      console.log('No sessions found in database');
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
    
    // Filter out full sessions (enrolled >= capacity)
    const availableSessions = sessions.filter(session => 
      !session.capacity || session.enrolled < session.capacity
    );
    
    // Score sessions
    const scoredSessions = availableSessions.map(session => ({
      ...session,
      score: SessionMatcher.scoreSession(session, { industry, focus, timePref })
    }));
    
    // Filter out sessions with very low scores (strict matching)
    const relevantSessions = scoredSessions.filter(session => session.score > 0.5);
    
    console.log(`Filtered to ${relevantSessions.length} relevant sessions (score > 0.5)`);
    
    // Take top sessions and sort by score
    const topSessions = relevantSessions
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(topK * 2, 16)); // Take more sessions for arrangement
    
    // Apply arrangement to minimize conflicts/gaps but keep more sessions
    const arranged = SessionArranger.arrangeGreedy(topSessions, avoidGaps);
    let finalRecommendations = arranged.slice(0, topK);
    
    // If arrangement filtered out too many sessions, fall back to top scored sessions
    if (finalRecommendations.length < Math.min(topK, topSessions.length / 2)) {
      finalRecommendations = topSessions.slice(0, topK);
      console.log('Arrangement filtered out too many sessions, using top scored sessions');
    }
    
    // Final quality check: log scores for debugging
    console.log('Final recommendations with scores:', finalRecommendations.map(s => ({
      id: s.id,
      title: s.title.substring(0, 50) + '...',
      score: s.score,
      category: s.category,
      tags: s.tags?.slice(0, 3)
    })));
    
    // Use LLM optimization if requested and we have enough sessions
    if (useLLM && finalRecommendations.length > 1) {
      finalRecommendations = await LLMOptimizer.optimizeSchedule(
        finalRecommendations, 
        { industry, focus, timePref }
      );
    }
    
    // Generate request ID for potential booking
    const requestId = uuidv4();
    
    // Cache request (optional - you could store this in memory or Redis)
    // For now, we'll just include it in the response for booking reference
    
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
        llm_optimized: useLLM && finalRecommendations.length > 1
      }
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced booking endpoint
app.post('/api/book', async (req, res) => {
  try {
    console.log('Booking request received:', req.body);
    const { requestId, sessionIds, userDetails = {} } = req.body;
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      console.error('Invalid session IDs:', sessionIds);
      return res.status(400).json({ error: 'Session IDs are required' });
    }
    
    // Fetch selected sessions
    console.log('Fetching sessions with IDs:', sessionIds);
    const { data: sessions, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .in('id', sessionIds);
    
    console.log('Fetched sessions:', sessions);
    console.log('Fetch error:', fetchError);
    
    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return res.status(500).json({ error: 'Database error: ' + fetchError.message });
    }
    
    if (!sessions || sessions.length === 0) {
      console.error('No sessions found for IDs:', sessionIds);
      return res.status(404).json({ error: 'Sessions not found' });
    }
    
    // Check for conflicts and availability
    const conflicts = [];
    const unavailable = [];
    
    sessions.forEach(session => {
      if (session.enrolled >= session.capacity) {
        unavailable.push(session.id);
      }
    });
    
    // Check for time conflicts between selected sessions
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
    
    // Create bookings
    const bookingId = uuidv4();
    const bookingData = sessionIds.map(sessionId => ({
      id: uuidv4(),
      session_id: sessionId,
      booking_group_id: bookingId,
      user_details: userDetails,
      status: 'confirmed',
      booked_at: new Date().toISOString()
    }));
    
    console.log('Inserting booking data:', bookingData);
    const { data: insertResult, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData);
    
    console.log('Booking insert result:', insertResult);
    console.log('Booking insert error:', bookingError);
    
    if (bookingError) {
      console.error('Booking error:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking: ' + bookingError.message });
    }
    
    // Update enrollment counts
    await Promise.all(sessions.map(session =>
      supabase
        .from('sessions')
        .update({ enrolled: session.enrolled + 1 })
        .eq('id', session.id)
    ));
    
    // Generate calendar file
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

// ICS file download endpoint
app.get('/api/ics/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Fetch booking and associated sessions
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

// Get user's bookings
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Debug endpoint to check database connection and sessions
app.get('/api/debug/sessions', async (req, res) => {
  try {
    console.log('Debug: Checking database connection...');
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Debug: Database error:', error);
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: error.message,
        supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      });
    }
    
    console.log(`Debug: Found ${sessions?.length || 0} sessions`);
    res.json({ 
      success: true,
      sessionCount: sessions?.length || 0,
      sampleSessions: sessions || [],
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    });
  } catch (err) {
    console.error('Debug: Unexpected error:', err);
    res.status(500).json({ 
      error: 'Unexpected error', 
      message: err.message 
    });
  }
});

// Catch-all handler: serve the React app for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enhanced Session Booking API running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving frontend from /frontend/dist');
  }
});

module.exports = { app, SessionMatcher, CalendarGenerator, CategoryRouter, SessionArranger };

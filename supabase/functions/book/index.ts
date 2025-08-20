import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Session arrangement logic for overlap detection
class SessionArranger {
  static parseSessionDateTime(dateString: string, timeString: string): Date {
    const date = new Date(dateString);
    const hour = this.parseTime(timeString);
    date.setHours(hour, 0, 0, 0);
    return date;
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
  
  static parseDuration(durationString: string): number {
    if (!durationString) return 2;
    const match = durationString.match(/(\d+\.?\d*)\s*hours?/i);
    return match ? parseFloat(match[1]) : 2;
  }
  
  static sessionsOverlap(sessionA: any, sessionB: any): boolean {
    const startA = this.parseSessionDateTime(sessionA.date, sessionA.time);
    const endA = new Date(startA.getTime() + (this.parseDuration(sessionA.duration) * 60 * 60 * 1000));
    
    const startB = this.parseSessionDateTime(sessionB.date, sessionB.time);
    const endB = new Date(startB.getTime() + (this.parseDuration(sessionB.duration) * 60 * 60 * 1000));
    
    return !(endA <= startB || endB <= startA);
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

    const { requestId, sessionIds, userDetails = {} } = await req.json();
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Session IDs are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Fetch selected sessions
    const { data: sessions, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .in('id', sessionIds);
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Database error: ' + fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Sessions not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Check for conflicts and availability
    const conflicts: number[][] = [];
    const unavailable: number[] = [];
    
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
      return new Response(
        JSON.stringify({ 
          error: 'Some sessions are no longer available',
          unavailable_sessions: unavailable 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (conflicts.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Selected sessions have time conflicts',
          conflicts 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create bookings
    const bookingId = generateUUID();
    const bookingData = sessionIds.map((sessionId: number) => ({
      id: generateUUID(),
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
      return new Response(
        JSON.stringify({ error: 'Failed to create booking: ' + bookingError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Update enrollment counts
    await Promise.all(sessions.map(session =>
      supabase
        .from('sessions')
        .update({ enrolled: session.enrolled + 1 })
        .eq('id', session.id)
    ));
    
    const response = {
      bookingId,
      sessionIds,
      status: 'confirmed',
      icsUrl: `/functions/v1/ics?bookingId=${bookingId}`,
      sessions: sessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        start: SessionArranger.parseSessionDateTime(s.date, s.time).toISOString(),
        end: new Date(SessionArranger.parseSessionDateTime(s.date, s.time).getTime() + 
          (SessionArranger.parseDuration(s.duration) * 60 * 60 * 1000)).toISOString()
      }))
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Booking error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
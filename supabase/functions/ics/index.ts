import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calendar generation
class CalendarGenerator {
  static generateICS(sessions: any[], userDetails: any = {}): string {
    const events = sessions.map(session => {
      const startDate = this.parseSessionDateTime(session.date, session.time);
      const endDate = new Date(startDate.getTime() + (this.parseDuration(session.duration) * 60 * 60 * 1000));
      
      return {
        start: startDate,
        end: endDate,
        title: session.title,
        description: this.buildDescription(session),
        location: session.location || 'Online Session',
        organizer: session.instructor || 'Conference Organizer'
      };
    });
    
    const formatDate = (date: Date): string => {
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
  
  static buildDescription(session: any): string {
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
  
  static escapeICSText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
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

    const url = new URL(req.url);
    const bookingId = url.searchParams.get('bookingId');
    
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Booking ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Fetch booking and associated sessions
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        sessions (*)
      `)
      .eq('booking_group_id', bookingId);
    
    if (error || !bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const sessions = bookings.map((b: any) => b.sessions);
    const calendarContent = CalendarGenerator.generateICS(sessions, bookings[0].user_details);
    
    return new Response(calendarContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="schedule-${bookingId}.ics"`
      }
    });
    
  } catch (error) {
    console.error('ICS generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate calendar file' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
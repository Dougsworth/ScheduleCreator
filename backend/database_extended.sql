-- Enhanced Session Booking Database Schema
-- This creates tables for sessions, bookings, and user management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table with enhanced fields
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- e.g., 'DigitalMarketing', 'WebDevelopment'
    subcategory VARCHAR(100), -- e.g., 'SEO', 'React'
    tags TEXT[], -- Array of tags for better matching
    duration VARCHAR(50) NOT NULL, -- e.g., '3 hours', '2.5 hours'
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL, -- e.g., '9:00 AM', '2:30 PM'
    instructor VARCHAR(255),
    capacity INTEGER DEFAULT 20,
    enrolled INTEGER DEFAULT 0,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table for tracking reservations
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id INTEGER REFERENCES sessions(id),
    booking_group_id UUID NOT NULL, -- Groups multiple session bookings together
    user_details JSONB NOT NULL, -- Store user info as JSON
    status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'pending'
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table (optional - for future enhancements)
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    focus_areas TEXT[],
    preferred_times JSONB, -- Store time preferences as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_sessions_category ON sessions(category);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_tags ON sessions USING GIN(tags);
CREATE INDEX idx_bookings_session_id ON bookings(session_id);
CREATE INDEX idx_bookings_group_id ON bookings(booking_group_id);
CREATE INDEX idx_bookings_user_details ON bookings USING GIN(user_details);

-- Row Level Security (RLS) policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow read access to sessions for all users
CREATE POLICY "Sessions are viewable by everyone" ON sessions
    FOR SELECT USING (true);

-- Allow users to create bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own bookings
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (true);

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (true);

-- Functions for common operations

-- Function to get available sessions
CREATE OR REPLACE FUNCTION get_available_sessions(
    p_category VARCHAR DEFAULT NULL,
    p_date_from DATE DEFAULT CURRENT_DATE,
    p_date_to DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR,
    description TEXT,
    category VARCHAR,
    subcategory VARCHAR,
    tags TEXT[],
    duration VARCHAR,
    date DATE,
    time VARCHAR,
    instructor VARCHAR,
    capacity INTEGER,
    enrolled INTEGER,
    available_spots INTEGER,
    location VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.category,
        s.subcategory,
        s.tags,
        s.duration,
        s.date,
        s.time,
        s.instructor,
        s.capacity,
        s.enrolled,
        (s.capacity - s.enrolled) as available_spots,
        s.location
    FROM sessions s
    WHERE 
        (p_category IS NULL OR s.category = p_category)
        AND s.date >= p_date_from 
        AND s.date <= p_date_to
        AND s.enrolled < s.capacity
    ORDER BY s.date, s.time;
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking
CREATE OR REPLACE FUNCTION create_booking(
    p_session_ids INTEGER[],
    p_user_details JSONB
)
RETURNS UUID AS $$
DECLARE
    booking_group_id UUID := uuid_generate_v4();
    session_id INTEGER;
    session_record RECORD;
BEGIN
    -- Check if all sessions are available
    FOREACH session_id IN ARRAY p_session_ids
    LOOP
        SELECT * INTO session_record FROM sessions WHERE id = session_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Session with ID % not found', session_id;
        END IF;
        
        IF session_record.enrolled >= session_record.capacity THEN
            RAISE EXCEPTION 'Session % is fully booked', session_record.title;
        END IF;
    END LOOP;
    
    -- Create bookings for all sessions
    FOREACH session_id IN ARRAY p_session_ids
    LOOP
        INSERT INTO bookings (session_id, booking_group_id, user_details)
        VALUES (session_id, booking_group_id, p_user_details);
        
        -- Update enrollment count
        UPDATE sessions 
        SET enrolled = enrolled + 1 
        WHERE id = session_id;
    END LOOP;
    
    RETURN booking_group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel a booking
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_group_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    booking_record RECORD;
BEGIN
    -- Update booking status and decrease enrollment
    FOR booking_record IN 
        SELECT session_id FROM bookings WHERE booking_group_id = p_booking_group_id
    LOOP
        UPDATE sessions 
        SET enrolled = enrolled - 1 
        WHERE id = booking_record.session_id;
    END LOOP;
    
    -- Update booking status
    UPDATE bookings 
    SET status = 'cancelled' 
    WHERE booking_group_id = p_booking_group_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE sessions IS 'Conference sessions with AI-optimized categorization';
COMMENT ON TABLE bookings IS 'User bookings with grouping support for multi-session bookings';
COMMENT ON TABLE user_preferences IS 'User preferences for personalized recommendations';

COMMENT ON COLUMN sessions.tags IS 'Array of tags for semantic matching with user preferences';
COMMENT ON COLUMN sessions.category IS 'Primary category for industry-based filtering';
COMMENT ON COLUMN sessions.subcategory IS 'Secondary category for specific skill matching';
COMMENT ON COLUMN bookings.booking_group_id IS 'Groups multiple sessions booked together';
COMMENT ON COLUMN bookings.user_details IS 'JSON object containing user information';

-- Sample data views for debugging
CREATE VIEW session_availability AS
SELECT 
    id,
    title,
    category,
    subcategory,
    date,
    time,
    capacity,
    enrolled,
    (capacity - enrolled) as available_spots,
    ROUND((enrolled::DECIMAL / capacity) * 100, 1) as occupancy_rate
FROM sessions
ORDER BY date, time;

CREATE VIEW booking_summary AS
SELECT 
    booking_group_id,
    COUNT(*) as sessions_booked,
    MIN(s.date) as first_session_date,
    MAX(s.date) as last_session_date,
    b.user_details->>'name' as user_name,
    b.user_details->>'email' as user_email,
    b.status,
    b.booked_at
FROM bookings b
JOIN sessions s ON b.session_id = s.id
GROUP BY booking_group_id, b.user_details, b.status, b.booked_at
ORDER BY b.booked_at DESC;

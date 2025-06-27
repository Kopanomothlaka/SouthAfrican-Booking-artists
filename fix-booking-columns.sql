-- Fix Booking Columns for Client Bookings
-- This script adds the missing columns needed for client bookings

-- Add missing booking columns to the bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS experience TEXT;

-- Update the bookings table to better handle both artist services and client bookings
-- Add a type column to distinguish between artist services and client bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'service' CHECK (booking_type IN ('service', 'booking'));

-- Add more booking-specific columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Update status constraint to include booking statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('available', 'pending', 'confirmed', 'cancelled', 'completed', 'booked'));

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);

-- Update RLS policies to handle both service creation and booking creation
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        -- Artists can create services
        (auth.uid() = artist_id AND booking_type = 'service') OR
        -- Clients can create bookings
        (auth.uid() = client_id AND booking_type = 'booking') OR
        -- Check if user is a client
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'client'
        )
    );

-- Update view policy to show appropriate bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        -- Artists can view their services and bookings
        auth.uid() = artist_id OR
        -- Clients can view their bookings
        auth.uid() = client_id OR
        -- Public can view available services
        (booking_type = 'service' AND is_active = true AND status = 'available') OR
        -- Admins can view everything
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Success message
SELECT 'Booking columns fixed successfully!' as status; 
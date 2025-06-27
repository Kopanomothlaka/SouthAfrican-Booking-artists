-- Client Setup SQL Script - Final Version
-- This script safely sets up client functionality without conflicts

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    role TEXT NOT NULL CHECK (role IN ('client', 'artist', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies for users table (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public can read basic user info" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 4: Create policies for users table
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow public read access for basic user info (for booking purposes)
CREATE POLICY "Public can read basic user info" ON users
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Add client_id column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Update bookings table to include client information
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Step 7: Update bookings table status to include booking statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('available', 'pending', 'confirmed', 'cancelled', 'completed'));

-- Step 8: Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, phone, location, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'location',
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Drop existing booking policies (if they exist)
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Artists can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can update own bookings" ON bookings;

-- Step 11: Update RLS policies for bookings to allow clients to create bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        auth.uid() = client_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'client'
        )
    );

-- Step 12: Allow clients to view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = artist_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Step 13: Allow artists to update their own bookings
CREATE POLICY "Artists can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = artist_id);

-- Step 14: Allow clients to update their own bookings (for cancellation)
CREATE POLICY "Clients can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = client_id);

-- Step 15: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_artist_id ON bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Step 16: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.bookings TO anon, authenticated;
GRANT ALL ON public.booking_images TO anon, authenticated;

-- Step 17: Safely add tables to realtime publication (only if not already added)
DO $$
BEGIN
    -- Add users table to realtime if not already there
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE users;
    END IF;
    
    -- Add bookings table to realtime if not already there
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
    END IF;
END $$;

-- Success message
SELECT 'Client setup completed successfully!' as status; 
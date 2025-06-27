-- Create Clients Table and Setup
-- This script creates a separate clients table for client management

-- Step 1: Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for clients table
-- Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON clients
    FOR SELECT USING (auth.uid() = id);

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON clients
    FOR UPDATE USING (auth.uid() = id);

-- Allow public read access for basic client info (for booking purposes)
CREATE POLICY "Public can read basic client info" ON clients
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own client profile
CREATE POLICY "Clients can insert own profile" ON clients
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 4: Create function to automatically create client profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create client profile if role is 'client'
    IF NEW.raw_user_meta_data->>'role' = 'client' THEN
        INSERT INTO public.clients (id, full_name, email, phone, location)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client'),
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            NEW.raw_user_meta_data->>'location'
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If client already exists, just return NEW
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth signup
        RAISE WARNING 'Failed to create client profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger for new client signup
DROP TRIGGER IF EXISTS on_auth_user_created_client ON auth.users;
CREATE TRIGGER on_auth_user_created_client
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

-- Step 6: Update bookings table to reference clients table
-- Add client_id column if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.clients TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_client() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_client() TO anon;

-- Step 9: Add clients table to realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'clients'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE clients;
    END IF;
END $$;

-- Success message
SELECT 'Clients table setup completed successfully!' as status; 
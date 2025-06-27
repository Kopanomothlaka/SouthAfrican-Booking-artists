-- Comprehensive RLS Policy Fix for Afri-Art Booking Hub
-- This script fixes all permission issues for artists, clients, and admins

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Authenticated users can select all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can select their own user row" ON users;
DROP POLICY IF EXISTS "Admins can select all users" ON users;
DROP POLICY IF EXISTS "Public can select users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Service role can select all users" ON users;

-- Create comprehensive policy for users table
CREATE POLICY "Authenticated users can select all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON users TO authenticated;

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can view their own profile" ON clients;
DROP POLICY IF EXISTS "Clients can update their own profile" ON clients;
DROP POLICY IF EXISTS "Clients can insert their own profile" ON clients;
DROP POLICY IF EXISTS "Authenticated users can select all clients" ON clients;

-- Create policies for clients table
CREATE POLICY "Clients can view their own profile"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can update their own profile"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can insert their own profile"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to select all clients (for joins)
CREATE POLICY "Authenticated users can select all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON clients TO authenticated;

-- =====================================================
-- ARTISTS TABLE POLICIES
-- =====================================================

-- Enable RLS on artists table
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can view their own profile" ON artists;
DROP POLICY IF EXISTS "Artists can update their own profile" ON artists;
DROP POLICY IF EXISTS "Artists can insert their own profile" ON artists;
DROP POLICY IF EXISTS "Authenticated users can select all artists" ON artists;
DROP POLICY IF EXISTS "Public can select approved artists" ON artists;

-- Create policies for artists table
CREATE POLICY "Artists can view their own profile"
  ON artists FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Artists can update their own profile"
  ON artists FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Artists can insert their own profile"
  ON artists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to select all artists (for joins)
CREATE POLICY "Authenticated users can select all artists"
  ON artists FOR SELECT
  TO authenticated
  USING (true);

-- Allow public to select approved artists
CREATE POLICY "Public can select approved artists"
  ON artists FOR SELECT
  TO anon
  USING (status = 'approved');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON artists TO authenticated;
GRANT SELECT ON artists TO anon;

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can manage their own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Public can select available bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can select all bookings" ON bookings;

-- Create policies for bookings table
CREATE POLICY "Artists can manage their own bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Clients can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Allow public to select available bookings
CREATE POLICY "Public can select available bookings"
  ON bookings FOR SELECT
  TO anon
  USING (status = 'available' AND booking_type = 'service');

-- Allow authenticated users to select all bookings (for joins)
CREATE POLICY "Authenticated users can select all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON bookings TO authenticated;
GRANT SELECT ON bookings TO anon;

-- =====================================================
-- CLIENT_BOOKINGS TABLE POLICIES
-- =====================================================

-- Enable RLS on client_bookings table
ALTER TABLE client_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can view their own bookings" ON client_bookings;
DROP POLICY IF EXISTS "Artists can view bookings for their services" ON client_bookings;
DROP POLICY IF EXISTS "Admins can view all client bookings" ON client_bookings;
DROP POLICY IF EXISTS "Clients can insert their own bookings" ON client_bookings;
DROP POLICY IF EXISTS "Authenticated users can select all client bookings" ON client_bookings;

-- Create policies for client_bookings table
CREATE POLICY "Clients can view their own bookings"
  ON client_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Artists can view bookings for their services"
  ON client_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = client_bookings.booking_id 
      AND bookings.artist_id = auth.uid()
    )
  );

CREATE POLICY "Clients can insert their own bookings"
  ON client_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

-- Allow authenticated users to select all client_bookings (for joins)
CREATE POLICY "Authenticated users can select all client_bookings"
  ON client_bookings FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON client_bookings TO authenticated;

-- =====================================================
-- BOOKING_IMAGES TABLE POLICIES
-- =====================================================

-- Enable RLS on booking_images table
ALTER TABLE booking_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Artists can manage their booking images" ON booking_images;
DROP POLICY IF EXISTS "Public can view booking images" ON booking_images;
DROP POLICY IF EXISTS "Authenticated users can select all booking images" ON booking_images;

-- Create policies for booking_images table
CREATE POLICY "Artists can manage their booking images"
  ON booking_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = booking_images.booking_id 
      AND bookings.artist_id = auth.uid()
    )
  );

-- Allow public to view booking images
CREATE POLICY "Public can view booking images"
  ON booking_images FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to select all booking images (for joins)
CREATE POLICY "Authenticated users can select all booking images"
  ON booking_images FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON booking_images TO authenticated;
GRANT SELECT ON booking_images TO anon;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'All RLS policies have been updated successfully!' as status; 
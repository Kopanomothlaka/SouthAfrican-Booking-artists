const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientBookingsTable() {
  console.log('Testing client_bookings table...\n');

  try {
    // Check if client_bookings table exists
    console.log('1. Checking if client_bookings table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('client_bookings')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ client_bookings table does not exist or is not accessible');
      console.log('Error:', tableError.message);
      console.log('\n📋 Please run the following SQL in your Supabase dashboard:');
      console.log('File: client-bookings-setup.sql');
      console.log('\nOr copy this SQL:');
      console.log(`
-- Create client_bookings table for tracking client bookings of artists
CREATE TABLE IF NOT EXISTS client_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  event_date date,
  event_time time,
  event_location text,
  duration_hours integer DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  artist_notes text,
  client_notes text,
  UNIQUE(client_id, booking_id) -- Prevent duplicate bookings
);

-- Enable RLS on client_bookings table
ALTER TABLE client_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their own bookings" ON client_bookings;
DROP POLICY IF EXISTS "Artists can view bookings for their services" ON client_bookings;
DROP POLICY IF EXISTS "Admins can view all client bookings" ON client_bookings;

-- Policy: Clients can view their own bookings
CREATE POLICY "Clients can view their own bookings"
  ON client_bookings FOR SELECT
  USING (auth.uid() = client_id);

-- Policy: Artists can view bookings for their services
CREATE POLICY "Artists can view bookings for their services"
  ON client_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = client_bookings.booking_id 
      AND bookings.artist_id = auth.uid()
    )
  );

-- Policy: Admins can view all client bookings
CREATE POLICY "Admins can view all client bookings"
  ON client_bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON client_bookings TO authenticated;
      `);
      return;
    }

    console.log('✅ client_bookings table exists');

    // Check if there are any existing records
    console.log('\n2. Checking existing client_bookings records...');
    const { data: existingRecords, error: countError } = await supabase
      .from('client_bookings')
      .select('*');

    if (countError) {
      console.log('❌ Error checking existing records:', countError.message);
      return;
    }

    console.log(`📊 Found ${existingRecords.length} existing client_booking records`);

    if (existingRecords.length > 0) {
      console.log('\nSample record:');
      console.log(JSON.stringify(existingRecords[0], null, 2));
    }

    // Check if clients table exists
    console.log('\n3. Checking if clients table exists...');
    const { data: clientsCheck, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientsError) {
      console.log('❌ clients table does not exist or is not accessible');
      console.log('Error:', clientsError.message);
    } else {
      console.log('✅ clients table exists');
    }

    // Check if bookings table exists
    console.log('\n4. Checking if bookings table exists...');
    const { data: bookingsCheck, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);

    if (bookingsError) {
      console.log('❌ bookings table does not exist or is not accessible');
      console.log('Error:', bookingsError.message);
    } else {
      console.log('✅ bookings table exists');
    }

    console.log('\n🎯 Summary:');
    console.log('- client_bookings table:', tableCheck !== null ? '✅ Exists' : '❌ Missing');
    console.log('- clients table:', clientsCheck !== null ? '✅ Exists' : '❌ Missing');
    console.log('- bookings table:', bookingsCheck !== null ? '✅ Exists' : '❌ Missing');
    console.log('- Existing client_bookings records:', existingRecords.length);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClientBookingsTable(); 
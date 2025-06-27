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

-- Success message
SELECT 'Client bookings table created successfully!' as status; 
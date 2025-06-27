-- Enable RLS on bookings and artists tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Remove any existing SELECT policies that might block public access
DROP POLICY IF EXISTS "Public can view available bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated can view bookings" ON bookings;
DROP POLICY IF EXISTS "Artists can manage their own bookings" ON bookings;

DROP POLICY IF EXISTS "Public can view artists" ON artists;
DROP POLICY IF EXISTS "Authenticated can view artists" ON artists;
DROP POLICY IF EXISTS "Artists can manage their own profile" ON artists;

-- Allow public to view available bookings
CREATE POLICY "Public can view available bookings"
  ON bookings FOR SELECT
  USING (is_active = true AND status = 'available');

-- Allow public to view all artist info (needed for join)
CREATE POLICY "Public can view artists"
  ON artists FOR SELECT
  USING (true);

-- (Optional) If you want to keep artist row management secure, keep update/delete policies restricted to the artist or admin only.

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Public RLS policies for bookings and artists have been set.';
END $$; 
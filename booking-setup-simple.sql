-- Create bookings table for artist bookings
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  booking_fee decimal(10,2) NOT NULL,
  currency text DEFAULT 'ZAR',
  experience_years integer,
  experience_description text,
  availability_start date,
  availability_end date,
  availability_notes text,
  location text,
  max_duration_hours integer,
  min_duration_hours integer DEFAULT 1,
  is_active boolean DEFAULT true,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled', 'completed')),
  contact_email text,
  contact_phone text
);

-- Create booking_images table for multiple images per booking
CREATE TABLE IF NOT EXISTS booking_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_name text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0
);

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simple policies for bookings
CREATE POLICY "Artists can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = artist_id);

CREATE POLICY "Public can view available bookings"
  ON bookings FOR SELECT
  USING (is_active = true AND status = 'available');

-- Enable RLS on booking_images table
ALTER TABLE booking_images ENABLE ROW LEVEL SECURITY;

-- Simple policies for booking_images
CREATE POLICY "Artists can manage their booking images"
  ON booking_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_images.booking_id AND artist_id = auth.uid()
    )
  );

CREATE POLICY "Public can view booking images"
  ON booking_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_images.booking_id AND is_active = true AND status = 'available'
    )
  );

-- Create storage bucket for booking images
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-images', 'booking-images', true)
ON CONFLICT (id) DO NOTHING;

-- Simple storage policies
CREATE POLICY "Artists can upload booking images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'booking-images');

CREATE POLICY "Public can view booking images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'booking-images');

CREATE POLICY "Artists can update their booking images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'booking-images');

CREATE POLICY "Artists can delete their booking images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'booking-images'); 
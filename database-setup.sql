-- Create users table for role management (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name text,
  email text,
  role text DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin', 'artist'))
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create artists table (if not already exists)
CREATE TABLE IF NOT EXISTS artists (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name text,
  artist_name text,
  email text,
  phone text,
  category text,
  location text,
  bio text,
  experience text,
  id_document_url text,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS on artists table
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public artists are viewable by everyone." ON artists;
DROP POLICY IF EXISTS "Users can insert their own artist profile." ON artists;
DROP POLICY IF EXISTS "Users can update their own artist profile." ON artists;
DROP POLICY IF EXISTS "Admins can manage all artist profiles" ON artists;

-- Allow public read access for all artists
CREATE POLICY "Public artists are viewable by everyone."
  ON artists FOR SELECT
  USING (true);

-- Allow users to create their own artist profile
CREATE POLICY "Users can insert their own artist profile."
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own artist profile
CREATE POLICY "Users can update their own artist profile."
  ON artists FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to manage all artist profiles
CREATE POLICY "Admins can manage all artist profiles"
  ON artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for artist documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-documents', 'artist-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Artists can upload to their own folder." ON storage.objects;
DROP POLICY IF EXISTS "Artists can view their own documents." ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- Policy: Allow artists to upload to their own folder
CREATE POLICY "Artists can upload to their own folder."
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'artist-documents'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Policy: Allow artists to view their own documents
CREATE POLICY "Artists can view their own documents."
  ON storage.objects FOR SELECT USING (
    bucket_id = 'artist-documents'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Policy: Allow admins to view all documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'artist-documents'
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 
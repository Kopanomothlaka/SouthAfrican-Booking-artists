-- Fix the infinite recursion issue in RLS policies

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create a simpler policy that doesn't cause recursion
-- This policy allows users to view their own profile and admins to view all profiles
CREATE POLICY "Users can view profiles"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Alternative approach: Use a function to check admin role
-- First, create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then create a policy using the function
DROP POLICY IF EXISTS "Users can view profiles" ON users;

CREATE POLICY "Users can view profiles"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR 
    is_admin(auth.uid())
  );

-- Also fix the artists table policies to avoid similar issues
DROP POLICY IF EXISTS "Admins can manage all artist profiles" ON artists;

CREATE POLICY "Admins can manage all artist profiles"
  ON artists FOR ALL
  USING (
    auth.uid() = id OR 
    is_admin(auth.uid())
  );

-- Fix storage policies too
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'artist-documents'
    AND (
      auth.uid() = (storage.foldername(name))[1]::uuid OR
      is_admin(auth.uid())
    )
  ); 
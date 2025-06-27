-- Fix Booking Deletion for Artists
-- This script ensures artists can delete their own bookings

-- Step 1: Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Artists can delete own bookings" ON bookings;

-- Step 2: Create policy to allow artists to delete their own bookings
CREATE POLICY "Artists can delete own bookings" ON bookings
    FOR DELETE USING (auth.uid() = artist_id);

-- Step 3: Also ensure artists can delete booking images associated with their bookings
DROP POLICY IF EXISTS "Artists can delete own booking images" ON booking_images;

CREATE POLICY "Artists can delete own booking images" ON booking_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_images.booking_id 
            AND bookings.artist_id = auth.uid()
        )
    );

-- Step 4: Grant necessary permissions
GRANT DELETE ON bookings TO authenticated;
GRANT DELETE ON booking_images TO authenticated;

-- Step 5: Verify the policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('bookings', 'booking_images')
AND policyname LIKE '%delete%';

-- Success message
SELECT 'Booking deletion policies updated successfully!' as status; 
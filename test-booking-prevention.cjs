const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingPrevention() {
  console.log('🧪 Testing booking prevention system...\n');

  try {
    // Test 1: Check existing bookings
    console.log('1. Checking existing bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, artist_id, client_id, status, booking_type')
      .eq('booking_type', 'booking')
      .limit(10);

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError.message);
    } else {
      console.log(`✅ Found ${bookings.length} bookings:`);
      bookings.forEach(booking => {
        console.log(`   - Artist: ${booking.artist_id}, Client: ${booking.client_id}, Status: ${booking.status}`);
      });
    }

    // Test 2: Check for duplicate bookings (same client-artist combination)
    console.log('\n2. Checking for duplicate bookings...');
    if (bookings && bookings.length > 0) {
      const bookingMap = new Map();
      const duplicates = [];

      bookings.forEach(booking => {
        const key = `${booking.client_id}-${booking.artist_id}`;
        if (bookingMap.has(key)) {
          duplicates.push({
            client: booking.client_id,
            artist: booking.artist_id,
            status1: bookingMap.get(key).status,
            status2: booking.status
          });
        } else {
          bookingMap.set(key, booking);
        }
      });

      if (duplicates.length > 0) {
        console.log('⚠️  Found duplicate bookings:');
        duplicates.forEach(dup => {
          console.log(`   - Client ${dup.client} has multiple bookings with Artist ${dup.artist}`);
          console.log(`     Status 1: ${dup.status1}, Status 2: ${dup.status2}`);
        });
      } else {
        console.log('✅ No duplicate bookings found');
      }
    }

    // Test 3: Check booking statuses
    console.log('\n3. Checking booking statuses...');
    const statusCounts = {};
    if (bookings) {
      bookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
      });
      
      console.log('✅ Booking status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }

    // Test 4: Check if clients table exists and has data
    console.log('\n4. Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, full_name, email')
      .limit(5);

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError.message);
    } else {
      console.log(`✅ Found ${clients.length} clients in the table`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookingPrevention(); 
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingStatus() {
  console.log('Testing booking status functionality...\n');

  try {
    // Check bookings table
    console.log('1. Checking bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (bookingsError) {
      console.log('❌ Error fetching bookings:', bookingsError.message);
    } else {
      console.log(`✅ Found ${bookings.length} bookings`);
      if (bookings.length > 0) {
        console.log('\nRecent bookings:');
        bookings.forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.title || 'Untitled'} - Status: ${booking.status} - Date: ${booking.booking_date}`);
        });
      }
    }

    // Check client_bookings table
    console.log('\n2. Checking client_bookings table...');
    const { data: clientBookings, error: clientBookingsError } = await supabase
      .from('client_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (clientBookingsError) {
      console.log('❌ Error fetching client_bookings:', clientBookingsError.message);
    } else {
      console.log(`✅ Found ${clientBookings.length} client bookings`);
      if (clientBookings.length > 0) {
        console.log('\nRecent client bookings:');
        clientBookings.forEach((booking, index) => {
          console.log(`${index + 1}. Client ID: ${booking.client_id} - Status: ${booking.status} - Amount: ${booking.total_amount}`);
        });
      }
    }

    // Check status distribution
    console.log('\n3. Checking status distribution...');
    if (bookings && bookings.length > 0) {
      const statusCounts = {};
      bookings.forEach(booking => {
        statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
      });
      
      console.log('Status distribution in bookings:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    if (clientBookings && clientBookings.length > 0) {
      const clientStatusCounts = {};
      clientBookings.forEach(booking => {
        clientStatusCounts[booking.status] = (clientStatusCounts[booking.status] || 0) + 1;
      });
      
      console.log('\nStatus distribution in client_bookings:');
      Object.entries(clientStatusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    // Test status update (if there are bookings)
    if (bookings && bookings.length > 0) {
      console.log('\n4. Testing status update...');
      const testBooking = bookings[0];
      console.log(`Testing with booking ID: ${testBooking.id}, current status: ${testBooking.status}`);
      
      // Note: This would require authentication to actually update
      console.log('To test status updates, you need to:');
      console.log('1. Log in as an artist');
      console.log('2. Go to the artist dashboard');
      console.log('3. Confirm a booking');
      console.log('4. Check if the status updates in the client dashboard');
    }

    console.log('\n🎯 Summary:');
    console.log('- Bookings table:', bookings ? `✅ ${bookings.length} records` : '❌ Error');
    console.log('- Client_bookings table:', clientBookings ? `✅ ${clientBookings.length} records` : '❌ Error');
    console.log('- Status tracking:', '✅ Ready for testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookingStatus(); 
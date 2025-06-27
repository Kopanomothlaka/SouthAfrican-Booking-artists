const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientSetup() {
  console.log('🧪 Testing Client Setup...\n');

  try {
    // Test 1: Check if users table exists
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 2: Check if bookings table has client columns
    console.log('\n2. Checking bookings table structure...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('client_id, client_name, client_phone, client_email')
      .limit(1);
    
    if (bookingsError) {
      console.log('❌ Bookings table error:', bookingsError.message);
    } else {
      console.log('✅ Bookings table accessible with client columns');
    }

    // Test 3: Check public access to available bookings
    console.log('\n3. Testing public access to available bookings...');
    const { data: availableBookings, error: availableError } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        booking_fee,
        status,
        artists!inner(
          full_name,
          email,
          phone
        )
      `)
      .eq('status', 'available')
      .eq('is_active', true)
      .limit(3);

    if (availableError) {
      console.log('❌ Public bookings access error:', availableError.message);
    } else {
      console.log(`✅ Found ${availableBookings?.length || 0} available bookings`);
      if (availableBookings && availableBookings.length > 0) {
        console.log('   Sample booking:', {
          id: availableBookings[0].id,
          title: availableBookings[0].title,
          artist: availableBookings[0].artists.full_name,
          fee: availableBookings[0].booking_fee
        });
      }
    }

    // Test 4: Check if we can read artists table
    console.log('\n4. Testing artists table access...');
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, full_name, email, status')
      .eq('status', 'approved')
      .limit(3);

    if (artistsError) {
      console.log('❌ Artists table error:', artistsError.message);
    } else {
      console.log(`✅ Found ${artists?.length || 0} approved artists`);
    }

    console.log('\n🎉 Client setup test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the client-setup.sql script in your Supabase SQL editor');
    console.log('2. Test client registration at /client-register');
    console.log('3. Test client login at /login');
    console.log('4. Test booking functionality on artist detail pages');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testClientSetup(); 
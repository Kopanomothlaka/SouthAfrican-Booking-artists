const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientNavigation() {
  console.log('🧪 Testing Client Navigation...\n');

  try {
    // Test 1: Check if we can access the client dashboard
    console.log('1. Testing client dashboard access...');
    
    // First, create a test client
    const testEmail = `test-nav-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Test Navigation Client',
          role: 'client'
        }
      }
    });

    if (authError) {
      console.log('❌ Test client creation failed:', authError.message);
      return;
    }

    console.log('✅ Test client created');
    
    // Wait for user profile to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Check if we can access the users table
    console.log('\n2. Testing users table access...');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ User profile access failed:', profileError.message);
    } else {
      console.log('✅ User profile accessible');
      console.log('   Role:', userProfile.role);
      console.log('   Name:', userProfile.full_name);
    }

    // Test 3: Check if we can access the artists page (should work for clients)
    console.log('\n3. Testing artists page access...');
    const { data: artists, error: artistsError } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        booking_fee,
        status,
        artists!inner(
          full_name,
          email
        )
      `)
      .eq('booking_type', 'service')
      .eq('status', 'available')
      .eq('is_active', true)
      .limit(3);

    if (artistsError) {
      console.log('❌ Artists access failed:', artistsError.message);
    } else {
      console.log(`✅ Artists accessible (${artists?.length || 0} found)`);
      if (artists && artists.length > 0) {
        console.log('   Sample artist:', artists[0].artists.full_name);
      }
    }

    // Test 4: Check if we can create a booking (if artists exist)
    if (artists && artists.length > 0) {
      console.log('\n4. Testing booking creation...');
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          artist_id: artists[0].artists.id,
          client_id: authData.user.id,
          booking_date: '2024-12-25',
          booking_time: '14:00',
          experience: 'Test navigation booking',
          booking_fee: artists[0].booking_fee,
          status: 'pending',
          booking_type: 'booking',
          client_name: 'Test Navigation Client',
          client_email: testEmail,
          title: `Booking with ${artists[0].artists.full_name}`,
          description: 'Test navigation booking',
          category: 'booking',
          currency: 'ZAR',
          is_active: true
        })
        .select();

      if (bookingError) {
        console.log('❌ Booking creation failed:', bookingError.message);
      } else {
        console.log('✅ Test booking created');
        
        // Clean up test booking
        await supabase.from('bookings').delete().eq('id', bookingData[0].id);
        console.log('   Test booking cleaned up');
      }
    }

    // Clean up test client
    console.log('\n5. Cleaning up test data...');
    await supabase.from('users').delete().eq('id', authData.user.id);
    console.log('✅ Test client cleaned up');

    console.log('\n🎉 Client navigation test completed!');
    console.log('\n📋 What to test in the UI:');
    console.log('1. Register as a client at /client-register');
    console.log('2. Login as a client at /login');
    console.log('3. Navigate to /artists - should show minimal header');
    console.log('4. Navigate to /client-dashboard - should show custom header');
    console.log('5. Try booking an artist - should work without navigation issues');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testClientNavigation(); 